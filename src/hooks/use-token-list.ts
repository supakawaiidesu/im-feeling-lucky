import { useEffect, useState } from 'react'

export interface Token {
  symbol: string
  name: string
  icon: string
  address: string
  decimals: number
}

interface TokenListResponse {
  tokens: Array<{
    chainId: number
    address: string
    name: string
    symbol: string
    decimals: number
    logoURI?: string
    extensions?: {
      bridgeInfo?: {
        [key: string]: {
          tokenAddress: string
        }
      }
    }
  }>
}

export function useTokenList() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTokenList() {
      try {
        const response = await fetch('https://ipfs.io/ipns/tokens.uniswap.org')
        const data: TokenListResponse = await response.json()

        // Filter tokens that are either on Arbitrum (42161) directly or bridged to it
        const arbitrumTokens = data.tokens.filter(token => 
          token.chainId === 42161 || 
          token.extensions?.bridgeInfo?.['42161']
        ).map(token => ({
          symbol: token.symbol,
          name: token.name,
          icon: token.logoURI || '/placeholder.svg?height=40&width=40',
          // Use the Arbitrum address if it's bridged, otherwise use the original address
          address: token.chainId === 42161 
            ? token.address 
            : token.extensions?.bridgeInfo?.['42161'].tokenAddress || '',
          decimals: token.decimals
        }))

        console.log('Loaded tokens:', arbitrumTokens) // Debug log
        setTokens(arbitrumTokens)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to fetch token list:', err) // Debug log
        setError('Failed to fetch token list')
        setIsLoading(false)
      }
    }

    fetchTokenList()
  }, [])

  return { tokens, isLoading, error }
}