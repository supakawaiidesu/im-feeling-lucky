import { useState } from 'react'
import { useOdosQuote } from './use-odos-quote'
import { useOdosSwap } from './use-odos-swap'

interface UseSwapWorkflowParams {
  inputToken?: string
  outputToken?: string
  inputAmount?: string
}

export function useSwapWorkflow({
  inputToken,
  outputToken,
  inputAmount
}: UseSwapWorkflowParams) {
  const [error, setError] = useState<string | null>(null)

  const {
    quote,
    isLoading: quoteLoading,
    error: quoteError
  } = useOdosQuote({
    inputToken,
    outputToken,
    inputAmount: inputAmount ? inputAmount + "000000" : undefined, // Convert to proper decimals
    enabled: Boolean(inputAmount && inputToken && outputToken)
  })

  const {
    executeSwap,
    isLoading: swapLoading,
    error: swapError
  } = useOdosSwap()

  const handleSwap = async () => {
    if (!quote?.pathId) {
      setError('No quote available')
      return
    }

    try {
      const receipt = await executeSwap({ pathId: quote.pathId })
      return receipt
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Swap failed')
      throw err
    }
  }

  const getOutputAmount = () => {
    if (!quote || !quote.outAmounts?.[0]) return "0.0"
    const amount = BigInt(quote.outAmounts[0])
    return (Number(amount) / 1e18).toFixed(6) // Assuming 18 decimals for output token
  }

  const getExchangeRate = () => {
    if (!quote || !quote.outAmounts?.[0] || !quote.inAmounts?.[0]) return "0.00"
    return (Number(quote.outAmounts[0]) / Number(quote.inAmounts[0])).toFixed(6)
  }

  return {
    quote,
    outputAmount: getOutputAmount(),
    exchangeRate: getExchangeRate(),
    isLoading: quoteLoading || swapLoading,
    error: error || quoteError || swapError,
    handleSwap
  }
}
