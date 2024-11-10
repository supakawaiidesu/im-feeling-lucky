import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface AmountInputProps {
  amount: string
  onAmountChange: (value: string) => void
  onMaxClick: () => void
  disabled?: boolean
  isLoading?: boolean
  label?: string
}

export function AmountInput({
  amount,
  onAmountChange,
  onMaxClick,
  disabled = false,
  isLoading = false,
  label = "Amount (USDC)"
}: AmountInputProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          disabled={disabled || isLoading}
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute h-6 px-2 py-0 -translate-y-1/2 right-2 top-1/2"
          onClick={onMaxClick}
          disabled={disabled || isLoading}
        >
          MAX
        </Button>
      </div>
    </div>
  )
}
