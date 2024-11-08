import { BarChart2, Settings2, Maximize2 } from "lucide-react"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface ChartControlsProps {
  timeframe: string
  onTimeframeChange: (value: string) => void
}

export function ChartControls({ timeframe, onTimeframeChange }: ChartControlsProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <Select value={timeframe} onValueChange={onTimeframeChange}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5m">5m</SelectItem>
          <SelectItem value="15m">15m</SelectItem>
          <SelectItem value="1h">1h</SelectItem>
          <SelectItem value="4h">4h</SelectItem>
          <SelectItem value="1d">1d</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <BarChart2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
