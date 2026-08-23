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
      className="group block min-h-[250px] rounded-[22px] border border-slate-200/70 bg-white/88 p-5 text-center shadow-[0_10px_30px_rgba(20,35,75,0.045)] transition-all duration-200 hover:-translate-y-1 hover:border-slate-300/80 hover:shadow-[0_18px_42px_rgba(20,35,75,0.09)]"
    >
      <div className="flex flex-col items-center">
        {coin.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coin.logoUrl}
            alt=""
            className="h-10 w-10 rounded-full object-contain shadow-[0_4px_14px_rgba(20,35,75,0.08)]"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold tracking-wide text-slate-500">
            {coin.symbol.slice(0, 4)}
          </div>
        )}

        <p className="mt-3 text-[15px] font-semibold tracking-[-0.02em] text-slate-900">{coin.name}</p>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
          {coin.symbol} · {coin.category}
        </p>
      </div>

      <p className="mt-4 text-[22px] font-semibold tracking-[-0.035em] text-slate-950">${formatPrice(coin.price)}</p>
      <p className={`mt-1 text-xs font-medium ${changeIsPositive ? "text-emerald-600" : "text-rose-600"}`}>
        {changeIsPositive ? "+" : ""}{coin.change24hPct.toFixed(2)}% 24h
      </p>

      {coin.recentStates && coin.recentStates.length > 0 && (
        <div className="mx-auto mt-4 max-w-[88%] opacity-75 transition-opacity group-hover:opacity-100">
          <SignalSparkline states={coin.recentStates} />
        </div>
      )}

      <div className={`mt-4 rounded-xl ${config.bg} px-3 py-2.5 text-center`}>
        <p className={`text-xs font-bold tracking-[0.08em] ${config.text}`}>{config.label.toUpperCase()}</p>
        <div className="mx-auto mt-2 h-1 w-[90%] overflow-hidden rounded-full bg-white/70">
          <div className="h-full rounded-full" style={{ width: `${coin.confidencePct}%`, backgroundColor: config.dot }} />
        </div>
        <p className={`mt-1.5 text-[10px] ${config.text} opacity-75`}>
          Signal {coin.confidencePct.toFixed(0)}% · {coin.streakDays}d streak
        </p>
      </div>
    </Link>
  );
}
