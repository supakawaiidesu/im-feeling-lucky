import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import OrderCard from '../components/order-card';
import TradeTable from '../components/trade-table';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <Head>
        <title>RainbowKit Trading App</title>
        <meta
          content="RainbowKit Trading Application"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className="w-full max-w-4xl flex flex-col items-center gap-8">
        <ConnectButton showBalance={false} />
        <OrderCard />
        <TradeTable />
      </main>
    </div>
  );
};

export default Home;