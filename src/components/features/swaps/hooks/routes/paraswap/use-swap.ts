import { useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import type { SwapRequest } from '../../types'
import type { ParaswapPriceRoute } from './types'

interface SwapContext {
  priceRoute: ParaswapPriceRoute | null
  userAddress: string | null
}

let quoteContext: SwapContext = {
  priceRoute: null,
  userAddress: null
}

export function setParaswapQuoteContext(priceRoute: ParaswapPriceRoute, userAddress: string) {
  quoteContext = { priceRoute, userAddress }
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
    if (!quoteContext.priceRoute) throw new Error('No quote context found')
    
    setIsLoading(true)
    setError(null)

    try {
      // Call /transactions endpoint to get swap transaction data
      const response = await fetch('https://api.paraswap.io/transactions/42161', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          srcToken: quoteContext.priceRoute.srcToken,
          destToken: quoteContext.priceRoute.destToken,
          srcAmount: quoteContext.priceRoute.srcAmount,
          srcDecimals: quoteContext.priceRoute.srcDecimals,
          destDecimals: quoteContext.priceRoute.destDecimals,
          priceRoute: quoteContext.priceRoute,
          userAddress: address,
          partner: 'builders-workshop',
          slippage: 100, // 1%
          deadline: Math.floor(Date.now()/1000) + 300 // 5 minutes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to build transaction')
      }

      const txData = await response.json()

      // Execute the transaction
      const hash = await walletClient.sendTransaction({
        to: txData.to as `0x${string}`,
        data: txData.data as `0x${string}`,
        value: BigInt(txData.value || '0'),
        account: walletClient.account,
        chainId: txData.chainId
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
