import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useUsdmStaking } from "@/hooks/use-usdm-staking"
import { useState } from "react"
import { useWalletClient } from 'wagmi'
import { parseUnits } from 'viem'
import { useUsdm } from "@/hooks/use-usdm"

export function UsdmStakingCard() {
    const [amount, setAmount] = useState<string>("")
    const { data: walletClient } = useWalletClient()
    const { stakingData, claim, stake, withdraw, approve, refetch } = useUsdmStaking()
    const { usdmData } = useUsdm()

    const handleMax = () => {
        if (stakingData) {
            setAmount(usdmData?.formattedUsdmBalance || '0')
        }
    }

    const handleClaim = async () => {
        if (!walletClient) return
        try {
            const request = await claim()
            if (request) {
                await walletClient.writeContract(request)
            }
        } catch (error) {
            console.error('Error claiming rewards:', error)
        }
    }

    const handleStakeOrWithdraw = async () => {
        if (!walletClient || !amount) return
        try {
            const parsedAmount = parseUnits(amount, 18)
            const request = await withdraw(parsedAmount)
            if (request) {
                await walletClient.writeContract(request)
                setAmount("")
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleStakeOrApprove = async () => {
        if (!walletClient || !amount || !stakingData) return
        try {
            const parsedAmount = parseUnits(amount, 18)
            if (parsedAmount > stakingData.allowance) {
                const request = await approve(parsedAmount)
                if (request) {
                    await walletClient.writeContract(request)
                    await new Promise(r => setTimeout(r, 2000))
                    await refetch()
                }
            } else {
                const request = await stake(parsedAmount)
                if (request) {
                    await walletClient.writeContract(request)
                    setAmount("")
                }
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const canStake = () => {
        if (!amount || !usdmData) return false
        try {
            const parsedAmount = parseUnits(amount, 18)
            return parsedAmount <= usdmData.usdmBalance
        } catch {
            return false
        }
    }

    const canUnstake = () => {
        if (!amount || !stakingData) return false
        try {
            const parsedAmount = parseUnits(amount, 18)
            return parsedAmount <= stakingData.stakedBalance
        } catch {
            return false
        }
    }

    const needsApproval = () => {
        if (!amount || !stakingData) return false
        try {
            const parsedAmount = parseUnits(amount, 18)
            return parsedAmount > stakingData.allowance
        } catch {
            return false
        }
    }

    return (
        <Card className="bg-[#16161D] border-[#1b1b22]">
            <CardHeader>
                <CardTitle className="text-white">Stake USD.m</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Input
                            type="number"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full h-10 bg-[#110d31] border-[#373745] text-white placeholder:text-[#A0AEC0] pr-16"
                        />
                        <Button
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 bg-[#373745] hover:bg-[#474755] text-white text-xs px-2"
                            onClick={handleMax}
                        >
                            MAX
                        </Button>
                    </div>
                    <Button
                        className="bg-[#110d31] hover:bg-[#373745] text-white w-24"
                        onClick={handleStakeOrApprove}
                        disabled={!canStake()}
                    >
                        {needsApproval() ? 'Approve' : 'Stake'}
                    </Button>
                    <Button
                        className="bg-[#110d31] hover:bg-[#373745] text-white w-24"
                        onClick={handleStakeOrWithdraw}
                        disabled={!canUnstake()}
                    >
                        Unstake
                    </Button>
                </div>

                
                <div className="flex items-center justify-between p-4 bg-[#110d31] rounded-lg">
                    <div className="space-y-1">
                        <div className="text-sm text-[#A0AEC0]">Stake your USD.m to get additional rewards like esMOLTEN, based on your share of the staking vault's total TVL.</div>
                </div>
                </div>
            </CardContent>
        </Card>
    )
}
