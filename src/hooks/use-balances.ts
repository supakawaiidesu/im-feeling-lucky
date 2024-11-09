import { useContractRead } from 'wagmi'
import { useSmartAccount } from './use-smart-account'
import { formatUnits } from 'viem'

const BALANCES_CONTRACT = '0xeae57c7bce5caf160343a83440e98bc976ab7274'
const USDC_TOKEN = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'

const ABI = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserBalances',
    outputs: [
      { internalType: 'uint256', name: 'ethBalance', type: 'uint256' },
      { internalType: 'uint256', name: 'usdcBalance', type: 'uint256' },
      { internalType: 'uint256', name: 'usdcAllowance', type: 'uint256' },
      { internalType: 'uint256', name: 'musdBalance', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export interface Balances {
  ethBalance: bigint
  usdcBalance: bigint
  usdcAllowance: bigint
  musdBalance: bigint
  formattedEthBalance: string
  formattedUsdcBalance: string
  formattedUsdcAllowance: string
  formattedMusdBalance: string
}

export function useBalances() {
  const { smartAccount } = useSmartAccount()

  const { data, isError, isLoading } = useContractRead({
    address: BALANCES_CONTRACT,
    abi: ABI,
    functionName: 'getUserBalances',
    args: smartAccount?.address ? [smartAccount.address] : undefined,
    query: {
      enabled: !!smartAccount?.address,
    }
  })

  if (!data) {
    return {
      balances: null,
      isError,
      isLoading
    }
  }

  const [ethBalance, usdcBalance, usdcAllowance, musdBalance] = data

  const formattedBalances: Balances = {
    ethBalance,
    usdcBalance,
    usdcAllowance,
    musdBalance,
    formattedEthBalance: formatUnits(ethBalance, 18),
    formattedUsdcBalance: formatUnits(usdcBalance, 6), // USDC has 6 decimals
    formattedUsdcAllowance: formatUnits(usdcAllowance, 6),
    formattedMusdBalance: formatUnits(musdBalance, 30), // MUSD needs to be divided by 10^30
  }

  return {
    balances: formattedBalances,
    isError,
    isLoading
  }
}
