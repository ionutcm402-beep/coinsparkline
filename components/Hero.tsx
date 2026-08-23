import { getSignalTier, SignalTier, TIER_CONFIG } from "@/lib/tiers";
import { Coin } from "@/types/coin";

const REGIMES: SignalTier[] = ["calm", "building", "awakening", "volatile"];

function SignalPath() {
  return (
    <svg className="csl-hero-signal-svg" viewBox="0 0 1120 184" role="img" aria-label="A signal line progressing from calm through building and awakening to volatile market conditions">
      <defs>
        <filter id="csl-hero-soft-glow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="5" /></filter>
        <linearGradient id="csl-hero-ambient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--regime-calm)" stopOpacity="0.08" />
          <stop offset="0.42" stopColor="var(--regime-building)" stopOpacity="0.06" />
          <stop offset="0.7" stopColor="var(--regime-awakening)" stopOpacity="0.08" />
          <stop offset="1" stopColor="var(--regime-volatile)" stopOpacity="0.10" />
        </linearGradient>
      </defs>
      <rect x="32" y="27" width="1056" height="112" rx="28" fill="url(#csl-hero-ambient)" />
      <path className="csl-hero-baseline" d="M60 98 H1060" />
      <path className="csl-hero-glow csl-hero-glow-calm" d="M60 98 C118 96 166 101 224 98 S318 96 352 98" />
      <path className="csl-hero-glow csl-hero-glow-building" d="M352 98 C388 95 406 84 432 92 S470 108 500 96 S546 83 578 96" />
      <path className="csl-hero-glow csl-hero-glow-awakening" d="M578 96 C606 75 628 116 659 86 S707 67 736 98 S774 119 803 75" />
      <path className="csl-hero-glow csl-hero-glow-volatile" d="M803 75 C825 127 850 55 877 108 S929 48 953 112 S1000 42 1060 80" />
      <path className="csl-hero-line csl-hero-line-calm" d="M60 98 C118 96 166 101 224 98 S318 96 352 98" />
      <path className="csl-hero-line csl-hero-line-building" d="M352 98 C388 95 406 84 432 92 S470 108 500 96 S546 83 578 96" />
      <path className="csl-hero-line csl-hero-line-awakening" d="M578 96 C606 75 628 116 659 86 S707 67 736 98 S774 119 803 75" />
      <path className="csl-hero-line csl-hero-line-volatile" d="M803 75 C825 127 850 55 877 108 S929 48 953 112 S1000 42 1060 80" />
      <circle className="csl-hero-pulse csl-hero-pulse-building" cx="500" cy="96" r="4" />
      <circle className="csl-hero-pulse csl-hero-pulse-awakening" cx="736" cy="98" r="4" />
      <circle className="csl-hero-pulse csl-hero-pulse-volatile" cx="953" cy="112" r="4" />
    </svg>
  );
}

export default function Hero({ coins }: { coins: Coin[] }) {
  const counts: Record<SignalTier, number> = { calm: 0, building: 0, awakening: 0, volatile: 0 };
  for (const coin of coins) counts[getSignalTier(coin)]++;
  const dominant = REGIMES.reduce((current, tier) => (counts[tier] > counts[current] ? tier : current));
  const marketLabel = TIER_CONFIG[dominant].label;

  return (
    <section className="csl-hero" aria-labelledby="hero-title">
      <div className="csl-hero-atmosphere" aria-hidden="true" />
      <div className="csl-hero-content">
        <p className="csl-hero-kicker">Crypto market intelligence</p>
        <h1 id="hero-title" className="csl-hero-title">
          <span>Track the calm.</span>
          <span className="csl-gradient-text">Catch the move.</span>
        </h1>
        <p className="csl-hero-copy">
          See when crypto markets are calm, building momentum, awakening or turning volatile — before the move becomes obvious.
        </p>
        <figure className="csl-hero-signal">
          <div className="csl-hero-signal-heading">
            <figcaption>Market signal</figcaption>
            <span>From stillness to movement</span>
          </div>
          <SignalPath />
          <div className="csl-hero-regimes" aria-label="Market regime progression">
            {REGIMES.map((regime) => (
              <span key={regime} className="csl-hero-regime" data-regime={regime}><i aria-hidden="true" />{TIER_CONFIG[regime].label}</span>
            ))}
          </div>
        </figure>
        <div className="csl-hero-market-now" data-regime={dominant} aria-label={`Market now: ${marketLabel}`}>
          <span className="csl-hero-market-label">Market now</span>
          <span className="csl-hero-market-value"><i aria-hidden="true" />{marketLabel}</span>
        </div>
      </div>
    </section>
  );
}
