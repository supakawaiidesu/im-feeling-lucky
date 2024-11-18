import React from "react";
import { Input } from "../../../../ui/input";
import { Slider } from "../../../../ui/slider";
import { Button } from "../../../../ui/button";
import { OrderFormState } from "../types";
import TPSLInputSection from "./TPSLInputSection";

interface LimitOrderFormProps {
  formState: OrderFormState;
  calculatedMargin: number;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLimitPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSliderChange: (value: number[]) => void;
  toggleTPSL: () => void;
  handleTakeProfitChange: (value: string) => void; // Updated
  handleStopLossChange: (value: string) => void; // Updated
  handleMarginChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Add this
}

export function LimitOrderForm({
  formState,
  calculatedMargin,
  handleAmountChange,
  handleMarginChange,  // Add this
  handleLimitPriceChange,
  handleSliderChange,
  toggleTPSL,
  handleTakeProfitChange,
  handleStopLossChange,
}: LimitOrderFormProps) {
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
            value={formState.limitPrice}
            onChange={handleLimitPriceChange}
            className="text-right pr-7"
            label="Limit Price"
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
        <div className="relative">
          <Input
            type="number"
            placeholder="0"
            onChange={(e) => {
              const value = Math.floor(Number(e.target.value));
              if (!isNaN(value) && value >= 0 && value <= 100) {
                handleSliderChange([value]);
              }
            }}
            onBlur={(e) => {
              const value = Math.floor(Number(e.target.value));
              if (isNaN(value) || value < 0) e.target.value = "0";
              if (value > 100) e.target.value = "100";
            }}
            min="0"
            max="100"
            step="1"
            className="w-full pr-6 text-xs text-right h-9"
          />
          <span className="absolute text-xs -translate-y-1/2 right-2 top-1/2 text-muted-foreground pointer-events-none">
            %
          </span>
        </div>

        {/* TP/SL Section */}
        <TPSLInputSection
          enabled={formState.tpslEnabled}
          takeProfit={formState.takeProfit}
          stopLoss={formState.stopLoss}
          entryPrice={Number(formState.limitPrice) || 0}
          isLong={formState.isLong} // Add this line
          onTakeProfitChange={handleTakeProfitChange}
          onStopLossChange={handleStopLossChange}
          toggleTPSL={toggleTPSL}
        />
      </div>
    </div>
  );
}
