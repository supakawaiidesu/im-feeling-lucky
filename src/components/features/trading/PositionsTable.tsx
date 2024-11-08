import { Button } from "../../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"

interface Position {
  market: string
  size: string
  entryPrice: string
  markPrice: string
  pnl: string
}

interface PositionsTableProps {
  positions: Position[]
}

export function PositionsTable({ positions }: PositionsTableProps) {
  return (
    <div className="mx-4 mb-4 border rounded-lg">
      <div className="flex items-center p-2 border-b">
        <Button variant="ghost" size="sm">
          Positions
        </Button>
        <Button variant="ghost" size="sm">
          Orders
        </Button>
        <Button variant="ghost" size="sm">
          Trades
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Market</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Entry Price</TableHead>
            <TableHead>Mark Price</TableHead>
            <TableHead>Unrealized PNL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((position, index) => (
            <TableRow key={index}>
              <TableCell>{position.market}</TableCell>
              <TableCell>{position.size}</TableCell>
              <TableCell>{position.entryPrice}</TableCell>
              <TableCell>{position.markPrice}</TableCell>
              <TableCell className="text-green-500">{position.pnl}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
