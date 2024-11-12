import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSmartAccount } from "@/hooks/use-smart-account"
import { useToast } from "@/components/ui/use-toast"
import { useBalances } from "@/hooks/use-balances"
import { useTokenTransferActions } from "@/hooks/use-token-transfer-actions"
import { useAccount } from 'wagmi'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { parseUnits, encodeFunctionData } from 'viem'
import { AmountInput } from './AmountInput'
import { BalanceDisplay } from './BalanceDisplay'
import { ActionButtons } from './ActionButtons'

const TRADING_CONTRACT = '0x5f19704F393F983d5932b4453C6C87E85D22095E'
const USDC_TOKEN = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'

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
] as const

export default function DepositBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [smartAccountAmount, setSmartAccountAmount] = useState('')
  const [tradingAmount, setTradingAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  
  const { smartAccount, kernelClient, setupSessionKey, isSigningSessionKey, isInitialized } = useSmartAccount()
  const { address: eoaAddress } = useAccount()
  const { toast } = useToast()
  const { balances, isLoading: isLoadingBalances, refetchBalances } = useBalances()
  const { transferToSmartAccount, isTransferring } = useTokenTransferActions()

  useEffect(() => {
    if (smartAccount?.address) {
      refetchBalances()
    }
  }, [smartAccount?.address, refetchBalances])

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="bg-[hsl(var(--component-background))]"
      >
        Deposit / Withdraw
      </Button>
    )
  }

  const handleSetupSmartAccount = async () => {
    try {
      await setupSessionKey()
      toast({
        title: 'Success',
        description: '1CT Account successfully created',
      })
      refetchBalances()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to setup 1CT account',
        variant: 'destructive',
      })
    }
  }

  const handleMaxClick = (type: 'smart-account' | 'trading') => {
    if (!balances) return

    if (type === 'smart-account') {
      setSmartAccountAmount(balances.formattedEoaUsdcBalance)
    } else {
      setTradingAmount(balances.formattedUsdcBalance)
    }
  }

  const handleApproveAndDeposit = async () => {
    if (!smartAccount || !kernelClient) return

    try {
      setIsApproving(true)
      toast({
        title: 'Processing',
        description: 'Approving USDC for trading contract...',
      })

      const approveCalldata = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [TRADING_CONTRACT, parseUnits(tradingAmount, 6)]
      })

      const tx = await kernelClient.sendTransaction({
        to: USDC_TOKEN,
        data: approveCalldata,
      })

      await kernelClient.waitForTransactionReceipt({ hash: tx })
      
      await handleTradingOperation('deposit')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve and deposit USDC',
        variant: 'destructive',
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleSmartAccountOperation = async (type: 'deposit' | 'withdraw') => {
    if (!eoaAddress || !smartAccount) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      })
      return
    }

    if (type === 'deposit' && balances && parseFloat(smartAccountAmount) > parseFloat(balances.formattedEoaUsdcBalance)) {
      toast({
        title: 'Error',
        description: 'Insufficient USDC balance in your wallet',
        variant: 'destructive',
      })
      return
    }

    if (type === 'withdraw' && balances && parseFloat(smartAccountAmount) > parseFloat(balances.formattedUsdcBalance)) {
      toast({
        title: 'Error',
        description: 'Insufficient USDC balance in 1CT Wallet',
        variant: 'destructive',
      })
      return
    }
    
    try {
      if (type === 'deposit') {
        await transferToSmartAccount(smartAccountAmount, eoaAddress)
      } else {
        toast({
          title: 'Coming Soon',
          description: 'Withdrawal to EOA functionality coming soon',
        })
      }
      setSmartAccountAmount('')
      refetchBalances()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${type}`,
        variant: 'destructive',
      })
    }
  }

  const handleTradingOperation = async (type: 'deposit' | 'withdraw') => {
    if (!smartAccount || !kernelClient) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      })
      return
    }

    if (type === 'deposit' && balances && parseFloat(tradingAmount) > parseFloat(balances.formattedUsdcBalance)) {
      toast({
        title: 'Error',
        description: 'Insufficient USDC balance in 1CT Wallet',
        variant: 'destructive',
      })
      return
    }

    if (type === 'withdraw' && balances && parseFloat(tradingAmount) > parseFloat(balances.formattedMusdBalance)) {
      toast({
        title: 'Error',
        description: 'Insufficient deposited balance in Trading Contract',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch('https://unidexv4-api-production.up.railway.app/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          tokenAddress: USDC_TOKEN,
          amount: tradingAmount,
          smartAccountAddress: smartAccount.address,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to process wallet operation')

      const tx = await kernelClient.sendTransaction({
        to: data.vaultAddress,
        data: data.calldata,
      })

      await kernelClient.waitForTransactionReceipt({ hash: tx })
      
      toast({
        title: 'Success',
        description: `Successfully ${type}ed ${tradingAmount} USDC`,
      })
      
      setTradingAmount('')
      refetchBalances()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${type}`,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const needsApproval = balances ? parseFloat(tradingAmount || '0') > parseFloat(balances.formattedUsdcAllowance) : false

  return (
    <Card className="absolute z-50 p-6 space-y-6 top-14 right-4 w-[480px] bg-[hsl(var(--component-background))]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Balance Management</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>×</Button>
      </div>

      {!smartAccount && eoaAddress ? (
        <div className="space-y-4">
          <Alert>
            <AlertDescription className="space-y-4">
              <p className="text-sm">To get started with trading, you'll need to setup your 1CT wallet first.</p>
              <Button
                size="sm"
                onClick={handleSetupSmartAccount}
                disabled={isSigningSessionKey}
              >
                {isSigningSessionKey ? 'Setting up...' : 'Setup 1CT Wallet'}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <>
          <BalanceDisplay
            eoaAddress={eoaAddress}
            smartAccountAddress={smartAccount?.address}
            eoaBalance={balances ? parseFloat(balances.formattedEoaUsdcBalance).toFixed(2) : '0.00'}
            smartAccountBalance={balances ? parseFloat(balances.formattedUsdcBalance).toFixed(2) : '0.00'}
            marginBalance={balances ? parseFloat(balances.formattedMusdBalance).toFixed(2) : '0.00'}
            isLoading={isLoadingBalances}
            isEffectivelyInitialized={isInitialized || !!smartAccount?.address}
          />

          <Tabs defaultValue="smart-account" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="smart-account" className="flex-1">1CT Wallet</TabsTrigger>
              <TabsTrigger value="trading" className="flex-1">Margin Balance</TabsTrigger>
            </TabsList>

            <TabsContent value="smart-account" className="space-y-4">
              <AmountInput
                amount={smartAccountAmount}
                onAmountChange={setSmartAccountAmount}
                onMaxClick={() => handleMaxClick('smart-account')}
                disabled={!smartAccount || isLoadingBalances}
                isLoading={isLoadingBalances}
              />

              <ActionButtons
                type="smart-account"
                onDeposit={() => handleSmartAccountOperation('deposit')}
                onWithdraw={() => handleSmartAccountOperation('withdraw')}
                isLoading={isTransferring}
                depositDisabled={
                  !smartAccountAmount || 
                  !eoaAddress || 
                  !balances ||
                  parseFloat(smartAccountAmount) > parseFloat(balances.formattedEoaUsdcBalance)
                }
                withdrawDisabled={
                  !smartAccountAmount || 
                  !smartAccount ||
                  !balances ||
                  parseFloat(smartAccountAmount) > parseFloat(balances.formattedUsdcBalance)
                }
              />
            </TabsContent>

            <TabsContent value="trading" className="space-y-4">
              <AmountInput
                amount={tradingAmount}
                onAmountChange={setTradingAmount}
                onMaxClick={() => handleMaxClick('trading')}
                disabled={!smartAccount || isLoadingBalances}
                isLoading={isLoadingBalances}
              />

              <ActionButtons
                type="trading"
                onDeposit={needsApproval ? handleApproveAndDeposit : () => handleTradingOperation('deposit')}
                onWithdraw={() => handleTradingOperation('withdraw')}
                isLoading={isLoading}
                isApproving={isApproving}
                needsApproval={needsApproval}
                depositDisabled={
                  !tradingAmount || 
                  !balances || 
                  parseFloat(tradingAmount) > parseFloat(balances.formattedUsdcBalance) || 
                  !smartAccount ||
                  isLoadingBalances
                }
                withdrawDisabled={
                  !tradingAmount || 
                  !balances || 
                  parseFloat(tradingAmount) > parseFloat(balances.formattedMusdBalance) || 
                  !smartAccount ||
                  isLoadingBalances
                }
              />
            </TabsContent>
          </Tabs>

          <div className="space-y-1 text-xs text-muted-foreground">
            <p>How to use UniDex's 1CT and Margin Wallet</p>
            <ol className="pl-2 list-decimal list-inside">
              <li>Transfer USDC between Web and 1CT Wallet using the 1CT tab</li>
              <li>Use the Margin Balance tab manage your margin contract balance</li>
            </ol>
          </div>
        </>
      )}
    </Card>
  )
}
