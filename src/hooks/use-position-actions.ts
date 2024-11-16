import { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { useToast } from './use-toast';
import { useSmartAccount } from './use-smart-account';

interface ClosePositionResponse {
  calldata: string;
  vaultAddress: string;
  requiredGasFee: string;
}

interface AddTPSLResponse {
  calldata: string;
  vaultAddress: string;
  requiredGasFee: string;
}

interface ModifyCollateralResponse {
  calldata: string;
  vaultAddress: string;
  requiredGasFee: string;
}

export function usePositionActions() {
  const [closingPositions, setClosingPositions] = useState<{ [key: number]: boolean }>({});
  const [settingTPSL, setSettingTPSL] = useState<{ [key: number]: boolean }>({});
  const [modifyingCollateral, setModifyingCollateral] = useState<{ [key: number]: boolean }>({});
  const publicClient = usePublicClient();
  const { toast } = useToast();
  const { smartAccount, kernelClient } = useSmartAccount();

  const closePosition = async (
    positionId: number,
    isLong: boolean,
    currentPrice: number,
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
          sizeDelta: size,
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

      await kernelClient.sendTransaction({
        to: data.vaultAddress,
        data: data.calldata,
      });

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

  const addTPSL = async (
    positionId: number,
    takeProfit: number | null,
    stopLoss: number | null,
    takeProfitClosePercent: number,
    stopLossClosePercent: number
  ) => {
    if (!kernelClient || !smartAccount?.address || !publicClient) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!takeProfit && !stopLoss) {
      toast({
        title: "Error",
        description: "Please set either Take Profit or Stop Loss",
        variant: "destructive",
      });
      return;
    }

    try {
      setSettingTPSL(prev => ({ ...prev, [positionId]: true }));

      toast({
        title: "Setting TP/SL",
        description: "Preparing transaction...",
      });

      const response = await fetch('https://unidexv4-api-production.up.railway.app/api/position/add-tpsl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positionId,
          takeProfit,
          stopLoss,
          takeProfitClosePercent,
          stopLossClosePercent,
          userAddress: smartAccount.address
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get TP/SL data');
      }

      const data: AddTPSLResponse = await response.json();

      toast({
        title: "Confirm Transaction",
        description: "Please confirm the transaction in your wallet",
      });

      await kernelClient.sendTransaction({
        to: data.vaultAddress,
        data: data.calldata,
      });

      toast({
        title: "Success",
        description: "TP/SL set successfully",
      });

    } catch (err) {
      console.error('Error setting TP/SL:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to set TP/SL",
        variant: "destructive",
      });
    } finally {
      setSettingTPSL(prev => ({ ...prev, [positionId]: false }));
    }
  };

  const modifyCollateral = async (
    positionId: number,
    amount: number,
    isAdd: boolean
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
      setModifyingCollateral(prev => ({ ...prev, [positionId]: true }));

      toast({
        title: `${isAdd ? 'Adding' : 'Removing'} Collateral`,
        description: "Preparing transaction...",
      });

      const response = await fetch('https://unidexv4-api-production.up.railway.app/api/position/modify-collateral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positionId,
          amount,
          isAdd,
          userAddress: smartAccount.address
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to modify collateral');
      }

      const data: ModifyCollateralResponse = await response.json();

      toast({
        title: "Confirm Transaction",
        description: "Please confirm the transaction in your wallet",
      });

      await kernelClient.sendTransaction({
        to: data.vaultAddress,
        data: data.calldata,
      });

      toast({
        title: "Success",
        description: `Successfully ${isAdd ? 'added' : 'removed'} collateral`,
      });

    } catch (err) {
      console.error('Error modifying collateral:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to modify collateral",
        variant: "destructive",
      });
    } finally {
      setModifyingCollateral(prev => ({ ...prev, [positionId]: false }));
    }
  };

  return {
    closePosition,
    closingPositions,
    addTPSL,
    settingTPSL,
    modifyCollateral,
    modifyingCollateral
  };
}
