
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMarketData } from './use-market-data';

export function usePairFromUrl(defaultPair: string = 'ETH/USD') {
  const router = useRouter();
  const [selectedPair, setSelectedPair] = useState(defaultPair);
  const { allMarkets } = useMarketData();

  useEffect(() => {
    const { pair } = router.query;
    if (typeof pair === 'string' && allMarkets.some(m => m.pair === pair)) {
      setSelectedPair(pair);
    }
  }, [router.query, allMarkets]);

  const setPair = (pair: string) => {
    setSelectedPair(pair);
    router.push(`/?pair=${pair}`, undefined, { shallow: true });
  };

  return { selectedPair, setPair };
}