import { useMoltenStaking } from "@/hooks/use-molten-staking"
import { useUsdm } from "@/hooks/use-usdm"
import { formatLargeNumber } from "@/utils/format"

export function StatsDisplay() {
  const { stakingData } = useMoltenStaking()
  const { usdmData } = useUsdm()
  
  return (
    <div className="flex flex-wrap gap-8">
      <div className="space-y-1">
        <div className="text-sm text-[#A0AEC0]">USD.m TVL</div>
        <div className="text-xl text-white">
          ${formatLargeNumber(usdmData?.formattedVaultBalance || '0')} <span className="text-[#A0AEC0] text-sm">USD</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-[#A0AEC0]">Total Vault Return</div>
        <div className="text-xl text-white">{stakingData?.percentageStaked || '0'}%</div>
      </div>
    </div>
  )
}