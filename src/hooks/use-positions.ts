import { useState, useEffect, useCallback } from 'react';
import { usePrices } from '../lib/websocket-price-context';

export interface Position {
  market: string;
  size: string;
  entryPrice: string;
  markPrice: string;
  pnl: string;
  positionId: string;
  isLong: boolean;
  margin: string;
  liquidationPrice: string;
  fees: {
    positionFee: string;
    borrowFee: string;
    fundingFee: string;
  };
}

interface APIPosition {
  owner: string;
  refer: string;
  isLong: boolean;
  tokenId: string;
  averagePrice: string;
  collateral: string;
  fundingIndex: string;
  lastIncreasedTime: string;
  size: string;
  accruedBorrowFee: string;
}

interface PositionsResponse {
  posIds: string[];
  positions: APIPosition[];
  orders: any[];
  triggers: any[];
  paidFees: {
    paidPositionFee: string;
    paidBorrowFee: string;
    paidFundingFee: string;
  }[];
  accruedFees: {
    positionFee: string;
    borrowFee: string;
    fundingFee: string;
  }[];
}

const TOKEN_ID_TO_PRICE_KEY: { [key: string]: string } = {
  "1": "btc",
  "2": "eth",
};

const TOKEN_ID_TO_MARKET: { [key: string]: string } = {
  "1": "BTC/USD",
  "2": "ETH/USD",
};

function calculateLiquidationPrice(
  position: APIPosition,
  entryPrice: number
): string {
  const margin = parseFloat(position.collateral);
  const size = parseFloat(position.size);
  const liquidationThreshold = 0.9; // 90% loss threshold

  if (position.isLong) {
    const liqPrice = entryPrice * (1 - (margin / (size * liquidationThreshold)));
    return liqPrice.toFixed(2);
  } else {
    const liqPrice = entryPrice * (1 + (margin / (size * liquidationThreshold)));
    return liqPrice.toFixed(2);
  }
}

function calculatePnL(
  position: APIPosition, 
  currentPrice: number,
  paidFees: { paidPositionFee: string; paidBorrowFee: string; paidFundingFee: string; },
  accruedFees: { positionFee: string; borrowFee: string; fundingFee: string; }
): { pnl: string; fees: { positionFee: string; borrowFee: string; fundingFee: string; } } {
  const entryPrice = parseFloat(position.averagePrice);
  const size = parseFloat(position.size);
  
  if (isNaN(entryPrice) || isNaN(currentPrice) || isNaN(size)) {
    return { 
      pnl: 'N/A',
      fees: { positionFee: '0', borrowFee: '0', fundingFee: '0' }
    };
  }

  // Calculate raw PnL from price difference
  const priceDiff = position.isLong ? 
    (currentPrice - entryPrice) : 
    (entryPrice - currentPrice);
  
  const rawPnL = (priceDiff * size / entryPrice);

  // Sum up fees from both paid and accrued
  const totalPositionFee = parseFloat(paidFees.paidPositionFee) + parseFloat(accruedFees.positionFee);
  const totalBorrowFee = parseFloat(paidFees.paidBorrowFee) + parseFloat(accruedFees.borrowFee);
  const totalFundingFee = parseFloat(paidFees.paidFundingFee) + parseFloat(accruedFees.fundingFee);

  // Calculate final PnL by subtracting all fees
  const finalPnL = rawPnL - totalPositionFee - totalBorrowFee - totalFundingFee;
  
  return {
    pnl: finalPnL >= 0 ? 
      `+$${finalPnL.toFixed(2)}` : 
      `-$${Math.abs(finalPnL).toFixed(2)}`,
    fees: {
      positionFee: totalPositionFee.toFixed(6),
      borrowFee: totalBorrowFee.toFixed(6),
      fundingFee: totalFundingFee.toFixed(6)
    }
  };
}

export function usePositions(address: string | undefined) {
  const [rawPositions, setRawPositions] = useState<{
    position: APIPosition;
    positionId: string;
    paidFees: PositionsResponse['paidFees'][0];
    accruedFees: PositionsResponse['accruedFees'][0];
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { prices } = usePrices();

  const fetchPositions = useCallback(async () => {
    if (!address) {
      setRawPositions([]);
      return;
    }

    try {
      const response = await fetch(`https://unidexv4-api-production.up.railway.app/api/positions?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }

      const data: PositionsResponse = await response.json();
      
      const newRawPositions = data.positions.map((pos, index) => ({
        position: pos,
        positionId: data.posIds[index],
        paidFees: data.paidFees[index],
        accruedFees: data.accruedFees[index]
      }));

      setRawPositions(newRawPositions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 5000);
    return () => clearInterval(interval);
  }, [fetchPositions]);

  const positions = rawPositions.map(({ position, positionId, paidFees, accruedFees }) => {
    const market = TOKEN_ID_TO_MARKET[position.tokenId] || `Token${position.tokenId}/USD`;
    const priceKey = TOKEN_ID_TO_PRICE_KEY[position.tokenId];
    const currentPrice = priceKey && prices[priceKey]?.price;
    const entryPrice = parseFloat(position.averagePrice);

    const { pnl, fees } = currentPrice ? 
      calculatePnL(position, currentPrice, paidFees, accruedFees) : 
      { pnl: 'Loading...', fees: { positionFee: '0', borrowFee: '0', fundingFee: '0' } };

    return {
      positionId,
      market,
      size: parseFloat(position.size).toFixed(3),
      entryPrice: entryPrice.toFixed(2),
      markPrice: currentPrice ? currentPrice.toFixed(2) : 'Loading...',
      pnl,
      isLong: position.isLong,
      margin: parseFloat(position.collateral).toFixed(3),
      liquidationPrice: currentPrice ? calculateLiquidationPrice(position, entryPrice) : 'Loading...',
      fees
    };
  });

  return { positions, loading, error };
}
