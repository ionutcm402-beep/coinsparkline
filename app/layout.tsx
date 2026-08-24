import type { Metadata } from "next";
import "./globals.css";
import "./mobile-polish.css";
import "./premium-home.css";
import FlowingLines from "@/components/FlowingLines";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import CookieConsent from "@/components/CookieConsent";
import CoinPageWatchlistDock from "@/components/CoinPageWatchlistDock";

export const metadata: Metadata = {
  title: "CoinSparkLine — Track the calm. Catch the move.",
  description: "A regime signal for every major cryptocurrency, refreshed daily.",
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
