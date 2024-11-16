import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface ActionsCardProps {
  isStaking: boolean
  setIsStaking: (value: boolean) => void
}

export function ActionsCard({ isStaking, setIsStaking }: ActionsCardProps) {
  const [amount, setAmount] = useState<string>("")

  return (
    <Card className="bg-[#16161D] border-[#1b1b22]">
      <CardHeader>
        <CardTitle className="text-white">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-10 bg-[#272734] border-[#373745] text-white placeholder:text-[#A0AEC0] pr-16"
            />
            <Button
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 bg-[#373745] hover:bg-[#474755] text-white text-xs px-2"
              onClick={() => {}}
            >
              MAX
            </Button>
          </div>
          <Button
            className={`${isStaking ? 'bg-[#7B3FE4] hover:bg-[#6B2FD4]' : 'bg-[#272734] hover:bg-[#373745]'} text-white w-24`}
            onClick={() => setIsStaking(true)}
          >
            Stake
          </Button>
          <Button
            className={`${!isStaking ? 'bg-[#7B3FE4] hover:bg-[#6B2FD4]' : 'bg-[#272734] hover:bg-[#373745]'} text-white w-24`}
            onClick={() => setIsStaking(false)}
          >
            Unstake
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#A0AEC0]">Unstaked Locked</span>
            <span className="text-white">0.00 MOLTEN</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#A0AEC0]">Unlock Time</span>
            <span className="text-white">-</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}