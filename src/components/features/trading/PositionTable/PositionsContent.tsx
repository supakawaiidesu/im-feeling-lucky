import { Position } from "../../../../hooks/use-positions";
import { Button } from "../../../ui/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { usePrices } from "../../../../lib/websocket-price-context";

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
  const { prices } = usePrices();

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

  const calculatePnLPercentage = (pnl: number, margin: string) => {
    const marginValue = parseFloat(margin.replace(/[^0-9.-]/g, ""));
    return ((pnl / marginValue) * 100).toFixed(2);
  };

  const calculateLeverage = (size: string, margin: string) => {
    const sizeValue = parseFloat(size.replace(/[^0-9.-]/g, ""));
    const marginValue = parseFloat(margin.replace(/[^0-9.-]/g, ""));
    return (sizeValue / marginValue).toFixed(1);
  };

  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead>Market</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Margin</TableHead>
          <TableHead>Open Price</TableHead>
          <TableHead>Price</TableHead>
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
            const pnlValue = parseFloat(finalPnl);
            const leverage = calculateLeverage(position.size, position.margin);
            const pnlPercentage = calculatePnLPercentage(pnlValue, position.margin);
            const basePair = position.market.split("/")[0].toLowerCase();
            const currentPrice = prices[basePair]?.price;

            return (
              <TableRow key={position.positionId}>
                <TableCell>
                  <div>{position.market}</div>
                  <div className={position.isLong ? "text-green-500" : "text-red-500"}>
                    {leverage}x {position.isLong ? "Long" : "Short"}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{position.size}</div>
                  <div className="text-sm text-muted-foreground">
                    ${(parseFloat(position.size) * parseFloat(position.entryPrice)).toFixed(2)}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{position.margin}</div>
                </TableCell>
                <TableCell>
                  <div>{position.entryPrice}</div>
                </TableCell>
                <TableCell>
                  <div>{currentPrice?.toFixed(2) || "Loading..."}</div>
                  <div className="text-red-500">{position.liquidationPrice}</div>
                </TableCell>
                <TableCell
                  ref={setRef(position.positionId)}
                  className={pnlValue >= 0 ? "text-green-500" : "text-red-500"}
                  onMouseEnter={() => handleMouseEnter(position.positionId)}
                  onMouseLeave={() => setHoveredPosition(null)}
                >
                  <div>{formatPnL(finalPnl)}</div>
                  <div>{pnlPercentage}%</div>
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
