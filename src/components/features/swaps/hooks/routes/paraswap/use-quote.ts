import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import type { QuoteResponse, QuoteParams } from '../../types'
import type { ParaswapPriceRoute } from './types'
import { setParaswapQuoteContext } from './use-swap'

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

export function useParaswapQuote({ 
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

        // Store quote context for swap
        setParaswapQuoteContext({
          srcToken: inputToken,
          destToken: outputToken,
          srcAmount: baseUnitAmount,
          srcDecimals: inputDecimals,
          destDecimals: outputDecimals
        })

        // Construct URL with query parameters
        const params = new URLSearchParams({
          srcToken: inputToken,
          destToken: outputToken,
          amount: baseUnitAmount,
          srcDecimals: inputDecimals.toString(),
          destDecimals: outputDecimals.toString(),
          userAddress: address,
          network: '42161' // Arbitrum
        })

        const response = await fetch(`https://api.paraswap.io/prices?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch quote')
        }

        const data: { priceRoute: ParaswapPriceRoute } = await response.json()
        
        // Convert Paraswap response to our common QuoteResponse format
        setQuote({
          inTokens: [data.priceRoute.srcToken],
          outTokens: [data.priceRoute.destToken],
          inAmounts: [inputAmount], // Use original input amount for consistency
          outAmounts: [fromBaseUnits(data.priceRoute.destAmount, outputDecimals)],
          gasEstimate: parseInt(data.priceRoute.gasCost),
          dataGasEstimate: 0,
          gweiPerGas: 0,
          gasEstimateValue: parseFloat(data.priceRoute.gasCostUSD),
          inValues: [parseFloat(data.priceRoute.srcUSD)],
          outValues: [parseFloat(data.priceRoute.destUSD)],
          netOutValue: parseFloat(data.priceRoute.destUSD),
          priceImpact: Math.abs(1 - parseFloat(data.priceRoute.destUSD) / parseFloat(data.priceRoute.srcUSD)),
          percentDiff: 0,
          partnerFeePercent: data.priceRoute.partnerFee,
          pathId: data.priceRoute.hmac,
          pathViz: data.priceRoute.bestRoute,
          blockNumber: data.priceRoute.blockNumber
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
