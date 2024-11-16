import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useMoltenStaking } from "@/hooks/use-molten-staking"
import { useState } from "react"

interface ActionsCardProps {
  isStaking: boolean
  setIsStaking: (value: boolean) => void
}

export function ActionsCard({ isStaking, setIsStaking }: ActionsCardProps) {
    const [amount, setAmount] = useState<string>("")
    const { stakingData } = useMoltenStaking()
  
    const handleMax = () => {
        if (stakingData) {
          // Use full precision values for MAX
          setAmount(isStaking ? stakingData.formattedWalletBalance : stakingData.formattedStakedBalance)
        }
      }
  
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
              onClick={handleMax}
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
        
        <div className="border-t border-[#272734]" />
        
        <div className="flex items-center justify-between p-4 bg-[#272734] rounded-lg">
          <div className="space-y-1">
            <div className="text-sm text-[#A0AEC0]">MOLTEN Staking Rewards</div>
            <div className="text-white">
              {stakingData?.displayEarnedBalance || '0.00'} MOLTEN
            </div>
          </div>
          <Button 
            className="bg-[#7B3FE4] hover:bg-[#6B2FD4] text-white"
            disabled={!stakingData?.earnedBalance || stakingData.earnedBalance <= 0n}
            onClick={() => {}}
          >
            Claim Rewards
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}