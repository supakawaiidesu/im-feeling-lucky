import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

interface PairSelectorProps {
  selectedPair: string
  onPairChange: (value: string) => void
}

export function PairSelector({ selectedPair, onPairChange }: PairSelectorProps) {
  return (
    <div className="mb-4">
      <Select value={selectedPair} onValueChange={onPairChange}>
        <SelectTrigger>
          <SelectValue>{selectedPair}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ETH-PERP">ETH-PERP</SelectItem>
          <SelectItem value="BTC-PERP">BTC-PERP</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
