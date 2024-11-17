# MOLTEN Staking Components Documentation

## Component Overview

The MOLTEN staking module provides a staking interface with real-time statistics and position management with the following components:

### StakingMOLTEN/index.tsx
- Main container component that organizes the staking interface
- Implements two-column layout for positions and actions
- Manages staking mode state (stake/unstake)

### StakingMOLTEN/StatsDisplay
- Shows total staked amount and percentage of circulating supply
- Displays key metrics about the staking pool
- Uses molten-stats and molten-staking hooks for data

### StakingMOLTEN/StatsActions
- Displays APR, current price, and total staked amounts
- Provides quick access to buy MOLTEN token
- Shows real-time price and APR information

### StakingMOLTEN/PositionCard
- Shows user's staking position details
- Displays wallet balance, staked amount, and rewards
- Calculates share of pool percentage
- Shows USD values based on current price

### StakingMOLTEN/ActionsCard
- Handles staking and unstaking actions
- Manages token approvals
- Provides rewards claiming functionality
- Includes MAX amount button and input validation

## Key Features
- Real-time staking statistics
- Token approval and staking management
- Rewards tracking and claiming
- USD value calculations
- Share of pool tracking
- Price and APR monitoring

## Technical Implementation
- Uses custom hooks:
  - useMoltenStaking: Manages staking data and actions
  - useMoltenStats: Handles price and APR data
- Integrates with wallet connections via wagmi
- Implements viem for blockchain interactions
- Auto-refreshing data with set intervals