import { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { useToast } from './use-toast';
import { useSmartAccount } from './use-smart-account';

interface OrderResponse {
  calldata: string;
  vaultAddress: string;
  insufficientBalance: boolean;
  requiredGasFee: string;
  error?: string;
}

export function useMarketOrderActions() {
  const [placingOrders, setPlacingOrders] = useState<boolean>(false);
  const publicClient = usePublicClient();
  const { toast } = useToast();
  const { smartAccount, kernelClient } = useSmartAccount();

  const placeOrder = async (
    pair: number,
    isLong: boolean,
    price: number,
    slippagePercent: number,
    margin: number,
    size: number,
    orderType: "market" | "limit"
  ) => {
    if (!kernelClient || !smartAccount?.address || !publicClient) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setPlacingOrders(true);

      toast({
        title: "Placing Order",
        description: "Preparing transaction...",
      });

      // For market orders, calculate maxAcceptablePrice with slippage
      // For limit orders, use the exact limit price
      const maxAcceptablePrice = orderType === "market" 
        ? Number((price * (isLong ? 1.05 : 0.95)).toFixed(6))
        : Number(price.toFixed(6));

      const response = await fetch('https://unidexv4-api-production.up.railway.app/api/newposition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pair,
          isLong,
          orderType,
          maxAcceptablePrice,
          slippagePercent,
          margin,
          size,
          userAddress: smartAccount.address,
          ...(orderType === "limit" && { limitPrice: price }),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to place ${orderType} order`);
      }

      const data: OrderResponse = await response.json();

      if (data.insufficientBalance) {
        toast({
          title: "Error",
          description: "Insufficient balance to place order",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Confirm Transaction",
        description: "Please confirm the transaction in your wallet",
      });

      const tx = await kernelClient.sendTransaction({
        to: data.vaultAddress,
        data: data.calldata,
      });

      toast({
        title: "Transaction Sent",
        description: "Waiting for confirmation...",
      });

      await kernelClient.waitForTransactionReceipt({ hash: tx });

      toast({
        title: "Success",
        description: `${orderType.charAt(0).toUpperCase() + orderType.slice(1)} order placed successfully`,
      });

    } catch (err) {
      console.error(`Error placing ${orderType} order:`, err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : `Failed to place ${orderType} order`,
        variant: "destructive",
      });
    } finally {
      setPlacingOrders(false);
    }
  };

  const placeMarketOrder = (
    pair: number,
    isLong: boolean,
    currentPrice: number,
    slippagePercent: number,
    margin: number,
    size: number
  ) => {
    return placeOrder(pair, isLong, currentPrice, slippagePercent, margin, size, "market");
  };

  const placeLimitOrder = (
    pair: number,
    isLong: boolean,
    limitPrice: number,
    slippagePercent: number,
    margin: number,
    size: number
  ) => {
    return placeOrder(pair, isLong, limitPrice, slippagePercent, margin, size, "limit");
  };

  return {
    placeMarketOrder,
    placeLimitOrder,
    placingOrders,
  };
}
