import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onDeposit: () => void
  onWithdraw: () => void
  isLoading: boolean
  isApproving?: boolean
  needsApproval?: boolean
  depositDisabled: boolean
  withdrawDisabled: boolean
  type: 'smart-account' | 'trading'
  depositText?: string
  withdrawText?: string
}

export function ActionButtons({
  onDeposit,
  onWithdraw,
  isLoading,
  isApproving,
  needsApproval,
  depositDisabled,
  withdrawDisabled,
  type,
  depositText,
  withdrawText
}: ActionButtonsProps) {
  const getDepositText = () => {
    if (isLoading || isApproving) return 'Processing...'
    if (depositText) return depositText
    if (needsApproval) return 'Approve USDC'
    return type === 'smart-account' ? 'Deposit to 1CT Wallet' : 'Deposit to Trading'
  }

  const getWithdrawText = () => {
    if (isLoading) return 'Processing...'
    if (withdrawText) return withdrawText
    return 'Withdraw'
  }

  return (
    <div className="flex space-x-2">
      <Button
        className="flex-1"
        onClick={onDeposit}
        disabled={depositDisabled || isLoading || isApproving}
      >
        {getDepositText()}
      </Button>
      <Button
        className="flex-1"
        onClick={onWithdraw}
        disabled={withdrawDisabled || isLoading}
      >
        {getWithdrawText()}
      </Button>
    </div>
  )
}
