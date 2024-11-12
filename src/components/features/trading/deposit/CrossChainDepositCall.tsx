import { createConfig, ChainId } from '@lifi/sdk'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { parseUnits } from 'viem'

createConfig({
  integrator: 'unidex',
  rpcUrls: {
    [ChainId.ARB]: ['https://rpc.ankr.com/arbitrum'],
    [ChainId.OPT]: ['https://rpc.ankr.com/optimism'],
  },
})

interface CrossChainDepositCallProps {
  amount?: string;
  onSuccess?: () => void;
}

export function CrossChainDepositCall({ amount = "0", onSuccess }: CrossChainDepositCallProps) {
  const { toast } = useToast()
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const handleCrossChainDeposit = async () => {
    if (!address || !walletClient || !publicClient) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      })
      return
    }

    try {
      // Convert amount from decimal format (e.g. "1.5") to USDC units (multiply by 10^6)
      const amountInUsdcUnits = parseUnits(amount, 6).toString()

      const response = await fetch(`https://li.quest/v1/quote?fromChain=10&toChain=42161&fromToken=0x0b2c639c533813f4aa9d7837caf62653d097ff85&toToken=0xaf88d065e77c8cc2239327c5edb3a432268e5831&fromAddress=0xaf88d065e77c8cc2239327c5edb3a432268e5831&toAddress=0xe43cCd354c0c17ee17888cc4d76142a37b4DB68D&fromAmount=${amountInUsdcUnits}&integrator=unidex&allowBridges=across&skipSimulation=true`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch quote')
      }

      const data = await response.json()
      const { transactionRequest } = data

      const hash = await walletClient.sendTransaction({
        to: transactionRequest.to as `0x${string}`,
        data: transactionRequest.data as `0x${string}`,
        value: BigInt(transactionRequest.value || '0'),
      })

      toast({
        title: 'Transaction Sent',
        description: 'Cross-chain deposit transaction has been sent',
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      toast({
        title: 'Success',
        description: 'Cross-chain deposit completed successfully',
      })

      onSuccess?.()

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process cross-chain deposit',
        variant: 'destructive',
      })
    }
  }

  return (
    <Button 
      onClick={handleCrossChainDeposit}
      variant="outline"
      className="w-full"
      data-testid="cross-chain-deposit-button"
    >
      Deposit to 1CT Wallet
    </Button>
  )
}
