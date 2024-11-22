interface SwapExchange {
  exchange: string
  srcAmount: string
  destAmount: string
  percent: number
  poolAddresses: string[]
  data: {
    router: string
    path: string[]
    factory: string
    initCode: string
    feeFactor: number
    pools: {
      address: string
      fee: number
      direction: boolean
    }[]
    gasUSD: string
  }
}

interface RouteSwap {
  srcToken: string
  srcDecimals: number
  destToken: string
  destDecimals: number
  swapExchanges: SwapExchange[]
}

interface Route {
  percent: number
  swaps: RouteSwap[]
}

export interface ParaswapPriceRoute {
  blockNumber: number
  network: number
  srcToken: string
  srcDecimals: number
  srcAmount: string
  destToken: string
  destDecimals: number
  destAmount: string
  bestRoute: Route[]
  gasCostUSD: string
  gasCost: string
  side: string
  version: string
  contractAddress: string
  tokenTransferProxy: string
  contractMethod: string
  partnerFee: number
  srcUSD: string
  destUSD: string
  partner: string
  maxImpactReached: boolean
  hmac: string
}

export interface ParaswapSwapResponse {
  priceRoute: ParaswapPriceRoute
  txParams: {
    from: string
    to: string
    value: string
    data: string
    gasPrice: string
    chainId: number
  }
}
