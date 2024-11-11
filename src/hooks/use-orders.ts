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

export interface TriggerOrder {
  positionId: string;
  market: string;
  takeProfit: {
    price: string;
    size: string;
    type: string;
  } | null;
  stopLoss: {
    price: string;
    size: string;
    type: string;
  } | null;
  timestamp: string;  // Add this field
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

interface TriggerData {
  isTP: boolean;
  amountPercent: bigint;
  createdAt: bigint;
  price: bigint;
  triggeredAmount: bigint;
  triggeredAt: bigint;
  status: number;
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
  0: "Limit",
  1: "Stop",
  2: "StopLimit",
  3: "TakeProfit",
};

function getOrderType(positionType: bigint, stepType: bigint): string {
  const typeNumber = Number(stepType);
  return ORDER_TYPE_MAP[typeNumber] || "Unknown";
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [triggerOrders, setTriggerOrders] = useState<TriggerOrder[]>([]);
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

  const { data: positionsResult } = useReadContract({
    address: LENS_CONTRACT_ADDRESS,
    abi: lensAbi,
    functionName: 'getUserAlivePositions',
    args: smartAccount?.address ? [smartAccount.address as `0x${string}`] : undefined,
    query: {
      enabled: Boolean(smartAccount?.address),
      refetchInterval: 5000
    }
  });

  // Process trigger orders from positions
  useEffect(() => {
    if (!positionsResult || !Array.isArray(positionsResult)) {
      setTriggerOrders([]);
      return;
    }

    const [posIds, positions, , triggers] = positionsResult;

    if (!positions.length) {
      setTriggerOrders([]);
      return;
    }

    const formattedTriggerOrders = positions.map((position: ContractPosition, index: number) => {
      const triggerData = triggers[index] as { triggers: TriggerData[] };
      const market = TOKEN_ID_TO_MARKET[position.tokenId.toString()] || 
                    `Token${position.tokenId.toString()}/USD`;
    
      // Process trigger orders (TP/SL)
      let takeProfit = null;
      let stopLoss = null;
      let latestTimestamp = 0;
    
      if (triggerData && triggerData.triggers && triggerData.triggers.length > 0) {
        triggerData.triggers.forEach((t: TriggerData) => {
          const orderData = {
            price: Number(formatUnits(t.price, SCALING_FACTOR)).toFixed(2),
            size: Number(formatUnits(t.amountPercent, SCALING_FACTOR)).toFixed(2),
            type: t.isTP ? "TakeProfit" : "StopLoss"
          };
    
          // Keep track of the latest timestamp
          latestTimestamp = Math.max(latestTimestamp, Number(t.createdAt));
    
          if (t.isTP) {
            takeProfit = orderData;
          } else {
            stopLoss = orderData;
          }
        });
      }
    
      return {
        positionId: posIds[index].toString(),
        market,
        takeProfit,
        stopLoss,
        timestamp: latestTimestamp ? new Date(latestTimestamp * 1000).toLocaleString() : '-'
      };
    });

    setTriggerOrders(formattedTriggerOrders);
  }, [positionsResult]);

  // Process regular orders
  useEffect(() => {
    if (!contractResult || !Array.isArray(contractResult)) {
      setOrders([]);
      return;
    }

    const [posIds, positions, orders_, triggers, paidFees, accruedFees] = contractResult;

    if (!positions.length) {
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

    setOrders(formattedOrders);
  }, [contractResult, prices]);

  return {
    orders,
    triggerOrders,
    loading: isLoading,
    error: isError ? new Error('Failed to fetch orders') : null,
    refetch
  };
}
