import { useState } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { useToast } from './use-toast';

interface ClosePositionResponse {
  calldata: string;
  vaultAddress: string;
  requiredGasFee: string;
}

export function usePositionActions() {
  const [closingPositions, setClosingPositions] = useState<{ [key: number]: boolean }>({});
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { toast } = useToast();

  const closePosition = async (
    positionId: number,
    address: string,
    isLong: boolean,
    currentPrice: number,
    size: number  // Add size parameter
  ) => {
    if (!walletClient || !address || !publicClient) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setClosingPositions(prev => ({ ...prev, [positionId]: true }));

      toast({
        title: "Closing Position",
        description: "Preparing transaction...",
      });

      const allowedPrice = isLong ? currentPrice * 0.95 : currentPrice * 1.05;

      const response = await fetch('https://unidexv4-api-production.up.railway.app/api/closeposition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positionId,
          sizeDelta: size,  // Use the actual position size
          allowedPrice,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get close position data');
      }

      const data: ClosePositionResponse = await response.json();

      toast({
        title: "Confirm Transaction",
        description: "Please confirm the transaction in your wallet",
      });

      const hash = await walletClient.sendTransaction({
        account: address as `0x${string}`,
        to: data.vaultAddress as `0x${string}`,
        data: data.calldata as `0x${string}`,
        value: parseEther("0"),
      });

      toast({
        title: "Transaction Sent",
        description: "Waiting for confirmation...",
      });

      await publicClient.waitForTransactionReceipt({ hash });

      toast({
        title: "Success",
        description: "Position closed successfully",
      });

    } catch (err) {
      console.error('Error closing position:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to close position",
        variant: "destructive",
      });
    } finally {
      setClosingPositions(prev => ({ ...prev, [positionId]: false }));
    }
  };

  return {
    closePosition,
    closingPositions,
  };
}