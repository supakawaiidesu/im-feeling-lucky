import React from "react";
import { Input } from "../../../../ui/input";
import { Button } from "../../../../ui/button";
import { OrderFormState } from "../types";
import TPSLInputSection from "./TPSLInputSection";

interface MarketOrderFormProps {
  formState: OrderFormState;
  calculatedMargin: number;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSliderChange: (value: number[]) => void;
  toggleTPSL: () => void;
  handleTakeProfitChange: (value: string) => void; // Updated
  handleStopLossChange: (value: string) => void; // Updated
  handleMarginChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MarketOrderForm({
  formState,
  calculatedMargin,
  handleAmountChange,
  handleMarginChange,
  handleSliderChange,
  toggleTPSL,
  handleTakeProfitChange,
  handleStopLossChange,
}: MarketOrderFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="relative">
          <Input
            type="number"
            placeholder="0.00"
            value={formState.amount}
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
            value={calculatedMargin.toFixed(2)}
            onChange={handleMarginChange}
            className="text-right pr-7"
            label="Margin"
          />
          <div className="absolute text-sm -translate-y-1/2 right-3 top-1/2 text-muted-foreground">
            USD
          </div>
        </div>

        {/* Replace slider with percentage buttons */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSliderChange([25])}
            className="w-full text-xs"
          >
            25%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSliderChange([50])}
            className="w-full text-xs"
          >
            50%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSliderChange([75])}
            className="w-full text-xs"
          >
            75%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSliderChange([100])}
            className="w-full text-xs"
          >
            100%
          </Button>
        </div>

        {/* New TP/SL Section using the TPSLInputSection component */}
        <TPSLInputSection
          enabled={formState.tpslEnabled}
          takeProfit={formState.takeProfit}
          stopLoss={formState.stopLoss}
          entryPrice={formState.entryPrice || 0}
          isLong={formState.isLong} // Add this line
          onTakeProfitChange={handleTakeProfitChange}
          onStopLossChange={handleStopLossChange}
          toggleTPSL={toggleTPSL}
        />
      </div>
    </div>
  );
}
