# PositionsTable Components Documentation

## Component Overview

The PositionsTable module provides a comprehensive interface for displaying trading positions, orders, and trades with the following components:

### PositionsTable.tsx
- Main component that manages the display of positions, orders, and trades
- Features a tabbed interface for switching between different views
- Handles position closing functionality
- Implements hover effects with tooltips for PnL information
- Uses portal for rendering tooltips outside the table structure

### PositionTable/PositionsContent
- Renders the content for the Positions tab
- Displays active trading positions
- Shows position details like size, entry price, and PnL
- Includes position closing functionality
- Handles loading and error states

### PositionTable/OrdersContent
- Manages the display of active orders
- Shows both regular and trigger orders
- Handles loading and error states for orders data

### PositionTable/TradesContent
- Displays trading history and completed trades
- Shows historical trading activity

### PositionTable/PnLTooltip
- Tooltip component for displaying detailed PnL information
- Appears on hover over position entries
- Shows profit/loss calculations and related metrics

## Key Features
- Tabbed navigation between positions, orders, and trades
- Real-time position monitoring
- Position closing functionality
- Hover tooltips for detailed information
- Responsive table design with horizontal scrolling
- Error handling and loading states
- Integration with position and order management hooks

## Technical Implementation
- Uses React portals for tooltip rendering
- Implements ref-based position tracking for tooltips
- Responsive design with minimum width constraints
- Integrates with custom hooks:
  - usePositions: Manages position data
  - useOrders: Handles order data
  - usePositionActions: Provides position management functions
