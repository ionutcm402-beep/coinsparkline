import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoinSparkline — Calm vs volatile, for every coin",
  description: "A regime signal for every major cryptocurrency, updated in real time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
