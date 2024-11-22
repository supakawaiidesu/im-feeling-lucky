import { useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import type { SwapRequest } from '../../types'
import type { ParaswapSwapResponse } from './types'

interface SwapContext {
  srcToken: string
  destToken: string
  srcAmount: string
  srcDecimals: number
  destDecimals: number
}

// Store quote context globally since it's needed across renders
let quoteContext: SwapContext | null = null

export function setParaswapQuoteContext(context: SwapContext) {
  quoteContext = context
}

export function useParaswapSwap() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeSwap = async ({ pathId }: SwapRequest) => {
    if (!walletClient) throw new Error('Wallet not connected')
    if (!address) throw new Error('No address found')
    if (!quoteContext) throw new Error('No quote context found')
    
    setIsLoading(true)
    setError(null)

    try {
      // Get swap transaction data using stored context
      const params = new URLSearchParams({
        srcToken: quoteContext.srcToken,
        destToken: quoteContext.destToken,
        amount: quoteContext.srcAmount,
        srcDecimals: quoteContext.srcDecimals.toString(),
        destDecimals: quoteContext.destDecimals.toString(),
        userAddress: address,
        network: '42161', // Arbitrum
        hmac: pathId
      })

      const response = await fetch(`https://api.paraswap.io/swap?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to assemble swap')
      }

      const data: ParaswapSwapResponse = await response.json()
      
      // Execute the transaction
      const hash = await walletClient.sendTransaction({
        to: data.txParams.to as `0x${string}`,
        data: data.txParams.data as `0x${string}`,
        value: BigInt(data.txParams.value || '0'),
        account: walletClient.account,
        chainId: data.txParams.chainId
      })

      // Wait for transaction confirmation
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        return receipt
      }

      return { hash }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to execute swap'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { 
    executeSwap, 
    isLoading, 
    error 
  }
}
