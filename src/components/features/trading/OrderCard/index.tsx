import React, { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { useMarketOrderActions } from "../../../../hooks/use-market-order-actions";
import { useSmartAccount } from "../../../../hooks/use-smart-account";
import { useMarketData } from "../../../../hooks/use-market-data";
import { LeverageDialog } from "../LeverageDialog";
import { MarketOrderForm } from "./components/MarketOrderForm";
import { LimitOrderForm } from "./components/LimitOrderForm";
import { TradeDetails } from "./components/TradeDetails";
import { useOrderForm } from "./hooks/useOrderForm";
import { useTradeCalculations } from "./hooks/useTradeCalculations";
import { OrderCardProps } from "./types";

export function OrderCard({
  leverage,
  onLeverageChange,
  assetId,
}: OrderCardProps) {
  const { isConnected } = useAccount();
  const { smartAccount, error } = useSmartAccount();
  const [activeTab, setActiveTab] = useState("market");
  const { placeMarketOrder, placeLimitOrder, placingOrders } =
    useMarketOrderActions();
  const { allMarkets } = useMarketData();

  const {
    formState,
    maxLeveragedAmount,
    handleAmountChange,
    handleLimitPriceChange,
    handleSliderChange,
    toggleDirection,
    toggleTPSL,
    handleTakeProfitChange,
    handleStopLossChange,
  } = useOrderForm({ leverage });

  const calculatedMargin = formState.amount
    ? parseFloat(formState.amount) / parseFloat(leverage)
    : 0;

  const tradeDetails = useTradeCalculations({
    amount: formState.amount,
    leverage,
    isLong: formState.isLong,
    activeTab,
    limitPrice: formState.limitPrice,
    assetId,
  });

  // Get the pair name from market data using assetId
  const market = allMarkets.find((m) => m.assetId === assetId);

  const handlePlaceOrder = () => {
    if (!isConnected || !smartAccount?.address) return;

    const calculatedSize = formState.amount ? parseFloat(formState.amount) : 0;
    const tpsl = formState.tpslEnabled
      ? {
          takeProfit: formState.takeProfit,
          stopLoss: formState.stopLoss,
        }
      : {};

    if (activeTab === "market" && tradeDetails.entryPrice) {
      placeMarketOrder(
        parseInt(assetId, 10),
        formState.isLong,
        tradeDetails.entryPrice,
        100, // 1% slippage
        calculatedMargin,
        calculatedSize,
        tpsl.takeProfit,
        tpsl.stopLoss
      );
    } else if (activeTab === "limit" && formState.limitPrice) {
      placeLimitOrder(
        parseInt(assetId, 10),
        formState.isLong,
        parseFloat(formState.limitPrice),
        100, // 1% slippage
        calculatedMargin,
        calculatedSize,
        tpsl.takeProfit,
        tpsl.stopLoss
      );
    }
  };

  return (
    <Card className="w-[350px]">
      <CardContent className="p-4">
        {error && (
          <div className="mb-4 text-red-500">Error: {error.message}</div>
        )}

        <div className="mb-4">
          <LeverageDialog
            leverage={leverage}
            onLeverageChange={onLeverageChange}
          />
        </div>

        <Tabs defaultValue="market" onValueChange={setActiveTab}>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              variant={formState.isLong ? "default" : "outline"}
              className={`w-full ${
                formState.isLong ? "bg-green-600 hover:bg-green-700" : ""
              }`}
              onClick={() => formState.isLong || toggleDirection()}
            >
              Long
            </Button>
            <Button
              variant={!formState.isLong ? "default" : "outline"}
              className={`w-full ${
                !formState.isLong ? "bg-red-600 hover:bg-red-700" : ""
              }`}
              onClick={() => !formState.isLong || toggleDirection()}
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

          <TabsContent value="market">
            <MarketOrderForm
              formState={formState}
              calculatedMargin={calculatedMargin}
              handleAmountChange={handleAmountChange}
              handleSliderChange={handleSliderChange}
              toggleTPSL={toggleTPSL}
              handleTakeProfitChange={handleTakeProfitChange}
              handleStopLossChange={handleStopLossChange}
            />
          </TabsContent>

          <TabsContent value="limit">
            <LimitOrderForm
              formState={formState}
              calculatedMargin={calculatedMargin}
              handleAmountChange={handleAmountChange}
              handleLimitPriceChange={handleLimitPriceChange}
              handleSliderChange={handleSliderChange}
              toggleTPSL={toggleTPSL}
              handleTakeProfitChange={handleTakeProfitChange}
              handleStopLossChange={handleStopLossChange}
            />
          </TabsContent>

          <TradeDetails details={tradeDetails} pair={market?.pair} />

          <Button
            variant="market"
            className="w-full mt-4"
            disabled={
              !isConnected ||
              !smartAccount?.address ||
              placingOrders ||
              (activeTab === "market" && !tradeDetails.entryPrice) ||
              (activeTab === "limit" && !formState.limitPrice)
            }
            onClick={handlePlaceOrder}
          >
            {!isConnected
              ? "Connect Wallet to Trade"
              : !smartAccount?.address
              ? "Smart Account Not Ready"
              : activeTab === "market" && !tradeDetails.entryPrice
              ? "Waiting for price..."
              : activeTab === "limit" && !formState.limitPrice
              ? "Enter Limit Price"
              : placingOrders
              ? "Placing Order..."
              : `Place ${activeTab === "market" ? "Market" : "Limit"} ${
                  formState.isLong ? "Long" : "Short"
                }`}
          </Button>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default OrderCard;
