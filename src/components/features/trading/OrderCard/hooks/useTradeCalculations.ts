import { useMemo } from 'react';
import { useMarketData } from '../../../../../hooks/use-market-data';
import { usePrices } from '../../../../../lib/websocket-price-context';
import { TradeDetails } from '../types';

interface UseTradeCalculationsProps {
  amount: string;
  leverage: string;
  isLong: boolean;
  activeTab: string;
  limitPrice: string;
  assetId: string;
}

export function useTradeCalculations({
  amount,
  leverage,
  isLong,
  activeTab,
  limitPrice,
  assetId,
}: UseTradeCalculationsProps): TradeDetails {
  const { prices } = usePrices();
  const { allMarkets } = useMarketData();

  // Get the pair name from market data using assetId
  const market = allMarkets.find((m) => m.assetId === assetId);
  const pair = market?.pair;
  const basePair = pair?.split("/")[0].toLowerCase();
  const currentPrice = basePair ? prices[basePair]?.price : undefined;

  const calculatedMargin = useMemo(() => {
    if (!amount || !leverage) return 0;
    return parseFloat(amount) / parseFloat(leverage);
  }, [amount, leverage]);

  const calculatedSize = useMemo(() => {
    if (!amount) return 0;
    return parseFloat(amount);
  }, [amount]);

  // Calculate notional size based on order type
  const notionalSize = useMemo(() => {
    if (!calculatedSize) return 0;
    const price = activeTab === "limit" && limitPrice ? parseFloat(limitPrice) : currentPrice;
    return price ? calculatedSize / price : 0;
  }, [calculatedSize, currentPrice, activeTab, limitPrice]);

  // Calculate liquidation price based on order type
  const liquidationPrice = useMemo(() => {
    const price = activeTab === "limit" && limitPrice ? parseFloat(limitPrice) : currentPrice;
    if (!price || !leverage) return null;

    const priceMovementPercentage = 0.9 / parseFloat(leverage);

    if (isLong) {
      return price * (1 - priceMovementPercentage);
    } else {
      return price * (1 + priceMovementPercentage);
    }
  }, [currentPrice, leverage, isLong, activeTab, limitPrice]);

  // Calculate fees using market data
  const fees = useMemo(() => {
    if (!amount || !market || !currentPrice)
      return {
        tradingFee: 0,
        hourlyInterest: 0,
        tradingFeePercent: 0,
        hourlyInterestPercent: 0,
      };

    const size = parseFloat(amount);

    const tradingFeePercent = isLong
      ? market.longTradingFee
      : market.shortTradingFee;
    const tradingFee = size * tradingFeePercent;

    const borrowRate = isLong
      ? market.borrowRateForLong
      : market.borrowRateForShort;

    const hourlyFundingRate = market.fundingRate;

    const effectiveFundingRate = isLong
      ? -hourlyFundingRate
      : hourlyFundingRate;

    const totalHourlyRatePercent = borrowRate + effectiveFundingRate;
    const hourlyInterest = size * (totalHourlyRatePercent / 100);

    return {
      tradingFee,
      hourlyInterest,
      tradingFeePercent,
      hourlyInterestPercent:
        hourlyInterest >= 0 ? -totalHourlyRatePercent : totalHourlyRatePercent,
    };
  }, [amount, market, currentPrice, isLong]);

  const entryPrice = activeTab === "limit" && limitPrice
    ? parseFloat(limitPrice)
    : currentPrice;

  return {
    entryPrice,
    notionalSize,
    liquidationPrice,
    fees,
  };
}
