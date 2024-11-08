import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { useMarketData } from "@/hooks/use-market-data"
import { cn } from "@/lib/utils"

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
    return `${rate.toFixed(4)}%`
  }

  if (loading) {
    return (
      <div className="mb-4">
        <Select value={selectedPair} onValueChange={onPairChange}>
          <SelectTrigger className="w-[300px]">
            <SelectValue>Loading...</SelectValue>
          </SelectTrigger>
        </Select>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <Select value={selectedPair} onValueChange={onPairChange}>
        <SelectTrigger className="w-[290px]">
          <SelectValue>{selectedPair}</SelectValue>
        </SelectTrigger>
        <SelectContent className="w-[800px]">
          {allMarkets.map((market) => (
            <SelectItem 
              key={market.pair} 
              value={market.pair}
              className="py-1.5 hover:bg-muted/60 cursor-pointer"
            >
              <div className="flex items-center text-sm">
                <div className="flex items-center min-w-[150px]">
                  <span>{market.pair}</span>
                  <span className="ml-2">{formatPrice(market.price)}</span>
                </div>
                <div className="text-muted-foreground">
                  Long: ${formatNumber(market.availableLiquidity.long)} Short: ${formatNumber(market.availableLiquidity.short)} Funding: <span className={cn(
                    market.fundingRate > 0 ? "text-[#22c55e]" : 
                    market.fundingRate < 0 ? "text-[#ef4444]" : 
                    "text-foreground"
                  )}>
                    {formatFundingRate(market.fundingRate)}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
