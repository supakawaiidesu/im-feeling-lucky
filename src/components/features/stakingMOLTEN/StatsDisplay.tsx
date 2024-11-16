
import { useMoltenStaking } from "@/hooks/use-molten-staking"
import { formatLargeNumber } from "@/utils/format"

export function StatsDisplay() {
  const { stakingData } = useMoltenStaking()
  
  return (
    <div className="flex flex-wrap gap-8">
      <div className="space-y-1">
        <div className="text-sm text-[#A0AEC0]">Total Staked</div>
        <div className="text-xl text-white">
          {formatLargeNumber(stakingData?.formattedTotalStaked || '0')} <span className="text-[#A0AEC0] text-sm">MOLTEN</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-[#A0AEC0]">% of Circ. Supply</div>
        <div className="text-xl text-white">{stakingData?.percentageStaked || '0'}%</div>
      </div>
    </div>
  )
}