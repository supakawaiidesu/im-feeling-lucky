import React from "react";
import { Input } from "../../../../ui/input";
import { Button } from "../../../../ui/button";
import { OrderFormState } from "../types";

interface MarketOrderFormProps {
  formState: OrderFormState;
  calculatedMargin: number;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMarginChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  leverage: string;
  onLeverageChange: (value: string) => void;
  accountBalance: string;
  tradingBalance: string;
  handleMaxClick: () => void;
}

export function MarketOrderForm({
  formState,
  calculatedMargin,
  handleAmountChange,
  handleMarginChange,
  leverage,
  onLeverageChange,
  accountBalance,
  tradingBalance,
  handleMaxClick,
}: MarketOrderFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="relative">
          <Input
            type="number"
            placeholder="0.00"
            value={calculatedMargin ? calculatedMargin.toFixed(2) : ''}
            onChange={handleMarginChange}
            className="pr-16 text-right"
            label="Bet Amount"
            suppressHydrationWarning
          />
          <button
            onClick={handleMaxClick}
            className="absolute px-2 py-1 text-xs font-medium -translate-y-1/2 right-2 top-1/2 text-primary hover:text-primary/80"
            type="button"
          >
            Max
          </button>
        </div>
        <div className="flex flex-col px-1 pt-1 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Account Balance:</span>
            <span>{accountBalance} USDC</span>
          </div>
          <div className="flex justify-between">
            <span>Trading Balance:</span>
            <span>{tradingBalance} USDC</span>
          </div>
        </div>
      </div>

      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Leverage:</span>
          <span className="text-sm">{leverage}x</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLeverageChange("25")}
            className="w-full text-xs"
          >
            25x
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLeverageChange("50")}
            className="w-full text-xs"
          >
            50x
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLeverageChange("100")}
            className="w-full text-xs"
          >
            100x
          </Button>
        </div>
      </div>
    </div>
  );
}
