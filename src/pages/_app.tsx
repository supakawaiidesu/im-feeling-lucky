import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import Script from 'next/script';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { ThemeProvider } from 'next-themes';

import { config } from '../wagmi';
import { arbitrum } from 'viem/chains';
import { PriceProvider } from '../lib/websocket-price-context';
import { ToastProvider } from '../components/ui/use-toast';
import { Footer } from '../components/shared/Footer';

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script 
        src="/static/charting_library/charting_library.standalone.js"
        strategy="beforeInteractive"
      />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <WagmiProvider config={config}>
          <QueryClientProvider client={client}>
            <RainbowKitProvider
              theme={{
                lightMode: lightTheme(),
                darkMode: darkTheme()
              }}
              initialChain={arbitrum}
            >
              <PriceProvider>
                <ToastProvider>
                  <div className="pb-8"> {/* Added padding bottom to prevent footer overlap */}
                    <Component {...pageProps} />
                  </div>
                  <Footer />
                </ToastProvider>
              </PriceProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
