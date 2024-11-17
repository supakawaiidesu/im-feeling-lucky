import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { useTradeHistory } from "../../../../hooks/use-trade-history";
import { Bitcoin } from "lucide-react";

interface TradeHistory {
  pair: string;
  isLong: boolean;
  size: string;
  margin: string;
  entryPrice: string;
  closePrice: string;
  pnl: string;
  date: string;
}

export function TradesContent() {
  const { trades, loading, error } = useTradeHistory();

  const formatNumber = (value: string) => {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculatePnlPercentage = (pnl: string, margin: string) => {
    const pnlValue = parseFloat(pnl);
    const marginValue = parseFloat(margin);
    return ((pnlValue / marginValue) * 100).toFixed(2);
  };

  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead>Market</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Margin</TableHead>
          <TableHead>Entry Price</TableHead>
          <TableHead>Close Price</TableHead>
          <TableHead>PnL</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading && trades.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">Loading trades...</TableCell>
          </TableRow>
        ) : error ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-red-500">{error.message}</TableCell>
          </TableRow>
        ) : trades.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">No trade history</TableCell>
          </TableRow>
        ) : (
          trades.map((trade: TradeHistory, index) => (
            <TableRow key={index}>
              <TableCell>
                <div>{trade.pair}</div>
                <div className={trade.isLong ? "text-green-500" : "text-red-500"}>
                  {(parseFloat(trade.size) / parseFloat(trade.margin)).toFixed(1)}x {trade.isLong ? "Long" : "Short"}
                </div>
              </TableCell>
              <TableCell>{trade.date}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>${formatNumber(trade.size)}</span>
                  <span className="text-xs text-zinc-400">
                    {(parseFloat(trade.size) / parseFloat(trade.entryPrice)).toFixed(6)} {trade.pair.split('/')[0]}
                  </span>
                </div>
              </TableCell>
              <TableCell>${formatNumber(trade.margin)}</TableCell>
              <TableCell>${formatNumber(trade.entryPrice)}</TableCell>
              <TableCell>${formatNumber(trade.closePrice)}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className={Number(trade.pnl) >= 0 ? "text-emerald-500" : "text-red-500"}>
                    {Number(trade.pnl) >= 0 ? "+$" : "-$"}{Math.abs(Number(trade.pnl)).toFixed(2)}
                  </span>
                  <span className={`text-xs ${Number(trade.pnl) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {Number(trade.pnl) >= 0 ? "+" : ""}
                    {calculatePnlPercentage(trade.pnl, trade.margin)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </>
  );
}
