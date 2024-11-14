import React from "react";
import { TradeDetails as TradeDetailsType } from "../types";

interface TradeDetailsProps {
  details: TradeDetailsType;
  pair?: string;
}

export function TradeDetails({ details, pair }: TradeDetailsProps) {
  const { entryPrice, notionalSize, liquidationPrice, fees } = details;

  // Convert trading fee to correct display value (fees are already in percentage form)
  const displayTradingFee = (fees.tradingFee / 100).toFixed(2);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
      <div className="flex justify-between">
        <span>Entry Price</span>
        <span>${entryPrice ? formatNumber(parseFloat(entryPrice.toFixed(2))) : "0.00"}</span>
      </div>
      <div className="flex justify-between">
        <span>Notional Size</span>
        <span>
          {formatNumber(parseFloat(notionalSize.toFixed(4)))} {pair?.split("/")[0]}
        </span>
      </div>
      <div className="flex justify-between">
        <span>Liquidation Price</span>
        <span className="text-red-500">
          ${liquidationPrice ? formatNumber(parseFloat(liquidationPrice.toFixed(2))) : "0.00"}
        </span>
      </div>
      <div className="flex justify-between">
        <span>Trading Fee </span>
        <span>
          ${formatNumber(parseFloat(displayTradingFee))} ({fees.tradingFeePercent}%)
        </span>
      </div>
      <div className="flex justify-between">
        <span>Hourly Interest</span>
        <span
          className={
            fees.hourlyInterest >= 0 ? "text-red-400" : "text-green-400"
          }
        >
          {fees.hourlyInterest >= 0 ? "-" : "+"}$
          {formatNumber(Math.abs(parseFloat(fees.hourlyInterest.toFixed(2))))} (
          {Math.abs(fees.hourlyInterestPercent).toFixed(4)}%)
        </span>
      </div>
    </div>
  );
}
