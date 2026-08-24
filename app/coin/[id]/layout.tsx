import type { ReactNode } from "react";
import CoinPageWatchlistDock from "@/components/CoinPageWatchlistDock";

export default function CoinDetailLayout({ children }: { children: ReactNode }) {
  return <>{children}<CoinPageWatchlistDock /></>;
}
