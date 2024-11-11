import { useContractRead } from 'wagmi'
import { useSmartAccount } from './use-smart-account'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { useEffect, useMemo, useState } from 'react'

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

function truncateToTwoDecimals(value: string): string {
  const parts = value.split('.');
  if (parts.length === 2) {
    return `${parts[0]}.${parts[1].slice(0, 2)}`;
  }
  return value;
}

export function useBalances() {
  const { smartAccount, isInitialized } = useSmartAccount()
  const { address: eoaAddress } = useAccount()
  const [localSmartAccount, setLocalSmartAccount] = useState<any>(null);

  // Use either the hook's smart account or our local copy
  const effectiveSmartAccount = smartAccount || localSmartAccount;

  // Memoize the contract read arguments to ensure stability
  const smartAccountArgs = useMemo(() => {
    const address = effectiveSmartAccount?.address;
    console.log("Updating smart account args with address:", address);
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
    error: smartAccountError,
    refetch: refetchSmartAccount 
  } = useContractRead({
    address: BALANCES_CONTRACT,
    abi: BALANCES_ABI,
    functionName: 'getUserBalances',
    args: smartAccountArgs,
    query: {
      enabled: !!effectiveSmartAccount?.address && isInitialized && !!smartAccountArgs,
      retry: 5,
      retryDelay: 1000,
      staleTime: 0,
      refetchInterval: 3000,
    }
  })

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
    args: eoaArgs,
    query: {
      enabled: !!eoaAddress,
      retry: 3,
      retryDelay: 1000,
      staleTime: 0,
    }
  })

  // Listen for smart account initialization
  useEffect(() => {
    const handleSmartAccountInit = async (event: CustomEvent) => {
      console.log("Smart account initialization event received:", {
        eventAddress: event.detail.address,
        currentAddress: effectiveSmartAccount?.address
      });

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

  // Monitor state changes
  useEffect(() => {
    console.log("Balance state changed:", {
      smartAccountAddress: effectiveSmartAccount?.address,
      isInitialized,
      hasArgs: !!smartAccountArgs,
      isEnabled: !!effectiveSmartAccount?.address && isInitialized && !!smartAccountArgs
    });
  }, [effectiveSmartAccount?.address, isInitialized, smartAccountArgs]);

  const refetchBalances = async () => {
    if (!effectiveSmartAccount?.address) {
      console.log("Cannot refetch balances - no smart account address");
      return;
    }

    console.log("Refetching balances with args:", { 
      smartAccountAddress: effectiveSmartAccount.address, 
      eoaAddress,
      isInitialized 
    });
    
    try {
      const results = await Promise.all([
        smartAccountArgs ? refetchSmartAccount() : Promise.resolve(null),
        eoaArgs ? refetchEoa() : Promise.resolve(null)
      ]);
      console.log("Refetch results:", results);
    } catch (error) {
      console.error('Error refetching balances:', error);
    }
  }

  // Trigger refetch when necessary
  useEffect(() => {
    if (!smartAccountData && !isSmartAccountLoading && effectiveSmartAccount?.address) {
      console.log("No data but have address, triggering refetch");
      refetchBalances();
    }
  }, [smartAccountData, isSmartAccountLoading, effectiveSmartAccount?.address]);

  if (!smartAccountData || !effectiveSmartAccount?.address) {
    return {
      balances: null,
      isError: isSmartAccountError || isEoaError,
      isLoading: isSmartAccountLoading || isEoaLoading,
      refetchBalances
    }
  }

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