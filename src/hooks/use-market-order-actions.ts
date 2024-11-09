import { useState } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { useToast } from './use-toast';

interface MarketOrderResponse {
  calldata: string;
  vaultAddress: string;
  insufficientBalance: boolean;
  requiredGasFee: string;
  error?: string;
}

export function useMarketOrderActions() {
  const [placingOrders, setPlacingOrders] = useState<boolean>(false);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { toast } = useToast();

  const placeMarketOrder = async (
    pair: number,
    isLong: boolean,
    maxAcceptablePrice: number,
    slippagePercent: number,
    margin: number,
    size: number,
    userAddress: string
  ) => {
    if (!walletClient || !userAddress || !publicClient) {
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

      const response = await fetch('https://unidexv4-api-production.up.railway.app/api/newposition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pair,
          isLong,
          orderType: "market",
          maxAcceptablePrice,
          slippagePercent,
          margin,
          size,
          userAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place market order');
      }

      const data: MarketOrderResponse = await response.json();

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

      const hash = await walletClient.sendTransaction({
        account: userAddress as `0x${string}`,
        to: data.vaultAddress as `0x${string}`,
        data: data.calldata as `0x${string}`,
        value: BigInt(0),
      });

      toast({
        title: "Transaction Sent",
        description: "Waiting for confirmation...",
      });

      await publicClient.waitForTransactionReceipt({ hash });

      toast({
        title: "Success",
        description: "Market order placed successfully",
      });

    } catch (err) {
      console.error('Error placing market order:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to place market order",
        variant: "destructive",
      });
    } finally {
      setPlacingOrders(false);
    }
  };

  return {
    placeMarketOrder,
    placingOrders,
  };
}
