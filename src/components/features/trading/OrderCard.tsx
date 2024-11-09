import React, { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useMarketOrderActions } from "../../../hooks/use-market-order-actions";
import { usePrices } from "../../../lib/websocket-price-context";
import { useMarketData } from "../../../hooks/use-market-data";
import { useSmartAccount } from "../../../hooks/use-smart-account";
import { useBalances } from "../../../hooks/use-balances";

interface OrderCardProps {
  leverage: string;
  onLeverageChange: (value: string) => void;
  assetId: string;
}

export function OrderCard({
  leverage,
  onLeverageChange,
  assetId,
}: OrderCardProps) {
  const { isConnected } = useAccount();
  const { smartAccount, error } = useSmartAccount();
  const [amount, setAmount] = useState("");
  const [isLong, setIsLong] = useState(true);
  const { placeMarketOrder, placingOrders } = useMarketOrderActions();
  const { prices } = usePrices();
  const { allMarkets } = useMarketData();
  const { balances } = useBalances();

  // Get the pair name from market data using assetId
  const market = allMarkets.find((m) => m.assetId === assetId);
  const pair = market?.pair;
  const basePair = pair?.split("/")[0].toLowerCase();
  const currentPrice = basePair ? prices[basePair]?.price : undefined;

  // Calculate various trade details
  const calculatedMargin = useMemo(() => {
    if (!amount || !leverage) return 0;
    return parseFloat(amount) / parseFloat(leverage);
  }, [amount, leverage]);

  const calculatedSize = useMemo(() => {
    if (!amount) return 0;
    return parseFloat(amount);
  }, [amount]);

  const liquidationPrice = useMemo(() => {
    if (!currentPrice || !leverage) return null;

    const priceMovementPercentage = 0.9 / parseFloat(leverage);

    if (isLong) {
      return currentPrice * (1 - priceMovementPercentage);
    } else {
      return currentPrice * (1 + priceMovementPercentage);
    }
  }, [currentPrice, leverage, isLong]);

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

    // Trading fee calculation remains the same
    const tradingFeePercent = isLong
      ? market.longTradingFee
      : market.shortTradingFee;
    const tradingFee = size * tradingFeePercent;

    // Get borrow rate (already in hourly form)
    const borrowRate = isLong
      ? market.borrowRateForLong
      : market.borrowRateForShort;

    // Funding rate is already hourly
    const hourlyFundingRate = market.fundingRate;

    // For longs: pay positive funding rate, receive negative
    // For shorts: receive positive funding rate, pay negative
    const effectiveFundingRate = isLong
      ? -hourlyFundingRate
      : hourlyFundingRate;

    // Combine borrow and funding rates for total hourly interest
    const totalHourlyRatePercent = borrowRate + effectiveFundingRate;
    const hourlyInterest = size * (totalHourlyRatePercent / 100);

    // Return the hourlyInterestPercent with the same sign as hourlyInterest
    // This ensures the percentage matches whether we're gaining or losing money
    return {
      tradingFee,
      hourlyInterest,
      tradingFeePercent,
      hourlyInterestPercent:
        hourlyInterest >= 0 ? -totalHourlyRatePercent : totalHourlyRatePercent,
    };
  }, [amount, market, currentPrice, isLong]);

  // Handle max button click
  const handleMaxClick = () => {
    if (balances?.formattedMusdBalance) {
      setAmount(balances.formattedMusdBalance);
    }
  };

  const handlePlaceOrder = () => {
    if (!isConnected || !smartAccount?.address || !currentPrice) return;

    placeMarketOrder(
      parseInt(assetId, 10),
      isLong,
      currentPrice,
      100, // 1% slippage
      calculatedMargin,
      calculatedSize
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        {error && (
          <div className="mb-4 text-red-500">Error: {error.message}</div>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">Leverage</span>
          <Select value={leverage} onValueChange={onLeverageChange}>
            <SelectTrigger className="w-20">
              <SelectValue>{leverage}x</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
              <SelectItem value="5">5x</SelectItem>
              <SelectItem value="10">10x</SelectItem>
              <SelectItem value="20">20x</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="market">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="market" className="flex-1">
              Market
            </TabsTrigger>
            <TabsTrigger value="limit" className="flex-1">
              Limit
            </TabsTrigger>
            <TabsTrigger value="stop" className="flex-1">
              Stop
            </TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={isLong ? "default" : "outline"}
                className={`w-full ${
                  isLong ? "bg-green-600 hover:bg-green-700" : ""
                }`}
                onClick={() => setIsLong(true)}
              >
                Long
              </Button>
              <Button
                variant={!isLong ? "default" : "outline"}
                className={`w-full ${
                  !isLong ? "bg-red-600 hover:bg-red-700" : ""
                }`}
                onClick={() => setIsLong(false)}
              >
                Short
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Amount</label>
                <div
                  className="text-sm cursor-pointer text-muted-foreground hover:text-primary"
                  onClick={handleMaxClick}
                >
                  Balance: {balances?.formattedMusdBalance || "0.00"}
                </div>
              </div>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Margin</span>
                <span>{calculatedMargin.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span>Entry Price</span>
                <span>${currentPrice?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>Position Size</span>
                <span>${calculatedSize.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Liquidation Price</span>
                <span className="text-red-500">
                  ${liquidationPrice?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trading Fee </span>
                <span>
                  ${fees.tradingFee.toFixed(2)} ({fees.tradingFeePercent}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hourly Interest</span>
                <span
                  className={
                    fees.hourlyInterest >= 0 ? "text-red-400" : "text-green-400"
                  }
                >
                  {fees.hourlyInterest >= 0 ? "-" : "+"}$
                  {Math.abs(fees.hourlyInterest).toFixed(2)} (
                  {Math.abs(fees.hourlyInterestPercent).toFixed(4)}%)
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              disabled={
                !isConnected ||
                !smartAccount?.address ||
                placingOrders ||
                !currentPrice
              }
              onClick={handlePlaceOrder}
            >
              {!isConnected
                ? "Connect Wallet to Trade"
                : !smartAccount?.address
                ? "Smart Account Not Ready"
                : !currentPrice
                ? "Waiting for price..."
                : placingOrders
                ? "Placing Order..."
                : `Place Market ${isLong ? "Long" : "Short"}`}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default OrderCard;
