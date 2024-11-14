import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { usePrices } from '../lib/websocket-price-context';
import { useSmartAccount } from './use-smart-account';
import { lensAbi } from '../lib/abi/lens';
import { arbitrum } from 'viem/chains';
import { TRADING_PAIRS } from './use-market-data';

const LENS_CONTRACT_ADDRESS = '0xeae57c7bce5caf160343a83440e98bc976ab7274' as `0x${string}`;
const SCALING_FACTOR = 30; // For formatUnits

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

interface ContractPosition {
  owner: `0x${string}`;
  refer: `0x${string}`;
  isLong: boolean;
  tokenId: bigint;
  averagePrice: bigint;
  collateral: bigint;
  fundingIndex: bigint;
  lastIncreasedTime: bigint;
  size: bigint;
  accruedBorrowFee: bigint;
}

interface ContractOrder {
  status: number;
  lmtPrice: bigint;
  size: bigint;
  collateral: bigint;
  positionType: bigint;
  stepAmount: bigint;
  stepType: bigint;
  stpPrice: bigint;
  timestamp: bigint;
}

interface ContractPaidFees {
  paidPositionFee: bigint;
  paidBorrowFee: bigint;
  paidFundingFee: bigint;
}

interface ContractAccruedFees {
  positionFee: bigint;
  borrowFee: bigint;
  fundingFee: bigint;
}

// Helper function to get price key from token ID
function getPriceKeyFromTokenId(tokenId: string): string {
  const market = TRADING_PAIRS[tokenId];
  if (!market) return '';
  
  // Extract the token symbol before /USD and convert to lowercase
  const symbol = market.split('/')[0].toLowerCase();
  return symbol;
}

// Helper functions for bigint conversions
const fromBigInt = (value: bigint): number => {
  return Number(value) / Number(SCALING_FACTOR);
};

const toBigInt = (value: number): bigint => {
  return BigInt(Math.floor(value * Number(SCALING_FACTOR)));
};

function calculateLiquidationPrice(
  position: ContractPosition, 
  entryPrice: number,
  accruedFees: { borrowFee: bigint; fundingFee: bigint }
): string {
  const margin = Number(formatUnits(position.collateral, SCALING_FACTOR));
  const size = Number(formatUnits(position.size, SCALING_FACTOR));
  const leverage = size / margin;
  
  // Convert fees to numbers
  const totalFees = Number(formatUnits(accruedFees.borrowFee + accruedFees.fundingFee, SCALING_FACTOR));
  
  // We want: (priceDiff * size / entryPrice) - fees = -0.9 * margin
  // Rearranging for priceDiff:
  // priceDiff * size / entryPrice = (-0.9 * margin) + fees
  // priceDiff = ((-0.9 * margin) + fees) * entryPrice / size
  
  const targetPnL = (-0.9 * margin) + totalFees;
  const requiredPriceDiff = (targetPnL * entryPrice) / size;

  if (position.isLong) {
    return (entryPrice + requiredPriceDiff).toFixed(2);
  } else {
    return (entryPrice - requiredPriceDiff).toFixed(2);
  }
}

function calculatePnL(
  position: ContractPosition,
  currentPrice: number,
  paidFees: ContractPaidFees,
  accruedFees: ContractAccruedFees
): { pnl: string; fees: { positionFee: string; borrowFee: string; fundingFee: string; } } {
  const entryPrice = Number(formatUnits(position.averagePrice, SCALING_FACTOR));
  const size = Number(formatUnits(position.size, SCALING_FACTOR));

  if (isNaN(entryPrice) || isNaN(currentPrice) || isNaN(size)) {
    return {
      pnl: 'N/A',
      fees: { positionFee: '0', borrowFee: '0', fundingFee: '0' }
    };
  }

  const priceDiff = position.isLong ?
    (currentPrice - entryPrice) :
    (entryPrice - currentPrice);

  const rawPnL = (priceDiff * size / entryPrice);

  // Convert fees
  const totalPositionFee = Number(formatUnits(paidFees.paidPositionFee + accruedFees.positionFee, SCALING_FACTOR));
  const totalBorrowFee = Number(formatUnits(paidFees.paidBorrowFee + accruedFees.borrowFee, SCALING_FACTOR));
  const totalFundingFee = Number(formatUnits(paidFees.paidFundingFee + accruedFees.fundingFee, SCALING_FACTOR));

  const finalPnL = rawPnL - totalPositionFee - totalBorrowFee - totalFundingFee;

  return {
    pnl: finalPnL >= 0 ?
      `+$${finalPnL.toFixed(2)}` :
      `-$${Math.abs(finalPnL).toFixed(2)}`,
    fees: {
      positionFee: totalPositionFee.toFixed(2),
      borrowFee: totalBorrowFee.toFixed(2),
      fundingFee: totalFundingFee.toFixed(2)
    }
  };
}

export function usePositions() {
  const [positions, setPositions] = useState<Position[]>([]);
  const { prices } = usePrices();
  const { smartAccount } = useSmartAccount();

  const { data: contractResult, isError, isLoading, refetch } = useReadContract({
    address: LENS_CONTRACT_ADDRESS,
    abi: lensAbi,
    functionName: 'getUserAlivePositions',
    args: smartAccount?.address ? [smartAccount.address as `0x${string}`] : undefined,
    query: {
      enabled: Boolean(smartAccount?.address),
      refetchInterval: 5000
    },
    chainId: arbitrum.id // Explicitly set chainId to Arbitrum
  });

  useEffect(() => {
    if (!contractResult || !Array.isArray(contractResult)) {
      setPositions([]);
      return;
    }

    const [posIds, positionsData, , , paidFeesData, accruedFeesData] = contractResult;

    if (!positionsData.length) {
      setPositions([]);
      return;
    }

    const formattedPositions = positionsData.map((position: ContractPosition, index: number) => {
      const tokenId = position.tokenId.toString();
      const market = TRADING_PAIRS[tokenId] || `Token${tokenId}/USD`;
      const priceKey = getPriceKeyFromTokenId(tokenId);
      const currentPrice = priceKey && prices[priceKey]?.price;
      const entryPrice = Number(formatUnits(position.averagePrice, SCALING_FACTOR));
    
      const { pnl, fees } = currentPrice ?
        calculatePnL(
          position,
          currentPrice,
          paidFeesData[index],
          accruedFeesData[index]
        ) :
        { pnl: 'Loading...', fees: { positionFee: '0', borrowFee: '0', fundingFee: '0' } };
    
      return {
        positionId: posIds[index].toString(),
        market,
        size: Number(formatUnits(position.size, SCALING_FACTOR)).toFixed(2),
        entryPrice: entryPrice.toFixed(2),
        markPrice: currentPrice ? currentPrice.toFixed(2) : 'Loading...',
        pnl,
        isLong: position.isLong,
        margin: Number(formatUnits(position.collateral, SCALING_FACTOR)).toFixed(2),
        liquidationPrice: currentPrice ? calculateLiquidationPrice(
          position, 
          entryPrice,
          accruedFeesData[index]
        ) : 'Loading...',
        fees
      };
    });

    setPositions(formattedPositions);
  }, [contractResult, prices]);

  return {
    positions,
    loading: isLoading,
    error: isError ? new Error('Failed to fetch positions') : null,
    refetch
  };
}
