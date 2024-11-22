import { useParaswapQuote } from './use-quote'
import { useParaswapSwap } from './use-swap'
import type { SwapRouteHooks } from '../../types'

export const paraswapRoute: SwapRouteHooks = {
  useQuote: useParaswapQuote,
  useSwap: useParaswapSwap
}

export { useParaswapQuote } from './use-quote'
export { useParaswapSwap } from './use-swap'
export * from './types'
