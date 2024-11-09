import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { arbitrum, sepolia } from 'wagmi/chains';

// Define chains
const chains = [
  arbitrum,
  ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
] as const;

// Create and export the config
export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains,
  transports: {
    [arbitrum.id]: http('https://rpc.ankr.com/arbitrum'),
  },
  ssr: true,
});
