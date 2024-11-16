# OrderCard Components Documentation

## Component Overview

The OrderCard module provides a comprehensive trading interface with the following structure:

### index.tsx
- Main trading card component that integrates all subcomponents
- Handles order placement for market and limit orders
- Manages form state, leverage, and trading calculations
- Integrates with wallet connection and smart account functionality
- Displays trading fees and balance information

### components/
#### MarketOrderForm
- Form interface for market orders
- Handles amount input, leverage, and TP/SL settings
- Provides real-time price and position size calculations

#### LimitOrderForm
- Form interface for limit orders
- Similar to MarketOrderForm but with additional limit price input
- Manages limit order specific validations

#### TradeDetails
- Displays trade-specific information
- Shows entry price, notional size, liquidation price
- Calculates and displays trading fees and interest rates

### hooks/
#### useOrderForm
- Custom hook for managing order form state
- Handles form input changes and validation
- Manages leverage and position direction state

#### useTradeCalculations
- Hook for performing trade-related calculations
- Computes liquidation prices, fees, and position sizes
- Handles real-time updates based on price changes

### types.ts
- Defines TypeScript interfaces for the OrderCard module
- Contains types for props, trade details, and form state
- Ensures type safety across the trading interface
