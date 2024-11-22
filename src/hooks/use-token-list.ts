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

const DEFAULT_TOKENS: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
    decimals: 6
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    decimals: 18
  }
];

export function useTokenList() {
  const [tokens, setTokens] = useState<Token[]>(DEFAULT_TOKENS)
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

        // Combine default tokens with fetched tokens, removing duplicates
        const allTokens = [...DEFAULT_TOKENS, ...arbitrumTokens.filter(
          token => !DEFAULT_TOKENS.some(defaultToken => defaultToken.address === token.address)
        )]

        setTokens(allTokens)
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