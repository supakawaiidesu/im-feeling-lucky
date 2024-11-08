import React from 'react';
import { useMarketData } from '../../../hooks/use-market-data';

interface PairHeaderProps {
  selectedPair?: string;
}

export const PairHeader: React.FC<PairHeaderProps> = ({ selectedPair = "ETH/USD" }) => {
  const { marketData, loading, error } = useMarketData({ 
    selectedPair,
    pollInterval: 10000 // 10 second polling
  });

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

  const totalOpenInterest = marketData.longOpenInterest + marketData.shortOpenInterest;
  const annualizedFunding = marketData.fundingRate * 365 * 100; // Convert to annual percentage

  return (
    <div className="flex items-center justify-between p-4 text-sm border-b">
      <div className="flex items-center space-x-8">
        <div>
          <div className="text-lg font-bold">{parseFloat(marketData.price).toLocaleString()}</div>
          <div className="text-muted-foreground">{marketData.pair}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Utilization</div>
          <div>{marketData.utilization.toFixed(2)}%</div>
        </div>
        <div>
          <div className="text-muted-foreground">Total Open Interest</div>
          <div>${totalOpenInterest.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Long Borrow Rate</div>
          <div>{(marketData.borrowRateForLong * 100).toFixed(4)}%</div>
        </div>
        <div>
          <div className="text-muted-foreground">Short Borrow Rate</div>
          <div>{(marketData.borrowRateForShort * 100).toFixed(4)}%</div>
        </div>
      </div>
      <div className="flex items-center space-x-8">
        <div>
          <div className="text-muted-foreground">Long OI</div>
          <div>${marketData.longOpenInterest.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Short OI</div>
          <div>${marketData.shortOpenInterest.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Current Funding</div>
          <div className={marketData.fundingRate >= 0 ? "text-green-500" : "text-red-500"}>
            {(marketData.fundingRate * 100).toFixed(4)}%
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Annualized Funding</div>
          <div className={annualizedFunding >= 0 ? "text-green-500" : "text-red-500"}>
            {annualizedFunding.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};
