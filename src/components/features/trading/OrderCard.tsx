import React, { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Slider } from "../../ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useMarketOrderActions } from "../../../hooks/use-market-order-actions";
import { usePrices } from "../../../lib/websocket-price-context";
import { useMarketData } from "../../../hooks/use-market-data";
import { useSmartAccount } from "../../../hooks/use-smart-account";
import { useBalances } from "../../../hooks/use-balances";
import { LeverageDialog } from "./LeverageDialog";

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
  const [limitPrice, setLimitPrice] = useState("");
  const [sliderValue, setSliderValue] = useState([0]);
  const [isLong, setIsLong] = useState(true);
  const [activeTab, setActiveTab] = useState("market");
  const { placeMarketOrder, placingOrders } = useMarketOrderActions();
  const { prices } = usePrices();
  const { allMarkets } = useMarketData();
  const { balances } = useBalances();

  // Get the pair name from market data using assetId
  const market = allMarkets.find((m) => m.assetId === assetId);
  const pair = market?.pair;
  const basePair = pair?.split("/")[0].toLowerCase();
  const currentPrice = basePair ? prices[basePair]?.price : undefined;

  // Calculate max leveraged amount
  const maxLeveragedAmount = useMemo(() => {
    const balance = parseFloat(balances?.formattedMusdBalance || "0");
    return balance * parseFloat(leverage);
  }, [balances?.formattedMusdBalance, leverage]);

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    const newAmount = (maxLeveragedAmount * value[0] / 100).toFixed(2);
    setAmount(newAmount);
  };

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    
    // Update slider value based on amount
    if (maxLeveragedAmount > 0) {
      const percentage = (parseFloat(newAmount) / maxLeveragedAmount) * 100;
      setSliderValue([Math.min(100, Math.max(0, percentage))]);
    }
  };

  // Handle limit price input change
  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLimitPrice(e.target.value);
  };

  // Calculate various trade details
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

  // Handle max button click
  const handleMaxClick = () => {
    if (balances?.formattedMusdBalance) {
      setAmount(maxLeveragedAmount.toFixed(2));
      setSliderValue([100]);
    }
  };

  const handlePlaceOrder = () => {
    if (!isConnected || !smartAccount?.address) return;

    if (activeTab === "market" && currentPrice) {
      placeMarketOrder(
        parseInt(assetId, 10),
        isLong,
        currentPrice,
        100, // 1% slippage
        calculatedMargin,
        calculatedSize
      );
    } else if (activeTab === "limit" && limitPrice) {
      // TODO: Implement limit order placement
      placeMarketOrder(
        parseInt(assetId, 10),
        isLong,
        parseFloat(limitPrice),
        100, // 1% slippage
        calculatedMargin,
        calculatedSize
      );
    }
  };

  const getEntryPrice = () => {
    if (activeTab === "limit" && limitPrice) {
      return parseFloat(limitPrice);
    }
    return currentPrice;
  };

  return (
    <Card className="w-[350px]">
      <CardContent className="p-4">
        {error && (
          <div className="mb-4 text-red-500">Error: {error.message}</div>
        )}

        <div className="mb-4">
          <LeverageDialog leverage={leverage} onLeverageChange={onLeverageChange} />
        </div>

        <Tabs defaultValue="market" onValueChange={setActiveTab}>
          <div className="grid grid-cols-2 gap-2 mb-4">
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

          <div className="flex justify-between text-sm text-muted-foreground">
            <TabsList className="flex gap-4 p-0 bg-transparent border-0">
              <TabsTrigger 
                value="market" 
                className="bg-transparent border-0 p-0 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-primary"
              >
                Market
              </TabsTrigger>
              <TabsTrigger 
                value="limit" 
                className="bg-transparent border-0 p-0 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-primary"
              >
                Limit
              </TabsTrigger>
              <TabsTrigger 
                value="stop" 
                className="bg-transparent border-0 p-0 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-primary"
              >
                Stop
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="market" className="space-y-4">
            <div className="space-y-1">
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  className="text-right pr-7"
                  label="Size"
                />
                <div className="absolute text-sm -translate-y-1/2 right-3 top-1/2 text-muted-foreground">
                  USD
                </div>
              </div>
              <Input
                type="text"
                value={`${calculatedMargin.toFixed(2)} USD`}
                readOnly
                label="Margin"
              />
              <div className="pt-2">
                <Slider
                  value={sliderValue}
                  onValueChange={handleSliderChange}
                  max={100}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="limit" className="space-y-4">
            <div className="space-y-1">
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  className="text-right pr-7"
                  label="Size"
                />
                <div className="absolute text-sm -translate-y-1/2 right-3 top-1/2 text-muted-foreground">
                  USD
                </div>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={limitPrice}
                  onChange={handleLimitPriceChange}
                  className="text-right pr-7"
                  label="Limit Price"
                />
                <div className="absolute text-sm -translate-y-1/2 right-3 top-1/2 text-muted-foreground">
                  USD
                </div>
              </div>
              <Input
                type="text"
                value={`${calculatedMargin.toFixed(2)} USD`}
                readOnly
                label="Margin"
              />
              <div className="pt-2">
                <Slider
                  value={sliderValue}
                  onValueChange={handleSliderChange}
                  max={100}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Entry Price</span>
              <span>${getEntryPrice()?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span>Notional Size</span>
              <span>
                {notionalSize.toFixed(4)} {market?.pair?.split("/")[0]}
              </span>
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
            variant="market"
            className="w-full mt-4"
            disabled={
              !isConnected ||
              !smartAccount?.address ||
              placingOrders ||
              (activeTab === "market" && !currentPrice) ||
              (activeTab === "limit" && !limitPrice)
            }
            onClick={handlePlaceOrder}
          >
            {!isConnected
              ? "Connect Wallet to Trade"
              : !smartAccount?.address
              ? "Smart Account Not Ready"
              : activeTab === "market" && !currentPrice
              ? "Waiting for price..."
              : activeTab === "limit" && !limitPrice
              ? "Enter Limit Price"
              : placingOrders
              ? "Placing Order..."
              : `Place ${activeTab === "market" ? "Market" : "Limit"} ${isLong ? "Long" : "Short"}`}
          </Button>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default OrderCard;
