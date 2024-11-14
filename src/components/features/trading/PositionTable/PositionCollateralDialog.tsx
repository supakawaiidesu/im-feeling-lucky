"use client"

import { useState } from "react"
import { Button } from "../../../ui/button"
import { Card, CardContent, CardHeader } from "../../../ui/card"
import { Tabs, TabsList, TabsTrigger } from "../../../ui/tabs"
import { Input } from "../../../ui/input"
import { Dialog, DialogContent } from "../../../ui/dialog"
import { Position } from "../../../../hooks/use-positions"

interface PositionCollateralDialogProps {
  position: Position | null
  isOpen: boolean
  onClose: () => void
}

export function PositionCollateralDialog({
  position,
  isOpen,
  onClose,
}: PositionCollateralDialogProps) {
  const [collateralAmount, setCollateralAmount] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("withdraw")
  
  if (!position) return null
  
  // Helper functions
  const getNumericValue = (value: string) => {
    return parseFloat(value.replace(/[^0-9.-]/g, ""))
  }

  const calculateLeverage = (size: string, margin: string) => {
    const sizeValue = getNumericValue(size)
    const marginValue = getNumericValue(margin)
    return (sizeValue / marginValue).toFixed(1)
  }

  // Current position values
  const currentMargin = getNumericValue(position.margin)
  const currentLeverage = calculateLeverage(position.size, position.margin)
  
  // Calculate new values based on input
  const collateralChange = collateralAmount ? parseFloat(collateralAmount) : 0
  const newMargin = activeTab === "deposit" 
    ? currentMargin + collateralChange 
    : currentMargin - collateralChange
  
  const positionSize = getNumericValue(position.size)
  const newLeverage = (positionSize / newMargin).toFixed(1)
  
  // Calculate new liquidation price - this is a simplified example
  const currentLiqPrice = parseFloat(position.liquidationPrice)
  const entryPrice = parseFloat(position.entryPrice)
  const liquidationThreshold = position.isLong ? 0.9 : 1.1 // 10% threshold example
  
  const calculateNewLiquidationPrice = () => {
    if (!collateralAmount) return currentLiqPrice
    
    const leverageRatio = positionSize / newMargin
    if (position.isLong) {
      return entryPrice * (1 - (1 / leverageRatio) * liquidationThreshold)
    } else {
      return entryPrice * (1 + (1 / leverageRatio) * liquidationThreshold)
    }
  }

  const newLiquidationPrice = calculateNewLiquidationPrice()

  const handleMaxClick = () => {
    if (activeTab === "withdraw") {
      // Set max withdrawable amount (leaving some margin for safety)
      const maxWithdraw = (currentMargin * 0.95).toFixed(2)
      setCollateralAmount(maxWithdraw)
    } else {
      // Example max deposit - could be based on user's wallet balance
      setCollateralAmount("100")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-0 sm:max-w-md bg-[#17161d]">
        <Card className="w-full border-0 shadow-lg bg-[#17161d]">
          <CardHeader className="flex flex-row items-center p-4 space-x-0 border-b border-zinc-800">
            <div className="flex-1 font-medium text-center text-white">Edit Margin</div>
          </CardHeader>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "deposit" | "withdraw")} className="w-full">
            <TabsList className="w-full h-12 bg-transparent border-b rounded-none border-zinc-800">
              <TabsTrigger
                value="deposit"
                className="w-full rounded-none data-[state=active]:bg-transparent data-[state=active]:text-white"
              >
                Deposit
              </TabsTrigger>
              <TabsTrigger
                value="withdraw"
                className="w-full rounded-none data-[state=active]:bg-transparent data-[state=active]:text-white"
              >
                Withdraw
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-zinc-400">Collateral</div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    className="w-20 text-2xl font-medium text-right text-white bg-transparent focus:outline-none"
                  />
                  <div 
                    className="text-xs cursor-pointer text-zinc-500 hover:text-white"
                    onClick={handleMaxClick}
                  >
                    MAX
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-400">Leverage</div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span>{currentLeverage}x</span>
                  {collateralAmount && (
                    <>
                      <span className="text-zinc-600">→</span>
                      <span className={parseFloat(newLeverage) > parseFloat(currentLeverage) ? "text-red-400" : "text-emerald-400"}>
                        {newLeverage}x
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-400">Collateral</div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span>{currentMargin.toFixed(2)}</span>
                  {collateralAmount && (
                    <>
                      <span className="text-zinc-600">→</span>
                      <span className={newMargin > currentMargin ? "text-emerald-400" : "text-red-400"}>
                        {newMargin.toFixed(2)} USDC
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-400">Fee</div>
                <div className="text-zinc-300">
                  {collateralAmount ? (parseFloat(collateralAmount) * 0.001).toFixed(4) : "0.00"} USDC
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-400">Current Price</div>
                <div className="text-zinc-300">{position.entryPrice}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-400">Liq. Price</div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="text-red-400">{currentLiqPrice}</span>
                  {collateralAmount && (
                    <>
                      <span className="text-zinc-600">→</span>
                      <span className={newLiquidationPrice > currentLiqPrice ? "text-red-400" : "text-emerald-400"}>
                        {newLiquidationPrice.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-400">{activeTab === "withdraw" ? "Receive" : "Pay"}</div>
                <div className="text-zinc-300">
                  {collateralAmount ? `${collateralAmount} USDC` : "0.00 USDC"}
                </div>
              </div>
            </div>
            <Button 
              className="w-full text-white bg-blue-600 hover:bg-blue-700"
              disabled={!collateralAmount || parseFloat(collateralAmount) <= 0}
            >
              {activeTab === "withdraw" 
                ? `Withdraw ${collateralAmount || "0"} USDC`
                : `Deposit ${collateralAmount || "0"} USDC`
              }
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}