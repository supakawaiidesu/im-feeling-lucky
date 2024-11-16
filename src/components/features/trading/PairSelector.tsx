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
        <SelectTrigger className="w-full md:w-[350px] h-[55px] bg-[hsl(var(--component-background))] border rounded-lg shadow-sm">
          <SelectValue>
            <TokenPairDisplay pair={selectedPair} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-full md:w-[900px] bg-[hsl(var(--component-background))]">
          <div className="grid grid-cols-5 px-4 py-2 text-sm font-medium border-b text-muted-foreground">
            <div className="w-[180px]">Pair</div>
            <div className="w-[140px]">Market Price</div>
            <div className="w-[140px]">Long Liquidity</div>
            <div className="w-[140px]">Short Liquidity</div>
            <div className="w-[140px]">Funding Rate</div>
          </div>
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
        </SelectContent>
      </Select>
    </div>
  );
}
