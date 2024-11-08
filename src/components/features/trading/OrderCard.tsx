import { useAccount } from 'wagmi'
import { Button } from "../../ui/button"
import { Card, CardContent } from "../../ui/card"
import { Input } from "../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { useState } from "react"

interface OrderCardProps {
  leverage: string
  onLeverageChange: (value: string) => void
}

export function OrderCard({ leverage, onLeverageChange }: OrderCardProps) {
  const { isConnected } = useAccount()
  const [amount, setAmount] = useState("")

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">Leverage</span>
          <Select value={leverage} onValueChange={onLeverageChange}>
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
  )
}
