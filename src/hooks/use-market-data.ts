import { useState, useEffect } from 'react';

// Types based on API documentation
export interface Market {
  assetId: string;
  pair: string;
  price: string;
  fundingRate: number;
  borrowRateForLong: number;
  borrowRateForShort: number;
  longOpenInterest: number;
  shortOpenInterest: number;
  maxLongOpenInterest: number;
  maxShortOpenInterest: number;
  longTradingFee: number;
  shortTradingFee: number;
  utilization: number;
  longShortRatio: {
    longPercentage: number;
    shortPercentage: number;
  };
  availableLiquidity: {
    long: number;
    short: number;
  };
}

export interface MarketsResponse {
  success: boolean;
  timestamp: number;
  marketsCount: number;
  markets: Market[];
}

interface UseMarketDataOptions {
  pollInterval?: number; // in milliseconds
  selectedPair?: string;
}

interface UseMarketDataResult {
  marketData: Market | null;
  allMarkets: Market[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const API_BASE_URL = 'https://unidexv4-api-production.up.railway.app';

export function useMarketData({ 
  pollInterval = 10000, // Default 10 second polling
  selectedPair 
}: UseMarketDataOptions = {}): UseMarketDataResult {
  const [marketData, setMarketData] = useState<Market | null>(null);
  const [allMarkets, setAllMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMarketData = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/markets`);
      const data: MarketsResponse = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch market data');
      }

      setAllMarkets(data.markets);

      if (selectedPair) {
        // Find the specific market data for the selected pair
        const market = data.markets.find((m) => m.pair === selectedPair);

        if (market) {
          setMarketData(market);
        } else {
          console.warn(`No market found for pair: ${selectedPair}. Available pairs:`, 
            data.markets.map(m => m.pair));
          // If no match found, use the first market as fallback
          setMarketData(data.markets[0] || null);
        }
      } else {
        // If no pair selected, use the first market
        setMarketData(data.markets[0] || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      console.error('Error fetching market data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();

    if (pollInterval > 0) {
      const interval = setInterval(fetchMarketData, pollInterval);
      return () => clearInterval(interval);
    }
  }, [selectedPair, pollInterval]);

  return {
    marketData,
    allMarkets,
    loading,
    error,
    refetch: fetchMarketData
  };
}
