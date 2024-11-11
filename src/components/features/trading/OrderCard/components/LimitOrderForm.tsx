import React from 'react';
import { Input } from '../../../../ui/input';
import { Slider } from '../../../../ui/slider';
import { OrderFormState } from '../types';

interface LimitOrderFormProps {
  formState: OrderFormState;
  calculatedMargin: number;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLimitPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSliderChange: (value: number[]) => void;
  toggleTPSL: () => void;
  handleTakeProfitChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStopLossChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LimitOrderForm({
  formState,
  calculatedMargin,
  handleAmountChange,
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

        {/* TP/SL Section */}
        <div className="pt-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formState.tpslEnabled}
              onChange={toggleTPSL}
              className="w-4 h-4"
            />
            <span className="text-sm">TP/SL?</span>
          </label>

          {formState.tpslEnabled && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formState.takeProfit}
                  onChange={handleTakeProfitChange}
                  className="text-right pr-7"
                  label="TP"
                />
                <div className="absolute text-sm -translate-y-1/2 right-3 top-1/2 text-muted-foreground">
                  USD
                </div>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formState.stopLoss}
                  onChange={handleStopLossChange}
                  className="text-right pr-7"
                  label="SL"
                />
                <div className="absolute text-sm -translate-y-1/2 right-3 top-1/2 text-muted-foreground">
                  USD
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
