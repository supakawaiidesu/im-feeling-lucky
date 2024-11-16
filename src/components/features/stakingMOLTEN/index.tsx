'use client'

import { useState } from "react"
import { Header } from "../../shared/Header"
import { PositionCard } from "./PositionCard"
import { ActionsCard } from "./ActionsCard"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from 'lucide-react'

export function StakingMOLTEN() {
  const [isStaking, setIsStaking] = useState(false)
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="min-h-screen bg-[#0b0b0e] text-white p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#7B3FE4] rounded-full" />
              <span className="text-[#A0AEC0]">Earn</span>
            </div>
            <h1 className="text-2xl font-semibold text-white">MOLTEN Staking</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-8">
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
              </div>
              <PositionCard />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-8">
                  <div className="space-y-1">
                    <div className="text-sm text-[#A0AEC0]">Staking APR</div>
                    <div className="text-xl text-white text-[#00FF00]">15.00%</div>
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
                </div>
                <Button className="bg-[#272734] text-white hover:bg-[#373745]">
                  Buy MOLTEN
                </Button>
              </div>
              <ActionsCard isStaking={isStaking} setIsStaking={setIsStaking} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}