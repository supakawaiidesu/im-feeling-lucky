import { useState, useEffect } from 'react'

interface UsdcPriceResponse {
  coins: {
    [key: string]: {
      decimals: number
      symbol: string
      price: number
      timestamp: number
      confidence: number
    }
  }
}

export function useUsdcPrice() {
  const [price, setPrice] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('https://coins.llama.fi/prices/current/arbitrum:0xaf88d065e77c8cc2239327c5edb3a432268e5831')
        const data: UsdcPriceResponse = await response.json()
        const usdcPrice = data.coins['arbitrum:0xaf88d065e77c8cc2239327c5edb3a432268e5831'].price
        setPrice(usdcPrice)
      } catch (error) {
        console.error('Error fetching USDC price:', error)
        setPrice(1) // fallback to 1:1
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  return { price, isLoading }
}
