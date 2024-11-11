import { Button } from "../../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { usePositions, Position } from "../../../hooks/use-positions"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { usePositionActions } from "../../../hooks/use-position-actions"

interface PositionsTableProps {
  address: string | undefined;
}

export function PositionsTable({ address }: PositionsTableProps) {
  const { positions, loading, error } = usePositions();
  const { closePosition, closingPositions } = usePositionActions();
  const [hoveredPosition, setHoveredPosition] = useState<string | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const cellRefs = useRef<{ [key: string]: HTMLTableCellElement | null }>({});

  useEffect(() => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.zIndex = '9999';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      document.body.removeChild(container);
    };
  }, []);

  const handleMouseEnter = (positionId: string) => {
    const cell = cellRefs.current[positionId];
    if (cell) {
      setHoveredPosition(positionId);
    }
  };

  const setRef = (positionId: string) => (el: HTMLTableCellElement | null) => {
    cellRefs.current[positionId] = el;
  };

  const handleClosePosition = (position: Position) => {
    // Parse the size value to a number and pass it to closePosition
    const positionSize = parseFloat(position.size);
    closePosition(
      Number(position.positionId), 
      position.isLong, 
      Number(position.markPrice),
      positionSize
    );
  };

  const calculateFinalPnl = (position: Position) => {
    const pnlWithoutFees = parseFloat(position.pnl.replace(/[^0-9.-]/g, ''));
    const totalFees = (
      parseFloat(position.fees.positionFee) +
      parseFloat(position.fees.borrowFee) +
      parseFloat(position.fees.fundingFee)
    );
    return (pnlWithoutFees - totalFees).toFixed(2);
  };

  const formatPnL = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue >= 0 ? `$${numValue.toFixed(2)}` : `-$${Math.abs(numValue).toFixed(2)}`;
  };

  return (
    <div className="mb-4 border rounded-lg bg-[hsl(var(--component-background))]">
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
            <TableHead>uPnL</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">Loading positions...</TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-red-500">{error.message}</TableCell>
            </TableRow>
          ) : positions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">No open positions</TableCell>
            </TableRow>
          ) : (
            positions.map((position) => {
              const finalPnl = calculateFinalPnl(position);
              return (
                <TableRow key={position.positionId}>
                  <TableCell>{position.market}</TableCell>
                  <TableCell className={position.isLong ? "text-green-500" : "text-red-500"}>
                    {position.isLong ? "+" : "-"}{position.size}
                  </TableCell>
                  <TableCell>{position.margin}</TableCell>
                  <TableCell>{position.entryPrice}</TableCell>
                  <TableCell>{position.markPrice}</TableCell>
                  <TableCell className="text-red-500">{position.liquidationPrice}</TableCell>
                  <TableCell 
                    ref={setRef(position.positionId)}
                    className={parseFloat(finalPnl) >= 0 ? "text-green-500" : "text-red-500"}
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
                      {closingPositions[Number(position.positionId)] ? 'Closing...' : 'Close'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {portalContainer && hoveredPosition && createPortal(
        (() => {
          const cell = cellRefs.current[hoveredPosition];
          if (!cell) return null;

          const rect = cell.getBoundingClientRect();
          const position = positions.find(p => p.positionId === hoveredPosition);
          if (!position) return null;

          // Calculate total fees
          const totalFees = (
            parseFloat(position.fees.positionFee) +
            parseFloat(position.fees.borrowFee) +
            parseFloat(position.fees.fundingFee)
          ).toFixed(2);

          // Parse PnL value by removing any non-numeric characters except decimal point and minus sign
          const pnlWithoutFees = parseFloat(position.pnl.replace(/[^0-9.-]/g, ''));
          
          // Calculate final PnL (after fees)
          const finalPnl = (pnlWithoutFees - parseFloat(totalFees)).toFixed(2);

          return (
            <div 
              className="p-4 text-white rounded-lg shadow-lg"
              style={{
                position: 'fixed',
                left: `${rect.left}px`,
                top: `${rect.top - 8}px`,
                transform: 'translateY(-100%)',
                minWidth: '250px',
                pointerEvents: 'none',
                backgroundColor: '#16161d'
              }}
            >
              <div className="space-y-2">
                <h4 className="mb-2 font-semibold">PnL Breakdown</h4>
                <div className="flex justify-between">
                  <span>Market PnL:</span>
                  <span className={pnlWithoutFees >= 0 ? "text-green-400" : "text-red-400"}>
                    {formatPnL(pnlWithoutFees)}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-700">
                  <div className="flex justify-between">
                    <span>Position Fee:</span>
                    <span className="text-red-400">
                      -${position.fees.positionFee}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Borrow Fee:</span>
                    <span className="text-red-400">
                      -${position.fees.borrowFee}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Funding Fee:</span>
                    <span className={position.fees.fundingFee.startsWith('-') ? "text-green-400" : "text-red-400"}>
                      {position.fees.fundingFee.startsWith('-') ? 
                        `-$${position.fees.fundingFee.substring(1)}` : 
                        `$${position.fees.fundingFee}`}
                    </span>
                  </div>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-700">
                  <div className="flex justify-between font-semibold">
                    <span>Final PnL:</span>
                    <span className={parseFloat(finalPnl) >= 0 ? "text-green-400" : "text-red-400"}>
                      {formatPnL(finalPnl)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })(),
        portalContainer
      )}
    </div>
  )
}
