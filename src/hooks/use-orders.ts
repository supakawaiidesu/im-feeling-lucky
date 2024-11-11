import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { usePrices } from '../lib/websocket-price-context';
import { useSmartAccount } from './use-smart-account';
import { lensAbi } from '../lib/abi/lens';

const LENS_CONTRACT_ADDRESS = '0xeae57c7bce5caf160343a83440e98bc976ab7274' as `0x${string}`;
const SCALING_FACTOR = 30; // For formatUnits

export interface Order {
  orderId: string;
  market: string;
  size: string;
  limitPrice: string;
  stopPrice: string;
  markPrice: string;
  type: string;
  isLong: boolean;
  margin: string;
  timestamp: string;
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

interface ContractTrigger {
  // Empty array in the example, but define fields if needed
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

const TOKEN_ID_TO_PRICE_KEY: { [key: string]: string } = {
  "1": "btc",
  "2": "eth",
};

const TOKEN_ID_TO_MARKET: { [key: string]: string } = {
  "1": "BTC/USD",
  "2": "ETH/USD",
};

const ORDER_TYPE_MAP: { [key: number]: string } = {
  0: "Market",
  1: "Limit",
  2: "Stop",
  3: "StopLimit",
  4: "TakeProfit",
  5: "TakeProfitLimit"
};

function getOrderType(positionType: bigint, stepType: bigint): string {
  const typeNumber = Number(stepType);
  return ORDER_TYPE_MAP[typeNumber] || "Unknown";
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { prices } = usePrices();
  const { smartAccount } = useSmartAccount();

  const { data: contractResult, isError, isLoading, refetch } = useReadContract({
    address: LENS_CONTRACT_ADDRESS,
    abi: lensAbi,
    functionName: 'getUserOpenOrders',
    args: smartAccount?.address ? [smartAccount.address as `0x${string}`] : undefined,
    query: {
      enabled: Boolean(smartAccount?.address),
      refetchInterval: 5000
    }
  });

  useEffect(() => {
    // Log initial contract result
    console.log('Raw Contract Result:', {
      contractResult,
      timestamp: new Date().toISOString()
    });

    if (!contractResult || !Array.isArray(contractResult)) {
      console.log('No contract result or invalid format');
      setOrders([]);
      return;
    }

    const [posIds, positions, orders_, triggers, paidFees, accruedFees] = contractResult;

    // Log destructured data
    console.log('Destructured Contract Data:', {
      positionIds: posIds,
      positions,
      orders: orders_,
      triggers,
      paidFees,
      accruedFees,
      timestamp: new Date().toISOString()
    });

    if (!positions.length) {
      console.log('No positions found');
      setOrders([]);
      return;
    }

    const formattedOrders = positions.map((position: ContractPosition, index: number) => {
      const order = orders_[index] as ContractOrder;
      const market = TOKEN_ID_TO_MARKET[position.tokenId.toString()] || 
                    `Token${position.tokenId.toString()}/USD`;
      const priceKey = TOKEN_ID_TO_PRICE_KEY[position.tokenId.toString()];
      const currentPrice = priceKey && prices[priceKey]?.price;

      // Calculate total fees
      const paidFee = paidFees[index] as ContractPaidFees;
      const accruedFee = accruedFees[index] as ContractAccruedFees;
      const totalFees = {
        positionFee: Number(formatUnits(paidFee.paidPositionFee + accruedFee.positionFee, SCALING_FACTOR)),
        borrowFee: Number(formatUnits(paidFee.paidBorrowFee + accruedFee.borrowFee, SCALING_FACTOR)),
        fundingFee: Number(formatUnits(paidFee.paidFundingFee + accruedFee.fundingFee, SCALING_FACTOR))
      };

      // Log individual order processing
      console.log(`Processing Order ${index}:`, {
        position,
        order,
        market,
        priceKey,
        currentPrice,
        totalFees,
        timestamp: new Date().toISOString()
      });

      return {
        orderId: posIds[index].toString(),
        market,
        size: Number(formatUnits(order.size, SCALING_FACTOR)).toFixed(2),
        limitPrice: Number(formatUnits(order.lmtPrice || BigInt(0), SCALING_FACTOR)).toFixed(2),
        stopPrice: Number(formatUnits(order.stpPrice || BigInt(0), SCALING_FACTOR)).toFixed(2),
        markPrice: currentPrice ? currentPrice.toFixed(2) : 'Loading...',
        type: getOrderType(order.positionType || BigInt(0), order.stepType || BigInt(0)),
        isLong: position.isLong,
        margin: Number(formatUnits(order.collateral, SCALING_FACTOR)).toFixed(2),
        timestamp: new Date(Number(order.timestamp) * 1000).toLocaleString()
      };
    });

    // Log final formatted orders
    console.log('Final Formatted Orders:', {
      formattedOrders,
      timestamp: new Date().toISOString()
    });

    setOrders(formattedOrders);
  }, [contractResult, prices]);

  return {
    orders,
    loading: isLoading,
    error: isError ? new Error('Failed to fetch orders') : null,
    refetch
  };
}