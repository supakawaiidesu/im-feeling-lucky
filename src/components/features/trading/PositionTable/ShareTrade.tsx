'use client'

import { useState } from 'react'
import { Button } from "../../../ui/button"
import { Card, CardContent } from "../../../ui/card"
import { Copy, Download, Twitter } from 'lucide-react'
import { Position } from "../../../../hooks/use-positions"

interface ShareTradeProps {
  position: Position;
  onClose: () => void;
}

export function ShareTrade({ position, onClose }: ShareTradeProps) {
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopy = () => {
    const tradeDetails = `${position.market} ${position.isLong ? 'LONG' : 'SHORT'}
Entry: ${position.entryPrice}
Size: ${position.size}
PnL: ${position.pnl}`
    
    navigator.clipboard.writeText(tradeDetails)
      .then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      })
      .catch(err => console.error('Failed to copy: ', err))
  }

  const handleDownload = () => {
    // TODO: Implement actual trade image download
    console.log('Download trade image')
  }

  const handleShare = () => {
    const tweetText = `Trading ${position.market} ${position.isLong ? 'LONG' : 'SHORT'} on @BuildersPerp`
    const encodedTweet = encodeURIComponent(tweetText)
    window.open(`https://twitter.com/intent/tweet?text=${encodedTweet}`, '_blank')
  }

  return (
    <Card className="w-full text-white rounded-lg bg-zinc-900 border-zinc-700">
      <CardContent className="p-6">
        <div className="relative mb-4 overflow-hidden rounded-lg bg-zinc-800 aspect-video">
          {/* TODO: Add trade chart/image */}
        </div>
        <div className="flex items-center justify-between mb-4 space-x-4">
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="flex-1 bg-blue-600 border-none hover:bg-blue-700" 
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4 mr-2" />
            {copySuccess ? 'Copied!' : 'Copy'}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-blue-600 border-none hover:bg-blue-700" 
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-blue-600 border-none hover:bg-blue-700" 
            onClick={handleShare}
          >
            <Twitter className="w-4 h-4 mr-2" />
            Tweet
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}