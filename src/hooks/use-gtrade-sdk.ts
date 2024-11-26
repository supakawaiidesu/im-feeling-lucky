// hooks/use-gtrade-sdk.ts
import { useMemo } from 'react';
import { TradingSDK, SupportedChainId } from "@gainsnetwork/trading-sdk";
import { usePublicClient } from 'wagmi';

export function useGTradeSdk() {
  const publicClient = usePublicClient();
  
  const sdk = useMemo(() => {
    if (!publicClient?.transport.url) return null;
    
    const tradingSdk = new TradingSDK({ 
      chainId: SupportedChainId.Arbitrum,
      rpcProviderUrl: publicClient.transport.url // Pass our existing RPC URL
    });
    return tradingSdk;
  }, [publicClient?.transport?.url]);

  return sdk;
}