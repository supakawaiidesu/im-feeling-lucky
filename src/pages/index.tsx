import { useState } from "react"
import { Header } from "../components/shared/Header"
import { PairSelector } from "../components/features/trading/PairSelector"
import { OrderCard } from "../components/features/trading/OrderCard"
import { ChartControls } from "../components/features/trading/ChartControls"
import { Chart } from "../components/features/trading/Chart"
import { PositionsTable } from "../components/features/trading/PositionsTable"

const mockPositions = [
  { market: 'ETH-PERP', size: '0.5', entryPrice: '2930.50', markPrice: '2938.90', pnl: '+$4.20' },
  { market: 'BTC-PERP', size: '0.1', entryPrice: '35000.00', markPrice: '35100.00', pnl: '+$10.00' },
]

export default function TradingInterface() {
  const [selectedPair, setSelectedPair] = useState("ETH-PERP")
  const [leverage, setLeverage] = useState("20")
  const [timeframe, setTimeframe] = useState("1h")

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
          <ChartControls 
            timeframe={timeframe} 
            onTimeframeChange={setTimeframe} 
          />
          <Chart />
          <PositionsTable positions={mockPositions} />
        </div>
      </div>
    </div>
  )
}
