import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CoinSparkLine",
    short_name: "CoinSparkLine",
    description: "Crypto market behaviour interpreted through SparkScore, regime intelligence and research tools.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2457d6",
    orientation: "portrait-primary",
    categories: ["finance", "utilities"],
    icons: [
      { src: "/pwa-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      { name: "Opportunity Radar", short_name: "Radar", url: "/opportunities" },
      { name: "Screener", short_name: "Screener", url: "/screener" },
      { name: "CoinSpark Live", short_name: "Live", url: "/live" },
      { name: "Watchlist", short_name: "Watchlist", url: "/watchlist" },
    ],
  };
}
