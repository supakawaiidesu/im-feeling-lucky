import { useContractRead } from 'wagmi'
import { useSmartAccount } from './use-smart-account'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'

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

// Function to truncate to 2 decimal places without rounding
function truncateToTwoDecimals(value: string): string {
  const parts = value.split('.');
  if (parts.length === 2) {
    return `${parts[0]}.${parts[1].slice(0, 2)}`;
  }
  return value;
}

export function useBalances() {
  const { smartAccount } = useSmartAccount()
  const { address: eoaAddress } = useAccount()

  // Debug logs for addresses
  useEffect(() => {
    if (smartAccount?.address) {
    }
    if (eoaAddress) {
    }
  }, [smartAccount?.address, eoaAddress])

  // Get smart account balances with detailed error handling
  const { 
    data: smartAccountData, 
    isError: isSmartAccountError, 
    isLoading: isSmartAccountLoading, 
    error: smartAccountError,
    refetch: refetchSmartAccount 
  } = useContractRead({
    address: BALANCES_CONTRACT,
    abi: BALANCES_ABI,
    functionName: 'getUserBalances',
    args: smartAccount?.address ? [smartAccount.address] : undefined,
    query: {
      enabled: !!smartAccount?.address,
      retry: 3,
      retryDelay: 1000
    }
  })

  // Get EOA's USDC balance with detailed error handling
  const { 
    data: eoaUsdcBalance, 
    isError: isEoaError, 
    isLoading: isEoaLoading,
    error: eoaError,
    refetch: refetchEoa 
  } = useContractRead({
    address: USDC_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: eoaAddress ? [eoaAddress] : undefined,
    query: {
      enabled: !!eoaAddress,
      retry: 3,
      retryDelay: 1000
    }
  })

  // Enhanced debug logs
  useEffect(() => {

    if (smartAccountError) {
      console.error('Smart Account Error Details:', smartAccountError)
    }
    if (eoaError) {
      console.error('EOA Error Details:', eoaError)
    }
  }, [
    smartAccountData, 
    eoaUsdcBalance, 
    isSmartAccountLoading, 
    isSmartAccountError, 
    smartAccountError,
    isEoaLoading, 
    isEoaError,
    eoaError
  ])

  // Manual refetch function with error handling
  const refetchBalances = async () => {
    try {
      await Promise.all([
        refetchSmartAccount(),
        refetchEoa()
      ])
    } catch (error) {
      console.error('Error refetching balances:', error)
    }
  }

  if (!smartAccountData && !isSmartAccountLoading && smartAccount?.address) {
    refetchBalances()
  }

  // Default return when no data is available
  if (!smartAccountData) {
    return {
      balances: null,
      isError: isSmartAccountError || isEoaError,
      isLoading: isSmartAccountLoading || isEoaLoading,
      refetchBalances
    }
  }

  // Format balances when data is available
  const [ethBalance, usdcBalance, usdcAllowance, musdBalance] = smartAccountData

  const formattedBalances: Balances = {
    ethBalance,
    usdcBalance,
    usdcAllowance,
    musdBalance,
    formattedEthBalance: formatUnits(ethBalance, 18),
    formattedUsdcBalance: formatUnits(usdcBalance, 6),
    formattedUsdcAllowance: formatUnits(usdcAllowance, 6),
    formattedMusdBalance: truncateToTwoDecimals(formatUnits(musdBalance, 30)),
    eoaUsdcBalance: eoaUsdcBalance || BigInt(0),
    formattedEoaUsdcBalance: eoaUsdcBalance ? formatUnits(eoaUsdcBalance, 6) : '0',
  }

  return {
    balances: formattedBalances,
    isError: isSmartAccountError || isEoaError,
    isLoading: isSmartAccountLoading || isEoaLoading,
    refetchBalances
  }
}
