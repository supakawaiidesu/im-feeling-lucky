import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMoltenStaking } from "@/hooks/use-molten-staking"

export function PositionCard() {
  const { stakingData, isLoading } = useMoltenStaking()
  
  return (
    <Card className="bg-[#16161D] border-[#1b1b22]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Your Position</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="text-[#A0AEC0] text-sm">Balance</div>
          <div className="text-2xl text-white">
            {stakingData?.displayWalletBalance || '0.00'} <span className="text-[#A0AEC0] text-sm">MOLTEN</span>
          </div>
        </div>
        <div className="border-t border-[#272734]" />
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#A0AEC0]">Amount Staked</span>
            <span className="text-white">
              {stakingData?.displayStakedBalance || '0.00'} MOLTEN
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#A0AEC0]">Amount Earned</span>
            <span className="text-[#00FF00]">
              {stakingData?.displayEarnedBalance || '0.00'} MOLTEN
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#A0AEC0]">Share of Pool</span>
            <span className="text-white">0%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}