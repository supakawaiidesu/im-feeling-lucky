import { odosRoute } from './odos'
import { paraswapRoute } from './paraswap'
import type { SwapRouteHooks } from '../types'

// Export all available routes
export const routes: Record<string, SwapRouteHooks> = {
  odos: odosRoute,
  paraswap: paraswapRoute
}

// Export individual routes
export { odosRoute } from './odos'
export { paraswapRoute } from './paraswap'

// Re-export types from routes
export * from './odos'
export * from './paraswap'
