import { useCallback, useEffect, useState } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { walletClientToSmartAccountSigner } from 'permissionless';
import { http, Chain, createPublicClient } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { toECDSASigner } from "@zerodev/permissions/signers";
import { 
  deserializePermissionAccount,
  serializePermissionAccount,
  toPermissionValidator
} from "@zerodev/permissions";
import { toSudoPolicy } from "@zerodev/permissions/policies";
import { arbitrum } from 'viem/chains';

const bundlerRpcUrl = process.env.NEXT_PUBLIC_BUNDLER_RPC_URL;
const PAYMASTER_RPC = process.env.NEXT_PUBLIC_PAYMASTER_RPC;
const ARBITRUM_RPC = process.env.NEXT_PUBLIC_ARBITRUM_RPC || "https://arb1.arbitrum.io/rpc";

// Create a dedicated Arbitrum public client
const arbitrumPublicClient = createPublicClient({
  chain: arbitrum,
  transport: http(ARBITRUM_RPC)
});

export function useSmartAccount() {
  const { data: walletClient } = useWalletClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [kernelClient, setKernelClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSigningSessionKey, setIsSigningSessionKey] = useState(false);
  const [sessionKeyAddress, setSessionKeyAddress] = useState<string | null>(null);

  // Use Arbitrum chain and client regardless of connected chain
  const getChainConfig = useCallback(() => {
    return {
      chain: arbitrum,
      publicClient: arbitrumPublicClient
    };
  }, []);

  useEffect(() => {
    if (smartAccount?.address && !isInitialized) {
      setIsInitialized(true);
    }
  }, [smartAccount?.address, isInitialized]);

  const triggerReload = useCallback(() => {
    sessionStorage.setItem('sessionKeyJustCreated', 'true');
    window.location.reload();
  }, []);

  const updateAccountState = useCallback((kernelAccount: any, client: any) => {
    Promise.all([
      new Promise(resolve => {
        setSmartAccount(kernelAccount);
        resolve(null);
      }),
      new Promise(resolve => {
        setKernelClient(client);
        resolve(null);
      }),
      new Promise(resolve => {
        setSessionKeyAddress(kernelAccount.address);
        resolve(null);
      }),
      new Promise(resolve => {
        setIsInitialized(true);
        resolve(null);
      }),
      new Promise(resolve => {
        setIsInitializing(false);
        resolve(null);
      })
    ]);
  }, []);

  const initializeFromStoredSession = useCallback(async () => {
    const { publicClient } = getChainConfig();
    
    setIsInitializing(true);
    const storedSessionKey = localStorage.getItem('sessionKey');
    
    const justCreated = sessionStorage.getItem('sessionKeyJustCreated');
    if (justCreated) {
      sessionStorage.removeItem('sessionKeyJustCreated');
    }
    
    if (storedSessionKey) {
      try {
        const kernelAccount = await deserializePermissionAccount(
          publicClient,
          ENTRYPOINT_ADDRESS_V07,
          KERNEL_V3_1,
          storedSessionKey
        );

        const kernelPaymaster = createZeroDevPaymasterClient({
          chain: arbitrum,
          entryPoint: ENTRYPOINT_ADDRESS_V07,
          transport: http(PAYMASTER_RPC),
        });

        const client = createKernelAccountClient({
          account: kernelAccount,
          entryPoint: ENTRYPOINT_ADDRESS_V07,
          chain: arbitrum,
          bundlerTransport: http(bundlerRpcUrl),
          middleware: {
            sponsorUserOperation: kernelPaymaster.sponsorUserOperation,
          }
        });

        updateAccountState(kernelAccount, client);
        
        if (justCreated) {
          window.dispatchEvent(new CustomEvent('showSuccessToast', {
            detail: { message: '1CT Account successfully created' }
          }));
        }
        
        return true;
      } catch (err) {
        console.warn('Failed to initialize from stored session:', err);
        localStorage.removeItem('sessionKey');
        setIsInitialized(false);
        return false;
      } finally {
        setIsInitializing(false);
      }
    }
    setIsInitializing(false);
    setIsInitialized(false);
    return false;
  }, [getChainConfig, updateAccountState]);

  const setupSessionKey = useCallback(async () => {
    if (!walletClient || !bundlerRpcUrl) return;
    const { publicClient } = getChainConfig();

    try {
      setIsSigningSessionKey(true);
      setError(null);

      const sessionPrivateKey = generatePrivateKey();
      const privKeyAccount = privateKeyToAccount(sessionPrivateKey);
      
      const sessionKeySigner = await toECDSASigner({
        signer: privKeyAccount,
      });

      const smartAccountSigner = walletClientToSmartAccountSigner(walletClient);

      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: smartAccountSigner,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: KERNEL_V3_1
      });

      const kernelAccount = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
          regular: await toPermissionValidator(publicClient, {
            entryPoint: ENTRYPOINT_ADDRESS_V07,
            signer: sessionKeySigner,
            policies: [toSudoPolicy({})],
            kernelVersion: KERNEL_V3_1
          })
        },
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: KERNEL_V3_1
      });

      const serializedSessionKey = await serializePermissionAccount(
        kernelAccount,
        sessionPrivateKey
      );
      localStorage.setItem('sessionKey', serializedSessionKey);

      const kernelPaymaster = createZeroDevPaymasterClient({
        chain: arbitrum,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        transport: http(PAYMASTER_RPC),
      });

      const client = createKernelAccountClient({
        account: kernelAccount,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        chain: arbitrum,
        bundlerTransport: http(bundlerRpcUrl),
        middleware: {
          sponsorUserOperation: kernelPaymaster.sponsorUserOperation,
        }
      });

      updateAccountState(kernelAccount, client);
      triggerReload();

    } catch (err) {
      console.error('Session key setup error:', err);
      setError(err instanceof Error ? err : new Error('Failed to setup session key'));
      setIsInitialized(false);
    } finally {
      setIsSigningSessionKey(false);
    }
  }, [walletClient, getChainConfig, updateAccountState, triggerReload]);

  useEffect(() => {
    initializeFromStoredSession();
  }, [initializeFromStoredSession]);

  return {
    smartAccount,
    kernelClient,
    isLoading,
    error,
    setupSessionKey,
    isSigningSessionKey,
    sessionKeyAddress,
    isInitialized,
    isInitializing
  };
}