// hooks/use-gtrade-sdk.ts
import { useMemo } from 'react';
import { TradingSDK, SupportedChainId } from "@gainsnetwork/trading-sdk";

export function useGTradeSdk() {
  const sdk = useMemo(() => {
    const tradingSdk = new TradingSDK({ chainId: SupportedChainId.Arbitrum });
    return tradingSdk;
  }, []);

  return sdk;
}