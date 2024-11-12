import { useContractRead, usePublicClient } from 'wagmi'
import { useSmartAccount } from './use-smart-account'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { useEffect, useMemo, useState } from 'react'
import { optimism, arbitrum } from 'viem/chains'

const BALANCES_CONTRACT = '0xeae57c7bce5caf160343a83440e98bc976ab7274'
const USDC_TOKEN = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
const USDC_TOKEN_OPTIMISM = '0x0b2c639c533813f4aa9d7837caf62653d097ff85'

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
  eoaOptimismUsdcBalance: bigint
  formattedEoaUsdcBalance: string
  formattedEoaOptimismUsdcBalance: string
}

function truncateToTwoDecimals(value: string): string {
  const parts = value.split('.');
  if (parts.length === 2) {
    return `${parts[0]}.${parts[1].slice(0, 2)}`;
  }
  return value;
}

export function useBalances(selectedNetwork: 'arbitrum' | 'optimism' = 'arbitrum') {
  const { smartAccount, isInitialized, isInitializing } = useSmartAccount()
  const { address: eoaAddress } = useAccount()
  const [localSmartAccount, setLocalSmartAccount] = useState<any>(null);

  // Consider account ready if we either have smartAccount or localSmartAccount
  const effectiveSmartAccount = smartAccount || localSmartAccount;
  const isEffectivelyInitialized = isInitialized || !!effectiveSmartAccount?.address;

  // Memoize the contract read arguments to ensure stability
  const smartAccountArgs = useMemo(() => {
    const address = effectiveSmartAccount?.address;
    if (!address) return undefined;
    return [address] as const;
  }, [effectiveSmartAccount?.address]);

  const eoaArgs = useMemo(() => {
    if (!eoaAddress) return undefined;
    return [eoaAddress] as const;
  }, [eoaAddress]);

  const { 
    data: smartAccountData, 
    isError: isSmartAccountError, 
    isLoading: isSmartAccountLoading,
    refetch: refetchSmartAccount 
  } = useContractRead({
    address: BALANCES_CONTRACT,
    abi: BALANCES_ABI,
    functionName: 'getUserBalances',
    args: smartAccountArgs,
    chainId: arbitrum.id,
    query: {
      enabled: !!effectiveSmartAccount?.address,
      retry: 5,
      retryDelay: 1000,
      staleTime: 0,
      refetchInterval: 3000,
    }
  })

  // Arbitrum USDC Balance
  const { 
    data: eoaUsdcBalance, 
    isError: isEoaError, 
    isLoading: isEoaArbitrumLoading,
    refetch: refetchEoaArbitrum 
  } = useContractRead({
    address: USDC_TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: eoaArgs,
    chainId: arbitrum.id,
    query: {
      enabled: !!eoaAddress && selectedNetwork === 'arbitrum',
      retry: 3,
      retryDelay: 1000,
      staleTime: 0,
    }
  })

  // Optimism USDC Balance
  const { 
    data: eoaOptimismUsdcBalance, 
    isError: isEoaOptimismError, 
    isLoading: isEoaOptimismLoading,
    refetch: refetchEoaOptimism 
  } = useContractRead({
    address: USDC_TOKEN_OPTIMISM,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: eoaArgs,
    chainId: optimism.id,
    query: {
      enabled: !!eoaAddress && selectedNetwork === 'optimism',
      retry: 3,
      retryDelay: 1000,
      staleTime: 0,
    }
  })

  // Listen for smart account initialization
  useEffect(() => {
    const handleSmartAccountInit = async (event: CustomEvent) => {
      if (event.detail.account) {
        setLocalSmartAccount(event.detail.account);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refetchBalances();
    }

    window.addEventListener('smartAccountInitialized', handleSmartAccountInit as unknown as EventListener);
    return () => {
      window.removeEventListener('smartAccountInitialized', handleSmartAccountInit as unknown as EventListener);
    }
  }, [effectiveSmartAccount?.address]);

  const refetchBalances = async () => {
    if (!effectiveSmartAccount?.address) {
      return;
    }
    
    try {
      await Promise.all([
        smartAccountArgs ? refetchSmartAccount() : Promise.resolve(null),
        eoaArgs && selectedNetwork === 'arbitrum' ? refetchEoaArbitrum() : Promise.resolve(null),
        eoaArgs && selectedNetwork === 'optimism' ? refetchEoaOptimism() : Promise.resolve(null)
      ]);
    } catch (error) {
      console.error('Error refetching balances:', error);
    }
  }

  // Trigger refetch when selected network changes
  useEffect(() => {
    if (eoaAddress) {
      refetchBalances();
    }
  }, [selectedNetwork, eoaAddress]);

  if (!smartAccountData || !effectiveSmartAccount?.address) {
    return {
      balances: null,
      isError: isSmartAccountError || isEoaError || isEoaOptimismError,
      isLoading: isSmartAccountLoading || isEoaArbitrumLoading || isEoaOptimismLoading,
      refetchBalances
    }
  }

  const [ethBalance, usdcBalance, usdcAllowance, musdBalance] = smartAccountData

  const currentEoaBalance = selectedNetwork === 'arbitrum' ? eoaUsdcBalance : eoaOptimismUsdcBalance;
  
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
    eoaOptimismUsdcBalance: eoaOptimismUsdcBalance || BigInt(0),
    formattedEoaUsdcBalance: currentEoaBalance ? formatUnits(currentEoaBalance, 6) : '0',
    formattedEoaOptimismUsdcBalance: eoaOptimismUsdcBalance ? formatUnits(eoaOptimismUsdcBalance, 6) : '0'
  }

  return {
    balances: formattedBalances,
    isError: isSmartAccountError || 
      (selectedNetwork === 'arbitrum' ? isEoaError : isEoaOptimismError),
    isLoading: isSmartAccountLoading || 
      (selectedNetwork === 'arbitrum' ? isEoaArbitrumLoading : isEoaOptimismLoading),
    refetchBalances
  }
}