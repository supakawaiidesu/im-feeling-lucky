import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSmartAccount } from '@/hooks/use-smart-account';
import { useToast } from '@/components/ui/use-toast';
import { useBalances } from '@/hooks/use-balances';
import { useTokenTransferActions } from '@/hooks/use-token-transfer-actions';
import { useAccount } from 'wagmi';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

export default function DepositWithdrawBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [smartAccountAmount, setSmartAccountAmount] = useState('');
  const [tradingAmount, setTradingAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  
  const { smartAccount, kernelClient, setupSessionKey, isSigningSessionKey } = useSmartAccount();
  const { address: eoaAddress } = useAccount();
  const { toast } = useToast();
  const { balances, isLoading: isLoadingBalances, isError: isBalancesError, refetchBalances } = useBalances();
  const { transferToSmartAccount, isTransferring } = useTokenTransferActions();

  // Effect to refetch balances after smart account setup
  useEffect(() => {
    if (smartAccount?.address) {
      console.log('Smart account detected, fetching balances...');
      refetchBalances();
    }
  }, [smartAccount?.address, refetchBalances]);

  // Effect to show toast when balances fail to load
  useEffect(() => {
    if (isBalancesError && smartAccount) {
      toast({
        title: 'Error',
        description: 'Failed to load balances. Please refresh the page.',
        variant: 'destructive',
      });
    }
  }, [isBalancesError, smartAccount, toast]);

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Deposit/Withdraw
      </Button>
    );
  }

  const handleSetupSmartAccount = async () => {
    try {
      await setupSessionKey();
      toast({
        title: 'Success',
        description: 'Smart Account successfully created',
      });
      refetchBalances();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to setup smart account',
        variant: 'destructive',
      });
    }
  };

  const handleMaxClick = (type: 'smart-account' | 'trading') => {
    if (!balances) return;

    if (type === 'smart-account') {
      setSmartAccountAmount(balances.formattedEoaUsdcBalance);
    } else {
      setTradingAmount(balances.formattedUsdcBalance);
    }
  };

  const handleApproveAndDeposit = async () => {
    if (!smartAccount || !kernelClient) return;

    try {
      setIsApproving(true);
      toast({
        title: 'Processing',
        description: 'Approving USDC for trading contract...',
      });

      const approveCalldata = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [TRADING_CONTRACT, parseUnits(tradingAmount, 6)]
      });

      const tx = await kernelClient.sendTransaction({
        to: USDC_TOKEN,
        data: approveCalldata,
      });

      await kernelClient.waitForTransactionReceipt({ hash: tx });
      
      // Proceed with deposit after approval
      await handleTradingOperation('deposit');

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve and deposit USDC',
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleSmartAccountOperation = async (type: 'deposit' | 'withdraw') => {
    if (!eoaAddress || !smartAccount) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    // Validate balances for Smart Account operations
    if (type === 'deposit') {
      if (balances && parseFloat(smartAccountAmount) > parseFloat(balances.formattedEoaUsdcBalance)) {
        toast({
          title: 'Error',
          description: 'Insufficient USDC balance in your wallet',
          variant: 'destructive',
        });
        return;
      }
    } else { // withdraw
      if (balances && parseFloat(smartAccountAmount) > parseFloat(balances.formattedUsdcBalance)) {
        toast({
          title: 'Error',
          description: 'Insufficient USDC balance in Smart Account',
          variant: 'destructive',
        });
        return;
      }
    }
    
    try {
      if (type === 'deposit') {
        await transferToSmartAccount(smartAccountAmount, eoaAddress);
      } else {
        // Add withdrawal logic from smart account to EOA here
        toast({
          title: 'Coming Soon',
          description: 'Withdrawal to EOA functionality coming soon',
        });
      }
      setSmartAccountAmount('');
      refetchBalances();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${type}`,
        variant: 'destructive',
      });
    }
  };

  const handleTradingOperation = async (type: 'deposit' | 'withdraw') => {
    if (!smartAccount || !kernelClient) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    // Validation for trading contract operations
    if (type === 'deposit') {
      // Check smart account balance
      if (balances && parseFloat(tradingAmount) > parseFloat(balances.formattedUsdcBalance)) {
        toast({
          title: 'Error',
          description: 'Insufficient USDC balance in Smart Account',
          variant: 'destructive',
        });
        return;
      }
    } else { // withdraw
      if (balances && parseFloat(tradingAmount) > parseFloat(balances.formattedMusdBalance)) {
        toast({
          title: 'Error',
          description: 'Insufficient deposited balance in Trading Contract',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('https://unidexv4-api-production.up.railway.app/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          tokenAddress: USDC_TOKEN,
          amount: tradingAmount,
          smartAccountAddress: smartAccount.address,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to process wallet operation');

      const tx = await kernelClient.sendTransaction({
        to: data.vaultAddress,
        data: data.calldata,
      });

      await kernelClient.waitForTransactionReceipt({ hash: tx });
      
      toast({
        title: 'Success',
        description: `Successfully ${type}ed ${tradingAmount} USDC`,
      });
      
      setTradingAmount('');
      refetchBalances();

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${type}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const needsApproval = balances && parseFloat(tradingAmount || '0') > parseFloat(balances.formattedUsdcAllowance);

  return (
    <Card className="absolute z-50 p-6 space-y-6 top-14 right-4 w-[480px] bg-background border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Balance Management</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>×</Button>
      </div>

      <div className="grid grid-cols-3 gap-4 p-4 text-sm rounded-lg bg-muted/50">
        <div>
          <div className="font-medium mb-1.5">EOA Wallet</div>
          <div className="truncate">{eoaAddress || 'Not connected'}</div>
          <div className="mt-1 font-medium">
            {isLoadingBalances ? 'Loading...' : 
              `${balances ? parseFloat(balances.formattedEoaUsdcBalance).toFixed(2) : '0.00'} USDC`}
          </div>
        </div>

        <div>
          <div className="font-medium mb-1.5">Smart Account</div>
          <div className="truncate">{smartAccount?.address || 'Not created'}</div>
          <div className="mt-1 font-medium">
            {isLoadingBalances ? 'Loading...' : 
              `${balances ? parseFloat(balances.formattedUsdcBalance).toFixed(2) : '0.00'} USDC`}
          </div>
        </div>

        <div>
          <div className="font-medium mb-1.5">Trading Contract</div>
          <div className="truncate">Deposited Balance</div>
          <div className="mt-1 font-medium">
            {isLoadingBalances ? 'Loading...' : 
              `${balances ? parseFloat(balances.formattedMusdBalance).toFixed(2) : '0.00'} USDC`}
          </div>
        </div>
      </div>

      {!smartAccount && eoaAddress && (
        <Alert>
          <AlertDescription>
            <Button
              size="sm"
              onClick={handleSetupSmartAccount}
              disabled={isSigningSessionKey}
            >
              {isSigningSessionKey ? 'Setting up...' : 'Setup Smart Account'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="smart-account" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="smart-account" className="flex-1">Smart Account</TabsTrigger>
          <TabsTrigger value="trading" className="flex-1">Trading Contract</TabsTrigger>
        </TabsList>

        <TabsContent value="smart-account" className="space-y-4">
          <div className="space-y-2">
            <Label>Amount (USDC)</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={smartAccountAmount}
                onChange={(e) => setSmartAccountAmount(e.target.value)}
                disabled={!smartAccount || isLoadingBalances}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute h-6 px-2 py-0 -translate-y-1/2 right-2 top-1/2"
                onClick={() => handleMaxClick('smart-account')}
                disabled={!balances || isLoadingBalances}
              >
                MAX
              </Button>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              className="flex-1"
              onClick={() => handleSmartAccountOperation('deposit')}
              disabled={
                isTransferring || 
                !smartAccountAmount || 
                !eoaAddress || 
                !balances ||
                parseFloat(smartAccountAmount) > parseFloat(balances.formattedEoaUsdcBalance)
              }
            >
              {isTransferring ? 'Processing...' : 'Deposit to Smart Account'}
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleSmartAccountOperation('withdraw')}
              disabled={
                isTransferring || 
                !smartAccountAmount || 
                !smartAccount ||
                !balances ||
                parseFloat(smartAccountAmount) > parseFloat(balances.formattedUsdcBalance)
              }
            >
              {isTransferring ? 'Processing...' : 'Withdraw to EOA'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <div className="space-y-2">
            <Label>Amount (USDC)</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={tradingAmount}
                onChange={(e) => setTradingAmount(e.target.value)}
                disabled={!smartAccount || isLoadingBalances}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute h-6 px-2 py-0 -translate-y-1/2 right-2 top-1/2"
                onClick={() => handleMaxClick('trading')}
                disabled={!balances || isLoadingBalances}
              >
                MAX
              </Button>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              className="flex-1"
              onClick={needsApproval ? handleApproveAndDeposit : () => handleTradingOperation('deposit')}
              disabled={
                isLoading || 
                isApproving ||
                !tradingAmount || 
                !balances || 
                parseFloat(tradingAmount) > parseFloat(balances.formattedUsdcBalance) || 
                !smartAccount ||
                isLoadingBalances
              }
            >
              {isLoading || isApproving ? 'Processing...' : 
                needsApproval ? 'Approve USDC' : 'Deposit to Trading'}
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleTradingOperation('withdraw')}
              disabled={
                isLoading || 
                !tradingAmount || 
                !balances || 
                parseFloat(tradingAmount) > parseFloat(balances.formattedMusdBalance) || 
                !smartAccount ||
                isLoadingBalances
              }
            >
              {isLoading ? 'Processing...' : 'Withdraw from Trading'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Note: Operation Flow</p>
        <ol className="pl-2 list-decimal list-inside">
          <li>Transfer USDC between EOA and Smart Account using the Smart Account tab</li>
          <li>Use the Trading Contract tab to deposit/withdraw from trading</li>
          <li>Approvals are required for first-time trading contract deposits</li>
        </ol>
      </div>
    </Card>
  );
}