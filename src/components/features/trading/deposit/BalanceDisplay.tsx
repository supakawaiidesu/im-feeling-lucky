interface BalanceDisplayItemProps {
  title: string
  address: string | undefined
  balance: string
  isLoading: boolean
}

function BalanceDisplayItem({ title, address, balance, isLoading }: BalanceDisplayItemProps) {
  return (
    <div>
      <div className="font-medium mb-1.5">{title}</div>
      <div className="truncate">{address || 'Not connected'}</div>
      <div className="mt-1 font-medium">
        {isLoading ? 'Loading...' : `${balance} USDC`}
      </div>
    </div>
  )
}

interface BalanceDisplayProps {
  eoaAddress: string | undefined
  smartAccountAddress: string | undefined
  eoaBalance: string
  smartAccountBalance: string
  marginBalance: string
  isLoading: boolean
}

export function BalanceDisplay({
  eoaAddress,
  smartAccountAddress,
  eoaBalance,
  smartAccountBalance,
  marginBalance,
  isLoading
}: BalanceDisplayProps) {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 text-sm rounded-lg bg-muted/50">
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
      />
      <BalanceDisplayItem
        title="Margin Balance"
        address="Deposited Balance"
        balance={marginBalance}
        isLoading={isLoading}
      />
    </div>
  )
}
