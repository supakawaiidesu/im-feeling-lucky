import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { NetworkType, NetworkSelectorProps } from "./types";
import { TokenIcon } from "@/hooks/use-token-icon";

export function NetworkSelector({ selectedNetwork, onNetworkChange }: NetworkSelectorProps) {
  return (
    <Select
      value={selectedNetwork}
      onValueChange={(value: NetworkType) => onNetworkChange(value)}
    >
      <SelectTrigger className="w-[180px] mt-2">
        <div className="flex items-center gap-2">
          <TokenIcon 
            pair={selectedNetwork === "arbitrum" ? "ARB/USD" : "OP/USD"}
            size={16}
          />
          <span className="capitalize">{selectedNetwork}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="arbitrum">
          <div className="flex items-center gap-2">
            <TokenIcon pair="ARB/USD" size={16} />
            <span>Arbitrum</span>
          </div>
        </SelectItem>
        <SelectItem value="optimism">
          <div className="flex items-center gap-2">
            <TokenIcon pair="OP/USD" size={16} />
            <span>Optimism</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
