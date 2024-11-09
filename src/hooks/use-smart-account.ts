import { useCallback, useEffect, useState } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { walletClientToSmartAccountSigner } from 'permissionless';
import { http } from 'viem';

const bundlerRpcUrl = process.env.NEXT_PUBLIC_BUNDLER_RPC_URL;

export function useSmartAccount() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [kernelClient, setKernelClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const setupSmartAccount = useCallback(async () => {
    if (!walletClient || !bundlerRpcUrl || !publicClient) return;

    try {
      setIsLoading(true);
      setError(null);

      // Convert wallet client to smart account signer
      const smartAccountSigner = walletClientToSmartAccountSigner(walletClient);

      // Create ECDSA validator
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: smartAccountSigner,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: KERNEL_V3_1
      });

      // Create Kernel account
      const account = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
        },
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: KERNEL_V3_1
      });

      // Create Kernel account client
      const client = createKernelAccountClient({
        account,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        chain: publicClient.chain,
        bundlerTransport: http(bundlerRpcUrl),
      });

      setSmartAccount(account);
      setKernelClient(client);
    } catch (err) {
      console.error('Smart account setup error:', err);
      setError(err instanceof Error ? err : new Error('Failed to setup smart account'));
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, publicClient]);

  useEffect(() => {
    setupSmartAccount();
  }, [setupSmartAccount]);

  return {
    smartAccount,
    kernelClient,
    isLoading,
    error,
    setupSmartAccount
  };
}
