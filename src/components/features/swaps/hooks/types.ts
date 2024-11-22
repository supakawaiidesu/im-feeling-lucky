// Common interfaces used across different routing implementations
export interface QuoteResponse {
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

export interface SwapTransaction {
  to: `0x${string}`
  data: `0x${string}`
  value: bigint
}

export interface SwapRequest {
  pathId: string
}

export interface TokenInfo {
  address: string
  decimals: number
  symbol: string
  name: string
}

export interface QuoteParams {
  inputToken?: string
  inputDecimals?: number
  outputToken?: string
  outputDecimals?: number
  inputAmount?: string
  enabled?: boolean
}

export interface SwapRouteHooks {
  useQuote: (params: QuoteParams) => {
    quote: QuoteResponse | null
    isLoading: boolean
    error: string | null
  }
  useSwap: () => {
    executeSwap: (request: SwapRequest) => Promise<any>
    isLoading: boolean
    error: string | null
  }
}
