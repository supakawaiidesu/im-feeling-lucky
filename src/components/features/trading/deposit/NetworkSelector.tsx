import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { NetworkType, NetworkSelectorProps } from "./types";

export function NetworkSelector({ selectedNetwork, onNetworkChange }: NetworkSelectorProps) {
  return (
    <Select
      value={selectedNetwork}
      onValueChange={(value: NetworkType) => onNetworkChange(value)}
    >
      <SelectTrigger className="w-[180px] mt-2">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{
              backgroundColor:
                selectedNetwork === "arbitrum" ? "#28A0F0" : "#FF0420",
            }}
          />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="arbitrum">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#28A0F0]" />
            <span>Arbitrum</span>
          </div>
        </SelectItem>
        <SelectItem value="optimism">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#FF0420]" />
            <span>Optimism</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
