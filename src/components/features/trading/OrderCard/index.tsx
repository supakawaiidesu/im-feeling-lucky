import React, { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "../../../ui/button";
import { Card, CardContent } from "../../../ui/card";
import { MarketOrderForm } from "./components/MarketOrderForm";
import { TradeDetails } from "./components/TradeDetails";
import { useOrderForm } from "./hooks/useOrderForm";
import { useTradeCalculations } from "./hooks/useTradeCalculations";
import { OrderCardProps, RoutingInfo } from "./types";
import { useBalances } from "../../../../hooks/use-balances";
import { useReferralContract } from "../../../../hooks/use-referral-contract";
import { useRouting, RouteId } from '../../../../hooks/use-routing';
import { toast } from "@/hooks/use-toast";
import { useMarketOrderActions } from "../../../../hooks/use-market-order-actions";
import { useSmartAccount } from "../../../../hooks/use-smart-account";
import { useMarketData } from "../../../../hooks/use-market-data";
import { usePrices } from "../../../../lib/websocket-price-context";


const DEFAULT_REFERRER = "0x0000000000000000000000000000000000000000";
const STORAGE_KEY_CODE = 'unidex-referral-code';
const STORAGE_KEY_ADDRESS = 'unidex-referral-address';

export function OrderCard({
  leverage,
  onLeverageChange,
  assetId,
  initialReferralCode,
}: OrderCardProps) {
  const { isConnected } = useAccount();
  const { smartAccount, setupSessionKey, error, isNetworkSwitching } = useSmartAccount();
  const [activeTab, setActiveTab] = useState("market");
  const { allMarkets } = useMarketData();
  const { prices } = usePrices();
  const { balances } = useBalances("arbitrum");
  const [referrerCode, setReferrerCode] = useState("");
  const { getReferralAddress } = useReferralContract();
  const [resolvedReferrer, setResolvedReferrer] = useState(DEFAULT_REFERRER);
  const [isEditingReferrer, setIsEditingReferrer] = useState(false);
  const referrerInputRef = useRef<HTMLInputElement>(null);
  const [tempReferrerCode, setTempReferrerCode] = useState("");
  const [placingOrders, setPlacingOrders] = useState(false);

  const {
    formState,
    handleAmountChange,
    handleMarginChange,
    handleLimitPriceChange,
    handleSliderChange,
    toggleDirection,
    toggleTPSL,
    handleTakeProfitChange,
    handleStopLossChange,
    setFormState,
    isValid,
  } = useOrderForm({ leverage });

  const { bestRoute, routes, executeOrder } = useRouting(
    assetId,
    formState.amount,
    leverage
  );

  const isValidRoutes = (routes: any): routes is Record<RouteId, { tradingFee: number; available: boolean; reason?: string; }> => {
    return routes !== undefined && routes !== null;
  };
  const routingInfo: RoutingInfo = {
    selectedRoute: bestRoute || 'unidexv4',
    routes: isValidRoutes(routes) ? routes : {
      unidexv4: {
        tradingFee: 0,
        available: true,
        minMargin: 1
      },
      gtrade: {
        tradingFee: 0,
        available: false,
        minMargin: 6,
        reason: "Route not available"
      }
    },
    routeNames: {
      unidexv4: 'UniDex',
      gtrade: 'gTrade'
    }
  };

  useEffect(() => {
    const initializeReferralCode = async () => {
      // First check URL parameter
      if (initialReferralCode) {
        const address = await getReferralAddress(initialReferralCode);
        if (address !== DEFAULT_REFERRER) {
          setReferrerCode(initialReferralCode);
          setTempReferrerCode(initialReferralCode);
          setResolvedReferrer(address);
          localStorage.setItem(STORAGE_KEY_CODE, initialReferralCode);
          localStorage.setItem(STORAGE_KEY_ADDRESS, address);
          return;
        }
      }

      // Fall back to stored code if no valid URL parameter
      const storedCode = localStorage.getItem(STORAGE_KEY_CODE);
      const storedAddress = localStorage.getItem(STORAGE_KEY_ADDRESS);
      
      if (storedCode) {
        setReferrerCode(storedCode);
        setTempReferrerCode(storedCode);
      }
      if (storedAddress) {
        setResolvedReferrer(storedAddress);
      }
    };

    initializeReferralCode();
  }, [initialReferralCode]);

  const calculatedMargin = formState.amount
    ? parseFloat(formState.amount) / parseFloat(leverage)
    : 0;

// Update the trading fee calculation
const calculatedSize = formState.amount ? parseFloat(formState.amount) : 0;
const tradingFee = calculatedSize * (isValidRoutes(routes) && bestRoute ? routes[bestRoute].tradingFee : 0);
const totalRequired = calculatedMargin + tradingFee;

  const marginWalletBalance = parseFloat(balances?.formattedMusdBalance || "0");
  const onectWalletBalance = parseFloat(balances?.formattedUsdcBalance || "0");
  const combinedBalance = marginWalletBalance + onectWalletBalance;
  const hasInsufficientBalance = totalRequired > combinedBalance;
  const needsDeposit = totalRequired > marginWalletBalance && totalRequired <= combinedBalance;

  
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

  const handleReferrerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempReferrerCode(e.target.value); // Only update the temporary value while typing
  };

  const handleReferrerClick = () => {
    setIsEditingReferrer(true);
    setTempReferrerCode(referrerCode); // Initialize temp code with current value
    setTimeout(() => referrerInputRef.current?.focus(), 0);
  };

  const handleReferrerBlur = async () => {
    setIsEditingReferrer(false);
    // Only validate and update when user is done editing
    if (tempReferrerCode) {
      const address = await getReferralAddress(tempReferrerCode);
      if (address === DEFAULT_REFERRER) {
        // Revert to previous valid code if it exists
        if (referrerCode) {
          setTempReferrerCode(referrerCode);
        } else {
          setTempReferrerCode("");
          setReferrerCode("");
          localStorage.removeItem(STORAGE_KEY_CODE);
          localStorage.removeItem(STORAGE_KEY_ADDRESS);
        }
      } else {
        setReferrerCode(tempReferrerCode);
        setResolvedReferrer(address);
        localStorage.setItem(STORAGE_KEY_CODE, tempReferrerCode);
        localStorage.setItem(STORAGE_KEY_ADDRESS, address);
      }
    } else {
      setReferrerCode("");
      setResolvedReferrer(DEFAULT_REFERRER);
      localStorage.removeItem(STORAGE_KEY_CODE);
      localStorage.removeItem(STORAGE_KEY_ADDRESS);
    }
  };

  const handleReferrerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Trigger blur event to validate
    }
  };

  useEffect(() => {
    if (referrerCode && resolvedReferrer === DEFAULT_REFERRER) {
      getReferralAddress(referrerCode).then(address => {
        if (address !== DEFAULT_REFERRER) {
          setResolvedReferrer(address);
          localStorage.setItem(STORAGE_KEY_ADDRESS, address);
        } else {
          // Clear invalid cached code
          setReferrerCode("");
          localStorage.removeItem(STORAGE_KEY_CODE);
          localStorage.removeItem(STORAGE_KEY_ADDRESS);
        }
      });
    }
  }, [referrerCode]);

  const shortenAddress = (address: string) => {
    if (address === DEFAULT_REFERRER) {
      return "Set Code";
    }
    // Always show the referral code if it exists
    return referrerCode || `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handlePlaceOrder = async () => {
    if (!isConnected || !smartAccount?.address) return;
  
    try {
      setPlacingOrders(true);
  
      const orderParams = {
        pair: parseInt(assetId, 10),
        isLong: formState.isLong,
        price: tradeDetails.entryPrice!,
        slippagePercent: 100,
        margin: calculatedMargin,
        size: calculatedSize,
        orderType: activeTab as "market" | "limit",
        takeProfit: formState.tpslEnabled ? formState.takeProfit : undefined,
        stopLoss: formState.tpslEnabled ? formState.stopLoss : undefined,
        referrer: resolvedReferrer
      };
  
      // The routing logic will now handle the order appropriately based on the selected route
      await executeOrder(orderParams);
  
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setPlacingOrders(false);
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
    if (hasInsufficientBalance) return "Insufficient Balance";
    
    // Add minimum margin check based on selected route
    const selectedRoute = routingInfo.routes[routingInfo.selectedRoute];
    if (calculatedMargin < selectedRoute.minMargin) {
      return `Minimum Margin: ${selectedRoute.minMargin} USD`;
    }

    const availableLiquidity = formState.isLong
      ? market?.availableLiquidity?.long
      : market?.availableLiquidity?.short;

    if (availableLiquidity !== undefined && calculatedSize > availableLiquidity) {
      return "Not Enough Liquidity";
    }

    if (needsDeposit) {
      return `Deposit & Bet ${formState.isLong ? "Up" : "Down"}`;
    }

    return `Bet ${
      formState.isLong ? "Up" : "Down"
    }`;
  };

  const handleButtonClick = () => {
    if (!smartAccount?.address && isConnected) {
      setupSessionKey();
    } else {
      handlePlaceOrder();
    }
  };

  const handleMaxClick = () => {
    // Get the trading fee percentage from the selected route
    const tradingFeePercent = isValidRoutes(routes) && bestRoute 
      ? routes[bestRoute].tradingFee 
      : 0;

    // Calculate maximum possible size considering fees
    // Formula: maxSize = availableBalance / (1/leverage + tradingFeePercent)
    const combinedBalance = marginWalletBalance + onectWalletBalance;
    const leverageNum = parseFloat(leverage);
    
    // The denominator accounts for both the margin requirement (1/leverage) and the trading fee percentage
    const maxSize = (combinedBalance / ((1/leverageNum) + tradingFeePercent)) - 0.01;
    
    handleAmountChange({
      target: { value: maxSize.toFixed(2) }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const referrerSection = (
    <div className="flex items-center justify-between">
      <span>Referrer</span>
      {isEditingReferrer ? (
        <input
          ref={referrerInputRef}
          type="text"
          value={tempReferrerCode} // Use temporary value for input
          onChange={handleReferrerChange}
          onBlur={handleReferrerBlur}
          onKeyDown={handleReferrerKeyDown} // Add keyboard handler
          placeholder="Enter code"
          className="text-right bg-transparent border-b border-dashed outline-none border-muted-foreground"
        />
      ) : (
        <span
          onClick={handleReferrerClick}
          className="cursor-pointer hover:text-primary"
        >
          {shortenAddress(resolvedReferrer)}
        </span>
      )}
    </div>
  );

  return (
    <Card className="w-full md:w-[350px]">
      <CardContent className="p-4">
        {error && (
          <div className="mb-4 text-red-500">Error: {error.message}</div>
        )}

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

        <MarketOrderForm
          formState={formState}
          calculatedMargin={calculatedMargin}
          handleAmountChange={handleAmountChange}
          handleMarginChange={handleMarginChange}
          leverage={leverage}
          onLeverageChange={onLeverageChange}
          accountBalance={balances?.formattedUsdcBalance || "0.00"}
          tradingBalance={balances?.formattedMusdBalance || "0.00"}
          handleMaxClick={handleMaxClick}
        />

        <TradeDetails 
          details={tradeDetails} 
          pair={market?.pair} 
          tradingFee={tradingFee}
          totalRequired={totalRequired}
          referrerSection={referrerSection}
          routingInfo={routingInfo}
        />

        {!isConnected ? (
          <div className="w-full mt-4">
            <ConnectButton.Custom>
              {({ openConnectModal }: { openConnectModal: () => void }) => (
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
              smartAccount?.address
                ? (placingOrders ||
                   isNetworkSwitching ||
                   !tradeDetails.entryPrice ||
                   hasInsufficientBalance ||
                   !isValid(formState.amount) ||
                   (() => {
                     const availableLiquidity = formState.isLong
                       ? market?.availableLiquidity?.long
                       : market?.availableLiquidity?.short;
                     return (
                       availableLiquidity !== undefined &&
                       calculatedSize > availableLiquidity
                     );
                   })())
                : false
            }
            onClick={handleButtonClick}
          >
            {getButtonText()}
          </Button>
        )}

      </CardContent>
    </Card>
  );
}

export default OrderCard;
