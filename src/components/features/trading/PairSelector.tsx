import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { useMarketData } from "@/hooks/use-market-data"

interface PairSelectorProps {
  selectedPair: string
  onPairChange: (value: string) => void
}

export function PairSelector({ selectedPair, onPairChange }: PairSelectorProps) {
  const { allMarkets, loading } = useMarketData()

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(num)
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(parseFloat(price))
  }

  const formatFundingRate = (rate: number) => {
    return `${(rate * 100).toFixed(4)}%`
  }

  if (loading) {
    return (
      <div className="mb-4">
        <Select value={selectedPair} onValueChange={onPairChange}>
          <SelectTrigger>
            <SelectValue>Loading...</SelectValue>
          </SelectTrigger>
        </Select>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <Select value={selectedPair} onValueChange={onPairChange}>
        <SelectTrigger>
          <SelectValue>{selectedPair}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allMarkets.map((market) => (
            <SelectItem key={market.pair} value={market.pair}>
              <div className="flex flex-col gap-1">
                <div className="font-medium">{market.pair}</div>
                <div className="text-sm text-muted-foreground">
                  <div>Price: ${formatPrice(market.price)}</div>
                  <div>
                    Liquidity - Long: ${formatNumber(market.availableLiquidity.long)} | 
                    Short: ${formatNumber(market.availableLiquidity.short)}
                  </div>
                  <div>Funding Rate: {formatFundingRate(market.fundingRate)}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
