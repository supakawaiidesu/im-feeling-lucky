import { useContractReads, useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { Token } from './use-token-list'
import { arbitrum } from 'viem/chains'

const ERC20_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

interface TokenBalance extends Token {
  balance: bigint
  formattedBalance: string
  decimals: number
}

export function useTokenListBalances(tokens: Token[]) {
  const { address: userAddress } = useAccount()

  const {
    data: balancesData,
    isError,
    isLoading,
    refetch: refetchBalances
  } = useContractReads({
    contracts: tokens.flatMap(token => ([
      {
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`],
        chainId: arbitrum.id,
      },
      {
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
        chainId: arbitrum.id,
      }
    ])),
    query: {
      enabled: !!userAddress && tokens.length > 0,
      staleTime: 5000,
      refetchInterval: 10000,
    }
  })

  const tokensWithBalances: TokenBalance[] = tokens.map((token, index) => {
    const balanceResult = balancesData?.[index * 2]
    const decimalsResult = balancesData?.[index * 2 + 1]
    
    const balance = (balanceResult?.status === 'success' ? balanceResult.result : 0n) as bigint
    const decimals = (decimalsResult?.status === 'success' ? decimalsResult.result : 18) as number

    return {
      ...token,
      balance,
      decimals,
      formattedBalance: formatUnits(balance, decimals)
    }
  })

  return {
    balances: tokensWithBalances,
    isLoading,
    isError,
    refetchBalances
  }
}