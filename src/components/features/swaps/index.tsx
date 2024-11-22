'use client'

import * as React from "react"
import { Settings, ChevronDown, ArrowDown } from 'lucide-react'
import { TokenSelector } from "./TokenSelector"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Header } from "../../shared/Header"

export function Swaps() {
  const [tokenSelectorOpen, setTokenSelectorOpen] = React.useState(false)
  const [selectedField, setSelectedField] = React.useState<'input' | 'output'>('input')
  const [inputToken, setInputToken] = React.useState({ symbol: 'USDC', name: 'USD Coin', icon: '/placeholder.svg?height=24&width=24' })
  const [outputToken, setOutputToken] = React.useState({ symbol: 'ETH', name: 'Ethereum', icon: '/placeholder.svg?height=24&width=24' })

  const handleTokenSelect = (token: { symbol: string; name: string; icon: string }) => {
    if (selectedField === 'input') {
      setInputToken(token)
    } else {
      setOutputToken(token)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="min-h-screen bg-[#0b0b0e] text-white p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2" />
            <h1 className="text-2xl font-semibold text-white">Swaps</h1>
          </div>
          
          <TooltipProvider>
            <div className="w-full max-w-md mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" className="text-gray-400">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-1">
                <div className="p-4 bg-neutral-900 rounded-xl">
                  {/* Sell Section */}
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Sell</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value="10"
                      className="w-1/2 text-4xl bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        setSelectedField('input')
                        setTokenSelectorOpen(true)
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800"
                    >
                      <img
                        src={inputToken.icon}
                        className="w-6 h-6 rounded-full"
                        alt={inputToken.name}
                      />
                      {inputToken.symbol}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-400">$10.00</div>
                </div>

                <div className="relative flex justify-center">
                  <div className="absolute flex items-center -top-3 -bottom-3">
                    <div className="p-2 rounded-xl bg-neutral-900">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-900 rounded-xl">
                  {/* Buy Section */}
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Buy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value="0.00297227"
                      className="w-1/2 text-4xl bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        setSelectedField('output')
                        setTokenSelectorOpen(true)
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800"
                    >
                      <img
                        src={outputToken.icon}
                        className="w-6 h-6 rounded-full"
                        alt={outputToken.name}
                      />
                      {outputToken.symbol}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-400">$9.98</div>
                </div>
              </div>

              <Button className="w-full py-6 text-white bg-pink-500 hover:bg-pink-600">
                Review
              </Button>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-gray-400">
                  <div className="flex items-center gap-1">
                    1 USDC = 0.00029727 ETH
                    <span className="text-gray-500">($1.00)</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      Fee (0.25%)
                      <div className="w-4 h-4 text-xs text-center bg-gray-700 rounded-full">?</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Trading fee</p>
                    </TooltipContent>
                  </Tooltip>
                  <span>$0.03</span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      Network cost
                      <div className="w-4 h-4 text-xs text-center bg-gray-700 rounded-full">?</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Estimated network fee</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center gap-1">
                    <img
                      src="/placeholder.svg?height=16&width=16"
                      className="w-4 h-4 rounded-full"
                      alt="Network"
                    />
                    $0.06
                  </div>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      Order routing
                      <div className="w-4 h-4 text-xs text-center bg-gray-700 rounded-full">?</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Route for best price</p>
                    </TooltipContent>
                  </Tooltip>
                  <span>Uniswap API</span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      Price impact
                      <div className="w-4 h-4 text-xs text-center bg-gray-700 rounded-full">?</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Price impact on trade</p>
                    </TooltipContent>
                  </Tooltip>
                  <span>-0.567%</span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      Max slippage
                      <div className="w-4 h-4 text-xs text-center bg-gray-700 rounded-full">?</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Maximum price slippage</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-800 rounded">Auto</span>
                    <span>1%</span>
                  </div>
                </div>
              </div>

              <TokenSelector
                open={tokenSelectorOpen}
                onClose={() => setTokenSelectorOpen(false)}
                onSelect={handleTokenSelect}
              />
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
