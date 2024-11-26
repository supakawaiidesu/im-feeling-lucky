import React from "react";
import { TradeDetails as TradeDetailsType, RouteId, TradeDetailsProps } from "../types";

export function TradeDetails({ 
  details, 
  pair, 
  tradingFee, 
  totalRequired, 
  referrerSection,
  routingInfo 
}: TradeDetailsProps) {
  const { entryPrice, notionalSize, liquidationPrice, fees } = details;

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
      <div className="flex justify-between">
        <span>Entry Price</span>
        <span>${entryPrice ? formatNumber(parseFloat(entryPrice.toFixed(6))) : "0.00"}</span>
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
          ${liquidationPrice ? formatNumber(parseFloat(liquidationPrice.toFixed(6))) : "0.00"}
        </span>
      </div>
      
      <div className="flex justify-between">
        <span>Trading Fee</span>
        <span>{tradingFee.toFixed(2)} USDC ({fees.tradingFeePercent}%)</span>
      </div>
      
      <div className="flex justify-between">
        <span>Hourly Interest</span>
        <span className={fees.hourlyInterest >= 0 ? "text-red-400" : "text-green-400"}>
          {fees.hourlyInterest >= 0 ? "-" : "+"}$
          {formatNumber(Math.abs(parseFloat(fees.hourlyInterest.toFixed(2))))} (
          {Math.abs(fees.hourlyInterestPercent).toFixed(4)}%)
        </span>
      </div>
      
      <div className="flex justify-between">
        <span>Total Required</span>
        <span>{totalRequired.toFixed(2)} USDC</span>
      </div>
      
      {referrerSection}
      
      <div className="pt-2 border-t border-border">
        <div className="flex justify-between">
          <span>Route</span>
          <span className="text-primary">
            {routingInfo.routeNames[routingInfo.selectedRoute]}
          </span>
        </div>
        {Object.entries(routingInfo.routes).map(([routeId, data]) => (
          <div key={routeId} className="flex justify-between text-xs">
            <span>{routingInfo.routeNames[routeId as RouteId]}</span>
            <span>
              {data.available 
                ? `${(data.tradingFee * 100).toFixed(3)}%` 
                : data.reason || 'Unavailable'
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}