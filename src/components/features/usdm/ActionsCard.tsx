"use client"

import * as React from "react"
import { ChevronDown } from 'lucide-react'
import { useWalletClient } from 'wagmi'
import { parseUnits } from 'viem'
import { useUsdm } from "@/hooks/use-usdm"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUsdcPrice } from "@/hooks/use-usdc-price"

interface ActionsCardProps {
  isStaking: boolean
  setIsStaking: (value: boolean) => void
}

export function ActionsCard({ isStaking, setIsStaking }: ActionsCardProps) {
  const [amount, setAmount] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(true)
  const [action, setAction] = React.useState<'mint' | 'burn'>('mint')
  const { data: walletClient } = useWalletClient()
  const { 
    usdmData,
    approveUsdc,
    approveUsdm,
    mint,
    burn,
    refetch,
    usdcBalance, // Add this
    usdcBalanceRaw // Add this
  } = useUsdm()
  const { price: usdcPrice } = useUsdcPrice()

  const handleTransaction = async () => {
    if (!walletClient || !amount) return

    try {
      const parsedAmount = parseUnits(amount, 6) // USDC has 6 decimals
      
      if (action === 'mint') {
        // Check if we need approval for USDC
        if (usdmData && parsedAmount > usdmData.usdcAllowance) {
          const request = await approveUsdc(parsedAmount)
          if (request) {
            await walletClient.writeContract(request)
            await new Promise(r => setTimeout(r, 2000)) // Wait for allowance update
            await refetch()
          }
          return
        }
        
        // If approved, proceed with mint
        const request = await mint(parsedAmount)
        if (request) {
          await walletClient.writeContract(request)
          setAmount("")
        }
      } else {
        // Check if we need approval for USDM
        if (usdmData && parsedAmount > usdmData.usdmAllowance) {
          const request = await approveUsdm(parsedAmount)
          if (request) {
            await walletClient.writeContract(request)
            await new Promise(r => setTimeout(r, 2000)) // Wait for allowance update
            await refetch()
          }
          return
        }
        
        // If approved, proceed with burn
        const request = await burn(parsedAmount)
        if (request) {
          await walletClient.writeContract(request)
          setAmount("")
        }
      }
    } catch (error) {
      console.error('Transaction failed:', error)
    }
  }

  const needsApproval = () => {
    if (!amount || !usdmData) return false
    try {
      const parsedAmount = parseUnits(amount, 6)
      return action === 'mint' 
        ? parsedAmount > usdmData.usdcAllowance
        : parsedAmount > usdmData.usdmAllowance
    } catch {
      return false
    }
  }

  // Update the button text based on action and approval status
  const getButtonText = () => {
    if (needsApproval()) {
      return action === 'mint' ? 'Approve USDC' : 'Approve USD.m'
    }
    return action === 'mint' ? 'Mint USD.m' : 'Burn USD.m'
  }

  // Fix: Update getAvailableBalance to use correct balance
  const getAvailableBalance = () => {
    if (action === 'mint') {
      return `Available: ${usdcBalance} USDC`
    }
    return `Available: ${usdmData?.displayUsdmBalance || '0.00'} USD.m`
  }

  // Add: Handle max button click
  const handleMaxClick = () => {
    if (action === 'mint') {
      setAmount(usdcBalance)
    } else {
      setAmount(usdmData?.displayUsdmBalance || '0')
    }
  }

  // Add: Validate transaction
  const canSubmit = () => {
    if (!amount || amount === '0') return false
    try {
      const parsedAmount = parseUnits(amount, 6)
      if (action === 'mint') {
        return parsedAmount <= usdcBalanceRaw
      } else {
        return parsedAmount <= (usdmData?.usdmBalance || BigInt(0))
      }
    } catch {
      return false
    }
  }

  // Update percentage buttons to work
  const handlePercentageClick = (percentage: number) => {
    if (action === 'mint') {
      const value = (Number(usdcBalance) * percentage).toFixed(6)
      setAmount(value)
    } else {
      const value = (Number(usdmData?.formattedUsdmBalance || 0) * percentage).toFixed(18)
      setAmount(value)
    }
  }

  const calculateUsdValue = (inputAmount: string) => {
    if (!inputAmount) return '0.00'
    
    // Use USDC price when minting, USD.m price when burning
    const price = action === 'mint' 
      ? usdcPrice 
      : Number(usdmData?.formattedUsdmPrice || 0)
      
    const usdValue = Number(inputAmount) * price
    return usdValue.toFixed(2)
  }

  return (
    <Card className="bg-[#16161D] border-[#1b1b22]">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-2xl font-semibold">{action === 'mint' ? 'Mint' : 'Burn'} USD.m</h2>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              className={`text-gray-400 hover:text-white ${action === 'mint' ? 'bg-[#272734]' : ''}`}
              onClick={() => setAction('mint')}
            >
              Mint
            </Button>
            <Button 
              variant="ghost" 
              className={`text-gray-400 hover:text-white ${action === 'burn' ? 'bg-[#272734]' : ''}`}
              onClick={() => setAction('burn')}
            >
              Burn
            </Button>
          </div>
        </div>

        <div className="px-6 pb-4">
          <h3 className="mb-2 text-xl">{action === 'mint' ? 'Stables to USD.m' : 'USD.m to Stables'}</h3>
          <div className="relative mb-2">
            <div className="flex gap-2">
              <Select defaultValue="usdc" disabled>
                <SelectTrigger className="w-[140px] h-[42px] bg-[#272734] border-0 focus:ring-0">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 text-sm bg-blue-500 rounded-full">
                        $
                      </div>
                      <span>USDC</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usdc">USDC</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-[42px] bg-[#272734] border-0 text-lg pr-20"
                  placeholder="0.00"
                />
                <div className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2">
                  ~${calculateUsdValue(amount)}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 text-gray-400">
            {getAvailableBalance()}
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            {["25", "50", "75", "100"].map((percent) => (
              <Button
                key={percent}
                variant="outline"
                className="bg-[#272734] border-0 hover:bg-[#373745]"
                onClick={() => handlePercentageClick(Number(percent) / 100)}
              >
                {percent}%
              </Button>
            ))}
          </div>

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#272734] rounded-lg">
              <span className="text-lg text-gray-300">Summary</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-[#272734] rounded-lg mt-px p-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Balance</span>
                <div className="flex items-center gap-2">
                  <span>0.00</span>
                  <span className="text-gray-400">→</span>
                  <span>{amount}</span>
                  <span className="text-gray-400">{action === 'mint' ? 'USD.m' : 'USDC'}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Button 
            className="w-full h-14 mt-6 bg-[#7C5CFF] hover:bg-[#6B4FE0] text-lg"
            onClick={handleTransaction}
            disabled={!canSubmit()}
          >
            {getButtonText()}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}