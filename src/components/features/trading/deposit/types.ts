import { Balances } from "@/hooks/use-balances";

export type NetworkType = "arbitrum" | "optimism";

export interface TransactionHandlerProps {
  smartAccount: any;
  kernelClient: any;
  toast: any;
  refetchBalances: () => void;
}

export interface NetworkSelectorProps {
  selectedNetwork: NetworkType;
  onNetworkChange: (network: NetworkType) => void;
}

export interface DepositFormProps {
  type: "smart-account" | "trading";
  amount: string;
  onAmountChange: (value: string) => void;
  onMaxClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  balances: Balances | null;
  selectedNetwork?: NetworkType;
  onNetworkChange?: (network: NetworkType) => void;
}
