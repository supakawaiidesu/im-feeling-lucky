'use client'

import { useState } from "react"
import { Header } from "../../shared/Header"
import { StatsBar } from "./StatsBar"
import { PositionCard } from "./PositionCard"
import { ActionsCard } from "./ActionsCard"

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

          <StatsBar />

          <div className="grid gap-6 md:grid-cols-2">
            <PositionCard />
            <ActionsCard isStaking={isStaking} setIsStaking={setIsStaking} />
          </div>
        </div>
      </div>
    </div>
  )
}