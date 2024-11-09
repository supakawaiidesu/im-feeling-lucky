import { useCallback, useEffect, useState } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { walletClientToSmartAccountSigner } from 'permissionless';
import { http, zeroAddress } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { signerToSessionKeyValidator, serializeSessionKeyAccount } from "@zerodev/session-key";

const bundlerRpcUrl = process.env.NEXT_PUBLIC_BUNDLER_RPC_URL;
const PAYMASTER_RPC = "https://rpc.zerodev.app/api/v2/paymaster/424715b6-9633-4489-87cd-c15cc8043178?selfFunded=true";

export function useSmartAccount() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [kernelClient, setKernelClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSigningSessionKey, setIsSigningSessionKey] = useState(false);

  const setupSessionKey = useCallback(async () => {
    if (!walletClient || !bundlerRpcUrl || !publicClient) return;

    try {
      setIsSigningSessionKey(true);
      setError(null);

      // Convert wallet client to smart account signer
      const smartAccountSigner = walletClientToSmartAccountSigner(walletClient);

      // Create ECDSA validator
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: smartAccountSigner,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: KERNEL_V3_1
      });

      // Generate session key
      const sessionPrivateKey = generatePrivateKey();
      const sessionKeyAccount = privateKeyToAccount(sessionPrivateKey);

      // Create session key validator with 10-minute expiration
      const validUntil = Math.floor(Date.now() / 1000) + 600; // 10 minutes
      const sessionKeyValidator = await signerToSessionKeyValidator(publicClient, {
        signer: sessionKeyAccount,
        validatorData: {
          validUntil,
          validAfter: 0,
          paymaster: zeroAddress,
          permissions: [
            {
              target: zeroAddress,
              valueLimit: 0n,
              operation: 0,
            }
          ]
        },
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: KERNEL_V3_1
      });

      // Create session key account
      const account = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
          regular: sessionKeyValidator
        },
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: KERNEL_V3_1
      });

      // Serialize the session key for storage
      const serializedSessionKey = await serializeSessionKeyAccount(account, sessionPrivateKey);
      localStorage.setItem('sessionKey', serializedSessionKey);

      // Create Kernel account client
      const client = createKernelAccountClient({
        account,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        chain: publicClient.chain,
        bundlerTransport: http(bundlerRpcUrl),
        middleware: {
          sponsorUserOperation: async ({ userOperation }) => {
            const zerodevPaymaster = createZeroDevPaymasterClient({
              chain: publicClient.chain,
              entryPoint: ENTRYPOINT_ADDRESS_V07,
              transport: http(PAYMASTER_RPC),
            });
            return zerodevPaymaster.sponsorUserOperation({
              userOperation,
              entryPoint: ENTRYPOINT_ADDRESS_V07,
            });
          }
        }
      });

      setSmartAccount(account);
      setKernelClient(client);
    } catch (err) {
      console.error('Session key setup error:', err);
      setError(err instanceof Error ? err : new Error('Failed to setup session key'));
    } finally {
      setIsSigningSessionKey(false);
    }
  }, [walletClient, publicClient]);

  useEffect(() => {
    const storedSessionKey = localStorage.getItem('sessionKey');
    if (storedSessionKey) {
      // TODO: Check if session key is still valid (not expired)
      // For now, we'll just try to use it
      setSmartAccount(null);
    }
  }, []);

  return {
    smartAccount,
    kernelClient,
    isLoading,
    error,
    setupSessionKey,
    isSigningSessionKey
  };
}
