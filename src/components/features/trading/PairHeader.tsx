import React, { useState } from "react";
import { useMarketData } from "../../../hooks/use-market-data";
import { usePrices } from "../../../lib/websocket-price-context";

interface PairHeaderProps {
  selectedPair?: string;
}

type TimeframeRate = "1h" | "1d" | "1y";

export const PairHeader: React.FC<PairHeaderProps> = ({
  selectedPair = "ETH/USD",
}) => {
  const [rateTimeframe, setRateTimeframe] = useState<TimeframeRate>("1h");
  const { marketData, loading, error } = useMarketData({
    selectedPair,
  });

  const { prices } = usePrices();
  const basePair = selectedPair.split("/")[0].toLowerCase();
  const currentPrice = prices[basePair]?.price;

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        Error loading market data: {error.message}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        Loading market data...
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="flex items-center justify-center p-4">
        No market data available for {selectedPair}
      </div>
    );
  }

  const getAnnualizedRate = (rate: number) => {
    switch (rateTimeframe) {
      case "1d":
        return rate * 24;
      case "1y":
        return rate * 24 * 365;
      default:
        return rate;
    }
  };

  const nextTimeframe = (): TimeframeRate => {
    switch (rateTimeframe) {
      case "1h":
        return "1d";
      case "1d":
        return "1y";
      case "1y":
        return "1h";
    }
  };

  return (
    <div className="p-2 mr-2 my-2 h-auto border rounded-lg shadow-sm bg-[hsl(var(--component-background))]">
      <div className="flex flex-wrap items-center text-sm">
        {/* Price Group */}
        <div className="flex items-center min-w-[100px] pr-2 border-r">
          <div className="flex items-center gap-2 px-4">
            <div className="font-bold text-md font-mono w-[75px] text-left">
              {currentPrice ? currentPrice.toLocaleString() : "Loading..."}
            </div>
            <div className="text-muted-foreground">{selectedPair}</div>
          </div>
        </div>

        {/* Open Interest Group */}
        <div className="flex items-center space-x-8 px-4 border-r min-w-[300px]">
          <div>
            <div className="text-muted-foreground">Long OI</div>
            <div>
              ${marketData.longOpenInterest.toLocaleString()} / $
              {marketData.maxLongOpenInterest.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Short OI</div>
            <div>
              ${marketData.shortOpenInterest.toLocaleString()} / $
              {marketData.maxShortOpenInterest.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Long/Short Ratio Group */}
        <div className="flex items-center px-4 border-r min-w-[160px]">
          <div>
            <div className="text-muted-foreground">Long/Short Ratio</div>
            <div>
              {marketData.longShortRatio.longPercentage.toFixed(1)}% /{" "}
              {marketData.longShortRatio.shortPercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Borrow Rates Group */}
        <div className="flex items-center px-4 min-w-[220px]">
          <div className="flex gap-4">
            <div>
              <div className="text-muted-foreground">Borrowing (L)</div>
              <div className="text-red-500">
                {getAnnualizedRate(marketData.borrowRateForLong).toFixed(4)}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Borrowing (S)</div>
              <div className="text-red-500">
                {getAnnualizedRate(marketData.borrowRateForShort).toFixed(4)}%
              </div>
            </div>
          </div>
        </div>

        {/* Funding Rate Group */}
        <div className="flex items-center px-4 border-l min-w-[160px]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Funding Rate</span>
              <button
                onClick={() => setRateTimeframe(nextTimeframe())}
                className="px-2 py-0.5 text-xs rounded bg-secondary hover:bg-secondary/80"
              >
                {rateTimeframe}
              </button>
            </div>
            <div
              className={
                getAnnualizedRate(marketData.fundingRate) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {getAnnualizedRate(marketData.fundingRate).toFixed(4)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PairHeader;