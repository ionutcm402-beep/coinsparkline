import type { Metadata } from "next";
import "./globals.css";
import "./csl2.css";
import FlowingLines from "@/components/FlowingLines";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import CookieConsent from "@/components/CookieConsent";
import CoinPageWatchlistDock from "@/components/CoinPageWatchlistDock";

export const metadata: Metadata = {
  title: "CoinSparkLine — See the market before it feels obvious.",
  description: "A clearer way to see crypto market behaviour, momentum and regime change.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="csl-app min-h-full flex flex-col antialiased">
        <CurrencyProvider>
          <FlowingLines />
          {children}
          <CoinPageWatchlistDock />
          <CookieConsent />
        </CurrencyProvider>
      </body>
    </html>
  );
}
