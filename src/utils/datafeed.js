// Rate limiter implementation
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.tokens = maxRequests;
    this.lastRefill = Date.now();
  }

  async waitForToken() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    this.tokens += Math.floor(timePassed / this.timeWindow * this.maxRequests);
    this.lastRefill = now;

    if (this.tokens > this.maxRequests) {
      this.tokens = this.maxRequests;
    }

    if (this.tokens <= 0) {
      // Wait for next token
      const waitTime = Math.ceil((this.timeWindow / this.maxRequests) - (timePassed % (this.timeWindow / this.maxRequests)));
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForToken();
    }

    this.tokens--;
    return true;
  }
}

// Create rate limiters: 90 requests per 10 seconds for TradingView endpoints
const rateLimiter = new RateLimiter(90, 10000);

import { subscribeOnStream, unsubscribeFromStream } from './streaming.js'

const API_ENDPOINT = 'https://benchmarks.pyth.network/v1/shims/tradingview'

// Use it to keep a record of the most recent bar on the chart
const lastBarsCache = new Map()

// Calculate reasonable time boundaries
const MAX_HISTORY = 365 * 24 * 60 * 60; // 1 year in seconds
const now = Math.floor(Date.now() / 1000);
const MIN_TIME = now - MAX_HISTORY;

async function makeRequest(url) {
  await rateLimiter.waitForToken();
  const response = await fetch(url);
  if (response.status === 429) {
    console.warn('Rate limit exceeded, waiting before retry...');
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds
    return makeRequest(url); // Retry the request
  }
  return response;
}


const supportedResolutions = ["1", "5", "15", "30", "1h", "4h", "1D", "1W"];

const datafeed = {
  onReady: async (callback) => {
    console.log('[onReady]: Method call')
    try {
      const response = await makeRequest(`${API_ENDPOINT}/config`);
      const configurationData = await response.json();
      callback({
        ...configurationData,
        supported_resolutions: supportedResolutions,
        supports_time: true,
        supports_marks: false,
        supports_timescale_marks: false,
      });
    } catch (error) {
      console.error('[onReady]: Error', error);
      callback({});
    }
  },
  
  searchSymbols: async (userInput, exchange, symbolType, onResultReadyCallback) => {
    console.log('[searchSymbols]: Method call')
    try {
      const response = await makeRequest(`${API_ENDPOINT}/search?query=${userInput}`);
      const data = await response.json();
      onResultReadyCallback(data);
    } catch (error) {
      console.error('[searchSymbols]: Error', error);
      onResultReadyCallback([]);
    }
  },

  resolveSymbol: async (
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback
  ) => {
    console.log('[resolveSymbol]: Method call', symbolName)
    try {
      const response = await makeRequest(`${API_ENDPOINT}/symbols?symbol=${symbolName}`);
      const symbolInfo = await response.json();
      console.log('[resolveSymbol]: Symbol resolved', symbolInfo)
      onSymbolResolvedCallback({
        ...symbolInfo,
        supported_resolutions: supportedResolutions,
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
      });
    } catch (error) {
      console.log('[resolveSymbol]: Cannot resolve symbol', symbolName)
      onResolveErrorCallback('Cannot resolve symbol')
    }
  },

  getBars: async (
    symbolInfo,
    resolution,
    periodParams,
    onHistoryCallback,
    onErrorCallback
  ) => {
    const { from, to, firstDataRequest } = periodParams
    console.log('[getBars] Raw resolution received:', resolution);

    try {
      // Ensure we don't request data before our minimum time
      const adjustedFrom = Math.max(from, MIN_TIME);
      const adjustedTo = Math.min(to, now);

      if (adjustedFrom >= adjustedTo) {
        onHistoryCallback([], { noData: true });
        return;
      }

      const url = `${API_ENDPOINT}/history?symbol=${symbolInfo.ticker}&from=${adjustedFrom}&to=${adjustedTo}&resolution=${resolution}`;
      console.log('[getBars]: Requesting URL:', url);
      
      const response = await makeRequest(url);
      const data = await response.json();
      
      const bars = [];
      if (data.t && data.t.length > 0) {
        data.t.forEach((time, index) => {
          if (data.o[index] !== undefined && data.h[index] !== undefined && 
              data.l[index] !== undefined && data.c[index] !== undefined) {
            bars.push({
              time: time * 1000,
              low: data.l[index],
              high: data.h[index],
              open: data.o[index],
              close: data.c[index],
            })
          }
        })
      }

      if (firstDataRequest && bars.length > 0) {
        lastBarsCache.set(symbolInfo.ticker, {
          ...bars[bars.length - 1],
        })
      }

      onHistoryCallback(bars, { noData: bars.length === 0 })
    } catch (error) {
      console.log('[getBars]: Get error', error)
      onErrorCallback(error)
    }
  },

  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback
  ) => {
    console.log(
      '[subscribeBars]: Method call with subscriberUID:',
      subscriberUID
    )
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(symbolInfo.ticker)
    )
  },

  unsubscribeBars: (subscriberUID) => {
    console.log(
      '[unsubscribeBars]: Method call with subscriberUID:',
      subscriberUID
    )
    unsubscribeFromStream(subscriberUID)
  },
}

export default datafeed
