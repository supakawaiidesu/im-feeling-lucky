import React, { useState } from "react";
import { useMarketData } from "../../../hooks/use-market-data";
import { usePrices } from "../../../lib/websocket-price-context";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Search } from "lucide-react";
import { cn } from "../../../lib/utils";
import {
  TokenIcon,
  TokenPairDisplay,
  PrefetchTokenImages,
} from "../../../hooks/use-token-icon";

interface PairHeaderProps {
  selectedPair: string;
  onPairChange: (value: string) => void;
}

type TimeframeRate = "1h" | "1d" | "1y";

export const PairHeader: React.FC<PairHeaderProps> = ({
  selectedPair,
  onPairChange,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { allMarkets, loading, error } = useMarketData({
    selectedPair,
  });

  const { prices } = usePrices();
  const basePair = selectedPair.split("/")[0].toLowerCase();
  const currentPrice = prices[basePair]?.price;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatPrice = (pair: string) => {
    const basePair = pair.split("/")[0].toLowerCase();
    const price = prices[basePair]?.price;
    if (!price) return "...";
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 4,
      minimumFractionDigits: 4,
    }).format(price);
  };

  const formatFundingRate = (rate: number) => {
    return `${rate.toFixed(4)}%`;
  };

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

  return (
    <div className="w-full">
      <div className="p-2 my-2 border rounded-lg shadow-sm bg-[hsl(var(--component-background))] overflow-hidden">
        <Select value={selectedPair} onValueChange={onPairChange}>
          <SelectTrigger className="w-full h-full p-0 bg-transparent border-0 shadow-none cursor-pointer focus:ring-0 hover:bg-muted/60">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <TokenIcon pair={selectedPair} size={24} />
                <span className="text-muted-foreground">{selectedPair}</span>
              </div>
              <div className="font-mono font-bold">
                {currentPrice ? currentPrice.toLocaleString() : "Loading..."}
              </div>
            </div>
          </SelectTrigger>
          <SelectContent className="w-[900px] bg-[hsl(var(--component-background))] overflow-hidden p-0">
            <div className="flex flex-col h-[500px]">
              <PrefetchTokenImages pairs={allMarkets.map((market) => market.pair)} />
              <div className="sticky top-0 z-20 bg-[hsl(var(--component-background))] shadow-sm">
                <div className="px-4 py-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search pairs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-2 pl-8 pr-4 text-sm bg-transparent border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5 px-4 py-2 text-sm font-medium border-b text-muted-foreground bg-muted/30">
                  <div className="w-[180px]">Pair</div>
                  <div className="w-[140px]">Market Price</div>
                  <div className="w-[140px]">Long Liquidity</div>
                  <div className="w-[140px]">Short Liquidity</div>
                  <div className="w-[140px]">Funding Rate</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {allMarkets.map((market) => (
                  <SelectItem
                    key={market.pair}
                    value={market.pair}
                    className="px-4 py-2 cursor-pointer hover:bg-muted/60"
                  >
                    <div className="grid items-center grid-cols-5 text-sm">
                      <div className="w-[180px]">
                        <TokenPairDisplay pair={market.pair} />
                      </div>
                      <div className="w-[140px]">{formatPrice(market.pair)}</div>
                      <div className="w-[140px]">${formatNumber(market.availableLiquidity.long)}</div>
                      <div className="w-[140px]">${formatNumber(market.availableLiquidity.short)}</div>
                      <div className="w-[140px]">
                        <span
                          className={cn(
                            market.fundingRate > 0
                              ? "text-[#22c55e]"
                              : market.fundingRate < 0
                              ? "text-[#ef4444]"
                              : "text-foreground"
                          )}
                        >
                          {formatFundingRate(market.fundingRate)}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </div>
            </div>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PairHeader;
