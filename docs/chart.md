I'll help create a new documentation page for the chart component. I'll create a new markdown file in the docs directory.

```markdown


# Chart Component

The Chart component is a versatile data visualization tool that helps display trading data in a clear and interactive format.

## Usage

```tsx
import { Chart } from '@builders.workshop/ui'

function TradingView() {
  return (
    <Chart
      data={chartData}
      height={400}
      width={800}
      type="candlestick"
    />
  )
}
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| data | ChartData[] | required | Array of data points to be displayed on the chart |
| height | number | 300 | Height of the chart in pixels |
| width | number | 600 | Width of the chart in pixels |
| type | 'line' \| 'candlestick' \| 'bar' | 'line' | Type of chart to display |
| theme | 'light' \| 'dark' | 'dark' | Color theme of the chart |
| timeFrame | string | '1D' | Time frame for the chart data |
| onZoom | (range: Range) => void | - | Callback function when zooming the chart |
| onCrosshairMove | (point: Point) => void | - | Callback function when moving the crosshair |

## Examples

### Basic Line Chart

```tsx
import { Chart } from '@builders.workshop/ui'

const lineData = [
  { timestamp: 1625097600000, value: 35000 },
  { timestamp: 1625184000000, value: 34500 },
  // ... more data points
]

function LineChart() {
  return (
    <Chart
      data={lineData}
      type="line"
      theme="dark"
      height={400}
    />
  )
}
```

### Candlestick Chart

```tsx
import { Chart } from '@builders.workshop/ui'

const candlestickData = [
  { 
    timestamp: 1625097600000,
    open: 35000,
    high: 36000,
    low: 34000,
    close: 34500
  },
  // ... more data points
]

function CandlestickChart() {
  return (
    <Chart
      data={candlestickData}
      type="candlestick"
      theme="dark"
      height={400}
    />
  )
}
```

## API Reference

### ChartData Type

```typescript
interface ChartData {
  timestamp: number
  value?: number
  open?: number
  high?: number
  low?: number
  close?: number
}
```

### Range Type

```typescript
interface Range {
  from: number
  to: number
}
```

### Point Type

```typescript
interface Point {
  x: number
  y: number
  price: number
  timestamp: number
}
```

## Customization

The Chart component can be customized using CSS variables:

```css
:root {
  --chart-background: #1a1a1a;
  --chart-grid-color: #2a2a2a;
  --chart-line-color: #2962FF;
  --chart-crosshair-color: rgba(255, 255, 255, 0.3);
}
```

## Notes

- The Chart component uses lightweight-charts under the hood
- For optimal performance, it's recommended to limit the number of data points to under 10,000
- The component automatically handles window resizing
- Real-time updates are supported by passing new data to the `data` prop
```