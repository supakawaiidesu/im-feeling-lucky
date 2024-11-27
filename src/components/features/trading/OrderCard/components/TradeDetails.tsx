import React from "react";
import { TradeDetailsProps } from "../types";

export function TradeDetails({ details }: TradeDetailsProps) {
  const { liquidationPrice } = details;

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
      <div className="flex justify-between">
        <span>Liquidation Price</span>
        <span className="text-red-500">
          ${liquidationPrice ? formatNumber(parseFloat(liquidationPrice.toFixed(6))) : "0.00"}
        </span>
      </div>
    </div>
  );
}