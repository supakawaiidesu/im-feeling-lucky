import React, { useState } from 'react';
import { useMarketData } from '../../../hooks/use-market-data';
import { usePrices } from '../../../lib/websocket-price-context';

interface PairHeaderProps {
  selectedPair?: string;
}

type FundingTimeframe = '1h' | '1d' | '1y';

export const PairHeader: React.FC<PairHeaderProps> = ({ selectedPair = "ETH/USD" }) => {
  const [fundingTimeframe, setFundingTimeframe] = useState<FundingTimeframe>('1h');
  const { marketData, loading, error } = useMarketData({ 
    selectedPair,
    pollInterval: 10000
  });

  const { prices } = usePrices();
  const basePair = selectedPair.split('/')[0].toLowerCase();
  const currentPrice = prices[basePair]?.price;

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        Error loading market data: {error.message}
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center p-4">Loading market data...</div>;
  }

  if (!marketData) {
    return (
      <div className="flex items-center justify-center p-4">
        No market data available for {selectedPair}
      </div>
    );
  }

  const getFundingRate = () => {
    const rate = marketData.fundingRate;
    switch (fundingTimeframe) {
      case '1d':
        return rate * 24;
      case '1y':
        return rate * 24 * 365;
      default:
        return rate;
    }
  };

  const nextTimeframe = (): FundingTimeframe => {
    switch (fundingTimeframe) {
      case '1h':
        return '1d';
      case '1d':
        return '1y';
      case '1y':
        return '1h';
    }
  };

  return (
    <div className="p-2 mx-0.25 my-2 border rounded-lg shadow-sm bg-background">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          {/* Price Group */}
          <div className="flex items-center pr-16 space-x-2 border-r">
            <div>
              <div className="font-bold text-md">
                {currentPrice ? currentPrice.toLocaleString() : 'Loading...'}
              </div>
              <div className="text-muted-foreground">{selectedPair}</div>
            </div>
          </div>

          {/* Open Interest Group */}
          <div className="flex items-center px-8 space-x-8 border-r">
            <div>
              <div className="text-muted-foreground">Long OI</div>
              <div>
                ${marketData.longOpenInterest.toLocaleString()} / ${marketData.maxLongOpenInterest.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Short OI</div>
              <div>
                ${marketData.shortOpenInterest.toLocaleString()} / ${marketData.maxShortOpenInterest.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Long/Short Ratio Group */}
          <div className="flex items-center px-8 space-x-8 border-r">
            <div>
              <div className="text-muted-foreground">Long/Short Ratio</div>
              <div>
                {marketData.longShortRatio.longPercentage.toFixed(1)}% / {marketData.longShortRatio.shortPercentage.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Funding Rate Group */}
          <div className="flex items-center pl-8 space-x-8">
            <div>
              <div className="text-muted-foreground">
                Funding Rate
                <button 
                  onClick={() => setFundingTimeframe(nextTimeframe())}
                  className="ml-2 px-2 py-0.5 text-xs rounded bg-secondary hover:bg-secondary/80"
                >
                  {fundingTimeframe}
                </button>
              </div>
              <div className={getFundingRate() >= 0 ? "text-green-500" : "text-red-500"}>
                {getFundingRate().toFixed(4)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
