# Deposit Components Documentation

## Component Overview

The deposit module consists of several components that work together to handle deposit and withdrawal functionality:

### ActionButtons.tsx
- Provides button UI components for deposit and withdraw actions
- Handles user interaction for initiating transactions

### AmountInput.tsx
- Input field component for entering deposit/withdraw amounts
- Includes a "Max" button for convenient maximum amount selection

### BalanceDisplay.tsx
- Displays various balance information
- Shows user's available balances across different accounts/networks

### CrossChainDepositCall.tsx
- Handles the logic for cross-chain deposit operations
- Manages interactions with different blockchain networks

### DepositForm.tsx
- Main form component that orchestrates the deposit/withdraw flow
- Combines input fields, network selection, and action buttons
- Manages form state and validation

### NetworkSelector.tsx
- Dropdown component for selecting different blockchain networks
- Handles network switching functionality

### types.ts
- Contains shared TypeScript interfaces and types
- Defines data structures used across deposit components

### useTransactionHandler.ts
- Custom hook for managing transaction states and execution
- Handles transaction submission and monitoring

### index.tsx
- Main entry point that composes all deposit components
- Orchestrates the overall deposit/withdraw functionality
