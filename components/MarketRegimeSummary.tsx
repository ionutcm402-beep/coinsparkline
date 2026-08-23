import { Coin } from "@/types/coin";
import { getSignalTier, TIER_CONFIG, SignalTier } from "@/lib/tiers";

const TIERS: SignalTier[] = ["calm", "building", "awakening", "volatile"];

export default function MarketRegimeSummary({ coins, updatedLabel }: { coins: Coin[]; updatedLabel?: string }) {
  const counts: Record<SignalTier, number> = { calm: 0, building: 0, awakening: 0, volatile: 0 };
  for (const coin of coins) counts[getSignalTier(coin)]++;
  const total = coins.length;
  const dominant = TIERS.reduce((current, tier) => (counts[tier] > counts[current] ? tier : current));

  return (
    <section className="csl-market-reading" aria-labelledby="market-reading-title" style={{ paddingTop: "1.05rem", paddingBottom: "1.05rem" }}>
      <div className="csl-market-reading-topline"><p className="csl-kicker" style={{ fontSize: ".56rem" }}>Latest market reading</p></div>
      <div className="csl-market-reading-primary" style={{ marginTop: ".3rem" }}>
        <div>
          <p className="csl-market-state-label" style={{ fontSize: ".58rem" }}>Market state</p>
          <h2 id="market-reading-title" className="csl-market-state" data-regime={dominant} style={{ fontSize: "clamp(1.7rem, 3vw, 2.5rem)" }}><i aria-hidden="true" />{TIER_CONFIG[dominant].label}</h2>
        </div>
        <p className="csl-market-total" style={{ fontSize: ".68rem" }}><strong>{total}</strong> assets analysed · {updatedLabel ? "Updated " + updatedLabel : "Latest available snapshot"}</p>
      </div>
      <div className="csl-market-spectrum" aria-label={"Market distribution across " + total + " tracked assets"} style={{ marginTop: ".7rem", height: ".5rem" }}>
        {TIERS.map((tier) => (
          <span key={tier} className="csl-market-spectrum-segment" data-regime={tier} style={{ flexGrow: Math.max(counts[tier], 0) }} aria-label={counts[tier] + " " + TIER_CONFIG[tier].label}><i /></span>
        ))}
      </div>
      <div className="csl-market-counts" style={{ marginTop: ".4rem" }}>
        {TIERS.map((tier) => (
          <div key={tier} className="csl-market-count" data-regime={tier}><strong style={{ fontSize: "1rem" }}>{counts[tier]}</strong><span style={{ fontSize: ".55rem" }}><i aria-hidden="true" />{TIER_CONFIG[tier].label}</span></div>
        ))}
      </div>
    </section>
  );
}
