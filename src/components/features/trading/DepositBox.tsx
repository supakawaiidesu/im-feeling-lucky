import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSmartAccount } from '@/hooks/use-smart-account';
import { useToast } from '@/components/ui/use-toast';
import { useBalances } from '@/hooks/use-balances';
import { useTokenTransferActions } from '@/hooks/use-token-transfer-actions';
import { useAccount } from 'wagmi';
import { parseUnits, encodeFunctionData } from 'viem';

const TRADING_CONTRACT = '0x5f19704F393F983d5932b4453C6C87E85D22095E';
const USDC_TOKEN = '0xaf88d065e77c8cc2239327c5edb3a432268e5831';

const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

export const DepositBox = () => {
  const [amount, setAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const { smartAccount, kernelClient } = useSmartAccount();
  const { address: eoaAddress } = useAccount();
  const { toast } = useToast();
  const { balances, isLoading: isLoadingBalances } = useBalances();
  const { transferToSmartAccount, isTransferring } = useTokenTransferActions();

  const handleApprove = async () => {
    if (!smartAccount || !kernelClient) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsApproving(true);

      // Encode the approve function call
      const approveCalldata = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [TRADING_CONTRACT, parseUnits(amount, 6)]
      });

      // Send the approval transaction
      const tx = await kernelClient.sendTransaction({
        to: USDC_TOKEN,
        data: approveCalldata,
      });

      await kernelClient.waitForTransactionReceipt({ hash: tx });

      toast({
        title: 'Success',
        description: 'Successfully approved USDC for trading contract',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve USDC',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  const handleWalletOperation = async (type: 'deposit' | 'withdraw') => {
    if (!smartAccount || !kernelClient) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    // Additional validation for deposit/withdraw based on balances
    if (type === 'deposit') {
      // For deposits, first check if smart account has enough USDC
      if (balances && parseFloat(amount) > parseFloat(balances.formattedUsdcBalance)) {
        // If smart account doesn't have enough, check if EOA has enough to potentially transfer
        if (parseFloat(amount) > parseFloat(balances.formattedEoaUsdcBalance)) {
          toast({
            title: 'Error',
            description: 'Insufficient USDC balance in your wallet',
            variant: 'destructive',
          });
          return;
        }
        // Prompt user to transfer to smart account first
        toast({
          title: 'Action Required',
          description: 'Please transfer USDC to your smart account first using the Transfer button',
        });
        return;
      }

      // Check if we have enough allowance
      if (balances && parseFloat(amount) > parseFloat(balances.formattedUsdcAllowance)) {
        toast({
          title: 'Action Required',
          description: 'Approval needed for trading contract',
        });
        
        const approved = await handleApprove();
        if (!approved) return;
      }
    }

    if (type === 'withdraw' && balances && parseFloat(amount) > parseFloat(balances.formattedMusdBalance)) {
      toast({
        title: 'Error',
        description: 'Insufficient deposited balance',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('https://unidexv4-api-production.up.railway.app/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          tokenAddress: USDC_TOKEN,
          amount,
          smartAccountAddress: smartAccount.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process wallet operation');
      }

      const tx = await kernelClient.sendTransaction({
        to: data.vaultAddress,
        data: data.calldata,
      });

      await kernelClient.waitForTransactionReceipt({ hash: tx });
      
      toast({
        title: 'Success',
        description: `Successfully ${type}ed ${amount} USDC`,
      });
      
      setAmount('');
      setIsOpen(false);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process wallet operation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferToSmartAccount = async () => {
    if (!eoaAddress) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      await transferToSmartAccount(amount, eoaAddress);
      setAmount('');
    } catch (error) {
      // Error is already handled in the hook
      console.error('Transfer failed:', error);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
      >
        Deposit/Withdraw
      </Button>
    );
  }

  const needsTransferToSmart = balances && parseFloat(amount || '0') > parseFloat(balances.formattedUsdcBalance);
  const hasEnoughInEoa = balances && parseFloat(amount || '0') <= parseFloat(balances.formattedEoaUsdcBalance);
  const needsApproval = balances && parseFloat(amount || '0') > parseFloat(balances.formattedUsdcAllowance);

  return (
    <Card className="absolute z-50 p-4 top-14 right-4 w-96 bg-background border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Deposit/Withdraw</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsOpen(false)}
        >
          ×
        </Button>
      </div>

      <div className="space-y-4">
        {/* Display both EOA and Smart Account addresses */}
        <div className="p-2 space-y-2 text-xs rounded bg-muted/50">
          <div className="space-y-1">
            <p className="font-medium text-muted-foreground">Connected Wallet (EOA):</p>
            <p className="font-mono break-all">{eoaAddress || 'Not connected'}</p>
            {balances && (
              <p className="text-sm">USDC Balance: {parseFloat(balances.formattedEoaUsdcBalance).toFixed(2)}</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="font-medium text-muted-foreground">Smart Account:</p>
            <p className="font-mono break-all">{smartAccount?.address || 'Not created'}</p>
            {balances && (
              <>
                <p className="text-sm">USDC Balance: {parseFloat(balances.formattedUsdcBalance).toFixed(2)}</p>
                <p className="text-sm">USDC Allowance: {parseFloat(balances.formattedUsdcAllowance).toFixed(2)}</p>
              </>
            )}
          </div>
        </div>

        {balances && (
          <div className="p-2 space-y-1 text-sm rounded bg-muted">
            <p className="font-medium">Trading Contract Balance:</p>
            <p>Deposited USDC: {parseFloat(balances.formattedMusdBalance).toFixed(2)}</p>
          </div>
        )}
        {isLoadingBalances && (
          <div className="text-sm text-muted-foreground">Loading balances...</div>
        )}

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USDC)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Show transfer to smart account button when needed */}
        {needsTransferToSmart && hasEnoughInEoa && (
          <Button
            className="w-full"
            onClick={handleTransferToSmartAccount}
            disabled={isTransferring || !amount}
          >
            {isTransferring ? 'Transferring...' : 'Transfer USDC to Smart Account'}
          </Button>
        )}

        {/* Show approve button when needed */}
        {needsApproval && !needsTransferToSmart && (
          <Button
            className="w-full"
            onClick={handleApprove}
            disabled={isApproving || !amount}
          >
            {isApproving ? 'Approving...' : 'Approve USDC for Trading'}
          </Button>
        )}

        <div className="flex space-x-2">
          <Button
            className="flex-1"
            onClick={() => handleWalletOperation('deposit')}
            disabled={isLoading || !amount || !balances || parseFloat(amount) > parseFloat(balances.formattedUsdcBalance) || needsApproval || undefined}
          >
            {isLoading ? 'Processing...' : 'Deposit'}
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleWalletOperation('withdraw')}
            disabled={isLoading || !amount || !balances || parseFloat(amount) > parseFloat(balances.formattedMusdBalance)}
          >
            {isLoading ? 'Processing...' : 'Withdraw'}
          </Button>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p>Note: To deposit into the trading contract:</p>
          <ol className="pl-2 list-decimal list-inside">
            <li>First ensure your Smart Account has enough USDC</li>
            <li>Approve USDC spending if needed</li>
            <li>Then deposit from Smart Account to trading contract</li>
          </ol>
        </div>
      </div>
    </Card>
  );
};
