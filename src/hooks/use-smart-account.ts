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
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [kernelClient, setKernelClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSigningSessionKey, setIsSigningSessionKey] = useState(false);
  const [sessionKeyAddress, setSessionKeyAddress] = useState<string | null>(null);

  // Initialize from stored session
  const initializeFromStoredSession = useCallback(async () => {
    if (!publicClient) return;

    const storedSessionKey = localStorage.getItem('sessionKey');
    
    if (storedSessionKey) {
      try {
        // Deserialize the permission account
        const kernelAccount = await deserializePermissionAccount(
          publicClient,
          ENTRYPOINT_ADDRESS_V07,
          KERNEL_V3_1,
          storedSessionKey
        );

        // Create kernel client with paymaster
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

        setSmartAccount(kernelAccount);
        setKernelClient(client);
        setSessionKeyAddress(kernelAccount.address);
        return true;
      } catch (err) {
        console.warn('Failed to initialize from stored session:', err);
        localStorage.removeItem('sessionKey');
        return false;
      }
    }
    return false;
  }, [publicClient]);

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

      // Create master account
      const masterAccount = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
        },
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: KERNEL_V3_1
      });

      // Create permission validator for the session key
      const permissionPlugin = await toPermissionValidator(publicClient, {
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        signer: sessionKeySigner,
        policies: [
          // Using sudo policy for now - can be replaced with more restrictive policies
          toSudoPolicy({}),
        ],
        kernelVersion: KERNEL_V3_1
      });

      // Create kernel account with session key permissions
      const kernelAccount = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
          regular: permissionPlugin,
        },
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: KERNEL_V3_1
      });

      // Serialize the permission account with private key
      const serializedSessionKey = await serializePermissionAccount(
        kernelAccount,
        sessionPrivateKey
      );

      // Store serialized session key
      localStorage.setItem('sessionKey', serializedSessionKey);

      // Create kernel client with paymaster
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

      setSmartAccount(kernelAccount);
      setKernelClient(client);
      setSessionKeyAddress(kernelAccount.address);

    } catch (err) {
      console.error('Session key setup error:', err);
      setError(err instanceof Error ? err : new Error('Failed to setup session key'));
    } finally {
      setIsSigningSessionKey(false);
    }
  }, [walletClient, publicClient]);

  // Try to initialize from stored session on mount
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
    sessionKeyAddress
  };
}