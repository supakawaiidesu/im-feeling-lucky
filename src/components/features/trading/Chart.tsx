import { useEffect } from 'react'
import type { ResolutionString } from '../../../../public/static/charting_library/charting_library'
import datafeed from '../../../utils/datafeed.js'

declare global {
  interface Window {
    TradingView: any
  }
}

const chartingLibraryPath = '/static/charting_library/'

export function Chart() {
  useEffect(() => {
    const loadTradingView = async () => {
      try {
        if (typeof window === 'undefined' || !window.TradingView) {
          console.log('TradingView not loaded yet')
          return
        }

        console.log('Creating TradingView widget')
        const widget = new window.TradingView.widget({
          container: 'tv_chart_container',
          locale: 'en',
          library_path: chartingLibraryPath,
          datafeed: datafeed,
          symbol: 'BTCUSD',
          interval: '1W' as ResolutionString,
          autosize: true,
          debug: true,
          enabled_features: ['show_exchange_logos'],
          theme: 'dark',
          overrides: {
            'paneProperties.background': '#110F23',
          },
        })

        widget.onChartReady(() => {
          console.log('Chart is ready')
          const chart = widget.chart()
          chart.getSeries().setChartStyleProperties(1, {
            upColor: '#E6DAFE',
            downColor: '#7142CF',
            borderUpColor: '#E6DAFE',
            borderDownColor: '#7142CF',
            wickUpColor: '#E4DADB',
            wickDownColor: '#E4DADB',
          })
        })
      } catch (error) {
        console.error('Error initializing TradingView:', error)
      }
    }

    loadTradingView()
  }, [])

  return (
    <div 
      id="tv_chart_container" 
      style={{ 
        flex: '1 1 auto',
        minHeight: '500px',
      }} 
    />
  )
}
