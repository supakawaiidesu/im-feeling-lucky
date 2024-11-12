import { createConfig, ChainId } from '@lifi/sdk'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAccount, usePublicClient, useWalletClient, useSwitchChain } from 'wagmi'
import { parseUnits } from 'viem'
import { optimism } from "wagmi/chains"

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
  chain?: number;
}

export function CrossChainDepositCall({ amount = "0", onSuccess, chain }: CrossChainDepositCallProps) {
  const { toast } = useToast()
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { switchChain } = useSwitchChain()

  const isOnOptimism = chain === optimism.id

  const handleChainSwitch = () => {
    console.log('Switching to Optimism...')
    switchChain?.({ chainId: optimism.id })
  }

  const handleDeposit = async () => {
    console.log('Starting deposit process...')
    console.log('Amount:', amount)
    console.log('Address:', address)
    console.log('Wallet Client:', !!walletClient)
    console.log('Public Client:', !!publicClient)

    if (!address || !walletClient || !publicClient) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      })
      return
    }

    try {
      console.log('Converting amount to USDC units...')
      const amountInUsdcUnits = parseUnits(amount, 6).toString()
      console.log('Amount in USDC units:', amountInUsdcUnits)

      console.log('Fetching quote...')
      const quoteUrl = `https://li.quest/v1/quote?fromChain=10&toChain=42161&fromToken=0x0b2c639c533813f4aa9d7837caf62653d097ff85&toToken=0xaf88d065e77c8cc2239327c5edb3a432268e5831&fromAddress=${address}&toAddress=${address}&fromAmount=${amountInUsdcUnits}&integrator=unidex&allowBridges=across&skipSimulation=true`
      console.log('Quote URL:', quoteUrl)

      const response = await fetch(quoteUrl)
      
      if (!response.ok) {
        console.error('Quote fetch failed:', response.status, response.statusText)
        throw new Error('Failed to fetch quote')
      }

      const data = await response.json()
      console.log('Quote data:', data)
      const { transactionRequest } = data

      console.log('Sending transaction...')
      const hash = await walletClient.sendTransaction({
        to: transactionRequest.to as `0x${string}`,
        data: transactionRequest.data as `0x${string}`,
        value: BigInt(transactionRequest.value || '0'),
      })
      console.log('Transaction hash:', hash)

      toast({
        title: 'Transaction Sent',
        description: 'Cross-chain deposit transaction has been sent',
      })

      console.log('Waiting for receipt...')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Transaction receipt:', receipt)

      toast({
        title: 'Success',
        description: 'Cross-chain deposit completed successfully',
      })

      onSuccess?.()

    } catch (error: any) {
      console.error('Deposit error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to process cross-chain deposit',
        variant: 'destructive',
      })
    }
  }

  const handleClick = async () => {
    console.log('Button clicked')
    console.log('Is on Optimism:', isOnOptimism)
    
    if (isOnOptimism) {
      await handleDeposit()
    } else {
      handleChainSwitch()
    }
  }

  return (
    <Button 
      onClick={handleClick}
      variant="outline"
      className="w-full"
      data-testid="cross-chain-deposit-button"
    >
      {isOnOptimism ? "Deposit to 1CT Wallet" : "Switch to Optimism"}
    </Button>
  )
}
