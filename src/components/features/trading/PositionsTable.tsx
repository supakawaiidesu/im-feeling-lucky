import { Button } from "../../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { usePositions, Position } from "../../../hooks/use-positions";
import { useOrders } from "../../../hooks/use-orders";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePositionActions } from "../../../hooks/use-position-actions";

interface PositionsTableProps {
  address: string | undefined;
}

type ActiveTab = "positions" | "orders" | "trades";

export function PositionsTable({ address }: PositionsTableProps) {
  const {
    positions,
    loading: positionsLoading,
    error: positionsError,
  } = usePositions();
  const {
    orders,
    triggerOrders,
    loading: ordersLoading,
    error: ordersError,
  } = useOrders();
  const { closePosition, closingPositions } = usePositionActions();
  const [activeTab, setActiveTab] = useState<ActiveTab>("positions");
  const [hoveredPosition, setHoveredPosition] = useState<string | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const cellRefs = useRef<{ [key: string]: HTMLTableCellElement | null }>({});

  useEffect(() => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.zIndex = "9999";
    container.style.pointerEvents = "none";
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
    const positionSize = parseFloat(position.size);
    closePosition(
      Number(position.positionId),
      position.isLong,
      Number(position.markPrice),
      positionSize
    );
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
      ? `$${numValue.toFixed(2)}`
      : `-$${Math.abs(numValue).toFixed(2)}`;
  };

  const renderTableContent = () => {
    switch (activeTab) {
      case "positions":
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
              {positionsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading positions...
                  </TableCell>
                </TableRow>
              ) : positionsError ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-red-500">
                    {positionsError.message}
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
                        className={
                          position.isLong ? "text-green-500" : "text-red-500"
                        }
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
                          parseFloat(finalPnl) >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }
                        onMouseEnter={() =>
                          handleMouseEnter(position.positionId)
                        }
                        onMouseLeave={() => setHoveredPosition(null)}
                      >
                        {formatPnL(finalPnl)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleClosePosition(position)}
                          disabled={
                            closingPositions[Number(position.positionId)]
                          }
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

      case "orders":
        return (
          <>
            <TableHeader>
              <TableRow>
                <TableHead>Market</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Limit Price</TableHead>
                <TableHead>Stop Price</TableHead>
                <TableHead>Stop Loss</TableHead>
                <TableHead>Take Profit</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : ordersError ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-red-500">
                    {ordersError.message}
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 &&
                (!triggerOrders || triggerOrders.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No open orders
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {/* Regular Orders */}
                  {orders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell>{order.market}</TableCell>
                      <TableCell>{order.type}</TableCell>
                      <TableCell
                        className={
                          order.isLong ? "text-green-500" : "text-red-500"
                        }
                      >
                        {order.isLong ? "+" : "-"}
                        {order.size}
                      </TableCell>
                      <TableCell>{order.margin}</TableCell>
                      <TableCell>
                        {order.limitPrice !== "0.00" ? order.limitPrice : "-"}
                      </TableCell>
                      <TableCell>
                        {order.stopPrice !== "0.00" ? order.stopPrice : "-"}
                      </TableCell>
                      <TableCell className="text-red-500">-</TableCell>
                      <TableCell className="text-green-500">-</TableCell>
                      <TableCell>{order.timestamp}</TableCell>
                    </TableRow>
                  ))}

                  {/* Trigger Orders */}
                  {triggerOrders?.map((order) => (
                    <TableRow key={`trigger-${order.positionId}`}>
                      <TableCell>{order.market}</TableCell>
                      <TableCell>Trigger</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-red-500">
                        {order.stopLoss
                          ? `${order.stopLoss.price} (${order.stopLoss.size}%)`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-green-500">
                        {order.takeProfit
                          ? `${order.takeProfit.price} (${order.takeProfit.size}%)`
                          : "-"}
                      </TableCell>
                      <TableCell>{order.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </>
        );

      case "trades":
        return (
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                Trade history coming soon
              </TableCell>
            </TableRow>
          </TableBody>
        );
    }
  };

  return (
    <div className="mb-4 border rounded-lg bg-[hsl(var(--component-background))]">
      <div className="flex items-center p-2 border-b">
        <Button
          variant={activeTab === "positions" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("positions")}
        >
          Positions
        </Button>
        <Button
          variant={activeTab === "orders" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </Button>
        <Button
          variant={activeTab === "trades" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("trades")}
        >
          Trades
        </Button>
      </div>
      <Table>{renderTableContent()}</Table>

      {portalContainer &&
        hoveredPosition &&
        createPortal(
          (() => {
            const cell = cellRefs.current[hoveredPosition];
            if (!cell) return null;

            const rect = cell.getBoundingClientRect();
            const position = positions.find(
              (p) => p.positionId === hoveredPosition
            );
            if (!position) return null;

            const totalFees = (
              parseFloat(position.fees.positionFee) +
              parseFloat(position.fees.borrowFee) +
              parseFloat(position.fees.fundingFee)
            ).toFixed(2);

            const pnlWithoutFees = parseFloat(
              position.pnl.replace(/[^0-9.-]/g, "")
            );
            const finalPnl = (pnlWithoutFees - parseFloat(totalFees)).toFixed(
              2
            );

            return (
              <div
                className="p-4 text-white rounded-lg shadow-lg"
                style={{
                  position: "fixed",
                  left: `${rect.left}px`,
                  top: `${rect.top - 8}px`,
                  transform: "translateY(-100%)",
                  minWidth: "250px",
                  pointerEvents: "none",
                  backgroundColor: "#16161d",
                }}
              >
                <div className="space-y-2">
                  <h4 className="mb-2 font-semibold">PnL Breakdown</h4>
                  <div className="flex justify-between">
                    <span>Market PnL:</span>
                    <span
                      className={
                        pnlWithoutFees >= 0 ? "text-green-400" : "text-red-400"
                      }
                    >
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
                      <span
                        className={
                          position.fees.fundingFee.startsWith("-")
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {position.fees.fundingFee.startsWith("-")
                          ? `-$${position.fees.fundingFee.substring(1)}`
                          : `$${position.fees.fundingFee}`}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-700">
                    <div className="flex justify-between font-semibold">
                      <span>Final PnL:</span>
                      <span
                        className={
                          parseFloat(finalPnl) >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
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
  );
}
