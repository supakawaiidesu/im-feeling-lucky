"use client"

import * as React from "react"
import { ChevronDown, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ActionsCardProps {
  isStaking: boolean
  setIsStaking: (value: boolean) => void
}

export function ActionsCard({ isStaking, setIsStaking }: ActionsCardProps) {
  const [amount, setAmount] = React.useState("100")
  const [isOpen, setIsOpen] = React.useState(true)
  const [action, setAction] = React.useState<'mint' | 'burn'>('mint')

  return (
    <Card className="w-full bg-[#1C1C1F] text-white border-none">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-2xl font-semibold">{action === 'mint' ? 'Mint' : 'Burn'} USD.m</h2>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              className={`text-gray-400 hover:text-white ${action === 'mint' ? 'bg-[#2C2C30]' : ''}`}
              onClick={() => setAction('mint')}
            >
              Mint
            </Button>
            <Button 
              variant="ghost" 
              className={`text-gray-400 hover:text-white ${action === 'burn' ? 'bg-[#2C2C30]' : ''}`}
              onClick={() => setAction('burn')}
            >
              Burn
            </Button>
          </div>
        </div>

        <div className="px-6 pb-4">
          <h3 className="mb-2 text-xl">{action === 'mint' ? 'Deposit USDC' : 'Burn USD.m'}</h3>
          <p className="mb-4 text-gray-400">
            {action === 'mint' 
              ? 'Deposit USDC to mint USD.m' 
              : 'Burn USD.m to receive USDC'}
          </p>

          <div className="relative mb-2">
            <div className="flex gap-2">
              <Select defaultValue="usdc" disabled>
                <SelectTrigger className="w-[140px] h-[42px] bg-[#2C2C30] border-0 focus:ring-0">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 text-sm bg-blue-500 rounded-full">
                        $
                      </div>
                      <span>USDC</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usdc">USDC</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-[42px] bg-[#2C2C30] border-0 text-lg pr-20"
                  placeholder="0.00"
                />
                <div className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2">
                  ~ ${amount}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 text-gray-400">Available: 0.00</div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            {["25%", "50%", "75%", "100%"].map((percent) => (
              <Button
                key={percent}
                variant="outline"
                className="bg-[#2C2C30] border-0 hover:bg-[#3C3C40]"
              >
                {percent}
              </Button>
            ))}
          </div>

          <div className="bg-[#2C2C30] rounded-lg p-4 mb-6">
            <p className="text-gray-200">
              {action === 'mint'
                ? 'Approval for USDC is required. You will need to deposit after the approval transaction is confirmed.'
                : 'Burning USD.m will return USDC to your wallet.'}
            </p>
          </div>

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#2C2C30] rounded-lg">
              <span className="text-lg text-gray-300">Summary</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-[#2C2C30] rounded-lg mt-px p-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Balance</span>
                <div className="flex items-center gap-2">
                  <span>0.00</span>
                  <span className="text-gray-400">→</span>
                  <span>{amount}</span>
                  <span className="text-gray-400">{action === 'mint' ? 'USD.m' : 'USDC'}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Button className="w-full h-14 mt-6 bg-[#7C5CFF] hover:bg-[#6B4FE0] text-lg">
            {action === 'mint' ? 'Approve' : 'Burn USD.m'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}