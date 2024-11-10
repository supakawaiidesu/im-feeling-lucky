import { useEffect } from "react";
import type { ResolutionString } from "../../../../public/static/charting_library/charting_library";
import datafeed from "../../../utils/datafeed.js";

declare global {
  interface Window {
    TradingView: any;
  }
}

const chartingLibraryPath = "/static/charting_library/";

// Calculate time ranges
const now = Math.floor(Date.now() / 1000);

export function Chart() {
  useEffect(() => {
    const loadTradingView = async () => {
      try {
        if (typeof window === "undefined" || !window.TradingView) {
          console.log("TradingView not loaded yet");
          return;
        }

        console.log("Creating TradingView widget");
        const widget = new window.TradingView.widget({
          container: "tv_chart_container",
          locale: "en",
          library_path: chartingLibraryPath,
          datafeed: datafeed,
          symbol: "Crypto.BTC/USD",
          interval: "15" as ResolutionString,
          autosize: true,
          debug: true,
          enabled_features: [
            "show_exchange_logos",
            "side_toolbar_in_fullscreen_mode",
            "header_in_fullscreen_mode",
            "hide_resolution_in_legend",
            "items_favoriting",
            "save_chart_properties_to_local_storage",
            "iframe_loading_compatibility_mode",
          ],
          disabled_features: [
            "volume_force_overlay",
            "create_volume_indicator_by_default",
            "header_compare",
            "display_market_status",
            "show_interval_dialog_on_key_press",
            "header_symbol_search",
            "popup_hints",
            "header_in_fullscreen_mode",
            "use_localstorage_for_settings",
            "right_bar_stays_on_scroll",
            "symbol_info",
            "timeframes_toolbar",
          ],
          theme: "dark",
          overrides: {
            "paneProperties.background": "#17161d",
            "paneProperties.backgroundType": "solid",
          },
          load_last_chart: false,
          saved_data: null,
          auto_save_delay: 0,
          max_bars: 300,
          range: "1D",
          allow_symbol_change: false,
          favorites: {
            intervals: [
              "1",
              "5",
              "15",
              "30",
              "60",
              "240",
              "1D",
            ] as ResolutionString[],
          },
          loading_screen: { backgroundColor: "#17161d" },
          visible_range: {
            from: now - 24 * 60 * 60,
            to: now,
          },
          auto_scale: true,
          initial_data: {
            resolution: "15" as ResolutionString,
            from: now - 24 * 60 * 60,
            to: now,
          },
        });

        widget.onChartReady(() => {
          const chart = widget.chart();
          chart.getSeries().setChartStyleProperties(1, {
            upColor: "#E6DAFE",
            downColor: "#7142CF",
            borderUpColor: "#E6DAFE",
            borderDownColor: "#7142CF",
            wickUpColor: "#E4DADB",
            wickDownColor: "#E4DADB",
          });
        });
      } catch (error) {
        console.error("Error initializing TradingView:", error);
      }
    };

    loadTradingView();
  }, []);

  return (
    <div
      id="tv_chart_container"
      style={{
        flex: "1 1 auto",
        minHeight: "600px",
        borderRadius: "0.75rem", // This adds rounded corners
        overflow: "hidden", // This ensures the chart content respects the border radius
        marginBottom: "0.75rem", // Added 2rem (32px) margin at the bottom
      }}
    />
  );
}
