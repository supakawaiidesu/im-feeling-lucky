import { useState, useEffect } from "react"
import { useAccount } from 'wagmi'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define the structure of a trade based on the API response
interface Trade {
  id: string
  pair: string
  entryPrice: number
  collateral: number
  size: number
  isLong: boolean
}

// Map tokenId to pair name
const tokenIdToPair: { [key: string]: string } = {
  "1": "BTC/USD",
  "2": "ETH/USD",
}

export default function TradeTable() {
  const [trades, setTrades] = useState<Trade[]>([])
  const { address } = useAccount()

  useEffect(() => {
    if (address) {
      fetchTrades(address)
    }
  }, [address])

  const fetchTrades = async (walletAddress: string) => {
    try {
      const response = await fetch(`https://unidexv4-api-production.up.railway.app/api/positions?address=${walletAddress}`)
      const data = await response.json()
      
      const mappedTrades = data.positions.map((position: any, index: number) => ({
        id: data.posIds[index],
        pair: tokenIdToPair[position.tokenId] || `Unknown (${position.tokenId})`,
        entryPrice: parseFloat(position.averagePrice),
        collateral: parseFloat(position.collateral),
        size: parseFloat(position.size),
        isLong: position.isLong
      }))

      setTrades(mappedTrades)
    } catch (error) {
      console.error("Error fetching trades:", error)
    }
  }

  const handleCloseTrade = (id: string) => {
    // Implement close trade functionality
    console.log("Closing trade:", id)
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Your Open Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pair</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Entry Price</TableHead>
              <TableHead>Margin</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell className="font-medium">{trade.pair}</TableCell>
                <TableCell>{trade.isLong ? "Long" : "Short"}</TableCell>
                <TableCell>${trade.entryPrice.toFixed(2)}</TableCell>
                <TableCell>${trade.collateral.toFixed(2)}</TableCell>
                <TableCell>{trade.size.toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCloseTrade(trade.id)}
                  >
                    Close
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}