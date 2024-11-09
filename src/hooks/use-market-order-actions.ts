import { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { useToast } from './use-toast';
import { useSmartAccount } from './use-smart-account';

interface MarketOrderResponse {
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

  const placeMarketOrder = async (
    pair: number,
    isLong: boolean,
    currentPrice: number,
    slippagePercent: number,
    margin: number,
    size: number
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

      // Calculate maxAcceptablePrice with 6 decimal precision
      const slippageMultiplier = isLong ? 1.05 : 0.95;
      const maxAcceptablePrice = Number((currentPrice * slippageMultiplier).toFixed(6));

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
          userAddress: smartAccount.address,
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
