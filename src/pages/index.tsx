import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart2, Settings2, Maximize2 } from "lucide-react"
import { useState } from "react"

const mockPositions = [
  { market: 'ETH-PERP', size: '0.5', entryPrice: '2930.50', markPrice: '2938.90', pnl: '+$4.20' },
  { market: 'BTC-PERP', size: '0.1', entryPrice: '35000.00', markPrice: '35100.00', pnl: '+$10.00' },
]

export default function TradingInterface() {
  const { isConnected } = useAccount()
  const [amount, setAmount] = useState("")
  const [leverage, setLeverage] = useState("20")
  const [selectedPair, setSelectedPair] = useState("ETH-PERP")

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <header className="flex items-center px-4 border-b h-14">
        <div className="flex items-center space-x-4">
          <span className="font-bold">UniDex</span>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost">Portfolio</Button>
            <Button variant="ghost">Markets</Button>
            <Button variant="ghost">Trade</Button>
          </nav>
        </div>
        <div className="ml-auto">
          <ConnectButton showBalance={false} />
        </div>
      </header>

      {/* Main Trading Interface */}
      <div className="flex flex-1">
        {/* Trading Panel */}
        <div className="p-4 border-r w-80">
          <div className="mb-4">
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger>
                <SelectValue>{selectedPair}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH-PERP">ETH-PERP</SelectItem>
                <SelectItem value="BTC-PERP">BTC-PERP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Leverage</span>
                <Select value={leverage} onValueChange={setLeverage}>
                  <SelectTrigger className="w-20">
                    <SelectValue>{leverage}x</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                    <SelectItem value="5">5x</SelectItem>
                    <SelectItem value="10">10x</SelectItem>
                    <SelectItem value="20">20x</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="market">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="market" className="flex-1">Market</TabsTrigger>
                  <TabsTrigger value="limit" className="flex-1">Limit</TabsTrigger>
                  <TabsTrigger value="stop" className="flex-1">Stop</TabsTrigger>
                </TabsList>

                <TabsContent value="market" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="default" className="w-full bg-green-600 hover:bg-green-700">Long</Button>
                    <Button variant="default" className="w-full bg-red-600 hover:bg-red-700">Short</Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm">Amount</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Available: 0.00</span>
                      <span>≈ $0.00</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    disabled={!isConnected}
                  >
                    {isConnected ? "Place Market Order" : "Connect Wallet to Trade"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Positions */}
        <div className="flex flex-col flex-1">
          {/* Chart Controls */}
          <div className="flex items-center justify-between p-4">
            <Select defaultValue="1h">
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5m">5m</SelectItem>
                <SelectItem value="15m">15m</SelectItem>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="4h">4h</SelectItem>
                <SelectItem value="1d">1d</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <BarChart2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Chart Placeholder */}
          <Card className="flex items-center justify-center flex-1 mx-4 mb-4">
            <span className="text-muted-foreground">Chart View</span>
          </Card>

          {/* Positions Table */}
          <div className="mx-4 mb-4 border rounded-lg">
            <div className="flex items-center p-2 border-b">
              <Button variant="ghost" size="sm">
                Positions
              </Button>
              <Button variant="ghost" size="sm">
                Orders
              </Button>
              <Button variant="ghost" size="sm">
                Trades
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Market</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Entry Price</TableHead>
                  <TableHead>Mark Price</TableHead>
                  <TableHead>Unrealized PNL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPositions.map((position, index) => (
                  <TableRow key={index}>
                    <TableCell>{position.market}</TableCell>
                    <TableCell>{position.size}</TableCell>
                    <TableCell>{position.entryPrice}</TableCell>
                    <TableCell>{position.markPrice}</TableCell>
                    <TableCell className="text-green-500">{position.pnl}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}