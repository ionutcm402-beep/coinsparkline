import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CoinSparkLine",
    short_name: "CoinSparkLine",
    description: "Crypto market behaviour, SparkScore, radar, portfolio and alerts.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fbff",
    theme_color: "#1677ff",
    orientation: "portrait-primary",
    categories: ["finance", "utilities"],
    icons: [
      {
        src: "/pwa-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      { name: "Opportunity Radar", short_name: "Radar", url: "/opportunities" },
      { name: "Screener", short_name: "Screener", url: "/screener" },
      { name: "Portfolio", short_name: "Portfolio", url: "/portfolio" },
      { name: "Alerts", short_name: "Alerts", url: "/alerts" },
    ],
  };
}
