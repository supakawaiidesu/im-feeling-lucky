import { Position } from "../../../../hooks/use-positions";
import { Button } from "../../../ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";

interface PositionsContentProps {
  positions: Position[];
  loading: boolean;
  error: Error | null;
  closingPositions: { [key: number]: boolean };
  handleClosePosition: (position: Position) => void;
  setRef: (positionId: string) => (el: HTMLTableCellElement | null) => void;
  handleMouseEnter: (positionId: string) => void;
  setHoveredPosition: (positionId: string | null) => void;
}

export function PositionsContent({
  positions,
  loading,
  error,
  closingPositions,
  handleClosePosition,
  setRef,
  handleMouseEnter,
  setHoveredPosition,
}: PositionsContentProps) {
  const calculateFinalPnl = (position: Position) => {
    const pnlWithoutFees = parseFloat(position.pnl.replace(/[^0-9.-]/g, ""));
    const totalFees =
      parseFloat(position.fees.positionFee) +
      parseFloat(position.fees.borrowFee) +
      parseFloat(position.fees.fundingFee);
    return (pnlWithoutFees - totalFees).toFixed(2);
  };

  const formatPnL = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return numValue >= 0
      ? `$${numValue.toFixed(2)}`
      : `-$${Math.abs(numValue).toFixed(2)}`;
  };

  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead>Market</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Margin</TableHead>
          <TableHead>Entry Price</TableHead>
          <TableHead>Liq. Price</TableHead>
          <TableHead>uPnL</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              Loading positions...
            </TableCell>
          </TableRow>
        ) : error ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-red-500">
              {error.message}
            </TableCell>
          </TableRow>
        ) : positions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              No open positions
            </TableCell>
          </TableRow>
        ) : (
          positions.map((position) => {
            const finalPnl = calculateFinalPnl(position);
            return (
              <TableRow key={position.positionId}>
                <TableCell>{position.market}</TableCell>
                <TableCell
                  className={position.isLong ? "text-green-500" : "text-red-500"}
                >
                  {position.isLong ? "+" : "-"}
                  {position.size}
                </TableCell>
                <TableCell>{position.margin}</TableCell>
                <TableCell>{position.entryPrice}</TableCell>
                <TableCell className="text-red-500">
                  {position.liquidationPrice}
                </TableCell>
                <TableCell
                  ref={setRef(position.positionId)}
                  className={
                    parseFloat(finalPnl) >= 0 ? "text-green-500" : "text-red-500"
                  }
                  onMouseEnter={() => handleMouseEnter(position.positionId)}
                  onMouseLeave={() => setHoveredPosition(null)}
                >
                  {formatPnL(finalPnl)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleClosePosition(position)}
                    disabled={closingPositions[Number(position.positionId)]}
                  >
                    {closingPositions[Number(position.positionId)]
                      ? "Closing..."
                      : "Close"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </>
  );
}
