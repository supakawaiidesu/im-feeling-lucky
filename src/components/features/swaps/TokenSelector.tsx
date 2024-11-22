"use client";

import { Search, X } from "lucide-react";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTokenList, type Token } from "@/hooks/use-token-list";
import { useTokenListBalances } from "@/hooks/use-tokenlist-balances";

interface TokenWithBalance extends Token {
  balance?: bigint;
  formattedBalance?: string;
}

interface TokenSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
}

export function TokenSelector({ open, onClose, onSelect }: TokenSelectorProps) {
  const [search, setSearch] = React.useState("");
  const { tokens, isLoading: tokensLoading } = useTokenList();
  const { balances } = useTokenListBalances(tokens);

  // Filter and deduplicate tokens based on the search input
  const displayedTokens = React.useMemo(() => {
    if (tokensLoading || !tokens) return [];

    const searchTerm = search.toLowerCase().trim();
    if (!searchTerm) return tokens;

    // Filter tokens
    const filteredTokens = tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(searchTerm) ||
        token.name.toLowerCase().includes(searchTerm)
    );

    // Deduplicate by address
    return filteredTokens.filter(
      (token, index, self) =>
        index === self.findIndex((t) => t.address === token.address)
    );
  }, [tokens, search, tokensLoading]);

  // Memoize tokens with balances to prevent unnecessary re-renders
  const tokensWithBalances = React.useMemo(() => {
    return displayedTokens.map(token => {
      const balance = balances?.find(b => b.address === token.address);
      return {
        ...token,
        balance: balance?.balance,
        formattedBalance: balance?.formattedBalance
      } as TokenWithBalance;
    });
  }, [displayedTokens, balances]);

  // Clear search on dialog close
  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[420px] bg-black text-white border-neutral-800">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Select a token</DialogTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>
        <div className="relative">
          <Input
            placeholder="Search name or paste address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-neutral-900 pl-9"
            autoFocus
          />
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-neutral-500" />
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-full size-4 bg-neutral-700" />
              <span className="text-sm text-neutral-400">
                {search
                  ? `Found ${tokensWithBalances.length} ${
                      tokensWithBalances.length === 1 ? "token" : "tokens"
                    }`
                  : `All tokens (${tokens?.length || 0})`}
              </span>
            </div>
            <div key={search} className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
              {tokensLoading ? (
                <div className="p-4 text-center">Loading tokens...</div>
              ) : tokensWithBalances.length === 0 ? (
                <div className="p-4 text-center text-neutral-400">
                  No tokens found
                </div>
              ) : (
                tokensWithBalances.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => {
                      // Only pass the Token properties, not the balance info
                      const { balance, formattedBalance, ...tokenWithoutBalance } = token;
                      onSelect(tokenWithoutBalance);
                      onClose();
                    }}
                    className="flex items-center w-full gap-3 p-2 rounded-lg hover:bg-neutral-900"
                  >
                    <img
                      src={token.icon}
                      alt={token.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 text-left">
                      <div>{token.name}</div>
                      <div className="text-sm text-neutral-400">
                        {token.symbol}
                      </div>
                    </div>
                    {token.formattedBalance && (
                      <div className="text-sm text-right text-neutral-400">
                        {token.formattedBalance}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
