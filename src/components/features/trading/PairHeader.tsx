import React from 'react';

export const PairHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 text-sm border-b">
      <div className="flex items-center space-x-8">
        <div>
          <div className="text-lg font-bold">2,931.90</div>
          <div className="text-muted-foreground">$2,931.12</div>
        </div>
        <div>
          <div className="text-muted-foreground">24h Change</div>
          <div className="text-green-500">+1.61%</div>
        </div>
        <div>
          <div className="text-muted-foreground">24h Volume USDC</div>
          <div>32,013,632</div>
        </div>
        <div>
          <div className="text-muted-foreground">Oracle Price</div>
          <div>2,933.90</div>
        </div>
        <div>
          <div className="text-muted-foreground">Spot Index Price</div>
          <div>2,933.87</div>
        </div>
      </div>
      <div className="flex items-center space-x-8">
        <div>
          <div className="text-muted-foreground">Open Interest USDC</div>
          <div>8,962,259</div>
        </div>
        <div>
          <div className="text-muted-foreground">Predicted Funding</div>
          <div className="text-green-500">+0.0009%</div>
        </div>
        <div>
          <div className="text-muted-foreground">Countdown</div>
          <div>07:43</div>
        </div>
        <div>
          <div className="text-muted-foreground">Annualized Funding</div>
          <div className="text-green-500">+8.15%</div>
        </div>
        <div>
          <div className="text-muted-foreground">The Tie</div>
          <div>24h Sentiment</div>
        </div>
      </div>
    </div>
  );
};
