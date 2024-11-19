import React from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useMarketData } from "../../../hooks/use-market-data";
import { usePrices } from "../../../lib/websocket-price-context";
import { cn } from "../../../lib/utils";
import {
  TokenPairDisplay,
  PrefetchTokenImages,
} from "../../../hooks/use-token-icon";

interface PairSelectorProps {
  selectedPair: string;
  onPairChange: (value: string) => void;
}

export function PairSelector({
  selectedPair,
  onPairChange,
}: PairSelectorProps) {
  const { allMarkets, loading } = useMarketData();
  const { prices } = usePrices();
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredMarkets = allMarkets.filter((market) =>
    market.pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(num);
  };

  const getWebsocketPrice = (pair: string) => {
    const basePair = pair.split("/")[0].toLowerCase();
    return prices[basePair]?.price;
  };

  const formatPrice = (pair: string) => {
    const price = getWebsocketPrice(pair);
    if (!price) return "...";
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 4,
      minimumFractionDigits: 4,
    }).format(price);
  };

  const formatFundingRate = (rate: number) => {
    return `${rate.toFixed(4)}%`;
  };

  const preventClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (loading) {
    return (
      <div className="flex items-center mx-0.25 my-2">
        <Select value={selectedPair} onValueChange={onPairChange}>
          <SelectTrigger className="w-full md:w-[350px] h-[55px] bg-[hsl(var(--component-background))] border rounded-lg shadow-sm">
            <SelectValue>Loading...</SelectValue>
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex items-center mx-0.25 my-2">
      <PrefetchTokenImages pairs={allMarkets.map((market) => market.pair)} />

      <Select value={selectedPair} onValueChange={onPairChange}>
        <SelectTrigger className="w-full md:w-[350px] h-[62px] bg-[hsl(var(--component-background))] border rounded-lg shadow-sm">
          <SelectValue>
            <TokenPairDisplay pair={selectedPair} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent 
          className="w-full md:w-[900px] bg-[hsl(var(--component-background))] overflow-hidden p-0"
        >
          <div className="flex flex-col h-[500px]">
            <div className="sticky top-0 z-20 bg-[hsl(var(--component-background))] shadow-sm">
              <div 
                className="px-4 py-2 border-b"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div 
                  className="relative"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search pairs..."
                    value={searchQuery}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSearchQuery(e.target.value);
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
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
              {filteredMarkets.map((market) => (
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
  );
}
