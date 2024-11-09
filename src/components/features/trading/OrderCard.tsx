import { useAccount } from 'wagmi'
import { Button } from "../../ui/button"
import { Card, CardContent } from "../../ui/card"
import { Input } from "../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { useState, useMemo } from "react"
import { useMarketOrderActions } from '../../../hooks/use-market-order-actions'
import { usePrices } from '../../../lib/websocket-price-context'
import { useMarketData } from '../../../hooks/use-market-data'
import { useSmartAccount } from '../../../hooks/use-smart-account'

interface OrderCardProps {
  leverage: string
  onLeverageChange: (value: string) => void
  assetId: string
}

export function OrderCard({ leverage, onLeverageChange, assetId }: OrderCardProps) {
  const { isConnected } = useAccount()
  const { smartAccount, error } = useSmartAccount()
  const [amount, setAmount] = useState("")
  const [isLong, setIsLong] = useState(true)
  const { placeMarketOrder, placingOrders } = useMarketOrderActions()
  const { prices } = usePrices()
  const { allMarkets } = useMarketData()

  // Get the pair name from market data using assetId
  const market = allMarkets.find(m => m.assetId === assetId)
  const pair = market?.pair
  const basePair = pair?.split('/')[0].toLowerCase()
  const currentPrice = basePair ? prices[basePair]?.price : undefined

  // Calculate margin based on amount and leverage
  const calculatedMargin = useMemo(() => {
    if (!amount || !leverage) return 0
    // Margin = Amount / Leverage
    return parseFloat(amount) / parseFloat(leverage)
  }, [amount, leverage])

  // Calculate size (should be equal to the input amount)
  const calculatedSize = useMemo(() => {
    if (!amount) return 0
    return parseFloat(amount)
  }, [amount])

  const handlePlaceOrder = () => {
    if (!isConnected || !smartAccount?.address) return;

    if (!currentPrice) {
      console.error('Price not available for asset')
      return
    }

    console.log('Placing order with:', {
      amount,
      leverage,
      calculatedMargin,
      calculatedSize
    })

    const orderDetails = {
      pair: parseInt(assetId, 10),
      isLong,
      currentPrice,
      slippagePercent: 100, // 1% slippage
      margin: calculatedMargin,
      size: calculatedSize
    };

    placeMarketOrder(
      orderDetails.pair,
      orderDetails.isLong,
      orderDetails.currentPrice,
      orderDetails.slippagePercent,
      orderDetails.margin,
      orderDetails.size
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        {error && <div className="mb-4 text-red-500">Error: {error.message}</div>}
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
              <Button 
                variant="default" 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setIsLong(true)}
              >
                Long
              </Button>
              <Button 
                variant="default" 
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => setIsLong(false)}
              >
                Short
              </Button>
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
                <span>Margin: {calculatedMargin.toFixed(4)}</span>
                <span>≈ ${currentPrice ? (parseFloat(amount || "0") * currentPrice).toFixed(2) : "0.00"}</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              disabled={!isConnected || !smartAccount?.address || placingOrders || !currentPrice}
              onClick={handlePlaceOrder}
            >
              {!isConnected 
                ? "Connect Wallet to Trade"
                : !smartAccount?.address
                ? "Smart Account Not Ready"
                : !currentPrice 
                  ? "Waiting for price..." 
                  : placingOrders 
                    ? "Placing Order..." 
                    : "Place Market Order"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}