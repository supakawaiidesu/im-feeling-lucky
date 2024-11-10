import { useState } from "react"
import { useAccount } from "wagmi"
import { Header } from "../components/shared/Header"
import { PairSelector } from "../components/features/trading/PairSelector"
import { OrderCard } from "../components/features/trading/OrderCard"
import { Chart } from "../components/features/trading/Chart"
import { PositionsTable } from "../components/features/trading/PositionsTable"
import { PairHeader } from "../components/features/trading/PairHeader"
import { useMarketData } from "../hooks/use-market-data"

export default function TradingInterface() {
  const [selectedPair, setSelectedPair] = useState("ETH/USD")
  const [leverage, setLeverage] = useState("20")
  const { address } = useAccount()
  const { allMarkets } = useMarketData()

  // Find the assetId for the selected pair
  const selectedMarket = allMarkets.find(market => market.pair === selectedPair)
  const assetId = selectedMarket ? selectedMarket.assetId : ""

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground">
      <Header />

      <div className="flex flex-1">
        {/* Trading Panel */}
        <div className="p-4 w-80">
          <PairSelector 
            selectedPair={selectedPair} 
            onPairChange={setSelectedPair} 
          />
          <OrderCard 
            leverage={leverage} 
            onLeverageChange={setLeverage} 
            assetId={assetId} // Pass the assetId to OrderCard
          />
        </div>

        {/* Chart and Positions */}
        <div className="flex flex-col flex-1">
          <PairHeader selectedPair={selectedPair} />
          <Chart />
          <PositionsTable address={address} />
        </div>
      </div>
    </div>
  )
}
