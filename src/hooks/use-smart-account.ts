import { useCallback, useEffect, useState } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { walletClientToSmartAccountSigner } from 'permissionless';
import { http } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { toECDSASigner } from "@zerodev/permissions/signers";
import { 
  ModularSigner,
  deserializePermissionAccount,
  serializePermissionAccount,
  toPermissionValidator
} from "@zerodev/permissions";
import { toSudoPolicy } from "@zerodev/permissions/policies";

const bundlerRpcUrl = process.env.NEXT_PUBLIC_BUNDLER_RPC_URL;
const PAYMASTER_RPC = process.env.NEXT_PUBLIC_PAYMASTER_RPC;

export function useSmartAccount() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [kernelClient, setKernelClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSigningSessionKey, setIsSigningSessionKey] = useState(false);
  const [sessionKeyAddress, setSessionKeyAddress] = useState<string | null>(null);

  const updateAccountState = useCallback((kernelAccount: any, client: any) => {
    console.log("Updating account state with:", { address: kernelAccount.address });
    setSmartAccount(kernelAccount);
    setKernelClient(client);
    setSessionKeyAddress(kernelAccount.address);
    setIsInitialized(true);
  }, []);

  const dispatchInitEvent = useCallback((kernelAccount: any) => {
    console.log("Dispatching init event for address:", kernelAccount.address);
    window.dispatchEvent(new CustomEvent('smartAccountInitialized', {
      detail: { 
        address: kernelAccount.address,
        account: kernelAccount 
      }
    }));
  }, []);

  // Initialize from stored session
  const initializeFromStoredSession = useCallback(async () => {
    if (!publicClient) return false;

    setIsInitializing(true);
    const storedSessionKey = localStorage.getItem('sessionKey');
    
    if (storedSessionKey) {
      try {
        const kernelAccount = await deserializePermissionAccount(
          publicClient,
          ENTRYPOINT_ADDRESS_V07,
          KERNEL_V3_1,
          storedSessionKey
        );

        const kernelPaymaster = createZeroDevPaymasterClient({
          chain: publicClient.chain,
          entryPoint: ENTRYPOINT_ADDRESS_V07,
          transport: http(PAYMASTER_RPC),
        });

        const client = createKernelAccountClient({
          account: kernelAccount,
          entryPoint: ENTRYPOINT_ADDRESS_V07,
          chain: publicClient.chain,
          bundlerTransport: http(bundlerRpcUrl),
          middleware: {
            sponsorUserOperation: kernelPaymaster.sponsorUserOperation,
          }
        });

        updateAccountState(kernelAccount, client);
        await new Promise(resolve => setTimeout(resolve, 500));
        dispatchInitEvent(kernelAccount);
        
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
  }, [publicClient, updateAccountState, dispatchInitEvent]);

  // Setup new session key
  const setupSessionKey = useCallback(async () => {
    if (!walletClient || !bundlerRpcUrl || !publicClient) return;

    try {
      setIsSigningSessionKey(true);
      setError(null);

      // Generate session key pair
      const sessionPrivateKey = generatePrivateKey();
      const privKeyAccount = privateKeyToAccount(sessionPrivateKey);
      
      // Create session key signer
      const sessionKeySigner = await toECDSASigner({
        signer: privKeyAccount,
      });

      // Convert wallet client to smart account signer
      const smartAccountSigner = walletClientToSmartAccountSigner(walletClient);

      // Create ECDSA validator for the owner
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: smartAccountSigner,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: KERNEL_V3_1
      });

      // Create kernel account with session key permissions
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

      // Store session key
      const serializedSessionKey = await serializePermissionAccount(
        kernelAccount,
        sessionPrivateKey
      );
      localStorage.setItem('sessionKey', serializedSessionKey);

      // Create kernel client
      const kernelPaymaster = createZeroDevPaymasterClient({
        chain: publicClient.chain,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        transport: http(PAYMASTER_RPC),
      });

      const client = createKernelAccountClient({
        account: kernelAccount,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        chain: publicClient.chain,
        bundlerTransport: http(bundlerRpcUrl),
        middleware: {
          sponsorUserOperation: kernelPaymaster.sponsorUserOperation,
        }
      });

      // Update state and dispatch event
      updateAccountState(kernelAccount, client);
      await new Promise(resolve => setTimeout(resolve, 1000));
      dispatchInitEvent(kernelAccount);

    } catch (err) {
      console.error('Session key setup error:', err);
      setError(err instanceof Error ? err : new Error('Failed to setup session key'));
      setIsInitialized(false);
    } finally {
      setIsSigningSessionKey(false);
    }
  }, [walletClient, publicClient, updateAccountState, dispatchInitEvent]);

  // Initialize on mount
  useEffect(() => {
    if (publicClient) {
      initializeFromStoredSession();
    }
  }, [initializeFromStoredSession, publicClient]);

  // Monitor state changes
  useEffect(() => {
    console.log("Smart account state changed:", {
      address: smartAccount?.address,
      isInitialized,
      isInitializing,
      hasClient: !!kernelClient
    });
  }, [smartAccount?.address, isInitialized, isInitializing, kernelClient]);

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