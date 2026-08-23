"use client";

import { usePathname } from "next/navigation";
import WatchlistButton from "@/components/WatchlistButton";

export default function CoinPageWatchlistDock() {
  const pathname = usePathname();
  const match = pathname.match(/^\/coin\/([^/?#]+)/);
  if (!match) return null;
  const coinId = decodeURIComponent(match[1]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 py-1.5 pl-3 pr-1.5 text-[10px] font-semibold text-slate-600 shadow-[0_12px_35px_rgba(20,35,75,0.14)] backdrop-blur">
      <span>Watchlist</span><WatchlistButton coinId={coinId} compact />
    </div>
  );
}
