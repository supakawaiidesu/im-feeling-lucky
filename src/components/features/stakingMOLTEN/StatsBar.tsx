import { ArrowUpRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function StatsBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="text-sm text-[#A0AEC0]">Staking APR</div>
        <div className="text-xl text-white text-[#00FF00]">15.00%</div>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-[#A0AEC0]">Total Staked</div>
        <div className="text-xl text-white">
          234M <span className="text-[#A0AEC0] text-sm">MOLTEN</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-[#A0AEC0]">% of Circ. Supply</div>
        <div className="text-xl text-white">64.14%</div>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-[#A0AEC0]">Price / 24h Change</div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#7B3FE4] rounded-full" />
          <span className="text-xl text-white">0.0630</span>
          <span className="text-[#00FF00] text-sm flex items-center">
            <ArrowUpRight className="w-3 h-3" />
            0.83%
          </span>
        </div>
      </div>
      <Button className="bg-[#272734] text-white hover:bg-[#373745]">
        Buy MOLTEN
      </Button>
    </div>
  )
}