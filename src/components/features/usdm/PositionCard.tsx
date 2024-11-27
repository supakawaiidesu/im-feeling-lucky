import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMoltenStaking } from "@/hooks/use-molten-staking"
import { useUsdmStaking } from "@/hooks/use-usdm-staking"
import { useMoltenStats } from "@/hooks/use-molten-stats"
import { useUsdm } from "@/hooks/use-usdm"

export function PositionCard() {
  const { stakingData: moltenStakingData } = useMoltenStaking()
  const { stakingData: usdmStakingData } = useUsdmStaking()
  const { stats } = useMoltenStats()
  const { usdmData } = useUsdm()
  
  const formatUsdValue = (moltenAmount: string) => {
    if (!stats?.price) return '($0.00)'
    const value = parseFloat(moltenAmount) * stats.price
    return `($${value.toFixed(2)})`
  }

  const calculateShareOfPool = () => {
    if (!usdmData?.formattedUsdmBalance || !usdmData?.formattedVaultBalance) return '0'
    const userUsdValue = parseFloat(usdmData.formattedUsdmBalance) * parseFloat(usdmData.formattedUsdmPrice)
    const totalVaultValue = parseFloat(usdmData.formattedVaultBalance)
    if (totalVaultValue === 0) return '0'
    return ((userUsdValue / totalVaultValue) * 100).toFixed(2)
  }
  
  return (
    <Card className="bg-[#16161D] border-[#1b1b22]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Positions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="text-[#A0AEC0] text-sm">Wallet Balance</div>
          <div className="text-2xl text-white">
            {usdmData?.displayUsdmBalance || '0.00'} <span className="text-[#A0AEC0] text-sm">USD.m</span>{' '}
            <span className="text-[#A0AEC0] text-sm">{formatUsdValue(usdmData?.formattedUsdmBalance || '0')}</span>
          </div>
        </div>
        <div className="border-t border-[#110d31]" />
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#A0AEC0]">Amount Staked</span>
            <span className="text-white">
              {usdmStakingData?.displayStakedBalance || '0.00'} USD.m {' '}
              <span className="text-[#A0AEC0]">
                (${((parseFloat(usdmStakingData?.formattedStakedBalance || '0') * parseFloat(usdmData?.formattedUsdmPrice || '0')).toFixed(2))})
              </span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#A0AEC0]">Vesting Rewards</span>
            <span className="text-[#00FF00]">
              {moltenStakingData?.displayEarnedBalance || '0.00'} esMOLTEN {' '}
              <span className="text-[#A0AEC0]">{formatUsdValue(moltenStakingData?.formattedEarnedBalance || '0')}</span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#A0AEC0]">Share of the Vault</span>
            <span className="text-white">{calculateShareOfPool()}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}