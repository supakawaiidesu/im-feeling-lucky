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

export function useTradeHistory() {
  const { smartAccount } = useSmartAccount();
  
  // Get initial data from session storage
  const getInitialData = () => {
    if (typeof window === 'undefined') return [];
    const sessionData = sessionStorage.getItem('tradeHistory');
    return sessionData ? JSON.parse(sessionData) : [];
  };

  const [trades, setTrades] = useState<TradeHistory[]>(getInitialData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTrades() {
      if (!smartAccount?.address) return;

      try {
        const checksumAddress = getAddress(smartAccount.address);
        setIsLoading(true);

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
          date: new Date(Number(trade.closedAt) * 1000).toISOString(), // Store as ISO string for easier formatting
          isLong: trade.isLong
        }));

        // Only update if data is different
        const currentTradesStr = JSON.stringify(trades);
        const newTradesStr = JSON.stringify(formattedTrades);
        
        if (currentTradesStr !== newTradesStr) {
          sessionStorage.setItem('tradeHistory', JSON.stringify(formattedTrades));
          setTrades(formattedTrades);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch trade history'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrades();
  }, [smartAccount?.address]);

  return { 
    trades, 
    loading: isLoading && trades.length === 0, // Only show loading if we have no data
    error 
  };
}