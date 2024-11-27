import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import Head from "next/head";

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
import { Toaster } from "../components/ui/toaster";
import  NewVersionNotification from "../components/shared/NewVersionNotification";

const client = new QueryClient();
const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree that you are not a US citizen or in any
    resticted territory based the {" "}
    <Link href="https://termsofservice.xyz">Terms of Service</Link> and
    acknowledge you have read and understand the protocol{" "}
    <Link href="https://disclaimer.xyz">Disclaimer</Link>
  </Text>
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="application-name" content="UniDex Exchange" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="UniDex" />
        <meta name="description" content="Open Source Perp Liquidity Layer" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/static/images/ios-icon.svg" />
      </Head>
      <Script
        src="/static/charting_library/charting_library.standalone.js"
        strategy="beforeInteractive"
      />
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
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
                darkMode: darkTheme({ overlayBlur: "small" }),
              }}
              initialChain={arbitrum}
            >
              <PriceProvider>
                <div className="pb-8">
                  <Component {...pageProps} />
                </div>
                <Toaster />
                <NewVersionNotification />
              </PriceProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;