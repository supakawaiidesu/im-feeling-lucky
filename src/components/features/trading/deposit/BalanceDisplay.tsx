import { Card, CardContent } from "@/components/ui/card";

interface BalanceDisplayItemProps {
  title: string;
  address: string | undefined;
  balance: string;
  isLoading: boolean;
  isEffectivelyInitialized?: boolean;
  network?: "arbitrum" | "optimism";
}

function BalanceDisplayItem({
  title,
  address,
  balance,
  isLoading,
  isEffectivelyInitialized = true,
  network,
}: BalanceDisplayItemProps) {
  const showConnectionStatus = title === "1CT Wallet";
  const displayAddress = showConnectionStatus
    ? isEffectivelyInitialized
      ? address
      : "Not connected"
    : address || "Not connected";

  const truncateAddress = (addr: string | undefined) => {
    if (!addr || addr === "Not connected") return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const networkDot = network && title === "Web Wallet" && (
    <div
      className="inline-block w-2 h-2 mr-1 rounded-full"
      style={{
        backgroundColor: network === "arbitrum" ? "#28A0F0" : "#FF0420",
      }}
    />
  );

  if (title === "UniDex V4 Balance") {
    return (
      <Card className="h-full bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{title}:</span>
            <span className="font-medium">
              {isLoading ? "Loading..." : `${balance} USDC`}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-muted/30">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {networkDot}
              {title}:
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {truncateAddress(displayAddress)}
            </span>
          </div>
          <div className="font-medium">
            {isLoading ? "Loading..." : `${balance} USDC`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BalanceDisplayProps {
  eoaAddress: string | undefined;
  smartAccountAddress: string | undefined;
  eoaBalance: string;
  smartAccountBalance: string;
  marginBalance: string;
  isLoading: boolean;
  isEffectivelyInitialized: boolean;
  selectedNetwork: "arbitrum" | "optimism";
}

export function BalanceDisplay({
  eoaAddress,
  smartAccountAddress,
  eoaBalance,
  smartAccountBalance,
  marginBalance,
  isLoading,
  isEffectivelyInitialized,
  selectedNetwork,
}: BalanceDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <BalanceDisplayItem
          title="Web Wallet"
          address={eoaAddress}
          balance={eoaBalance}
          isLoading={isLoading}
        />
        <BalanceDisplayItem
          title="1CT Wallet"
          address={smartAccountAddress}
          balance={smartAccountBalance}
          isLoading={isLoading}
          isEffectivelyInitialized={isEffectivelyInitialized}
        />
      </div>
      <BalanceDisplayItem
        title="UniDex V4 Balance"
        address=""
        balance={marginBalance}
        isLoading={isLoading}
      />
    </div>
  );
}
