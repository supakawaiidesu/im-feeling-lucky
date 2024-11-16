# Hooks Documentation

This document provides detailed information about the custom React hooks used in the application.

## Table of Contents

1. [useBalances](#usebalances)
2. [useMarketData](#usemarketdata)
3. [useMarketOrderActions](#usemarketorderactions)
4. [useNetworkSwitch](#usenetworkswitch)
5. [useOrders](#useorders)
6. [usePositionActions](#usepositionactions)
7. [usePositions](#usepositions)
8. [useSmartAccount](#usesmartaccount)
9. [useToast](#usetoast)
10. [useTokenIcon](#usetokenicon)
11. [useTokenTransferActions](#usetokentransferactions)

## useBalances

**Purpose**: Manages user balances across different tokens and networks.

**Features**:
- Fetches ETH, USDC, and mUSD balances
- Handles balance formatting
- Supports both Arbitrum and Optimism networks
- Provides real-time balance updates

**Usage Example**:
```typescript
const { balances, isError, isLoading, refetchBalances } = useBalances('arbitrum');

// Access balances
console.log(balances.formattedEthBalance);    // ETH balance
console.log(balances.formattedUsdcBalance);   // USDC balance
console.log(balances.formattedMusdBalance);   // mUSD balance
```

## useMarketData

**Purpose**: Handles market data for trading pairs.

**Features**:
- Fetches real-time market data
- Provides funding rates, trading fees, and interest rates
- Calculates utilization rates and liquidity
- Supports multiple trading pairs

**Usage Example**:
```typescript
const { marketData, allMarkets, loading, error, refetch } = useMarketData({
  pollInterval: 10000,
  selectedPair: 'BTC/USD'
});

// Access market data
console.log(marketData.fundingRate);          // Current funding rate
console.log(marketData.utilization);          // Market utilization
```

## useMarketOrderActions

**Purpose**: Handles market order actions like placing and managing orders.

**Features**:
- Place market orders
- Place limit orders
- Handle order validation
- Manage transaction states

**Usage Example**:
```typescript
const { placeMarketOrder, placeLimitOrder, placingOrders } = useMarketOrderActions();

// Place a market order
await placeMarketOrder(
  1,              // pair ID
  true,           // isLong
  50000,          // currentPrice
  1,              // slippagePercent
  1000,           // margin
  2000            // size
);
```

## useNetworkSwitch

**Purpose**: Manages network switching functionality.

**Features**:
- Switch between supported networks
- Handle network switching errors
- Ensure correct network connection

**Usage Example**:
```typescript
const { success, error } = await ensureArbitrumNetwork(
  currentChainId,
  walletClient
);
```

## useOrders

**Purpose**: Manages user's open orders and trigger orders.

**Features**:
- Fetch open orders
- Track trigger orders (Take Profit/Stop Loss)
- Real-time order updates
- Order status management

**Usage Example**:
```typescript
const { orders, triggerOrders, loading, error, refetch } = useOrders();

// Access orders
console.log(orders);         // List of open orders
console.log(triggerOrders);  // List of trigger orders
```

## usePositionActions

**Purpose**: Handles position-related actions.

**Features**:
- Close positions
- Add Take Profit/Stop Loss
- Modify collateral
- Handle position transactions

**Usage Example**:
```typescript
const {
  closePosition,
  closingPositions,
  addTPSL,
  settingTPSL,
  modifyCollateral,
  modifyingCollateral
} = usePositionActions();

// Close a position
await closePosition(
  positionId,
  isLong,
  currentPrice,
  size
);
```

## usePositions

**Purpose**: Manages user's trading positions.

**Features**:
- Fetch active positions
- Calculate PnL
- Track position metrics
- Real-time position updates

**Usage Example**:
```typescript
const { positions, loading, error, refetch } = usePositions();

// Access positions
console.log(positions);  // List of active positions
```

## useSmartAccount

**Purpose**: Manages smart account functionality.

**Features**:
- Initialize smart account
- Handle session keys
- Manage account state
- Network switching support

**Usage Example**:
```typescript
const {
  smartAccount,
  kernelClient,
  isLoading,
  error,
  setupSessionKey,
  isSigningSessionKey,
  sessionKeyAddress,
  isInitialized,
  isInitializing
} = useSmartAccount();
```

## useToast

**Purpose**: Provides toast notification functionality.

**Features**:
- Show success/error notifications
- Customizable duration
- Multiple toast types
- Queue management

**Usage Example**:
```typescript
const { toast } = useToast();

toast({
  title: "Success",
  description: "Operation completed successfully",
  variant: "default"
});
```

## useTokenIcon

**Purpose**: Manages token icons and pair displays.

**Features**:
- Token icon rendering
- Fallback handling
- Support for multiple token pairs
- Customizable sizing

**Usage Example**:
```typescript
// Using TokenIcon component
<TokenIcon pair="ETH/USD" size={24} />

// Using TokenPairDisplay component
<TokenPairDisplay pair="BTC/USD" iconSize={24} />
```

## useTokenTransferActions

**Purpose**: Handles token transfer operations.

**Features**:
- Transfer tokens to smart account
- Handle transfer states
- Transaction management
- Error handling

**Usage Example**:
```typescript
const { transferToSmartAccount, isTransferring } = useTokenTransferActions();

// Transfer tokens
await transferToSmartAccount(
  "100",           // amount
  fromAddress      // sender address
);
```

## Common Patterns

1. **Error Handling**: Most hooks include error states and proper error handling mechanisms.
2. **Loading States**: Hooks provide loading states to handle asynchronous operations.
3. **Refresh Mechanisms**: Many hooks include refetch functions to update data.
4. **Type Safety**: All hooks are written in TypeScript for type safety.
5. **Real-time Updates**: Several hooks implement polling or websocket connections for real-time data.

## Best Practices

1. Always check loading and error states before accessing data.
2. Use the provided refetch functions to ensure data freshness.
3. Handle errors appropriately using the error states.
4. Properly clean up subscriptions and intervals in useEffect cleanup functions.
5. Use the toast system for user feedback on actions.
