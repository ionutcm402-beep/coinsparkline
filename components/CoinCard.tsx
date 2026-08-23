import Link from "next/link";
import { Coin } from "@/types/coin";
import { getSignalTier, TIER_CONFIG } from "@/lib/tiers";
import SignalSparkline from "@/components/SignalSparkline";
import CurrencyAmount from "@/components/CurrencyAmount";

export default function CoinCard({ coin }: { coin: Coin }) {
  const changeIsPositive = coin.change24hPct >= 0;
  const tier = getSignalTier(coin);
  const config = TIER_CONFIG[tier];

  return (
    <Link
      href={`/coin/${coin.id}`}
      className="group block min-h-[182px] rounded-[16px] border border-slate-200/70 bg-white/88 p-3.5 text-center shadow-[0_6px_20px_rgba(20,35,75,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-[0_12px_28px_rgba(20,35,75,0.075)]"
    >
      <div className="flex flex-col items-center">
        {coin.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coin.logoUrl} alt="" className="h-8 w-8 rounded-full object-contain shadow-[0_3px_10px_rgba(20,35,75,0.07)]" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[9px] font-semibold tracking-wide text-slate-500">{coin.symbol.slice(0, 4)}</div>
        )}

        <p className="mt-2 text-[13px] font-semibold leading-none tracking-[-0.02em] text-slate-900">{coin.name}</p>
        <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.1em] text-slate-400">{coin.symbol} · {coin.category}</p>
      </div>

      <p className="mt-2.5 text-[18px] font-semibold leading-none tracking-[-0.035em] text-slate-950"><CurrencyAmount usd={coin.price} /></p>
      <p className={`mt-1 text-[10px] font-medium ${changeIsPositive ? "text-emerald-600" : "text-rose-600"}`}>
        {changeIsPositive ? "+" : ""}{coin.change24hPct.toFixed(2)}% 24h
      </p>

      {coin.recentStates && coin.recentStates.length > 0 && (
        <div className="mx-auto mt-2.5 max-w-[90%] opacity-65 transition-opacity group-hover:opacity-100">
          <SignalSparkline states={coin.recentStates} />
        </div>
      )}

      <div className={`mt-2.5 rounded-[10px] ${config.bg} px-2.5 py-1.5 text-center`}>
        <div className="flex items-center justify-between gap-2">
          <p className={`text-[9px] font-bold tracking-[0.07em] ${config.text}`}>{config.label.toUpperCase()}</p>
          <p className={`text-[8px] ${config.text} opacity-70`}>{coin.confidencePct.toFixed(0)}% · {coin.streakDays}d</p>
        </div>
        <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-white/70">
          <div className="h-full rounded-full" style={{ width: `${coin.confidencePct}%`, backgroundColor: config.dot }} />
        </div>
      </div>
    </Link>
  );
}
