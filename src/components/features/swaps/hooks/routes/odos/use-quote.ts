import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import type { QuoteResponse, QuoteParams } from '../../types'

// Helper function to convert amount to base units (e.g., 1.0 USDC -> 1000000)
function toBaseUnits(amount: string, decimals: number): string {
  try {
    const [whole, fraction = ''] = amount.split('.')
    const paddedFraction = fraction.padEnd(decimals, '0')
    const trimmedFraction = paddedFraction.slice(0, decimals)
    return `${whole}${trimmedFraction}`
  } catch (error) {
    console.error('Error converting to base units:', error)
    return '0'
  }
}

// Helper function to convert from base units to decimal string
function fromBaseUnits(amount: string, decimals: number): string {
  try {
    const value = BigInt(amount)
    const divisor = BigInt(10 ** decimals)
    const wholePart = value / divisor
    const fractionPart = value % divisor
    const paddedFraction = fractionPart.toString().padStart(decimals, '0')
    return `${wholePart}.${paddedFraction}`
  } catch (error) {
    console.error('Error converting from base units:', error)
    return '0'
  }
}

export function useOdosQuote({ 
  inputToken, 
  inputDecimals = 18,
  outputToken,
  outputDecimals = 18,
  inputAmount,
  enabled = true 
}: QuoteParams) {
  const { address } = useAccount()
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuote() {
      if (!inputToken || !outputToken || !inputAmount || !enabled || !address) {
        setQuote(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Convert input amount to base units using correct decimals
        const baseUnitAmount = toBaseUnits(inputAmount, inputDecimals)

        const response = await fetch('https://api.odos.xyz/sor/quote/v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chainId: 42161,
            compact: true,
            gasPrice: 20,
            inputTokens: [
              {
                amount: baseUnitAmount,
                tokenAddress: inputToken
              }
            ],
            outputTokens: [
              {
                proportion: 1,
                tokenAddress: outputToken
              }
            ],
            referralCode: 0,
            slippageLimitPercent: 0.3,
            sourceBlacklist: [],
            sourceWhitelist: [],
            userAddr: address
          })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch quote')
        }

        const data = await response.json()

        // Convert amounts to human-readable format
        setQuote({
          ...data,
          inAmounts: [inputAmount], // Use original input amount for consistency
          outAmounts: [fromBaseUnits(data.outAmounts[0], outputDecimals)]
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quote')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuote()
  }, [inputToken, outputToken, inputAmount, enabled, address, inputDecimals, outputDecimals])

  return { quote, isLoading, error }
}
