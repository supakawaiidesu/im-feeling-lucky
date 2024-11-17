import { useMoltenStats } from "@/hooks/use-molten-stats"
import { useUsdm } from "@/hooks/use-usdm"
import { Button } from "@/components/ui/button"

export function StatsActions() {
  const { stats } = useMoltenStats()
  const { usdmData } = useUsdm()
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-wrap gap-8">
        <div className="space-y-1">
          <div className="text-sm text-[#A0AEC0]">Total APR</div>
          <div className="text-xl text-white">{stats?.apy.toFixed(2)}%</div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-[#A0AEC0]">Current Price</div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#7B3FE4] rounded-full" />
            <span className="text-xl text-white">
              ${usdmData?.formattedUsdmPrice || '0.00'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}