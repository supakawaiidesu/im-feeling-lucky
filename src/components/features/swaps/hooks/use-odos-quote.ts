import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

interface OdosQuoteResponse {
  inTokens: string[]
  outTokens: string[]
  inAmounts: string[]
  outAmounts: string[]
  gasEstimate: number
  dataGasEstimate: number
  gweiPerGas: number
  gasEstimateValue: number
  inValues: number[]
  outValues: number[]
  netOutValue: number
  priceImpact: number
  percentDiff: number
  partnerFeePercent: number
  pathId: string
  pathViz: any
  blockNumber: number
}

interface UseOdosQuoteParams {
  inputToken?: string
  outputToken?: string
  inputAmount?: string
  enabled?: boolean
}

export function useOdosQuote({ 
  inputToken, 
  outputToken, 
  inputAmount,
  enabled = true 
}: UseOdosQuoteParams) {
  const { address } = useAccount()
  const [quote, setQuote] = useState<OdosQuoteResponse | null>(null)
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
                amount: inputAmount,
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
        setQuote(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quote')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuote()
  }, [inputToken, outputToken, inputAmount, enabled, address])

  return { quote, isLoading, error }
}
