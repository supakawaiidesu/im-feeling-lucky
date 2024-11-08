import { useState } from "react"
import { useAccount } from "wagmi"
import { Header } from "../components/shared/Header"
import { PairSelector } from "../components/features/trading/PairSelector"
import { OrderCard } from "../components/features/trading/OrderCard"
import { Chart } from "../components/features/trading/Chart"
import { PositionsTable } from "../components/features/trading/PositionsTable"
import { PairHeader } from "../components/features/trading/PairHeader"

export default function TradingInterface() {
  const [selectedPair, setSelectedPair] = useState("ETH/USD")
  const [leverage, setLeverage] = useState("20")
  const [timeframe, setTimeframe] = useState("1h")
  const { address } = useAccount()

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground">
      <Header />

      <div className="flex flex-1">
        {/* Trading Panel */}
        <div className="p-4 border-r w-80">
          <PairSelector 
            selectedPair={selectedPair} 
            onPairChange={setSelectedPair} 
          />
          <OrderCard 
            leverage={leverage} 
            onLeverageChange={setLeverage} 
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
