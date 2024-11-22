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
import { useTokenList } from '@/hooks/use-token-list'
import { useTokenListBalances } from "@/hooks/use-tokenlist-balances"
import { useOdosQuote } from "@/hooks/use-odos-quote"
import { useOdosSwap } from '@/hooks/use-odos-swap'
import { usePublicClient, useWalletClient } from 'wagmi'

export function Swaps() {
  const { tokens } = useTokenList()
  const [tokenSelectorOpen, setTokenSelectorOpen] = React.useState(false)
  const [selectedField, setSelectedField] = React.useState<'input' | 'output'>('input')
  const [inputAmount, setInputAmount] = React.useState("")
  const { balances } = useTokenListBalances(tokens)
  
  const defaultInputToken = tokens.find(t => t.address === '0xaf88d065e77c8cC2239327C5EDb3A432268e5831')
  const defaultOutputToken = tokens.find(t => t.address === '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1')
  
  const [inputToken, setInputToken] = React.useState(defaultInputToken || { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
  })
  const [outputToken, setOutputToken] = React.useState(defaultOutputToken || { 
    symbol: 'WETH', 
    name: 'Wrapped Ether', 
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
  })

  const inputBalance = balances.find(t => t.address === inputToken.address)
  const outputBalance = balances.find(t => t.address === outputToken.address)

  const { quote, isLoading: quoteLoading, error: quoteError } = useOdosQuote({
    inputToken: inputToken.address,
    outputToken: outputToken.address,
    inputAmount: inputAmount ? inputAmount + "000000" : undefined, // Convert to proper decimals
    enabled: Boolean(inputAmount && inputToken && outputToken)
  })

  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { executeSwap } = useOdosSwap()

  const handleTokenSelect = (token: { symbol: string; name: string; icon: string; address: string }) => {
      if (selectedField === 'input') {
        setInputToken(token)
      } else {
        setOutputToken(token)
      }
    }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setInputAmount(value)
    }
  }

  const outputAmount = React.useMemo(() => {
    if (!quote || !quote.outAmounts?.[0]) return "0.0"
    const amount = BigInt(quote.outAmounts[0])
    return (Number(amount) / 1e18).toFixed(6) // Assuming 18 decimals for output token
  }, [quote])

  const handleSwap = async () => {
    if (!quote?.pathId || !walletClient) return
    
    try {
      const request = await executeSwap(quote.pathId)
      
      const hash = await walletClient.sendTransaction({
        to: request.to as `0x${string}`,
        data: request.data as `0x${string}`,
        value: BigInt(request.value || "0"),
        account: walletClient.account
      })

      // Optional: Wait for transaction
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash })
      }
      
      // Reset form or show success message
      setInputAmount('')
    } catch (error) {
      console.error('Swap failed:', error)
      // Handle error (show toast, etc)
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
                      value={inputAmount}
                      onChange={handleInputChange}
                      placeholder="0.0"
                      className="w-1/2 text-4xl bg-transparent focus:outline-none"
                    />
                    <div className="flex flex-col items-end">
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
                      {inputBalance && (
                        <span className="mt-1 text-sm text-gray-400">
                          Balance: {Number(inputBalance.formattedBalance).toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    ${quote?.inValues?.[0]?.toFixed(2) || "0.00"}
                  </div>
                </div>

                <div className="relative flex justify-center">
                  <div className="absolute flex items-center -top-3 -bottom-3">
                    <div className="p-2 rounded-xl bg-[#232323]">
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
                      value={quoteLoading ? "Loading..." : outputAmount}
                      readOnly
                      className="w-1/2 text-4xl bg-transparent opacity-50 cursor-not-allowed focus:outline-none"
                    />
                    <div className="flex flex-col items-end">
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
                      {outputBalance && (
                        <span className="mt-1 text-sm text-gray-400">
                          Balance: {Number(outputBalance.formattedBalance).toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    ${quote?.outValues?.[0]?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>

              <Button 
                className="w-full py-6 text-white bg-pink-500 hover:bg-pink-600"
                onClick={handleSwap}
                disabled={!quote || !inputAmount}
              >
                {!quote ? 'Enter an amount' : 'Review'}
              </Button>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-gray-400">
                  <div className="flex items-center gap-1">
                    Rate: 1 {inputToken.symbol} = {quote ? (Number(quote.outAmounts[0]) / Number(quote.inAmounts[0])).toFixed(6) : '0.00'} {outputToken.symbol}
                    <span className="text-gray-500">
                      (${quote?.inValues?.[0]?.toFixed(2) || "0.00"})
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      Order Routing
                      <div className="w-4 h-4 text-xs text-center bg-gray-700 rounded-full">?</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Aggregator the trade routed through</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center gap-1">
                    <img
                      src="/placeholder.svg?height=16&width=16"
                      className="w-4 h-4 rounded-full"
                      alt="Network"
                    />
                    Odos
                  </div>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      Price Impact
                      <div className="w-4 h-4 text-xs text-center bg-gray-700 rounded-full">?</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Price impact on trade</p>
                    </TooltipContent>
                  </Tooltip>
                  <span>{quote?.priceImpact ? (quote.priceImpact * 100).toFixed(2) : '0.00'}%</span>
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
                    ${quote?.gasEstimateValue?.toFixed(2) || '0.00'}
                  </div>
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
                    <span className="px-2 bg-gray-800 rounded py-1px">Auto</span>
                    <span>0.3%</span>
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
