import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import Script from "next/script";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
  DisclaimerComponent,
} from "@rainbow-me/rainbowkit";
import { ThemeProvider } from "next-themes";

import { config } from "../wagmi";
import { arbitrum } from "viem/chains";
import { PriceProvider } from "../lib/websocket-price-context";
import { Footer } from "../components/shared/Footer";
import { Toaster } from "../components/ui/toaster";

const client = new QueryClient();
const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree that you are not a US citizen or in any
    resticted territory based the{" "}
    <Link href="https://termsofservice.xyz">Terms of Service</Link> and
    acknowledge you have read and understand the protocol{" "}
    <Link href="https://disclaimer.xyz">Disclaimer</Link>
  </Text>
);

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
              modalSize="compact"
              appInfo={{
                appName: "RainbowKit Demo",
                disclaimer: Disclaimer,
              }}
              theme={{
                lightMode: lightTheme(),
                darkMode: darkTheme({overlayBlur: "small"}),
                
              }}
              initialChain={arbitrum}
            >
              <PriceProvider>
                <div className="pb-8">
                  {" "}
                  {/* Added padding bottom to prevent footer overlap */}
                  <Component {...pageProps} />
                </div>
                <Footer />
                <Toaster />
              </PriceProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
