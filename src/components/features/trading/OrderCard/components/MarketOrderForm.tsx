import React from 'react';
import { Input } from '../../../../ui/input';
import { Slider } from '../../../../ui/slider';
import { OrderFormState } from '../types';
import TPSLInputSection from './TPSLInputSection';

interface MarketOrderFormProps {
  formState: OrderFormState;
  calculatedMargin: number;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSliderChange: (value: number[]) => void;
  toggleTPSL: () => void;
  handleTakeProfitChange: (value: string) => void;  // Updated
  handleStopLossChange: (value: string) => void;    // Updated
}

export function MarketOrderForm({
  formState,
  calculatedMargin,
  handleAmountChange,
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
        <Input
          type="text"
          value={`${calculatedMargin.toFixed(2)} USD`}
          readOnly
          label="Margin"
        />
        <div className="pt-2">
          <Slider
            value={formState.sliderValue}
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

        {/* New TP/SL Section using the TPSLInputSection component */}
        <TPSLInputSection
          enabled={formState.tpslEnabled}
          takeProfit={formState.takeProfit}
          stopLoss={formState.stopLoss}
          entryPrice={formState.entryPrice || 0}
          isLong={formState.isLong}  // Add this line
          onTakeProfitChange={handleTakeProfitChange}
          onStopLossChange={handleStopLossChange}
          toggleTPSL={toggleTPSL}
        />
      </div>
    </div>
  );
}