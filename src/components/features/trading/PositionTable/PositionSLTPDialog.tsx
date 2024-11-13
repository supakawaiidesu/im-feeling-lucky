import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState } from "react"
import { usePositionActions } from "@/hooks/use-position-actions"

interface Position {
  id: number
  symbol: string
  isLong: boolean
  entryPrice: number
  markPrice: number
  pnl: number
  pnlPercentage: number
}

interface PositionSLTPDialogProps {
  position: Position
  isOpen: boolean
  onClose: () => void
}

export function PositionSLTPDialog({ position, isOpen, onClose }: PositionSLTPDialogProps) {
  const [tpPrice, setTpPrice] = useState("")
  const [tpGain, setTpGain] = useState("")
  const [slPrice, setSlPrice] = useState("")
  const [slLoss, setSlLoss] = useState("")
  const { addTPSL, settingTPSL } = usePositionActions()

  const handleSubmit = async () => {
    const tp = tpPrice ? parseFloat(tpPrice) : null
    const sl = slPrice ? parseFloat(slPrice) : null

    if (!tp && !sl) {
      return
    }

    await addTPSL(
      position.id,
      tp,
      sl,
      100, // Close 100% of position at TP
      100  // Close 100% of position at SL
    )

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-0">
        <Card className="w-full max-w-md border-0 shadow-lg" style={{ background: "#17161d" }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 text-white bg-orange-500 rounded-full">₿</div>
              <div>
                <div className="text-white">{position.symbol}</div>
                <div className={position.isLong ? "text-emerald-500 text-sm" : "text-red-500 text-sm"}>
                  {position.isLong ? "LONG" : "SHORT"}
                </div>
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <div className="flex justify-between text-gray-400">
                <span>Est. Current PnL</span>
                <span className={position.pnl >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {position.pnl >= 0 ? "+" : ""}{position.pnl.toFixed(2)} ({position.pnlPercentage.toFixed(2)}%)
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Entry Price</span>
                <span className="text-white">{position.entryPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Market Price</span>
                <span className="text-white">{position.markPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-4 text-lg text-white">Take Profit</div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="take-profit-price" className="text-gray-400">
                      Price
                    </Label>
                    <Input
                      id="take-profit-price"
                      value={tpPrice}
                      onChange={(e) => setTpPrice(e.target.value)}
                      className="text-white bg-transparent border-gray-800"
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="take-profit-gain" className="text-gray-400">
                      Gain
                    </Label>
                    <Input
                      id="take-profit-gain"
                      value={tpGain}
                      onChange={(e) => setTpGain(e.target.value)}
                      className="text-white bg-transparent border-gray-800"
                      type="number"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="mb-4 text-sm text-gray-400">
                  If the oracle price climbs to {tpPrice || "0.00"}, a market order will trigger with an estimated profit of{" "}
                  <span className="text-emerald-500">${((Number(tpPrice) - position.entryPrice) * 0.01).toFixed(2)}</span>.
                </div>
              </div>

              <div>
                <div className="mb-4 text-lg text-white">Stop Loss</div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="stop-loss-price" className="text-gray-400">
                      Price
                    </Label>
                    <Input 
                      id="stop-loss-price" 
                      value={slPrice}
                      onChange={(e) => setSlPrice(e.target.value)}
                      className="text-white bg-transparent border-gray-800"
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stop-loss-loss" className="text-gray-400">
                      Loss
                    </Label>
                    <Input 
                      id="stop-loss-loss" 
                      value={slLoss}
                      onChange={(e) => setSlLoss(e.target.value)}
                      className="text-white bg-transparent border-gray-800"
                      type="number"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="mb-4 text-sm text-gray-400">
                  If the oracle price falls to {slPrice || "0.00"}, a market order will trigger with an estimated loss of{" "}
                  <span className="text-red-500">${((Number(slPrice) - position.entryPrice) * 0.01).toFixed(2)}</span>.
                </div>
              </div>

              <Button 
                className="w-full text-white" 
                style={{ backgroundColor: "#7142cf" }}
                onClick={handleSubmit}
                disabled={settingTPSL[position.id] || (!tpPrice && !slPrice)}
              >
                {settingTPSL[position.id] ? "Placing Order..." : "Place Take Profit & Stop Loss"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
