import { useOdosQuote } from './use-quote'
import { useOdosSwap } from './use-swap'
import type { SwapRouteHooks } from '../../types'

export const odosRoute: SwapRouteHooks = {
  useQuote: useOdosQuote,
  useSwap: useOdosSwap
}

export { useOdosQuote } from './use-quote'
export { useOdosSwap } from './use-swap'
