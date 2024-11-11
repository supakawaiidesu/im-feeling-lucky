import React from 'react';
import { Input } from '@/components/ui/input';

interface TPSLInputProps {
  enabled: boolean;
  takeProfit: string | number;
  stopLoss: string | number;
  entryPrice: number;
  onTakeProfitChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStopLossChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleTPSL: () => void;
}

const TPSLInputSection = ({
  enabled,
  takeProfit,
  stopLoss,
  entryPrice,
  onTakeProfitChange,
  onStopLossChange,
  toggleTPSL
}: TPSLInputProps) => {
  // Calculate percentage gain/loss
  const calculatePercentage = (price: number) => {
    if (!entryPrice || !price) return 0;
    return ((price - entryPrice) / entryPrice) * 100;
  };

  return (
    <div className="pt-4">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={toggleTPSL}
          className="w-4 h-4"
        />
        <span className="text-sm">TP/SL?</span>
      </label>

      {enabled && (
        <div className="mt-2 space-y-2">
          {/* Take Profit Row */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="0.00"
                value={takeProfit}
                onChange={onTakeProfitChange}
                className="text-right pr-7"
                label="TP"
              />
              <div className="absolute text-sm -translate-y-1/2 right-3 top-1/2 text-muted-foreground">
                USD
              </div>
            </div>
            <div className="relative w-24">
              <Input
                type="text"
                value={`${calculatePercentage(Number(takeProfit)).toFixed(2)}%`}
                readOnly
                className="pr-2 text-right"
                label=""
              />
            </div>
          </div>

          {/* Stop Loss Row */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="0.00"
                value={stopLoss}
                onChange={onStopLossChange}
                className="text-right pr-7"
                label="SL"
              />
              <div className="absolute text-sm -translate-y-1/2 right-3 top-1/2 text-muted-foreground">
                USD
              </div>
            </div>
            <div className="relative w-24">
              <Input
                type="text"
                value={`${calculatePercentage(Number(stopLoss)).toFixed(2)}%`}
                readOnly
                className="pr-2 text-right"
                label=""
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TPSLInputSection;