import type { Metadata } from "next";
import "./globals.css";
import FlowingLines from "@/components/FlowingLines";

export const metadata: Metadata = {
  title: "CoinSparkLine — Track the calm. Catch the move.",
  description: "A regime signal for every major cryptocurrency, refreshed daily.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="csl-app min-h-full flex flex-col antialiased">
        <FlowingLines />
        {children}
      </body>
    </html>
  );
}
