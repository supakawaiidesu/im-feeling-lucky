import React, { useState } from "react"
import { useAccount, useConnect, useWalletClient } from 'wagmi'
import { parseEther } from 'viem'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { usePrices } from "@/lib/websocket-price-context" // Import the usePrices hook

const API_BASE_URL = "https://unidexv4-api-production.up.railway.app/api"

const pairOptions = [
  { value: "1", label: "BTC/USD" },
  { value: "2", label: "ETH/USD" },
]

export default function OrderCard() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { data: walletClient } = useWalletClient()
  const { toast } = useToast()
  const { prices } = usePrices() // Use the prices from the context

  const [orderType, setOrderType] = useState<"long" | "short" | null>(null)
  const [pair, setPair] = useState<string>("")
  const [margin, setMargin] = useState<string>("")
  const [leverage, setLeverage] = useState<number>(1)
  const [loading, setLoading] = useState(false)

  // Get the current price for the selected pair
  const currentPrice = pair ? prices[pairOptions.find(p => p.value === pair)?.label.split('/')[0].toLowerCase()]?.price : null

  const handleConnect = async () => {
    const connector = connectors[0] // Assuming the first connector is the one you want to use
    if (connector) {
      await connect({ connector })
    } else {
      toast({
        title: "Error",
        description: "No wallet connector available",
        variant: "destructive",
      })
    }
  }

  const handleConfirm = async () => {
    if (!isConnected || !orderType || !pair || !margin || !walletClient || !currentPrice) {
      toast({
        title: "Error",
        description: "Please fill in all fields, connect your wallet, and ensure price data is available.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const marginValue = parseFloat(margin)
      const size = marginValue * leverage

      const response = await fetch(`${API_BASE_URL}/newposition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          pair: parseInt(pair),
          isLong: orderType === 'long',
          orderType: "market",
          maxAcceptablePrice: currentPrice * 1.01, // 1% slippage
          slippagePercent: 1,
          margin: marginValue,
          size: size,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const data = await response.json()

      // Execute the transaction
      const hash = await walletClient.sendTransaction({
        to: data.vaultAddress as `0x${string}`,
        data: data.calldata as `0x${string}`,
        value: parseEther(margin),
      })

      toast({
        title: "Order Placed",
        description: `Transaction hash: ${hash}`,
      })
    } catch (error) {
      console.error('Error placing order:', error)
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Place Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button
            variant={orderType === "long" ? "default" : "outline"}
            onClick={() => setOrderType("long")}
            className="w-1/2"
          >
            Long
          </Button>
          <Button
            variant={orderType === "short" ? "default" : "outline"}
            onClick={() => setOrderType("short")}
            className="w-1/2"
          >
            Short
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pair">Select Pair</Label>
          <Select onValueChange={setPair}>
            <SelectTrigger id="pair">
              <SelectValue placeholder="Select pair" />
            </SelectTrigger>
            <SelectContent>
              {pairOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {currentPrice && (
          <div className="text-sm">
            Current price: ${currentPrice.toFixed(2)}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="margin">Margin</Label>
          <Input
            id="margin"
            placeholder="Enter margin amount"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Leverage: {leverage}x</Label>
          <Slider
            min={1}
            max={100}
            step={1}
            value={[leverage]}
            onValueChange={(value) => setLeverage(value[0])}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={isConnected ? handleConfirm : handleConnect}
          disabled={loading}
        >
          {isConnected 
            ? (loading ? "Processing..." : "Confirm Order")
            : "Connect Wallet"
          }
        </Button>
      </CardFooter>
    </Card>
  )
}