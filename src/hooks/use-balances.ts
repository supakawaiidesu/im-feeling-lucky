import { useContractRead } from 'wagmi'
import { useSmartAccount } from './use-smart-account'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'

const BALANCES_CONTRACT = '0xeae57c7bce5caf160343a83440e98bc976ab7274'
const USDC_TOKEN = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'

const BALANCES_ABI = [
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

const ERC20_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
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
  eoaUsdcBalance: bigint
  formattedEoaUsdcBalance: string
}

export function useBalances() {
  const { smartAccount } = useSmartAccount()
  const { address: eoaAddress } = useAccount()

  // Get smart account balances
  const { data: smartAccountData, isError: isSmartAccountError, isLoading: isSmartAccountLoading } = useContractRead({
    address: BALANCES_CONTRACT,
    abi: BALANCES_ABI,
    functionName: 'getUserBalances',
    args: smartAccount?.address ? [smartAccount.address] : undefined,
    query: {
      enabled: !!smartAccount?.address,
    }
  })

  // Get EOA's USDC balance
  const { data: eoaUsdcBalance, isError: isEoaError, isLoading: isEoaLoading } = useContractRead({
    address: USDC_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: eoaAddress ? [eoaAddress] : undefined,
    query: {
      enabled: !!eoaAddress,
    }
  })

  if (!smartAccountData) {
    return {
      balances: null,
      isError: isSmartAccountError || isEoaError,
      isLoading: isSmartAccountLoading || isEoaLoading
    }
  }

  const [ethBalance, usdcBalance, usdcAllowance, musdBalance] = smartAccountData

  const formattedBalances: Balances = {
    ethBalance,
    usdcBalance,
    usdcAllowance,
    musdBalance,
    formattedEthBalance: formatUnits(ethBalance, 18),
    formattedUsdcBalance: formatUnits(usdcBalance, 6), // USDC has 6 decimals
    formattedUsdcAllowance: formatUnits(usdcAllowance, 6),
    formattedMusdBalance: formatUnits(musdBalance, 30), // MUSD needs to be divided by 10^30
    eoaUsdcBalance: eoaUsdcBalance || 0n,
    formattedEoaUsdcBalance: eoaUsdcBalance ? formatUnits(eoaUsdcBalance, 6) : '0',
  }

  return {
    balances: formattedBalances,
    isError: isSmartAccountError || isEoaError,
    isLoading: isSmartAccountLoading || isEoaLoading
  }
}
