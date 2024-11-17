import { useState, useEffect } from 'react';
import { TRADING_PAIRS } from './use-market-data';
import { useSmartAccount } from './use-smart-account';
import { getAddress } from 'viem';

interface Trade {
  averagePrice: string;
  closePrice: string;
  closedAt: string;
  isLiquidated: boolean;
  isLong: boolean;
  pnl: string;
  size: string;
  tokenAddress: string;
  collateral: string;
}

interface TradeHistory {
  pair: string;
  size: string;
  margin: string;
  entryPrice: string;
  closePrice: string;
  pnl: string;
  date: string;
  isLong: boolean;
}

// Cache manager for trade history
class TradeHistoryCache {
  private static instance: TradeHistoryCache;
  private cache: Map<string, { trades: TradeHistory[], timestamp: number }> = new Map();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance() {
    if (!TradeHistoryCache.instance) {
      TradeHistoryCache.instance = new TradeHistoryCache();
    }
    return TradeHistoryCache.instance;
  }

  get(address: string) {
    const cached = this.cache.get(address);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > TradeHistoryCache.CACHE_DURATION;
    return isExpired ? null : cached.trades;
  }

  set(address: string, trades: TradeHistory[]) {
    this.cache.set(address, { trades, timestamp: Date.now() });
  }
}

export function useTradeHistory() {
  const { smartAccount } = useSmartAccount();
  const cache = TradeHistoryCache.getInstance();
  
  // Initialize with cached data if available
  const initialCachedData = smartAccount?.address 
    ? cache.get(getAddress(smartAccount.address))
    : null;

  const [trades, setTrades] = useState<TradeHistory[]>(initialCachedData || []);
  const [loading, setLoading] = useState(!initialCachedData);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTrades() {
      if (!smartAccount?.address) return;

      try {
        const checksumAddress = getAddress(smartAccount.address);
        
        // Don't set loading true if we have cached data
        const cachedTrades = cache.get(checksumAddress);
        if (!cachedTrades) {
          setLoading(true);
        }

        // Fetch new data regardless of cache to keep it updated
        const response = await fetch('https://v4-subgraph-production.up.railway.app/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetTradeHistory($user: String!) {
                closedTrades(
                  orderBy: "closedAt"
                  orderDirection: "desc"
                  where: {user: $user}
                ) {
                  items {
                    averagePrice
                    closePrice
                    closedAt
                    isLiquidated
                    isLong
                    pnl
                    size
                    tokenAddress
                    collateral
                  }
                }
              }
            `,
            variables: {
              user: checksumAddress
            }
          })
        });

        const data = await response.json();
        
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        const formattedTrades = data.data.closedTrades.items.map((trade: Trade) => ({
          pair: TRADING_PAIRS[trade.tokenAddress] || `Token${trade.tokenAddress}/USD`,
          size: Number(trade.size).toFixed(2),
          margin: Number(trade.collateral).toFixed(2),
          entryPrice: Number(trade.averagePrice).toFixed(2),
          closePrice: Number(trade.closePrice).toFixed(2),
          pnl: Number(trade.pnl).toFixed(2),
          date: new Date(Number(trade.closedAt) * 1000).toLocaleString(),
          isLong: trade.isLong
        }));

        // Update cache and state only if data is different
        const currentTradesStr = JSON.stringify(trades);
        const newTradesStr = JSON.stringify(formattedTrades);
        
        if (currentTradesStr !== newTradesStr) {
          cache.set(checksumAddress, formattedTrades);
          setTrades(formattedTrades);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch trade history'));
        setLoading(false);
      }
    }

    fetchTrades();
  }, [smartAccount?.address]);

  return { trades, loading, error };
}