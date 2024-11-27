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
import { useState } from "react";
import { PositionDialog } from "./PositionDialog";
import { PositionCollateralDialog } from "./PositionCollateralDialog";

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
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCollateralDialogOpen, setIsCollateralDialogOpen] = useState(false);
  const [selectedCollateralPosition, setSelectedCollateralPosition] = useState<Position | null>(null);

  const formatNumber = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US').format(numValue);
  };

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
      ? `$${formatNumber(numValue.toFixed(2))}`
      : `-$${formatNumber(Math.abs(numValue).toFixed(2))}`;
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

  const handleRowClick = (position: Position) => {
    setSelectedPosition(position);
    setIsDialogOpen(true);
  };

  const handleOpenCollateral = () => {
    if (selectedPosition) {
      setSelectedCollateralPosition(selectedPosition);
      setIsCollateralDialogOpen(true);
    }
  };

  return (
    <>
      <TableHeader className="hidden md:table-header-group">
        <TableRow>
          <TableHead>Pair</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Margin</TableHead>
          <TableHead>Entry Price</TableHead>
          <TableHead>Market/Liq. Price</TableHead>
          <TableHead>uPnL</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              Loading positions...
            </TableCell>
          </TableRow>
        ) : error ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-red-500">
              {error.message}
            </TableCell>
          </TableRow>
        ) : positions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center">
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
              <TableRow 
                key={position.positionId}
                className="cursor-pointer hover:[background-color:#1f1f29] md:table-row flex flex-col border-b"
                onClick={() => handleRowClick(position)}
              >
                <TableCell className="flex flex-col md:table-cell md:block">
                  <div className="flex items-center justify-between">
                    <div>
                      <div>{position.market}</div>
                      <div className={position.isLong ? "text-green-500" : "text-red-500"}>
                        {leverage}x {position.isLong ? "Long" : "Short"}
                      </div>
                    </div>
                    <div className="md:hidden" onClick={(e) => e.stopPropagation()}>
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
                    </div>
                  </div>
                </TableCell>
                <TableCell className="flex justify-between md:table-cell">
                  <span className="md:hidden">Size:</span>
                  <div>
                    <div>${formatNumber(position.size)}</div>
                    <div className="hidden text-muted-foreground md:block">
                      {(parseFloat(position.size) / parseFloat(position.entryPrice)).toFixed(6)} {basePair.toUpperCase()}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="flex justify-between md:hidden">
                  <span>Notional Size:</span>
                  <div className="text-muted-foreground">
                    {(parseFloat(position.size) / parseFloat(position.entryPrice)).toFixed(6)} {basePair.toUpperCase()}
                  </div>
                </TableCell>
                <TableCell className="flex justify-between md:table-cell">
                  <span className="md:hidden">Margin:</span>
                  <div>${formatNumber(position.margin)}</div>
                </TableCell>
                <TableCell className="flex justify-between md:table-cell">
                  <span className="md:hidden">Entry Price:</span>
                  <div>${formatNumber(position.entryPrice)}</div>
                </TableCell>
                <TableCell className="flex justify-between md:table-cell">
                  <span className="md:hidden">Market Price:</span>
                  <div>
                    <div>{currentPrice ? `$${formatNumber(currentPrice.toFixed(2))}` : "Loading..."}</div>
                    <div className="hidden text-red-500 md:block">
                      ${formatNumber(position.liquidationPrice)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="flex justify-between md:hidden">
                  <span>Liquidation Price:</span>
                  <div className="text-red-500">
                    ${formatNumber(position.liquidationPrice)}
                  </div>
                </TableCell>
                <TableCell
                  ref={setRef(position.positionId)}
                  className={`md:table-cell flex justify-between ${pnlValue >= 0 ? "text-green-500" : "text-red-500"}`}
                  onMouseEnter={() => handleMouseEnter(position.positionId)}
                  onMouseLeave={() => setHoveredPosition(null)}
                >
                  <span className="md:hidden">PnL:</span>
                  <div>
                    <div>{formatPnL(finalPnl)}</div>
                    <div>{pnlPercentage}%</div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
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

      <PositionDialog
        position={selectedPosition}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedPosition(null);
        }}
        onClosePosition={handleClosePosition}
        isClosing={selectedPosition ? closingPositions[Number(selectedPosition.positionId)] : false}
        onOpenCollateral={handleOpenCollateral}
      />

      <PositionCollateralDialog
        position={selectedCollateralPosition}
        isOpen={isCollateralDialogOpen}
        onClose={() => {
          setIsCollateralDialogOpen(false);
          setSelectedCollateralPosition(null);
        }}
      />
    </>
  );
}
