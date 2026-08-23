import { getSignalTier, SignalTier, TIER_CONFIG } from "@/lib/tiers";
import { Coin } from "@/types/coin";

const REGIMES: SignalTier[] = ["calm", "building", "awakening", "volatile"];

function SignalPath() {
  return <svg className="h-[86px] w-full" viewBox="0 0 760 100" role="img" aria-label="Market signal progression from calm to volatile">
    <path d="M8 52 C55 43 88 39 126 48 S194 64 235 51 S282 33 315 52 S350 70 385 42 S430 64 465 43 S510 65 545 46 S590 64 625 43 S685 59 752 45" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
    <path d="M8 52 C55 43 88 39 126 48" fill="none" stroke="var(--regime-calm)" strokeWidth="2.4"/>
    <path d="M126 48 C194 64 235 51 282 33" fill="none" stroke="var(--regime-building)" strokeWidth="2.4"/>
    <path d="M282 33 C315 52 350 70 385 42 S430 64 465 43" fill="none" stroke="var(--regime-awakening)" strokeWidth="2.4"/>
    <path d="M465 43 C510 65 545 46 590 64 S625 43 685 59 S720 48 752 45" fill="none" stroke="var(--regime-volatile)" strokeWidth="2.4"/>
    <circle cx="752" cy="45" r="4" fill="var(--regime-volatile)"/>
  </svg>;
}

export default function Hero({ coins }: { coins: Coin[] }) {
  const counts: Record<SignalTier, number> = { calm: 0, building: 0, awakening: 0, volatile: 0 };
  for (const coin of coins) counts[getSignalTier(coin)]++;
  const dominant = REGIMES.reduce((a,b)=>counts[b]>counts[a]?b:a);
  return <section className="mx-auto max-w-[1390px] px-3 pt-5 sm:px-5 sm:pt-6">
    <div className="grid overflow-hidden rounded-[18px] border border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgba(20,35,75,.04)] lg:grid-cols-[.9fr_1.25fr]">
      <div className="border-b border-slate-100 px-5 py-5 lg:border-b-0 lg:border-r lg:px-6 lg:py-6">
        <p className="text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">Crypto market intelligence</p>
        <h1 className="mt-3 text-[clamp(1.75rem,3.1vw,2.7rem)] font-semibold leading-[1.02] tracking-[-.055em] text-slate-950">Track the calm. <span className="csl-gradient-text">Catch the move.</span></h1>
        <p className="mt-3 max-w-xl text-[11px] leading-5 text-slate-500 sm:text-xs">See when crypto markets are calm, building momentum, awakening or turning volatile — before the move becomes obvious.</p>
      </div>
      <div className="px-5 py-4 lg:px-6 lg:py-5">
        <div className="flex items-center justify-between"><p className="text-[9px] font-bold uppercase tracking-[.13em] text-slate-500">Market signal</p><p className="text-[8px] font-semibold uppercase tracking-[.11em] text-slate-400">From stillness to movement</p></div>
        <SignalPath/>
        <div className="grid grid-cols-4 gap-2">{REGIMES.map(r=><div key={r} className="flex items-center justify-center gap-1.5 text-[8px] font-bold uppercase tracking-[.06em] text-slate-600"><i className="h-2 w-2 rounded-full" style={{backgroundColor:`var(--regime-${r})`}}/>{TIER_CONFIG[r].label}</div>)}</div>
        <p className="mt-2 text-center text-[8px] font-semibold uppercase tracking-[.1em] text-slate-400">Market now · <span style={{color:`var(--regime-${dominant})`}}>{TIER_CONFIG[dominant].label}</span></p>
      </div>
    </div>
  </section>;
}
