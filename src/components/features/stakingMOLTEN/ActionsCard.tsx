import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useMoltenStaking } from "@/hooks/use-molten-staking"
import { useState } from "react"
import { useWalletClient } from 'wagmi'
import { parseUnits } from 'viem'

interface ActionsCardProps {
  isStaking: boolean
  setIsStaking: (value: boolean) => void
}

export function ActionsCard({ isStaking, setIsStaking }: ActionsCardProps) {
    const [amount, setAmount] = useState<string>("")
    const { data: walletClient } = useWalletClient()
    const { stakingData, claim, stake, withdraw, approve, refetch } = useMoltenStaking()

    const handleMax = () => {
        if (stakingData) {
          // Use full precision values for MAX
          setAmount(stakingData.formattedWalletBalance)
        }
      }

    const handleClaim = async () => {
        if (!walletClient) return
        try {
            const request = await claim()
            if (request) {
                await walletClient.writeContract({
                    address: request.address,
                    abi: request.abi,
                    functionName: request.functionName,
                    args: request.args,
                })
            }
        } catch (error) {
            console.error('Error claiming rewards:', error)
        }
    }

    const handleStakeOrWithdraw = async () => {
        if (!walletClient || !amount) return
        try {
            const parsedAmount = parseUnits(amount, 18)
            const request = isStaking 
                ? await stake(parsedAmount)
                : await withdraw(parsedAmount)
            if (request) {
                await walletClient.writeContract({
                    address: request.address,
                    abi: request.abi,
                    functionName: request.functionName,
                    args: request.args,
                })
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
                    await walletClient.writeContract({
                        address: request.address,
                        abi: request.abi,
                        functionName: request.functionName,
                        args: request.args,
                    })
                    await new Promise(r => setTimeout(r, 2000)) // Wait for allowance update
                    await refetch()
                }
            } else {
                const request = await stake(parsedAmount)
                if (request) {
                    await walletClient.writeContract({
                        address: request.address,
                        abi: request.abi,
                        functionName: request.functionName,
                        args: request.args,
                    })
                    setAmount("")
                }
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const canStake = () => {
        if (!amount || !stakingData) return false
        try {
            const parsedAmount = parseUnits(amount, 18)
            return parsedAmount <= stakingData.walletBalance
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
          <CardTitle className="text-white">Manage Position</CardTitle>
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

          <div className="border-t border-[#110d31]" />
          
          <div className="flex items-center justify-between p-4 bg-[#110d31] rounded-lg">
            <div className="space-y-1">
              <div className="text-sm text-[#A0AEC0]">MOLTEN Staking Rewards</div>
              <div className="text-white">
                {stakingData?.displayEarnedBalance || '0.00'} MOLTEN
              </div>
            </div>
            <Button 
              className="bg-[#7B3FE4] hover:bg-[#6B2FD4] text-white"
              disabled={!stakingData?.earnedBalance || stakingData.earnedBalance <= 0n}
              onClick={handleClaim}
            >
              Claim Rewards
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }