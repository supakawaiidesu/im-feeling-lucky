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

export function useBalances() {
  const { smartAccount } = useSmartAccount()
  const { address: eoaAddress } = useAccount()

  // Debug logs for addresses
  useEffect(() => {
    if (smartAccount?.address) {
      console.log('Smart Account Address for balance check:', smartAccount.address)
    }
    if (eoaAddress) {
      console.log('EOA Address for balance check:', eoaAddress)
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
      retryDelay: 1000,
      onError: (error: any) => {
        console.error('Smart account balance fetch error:', error)
      },
      onSuccess: (data: any) => {
        console.log('Smart account balance fetch success:', data)
      }
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
      retryDelay: 1000,
      onError: (error: any) => {
        console.error('EOA USDC balance fetch error:', error)
      },
      onSuccess: (data: any) => {
        console.log('EOA USDC balance fetch success:', data)
      }
    }
  })

  // Enhanced debug logs
  useEffect(() => {
    console.log('Smart Account Data:', smartAccountData)
    console.log('EOA USDC Balance:', eoaUsdcBalance)
    console.log('Smart Account Loading:', isSmartAccountLoading)
    console.log('Smart Account Error:', isSmartAccountError)
    if (smartAccountError) {
      console.error('Smart Account Error Details:', smartAccountError)
    }
    console.log('EOA Loading:', isEoaLoading)
    console.log('EOA Error:', isEoaError)
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
      console.log('Refetching balances...')
      await Promise.all([
        refetchSmartAccount(),
        refetchEoa()
      ])
      console.log('Balance refetch complete')
    } catch (error) {
      console.error('Error refetching balances:', error)
    }
  }

  if (!smartAccountData && !isSmartAccountLoading && smartAccount?.address) {
    console.log('No smart account data but address exists, triggering refetch')
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
    formattedMusdBalance: formatUnits(musdBalance, 30),
    eoaUsdcBalance: eoaUsdcBalance || 0n,
    formattedEoaUsdcBalance: eoaUsdcBalance ? formatUnits(eoaUsdcBalance, 6) : '0',
  }

  return {
    balances: formattedBalances,
    isError: isSmartAccountError || isEoaError,
    isLoading: isSmartAccountLoading || isEoaLoading,
    refetchBalances
  }
}