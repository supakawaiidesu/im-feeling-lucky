import { useState, useMemo } from 'react'
import { routes } from './routes'
import type { SwapRouteHooks, QuoteResponse, TokenInfo } from './types'

interface UseSwapWorkflowParams {
  inputToken?: TokenInfo
  outputToken?: TokenInfo
  inputAmount?: string
}

interface RouteQuote {
  routeName: string
  quote: QuoteResponse | null
  isLoading: boolean
  error: string | null
}

export function useSwapWorkflow({
  inputToken,
  outputToken,
  inputAmount
}: UseSwapWorkflowParams) {
  const [error, setError] = useState<string | null>(null)

  // Call all route hooks unconditionally at the top level
  const odosQuote = routes.odos.useQuote({
    inputToken: inputToken?.address,
    inputDecimals: inputToken?.decimals,
    outputToken: outputToken?.address,
    outputDecimals: outputToken?.decimals,
    inputAmount,
    enabled: Boolean(inputAmount && inputToken && outputToken)
  })
  const odosSwap = routes.odos.useSwap()

  const paraswapQuote = routes.paraswap.useQuote({
    inputToken: inputToken?.address,
    inputDecimals: inputToken?.decimals,
    outputToken: outputToken?.address,
    outputDecimals: outputToken?.decimals,
    inputAmount,
    enabled: Boolean(inputAmount && inputToken && outputToken)
  })
  const paraswapSwap = routes.paraswap.useSwap()

  // Combine quotes into array for comparison
  const routeQuotes: RouteQuote[] = useMemo(() => [
    { routeName: 'odos', ...odosQuote },
    { routeName: 'paraswap', ...paraswapQuote }
  ], [odosQuote, paraswapQuote])

  // Find the best quote (highest output amount)
  const bestRoute = useMemo(() => {
    // Return null if no quotes or all quotes are loading
    if (!routeQuotes.length || routeQuotes.every(rq => rq.isLoading)) {
      return null
    }

    return routeQuotes.reduce((best: RouteQuote | null, current) => {
      // Skip if current quote is loading, has error, or no quote
      if (current.isLoading || current.error || !current.quote?.outAmounts?.[0]) {
        return best
      }

      // If no best quote yet, use current
      if (!best || !best.quote?.outAmounts?.[0]) {
        return current
      }

      // Compare output amounts (already in decimal format from route hooks)
      const currentAmount = parseFloat(current.quote.outAmounts[0])
      const bestAmount = parseFloat(best.quote.outAmounts[0])

      return currentAmount > bestAmount ? current : best
    }, null)
  }, [routeQuotes])

  // Get the swap execution hook for the best route
  const getSelectedSwapHook = (routeName: string | null) => {
    switch (routeName) {
      case 'odos':
        return odosSwap
      case 'paraswap':
        return paraswapSwap
      default:
        return {
          executeSwap: async () => { throw new Error('No route selected') },
          isLoading: false,
          error: null
        }
    }
  }

  const selectedSwapHook = getSelectedSwapHook(bestRoute?.routeName ?? null)
  const {
    executeSwap = async () => { throw new Error('No route selected') },
    isLoading: swapLoading = false,
    error: swapError = null
  } = selectedSwapHook

  const handleSwap = async () => {
    if (!bestRoute?.quote?.pathId) {
      setError('No quote available')
      return
    }

    try {
      const receipt = await executeSwap({ pathId: bestRoute.quote.pathId })
      return receipt
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Swap failed')
      throw err
    }
  }

  const getOutputAmount = () => {
    if (!bestRoute?.quote?.outAmounts?.[0]) return "0.0"
    // Amount is already in decimal format from route hooks
    return bestRoute.quote.outAmounts[0]
  }

  const getExchangeRate = () => {
    if (!bestRoute?.quote?.outAmounts?.[0] || !bestRoute?.quote?.inAmounts?.[0]) return "0.00"
    const outAmount = parseFloat(bestRoute.quote.outAmounts[0])
    const inAmount = parseFloat(bestRoute.quote.inAmounts[0])
    return (outAmount / inAmount).toFixed(6)
  }

  // Get quotes status
  const isLoading = routeQuotes.some(rq => rq.isLoading) || swapLoading
  const aggregatedError = error || swapError || routeQuotes.find(rq => rq.error)?.error || null

  return {
    quote: bestRoute?.quote || null,
    outputAmount: getOutputAmount(),
    exchangeRate: getExchangeRate(),
    isLoading,
    error: aggregatedError,
    handleSwap,
    selectedRouteName: bestRoute?.routeName || null,
    // Include all quotes for UI display if needed
    allQuotes: routeQuotes.reduce((acc, { routeName, quote, isLoading, error }) => {
      acc[routeName] = { quote, isLoading, error }
      return acc
    }, {} as Record<string, Omit<RouteQuote, 'routeName'>>)
  }
}
