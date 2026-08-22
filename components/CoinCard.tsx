import Link from "next/link";
import { Coin } from "@/types/coin";
import { getSignalTier, TIER_CONFIG } from "@/lib/tiers";
import SignalSparkline from "@/components/SignalSparkline";

function formatPrice(price: number): string {
  const decimals = price >= 1 ? 2 : 4;
  return price.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function CoinCard({ coin }: { coin: Coin }) {
  const changeIsPositive = coin.change24hPct >= 0;
  const tier = getSignalTier(coin);
  const config = TIER_CONFIG[tier];

  return (
    <Link
      href={`/coin/${coin.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
    >
      <div className="mb-2.5 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[11px] font-medium text-blue-700">
          {coin.symbol.slice(0, 3)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{coin.name}</p>
          <p className="text-xs text-gray-400">{coin.category}</p>
        </div>
      </div>

      <p className="text-lg font-semibold text-gray-900">${formatPrice(coin.price)}</p>
      <p className={`mb-2 text-xs ${changeIsPositive ? "text-green-600" : "text-red-600"}`}>
        {changeIsPositive ? "+" : ""}
        {coin.change24hPct.toFixed(2)}% 24h
      </p>

      {coin.recentStates && coin.recentStates.length > 0 && (
        <div className="mb-2.5">
          <SignalSparkline states={coin.recentStates} />
        </div>
      )}

      {/* The dominant element on the card -- this is the actual product */}
      <div className={`rounded-lg ${config.bg} px-3 py-2 text-center`}>
        <p className={`text-sm font-bold ${config.text}`}>{config.label.toUpperCase()}</p>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-cyan-50/70">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${coin.confidencePct}%`, backgroundColor: config.dot }}
          />
        </div>
        <p className={`mt-1 text-[10px] ${config.text} opacity-80`}>
          Signal {coin.confidencePct.toFixed(0)}% &middot; {coin.streakDays}d streak
        </p>
      </div>
    </Link>
  );
}
