
import { useState } from 'react'
import { useAccount } from 'wagmi'

interface AssembleResponse {
  transaction: {
    data: string
    to: string
    value: string
    from: string
  }
  // ... other fields we might need later
}

export function useOdosSwap() {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeSwap = async (pathId: string) => {
    if (!address) throw new Error('No address found')
    setIsLoading(true)
    setError(null)

    try {
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
        to: data.transaction.to,
        data: data.transaction.data,
        value: BigInt(data.transaction.value || '0')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to execute swap'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { executeSwap, isLoading, error }
}