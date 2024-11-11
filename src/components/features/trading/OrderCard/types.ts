export interface OrderCardProps {
  leverage: string;
  onLeverageChange: (value: string) => void;
  assetId: string;
}

export interface TradeDetails {
  entryPrice: number | undefined;
  notionalSize: number;
  liquidationPrice: number | null;
  fees: {
    tradingFee: number;
    hourlyInterest: number;
    tradingFeePercent: number;
    hourlyInterestPercent: number;
  };
}

export interface OrderFormState {
  amount: string;
  limitPrice: string;
  sliderValue: number[];
  isLong: boolean;
  tpslEnabled: boolean;
  takeProfit: string;
  stopLoss: string;
  entryPrice?: number; // Add this
}
