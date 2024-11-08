import { Button } from "../../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { usePositions, Position } from "../../../hooks/use-positions"
import { useState } from "react"

interface PositionsTableProps {
  address: string | undefined;
}

export function PositionsTable({ address }: PositionsTableProps) {
  const { positions, loading, error } = usePositions(address);
  const [hoveredPosition, setHoveredPosition] = useState<string | null>(null);

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
            <TableHead>Margin</TableHead>
            <TableHead>Entry Price</TableHead>
            <TableHead>Mark Price</TableHead>
            <TableHead>Liq. Price</TableHead>
            <TableHead>PNL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">Loading positions...</TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-red-500">{error}</TableCell>
            </TableRow>
          ) : positions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">No open positions</TableCell>
            </TableRow>
          ) : (
            positions.map((position) => (
              <TableRow 
                key={position.positionId}
                className="relative group"
                onMouseEnter={() => setHoveredPosition(position.positionId)}
                onMouseLeave={() => setHoveredPosition(null)}
              >
                <TableCell>{position.market}</TableCell>
                <TableCell className={position.isLong ? "text-green-500" : "text-red-500"}>
                  {position.isLong ? "+" : "-"}{position.size}
                </TableCell>
                <TableCell>{position.margin}</TableCell>
                <TableCell>{position.entryPrice}</TableCell>
                <TableCell>{position.markPrice}</TableCell>
                <TableCell className="text-red-500">{position.liquidationPrice}</TableCell>
                <TableCell 
                  className={position.pnl.startsWith('+') ? "text-green-500" : "text-red-500"}
                >
                  {position.pnl}
                  {hoveredPosition === position.positionId && (
                    <div className="absolute z-50 bg-gray-900 text-white p-4 rounded-lg shadow-lg right-0 mt-2 min-w-[250px]">
                      <h4 className="mb-2 font-semibold">Fee Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Position Fee:</span>
                          <span className="text-red-400">
                            ${position.fees.positionFee}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Borrow Fee:</span>
                          <span className="text-red-400">
                            ${position.fees.borrowFee}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Funding Fee:</span>
                          <span className={position.fees.fundingFee.startsWith('-') ? "text-green-400" : "text-red-400"}>
                            ${position.fees.fundingFee}
                          </span>
                        </div>
                        <div className="pt-2 mt-2 border-t">
                          <div className="flex justify-between font-semibold">
                            <span>Total Fees:</span>
                            <span className="text-red-400">
                              ${(
                                parseFloat(position.fees.positionFee) +
                                parseFloat(position.fees.borrowFee) +
                                parseFloat(position.fees.fundingFee)
                              ).toFixed(6)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
