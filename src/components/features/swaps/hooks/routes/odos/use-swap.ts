import { useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { type SwapTransaction, type SwapRequest } from '../../types'

interface AssembleResponse {
  transaction: {
    data: string
    to: string
    value: string
    from: string
  }
}

export function useOdosSwap() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assembleTransaction = async (pathId: string): Promise<SwapTransaction> => {
    if (!address) throw new Error('No address found')

    const response = await fetch('https://api.odos.xyz/sor/assemble', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddr: address,
        pathId,
        receiver: address
      })
    })

    if (!response.ok) {
      throw new Error('Failed to assemble swap')
    }

    const data: AssembleResponse = await response.json()
    return {
      to: data.transaction.to as `0x${string}`,
      data: data.transaction.data as `0x${string}`,
      value: BigInt(data.transaction.value || '0'),
    }
  }

  const executeSwap = async ({ pathId }: SwapRequest) => {
    if (!walletClient) throw new Error('Wallet not connected')
    
    setIsLoading(true)
    setError(null)

    try {
      const transaction = await assembleTransaction(pathId)
      
      const hash = await walletClient.sendTransaction({
        to: transaction.to,
        data: transaction.data,
        value: transaction.value,
        account: walletClient.account
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
