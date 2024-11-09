import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSmartAccount } from '@/hooks/use-smart-account';
import { useToast } from '@/components/ui/use-toast';
import { useBalances } from '@/hooks/use-balances';

export const DepositBox = () => {
  const [amount, setAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { smartAccount, kernelClient } = useSmartAccount();
  const { toast } = useToast();
  const { balances, isLoading: isLoadingBalances } = useBalances();

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
    if (type === 'deposit' && balances && parseFloat(amount) > parseFloat(balances.formattedUsdcBalance)) {
      toast({
        title: 'Error',
        description: 'Insufficient USDC balance',
        variant: 'destructive',
      });
      return;
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
      
      // USDC on Arbitrum
      const tokenAddress = '0xaf88d065e77c8cc2239327c5edb3a432268e5831';
      
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          tokenAddress,
          amount,
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

  return (
    <Card className="absolute z-50 p-4 top-14 right-4 w-80 bg-background border-border">
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
        {balances && (
          <div className="p-2 space-y-1 text-sm rounded bg-muted">
            <p>Available USDC: {parseFloat(balances.formattedUsdcBalance).toFixed(2)}</p>
            <p>Deposited Balance: {parseFloat(balances.formattedMusdBalance).toFixed(2)}</p>
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

        <div className="flex space-x-2">
          <Button
            className="flex-1"
            onClick={() => handleWalletOperation('deposit')}
            disabled={isLoading || !amount || !balances || parseFloat(amount) > parseFloat(balances.formattedUsdcBalance)}
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
      </div>
    </Card>
  );
};
