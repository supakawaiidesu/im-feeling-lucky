"use client"

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
  if (!position) return null

  return (
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="p-0 border-0 sm:max-w-md bg-[#17161d]">
    <Card className="w-full border-0 shadow-lg bg-[#17161d]">
          <CardHeader className="flex flex-row items-center p-4 space-x-0 border-b border-zinc-800">
            <div className="flex-1 font-medium text-center text-white">Edit Margin</div>
          </CardHeader>
          <Tabs defaultValue="withdraw" className="w-full">
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
                    defaultValue="2"
                    className="w-20 text-2xl font-medium text-right text-white bg-transparent focus:outline-none"
                  />
                  <div className="text-xs cursor-pointer text-zinc-500">MAX</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-400">Leverage</div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span>10x</span>
                  <span>→</span>
                  <span>18.889x</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-400">Collateral</div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span>4.2</span>
                  <span>→</span>
                  <span>1.9 USDC</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-400">Fee</div>
                <div className="text-zinc-300">0.4 USDC</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-400">Current Price</div>
                <div className="text-zinc-300">90553.6</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-400">Liq. Price</div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span>82784.5</span>
                  <span>→</span>
                  <span>86563.6</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-zinc-400">Receive</div>
                <div className="text-zinc-300">2.0 USDC</div>
              </div>
            </div>
            <Button className="w-full text-white bg-blue-600 hover:bg-blue-700">
              Withdraw 2 USDC
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
