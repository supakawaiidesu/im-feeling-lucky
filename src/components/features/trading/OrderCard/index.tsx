import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { useMarketOrderActions } from "../../../../hooks/use-market-order-actions";
import { useSmartAccount } from "../../../../hooks/use-smart-account";
import { useMarketData } from "../../../../hooks/use-market-data";
import { usePrices } from "../../../../lib/websocket-price-context";
import { LeverageDialog } from "../LeverageDialog";
import { MarketOrderForm } from "./components/MarketOrderForm";
import { LimitOrderForm } from "./components/LimitOrderForm";
import { TradeDetails } from "./components/TradeDetails";
import { WalletBox } from "../WalletEquity";
import { useOrderForm } from "./hooks/useOrderForm";
import { useTradeCalculations } from "./hooks/useTradeCalculations";
import { OrderCardProps } from "./types";
import { useBalances } from "../../../../hooks/use-balances";

export function OrderCard({
  leverage,
  onLeverageChange,
  assetId,
}: OrderCardProps) {
  const { isConnected } = useAccount();
  const { smartAccount, setupSessionKey, error, isNetworkSwitching } =
    useSmartAccount();
  const [activeTab, setActiveTab] = useState("market");
  const { placeMarketOrder, placeLimitOrder, placingOrders } =
    useMarketOrderActions();
  const { allMarkets } = useMarketData();
  const { prices } = usePrices();
  const { balances } = useBalances("arbitrum");

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
    setFormState,
  } = useOrderForm({ leverage });

  const calculatedMargin = formState.amount
    ? parseFloat(formState.amount) / parseFloat(leverage)
    : 0;

  const marginWalletBalance = parseFloat(balances?.formattedMusdBalance || "0");
  const hasInsufficientBalance = calculatedMargin > marginWalletBalance;

  const tradeDetails = useTradeCalculations({
    amount: formState.amount,
    leverage,
    isLong: formState.isLong,
    activeTab,
    limitPrice: formState.limitPrice,
    assetId,
  });

  const market = allMarkets.find((m) => m.assetId === assetId);

  useEffect(() => {
    const pair = market?.pair;
    const basePair = pair?.split("/")[0].toLowerCase();
    const currentPrice = basePair ? prices[basePair]?.price : undefined;

    if (currentPrice) {
      setFormState((prev: any) => ({
        ...prev,
        entryPrice:
          activeTab === "market"
            ? currentPrice
            : activeTab === "limit" && formState.limitPrice
            ? Number(formState.limitPrice)
            : currentPrice,
      }));
    }
  }, [
    prices,
    assetId,
    allMarkets,
    activeTab,
    formState.limitPrice,
    setFormState,
  ]);

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
        100,
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
        100,
        calculatedMargin,
        calculatedSize,
        tpsl.takeProfit,
        tpsl.stopLoss
      );
    }
  };

  const getButtonText = () => {
    if (isNetworkSwitching) return "Switching to Arbitrum...";
    if (!smartAccount?.address) return "Establish Connection";
    if (activeTab === "market" && !tradeDetails.entryPrice)
      return "Waiting for price...";
    if (activeTab === "limit" && !formState.limitPrice)
      return "Enter Limit Price";
    if (placingOrders) return "Placing Order...";
    if (hasInsufficientBalance) return "Insufficient Margin Balance";

    // Add liquidity check
    const orderSize = parseFloat(formState.amount) || 0;
    const availableLiquidity = formState.isLong
      ? market?.availableLiquidity?.long
      : market?.availableLiquidity?.short;

    if (availableLiquidity !== undefined && orderSize > availableLiquidity) {
      return "Not Enough Liquidity";
    }

    return `Place ${activeTab === "market" ? "Market" : "Limit"} ${
      formState.isLong ? "Long" : "Short"
    }`;
  };

  const handleButtonClick = () => {
    if (!smartAccount?.address && isConnected) {
      setupSessionKey();
    } else {
      handlePlaceOrder();
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
              handleTakeProfitChange={(value) => handleTakeProfitChange(value)}
              handleStopLossChange={(value) => handleStopLossChange(value)}
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
              handleTakeProfitChange={(value) => handleTakeProfitChange(value)}
              handleStopLossChange={(value) => handleStopLossChange(value)}
            />
          </TabsContent>

          <TradeDetails details={tradeDetails} pair={market?.pair} />

          {!isConnected ? (
            <div className="w-full mt-4">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button
                    variant="market"
                    className="w-full"
                    onClick={openConnectModal}
                  >
                    Connect Wallet
                  </Button>
                )}
              </ConnectButton.Custom>
            </div>
          ) : (
            <Button
              variant="market"
              className="w-full mt-4"
              disabled={
                placingOrders ||
                isNetworkSwitching ||
                (activeTab === "market" && !tradeDetails.entryPrice) ||
                (activeTab === "limit" && !formState.limitPrice) ||
                hasInsufficientBalance ||
                (() => {
                  const orderSize = parseFloat(formState.amount) || 0;
                  const availableLiquidity = formState.isLong
                    ? market?.availableLiquidity?.long
                    : market?.availableLiquidity?.short;
                  return (
                    availableLiquidity !== undefined &&
                    orderSize > availableLiquidity
                  );
                })()
              }
              onClick={handleButtonClick}
            >
              {getButtonText()}
            </Button>
          )}

          {/* Add divider and WalletBox */}
          <div className="h-px my-4 bg-border" />
          <div className="mt-4">
            <WalletBox />
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default OrderCard;
