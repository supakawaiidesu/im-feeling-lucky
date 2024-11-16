import React from "react";
import { Label } from "../../../ui/label";
import { AmountInput } from "./AmountInput";
import { NetworkSelector } from "./NetworkSelector";
import { ActionButtons } from "./ActionButtons";
import { CrossChainDepositCall } from "./CrossChainDepositCall";
import { DepositFormProps } from "./types";

interface ExtendedDepositFormProps extends DepositFormProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  needsApproval?: boolean;
  isApproving?: boolean;
  chain?: number;
}

export function DepositForm({
  type,
  amount,
  onAmountChange,
  onMaxClick,
  isLoading,
  disabled,
  balances,
  selectedNetwork,
  onNetworkChange,
  onDeposit,
  onWithdraw,
  needsApproval,
  isApproving,
  chain,
}: ExtendedDepositFormProps) {
  const showNetworkSelector = type === "smart-account" && onNetworkChange;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Amount (USDC)</Label>
        <div className="flex gap-2">
          {showNetworkSelector && selectedNetwork && (
            <NetworkSelector
              selectedNetwork={selectedNetwork}
              onNetworkChange={onNetworkChange}
            />
          )}
          <div className={showNetworkSelector ? "flex-1" : "w-full"}>
            <AmountInput
              amount={amount}
              onAmountChange={onAmountChange}
              onMaxClick={onMaxClick}
              disabled={disabled}
              isLoading={isLoading}
              label="" // Empty label since we have it above
            />
          </div>
        </div>
      </div>

      {type === "smart-account" &&
      selectedNetwork === "optimism" &&
      onNetworkChange ? (
        <CrossChainDepositCall
          amount={amount}
          onSuccess={() => {
            onAmountChange("");
          }}
          chain={chain}
        />
      ) : (
        <ActionButtons
          type={type}
          onDeposit={onDeposit}
          onWithdraw={onWithdraw}
          isLoading={isLoading}
          isApproving={isApproving}
          needsApproval={needsApproval}
          depositDisabled={
            !amount ||
            !balances ||
            (type === "smart-account"
              ? parseFloat(amount) > parseFloat(balances.formattedEoaUsdcBalance)
              : parseFloat(amount) > parseFloat(balances.formattedUsdcBalance))
          }
          withdrawDisabled={
            !amount ||
            !balances ||
            (type === "smart-account"
              ? parseFloat(amount) > parseFloat(balances.formattedUsdcBalance)
              : parseFloat(amount) > parseFloat(balances.formattedMusdBalance))
          }
        />
      )}
    </div>
  );
}
