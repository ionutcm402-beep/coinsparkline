import { Coin } from "@/types/coin";

export type SignalTier = "calm" | "building" | "awakening" | "volatile";

export const TIER_CONFIG: Record<SignalTier, { label: string; bg: string; text: string; dot: string }> = {
  calm: { label: "Calm", bg: "bg-green-50", text: "text-green-700", dot: "#2f9e44" },
  building: { label: "Building", bg: "bg-yellow-50", text: "text-yellow-700", dot: "#f5b400" },
  awakening: { label: "Awakening", bg: "bg-orange-50", text: "text-orange-700", dot: "#e8590c" },
  volatile: { label: "Volatile", bg: "bg-red-50", text: "text-red-700", dot: "#d6336c" },
};

/**
 * Phase 2 four-stage classifier.
 *
 * The HMM remains the structural anchor (calm vs volatile), but the middle
 * stages now require measured transition behaviour instead of merely a lower
 * confidence score.
 *
 * CALM: low-volatility HMM state without strong transition evidence.
 * BUILDING: still in the calm HMM state, but realised volatility is rising,
 *           unusually high for the asset, the fitted flip hazard is elevated,
 *           or the HMM itself is becoming uncertain.
 * AWAKENING: the HMM has moved into the volatile state, but the transition is
 *            fresh or not yet strongly confirmed.
 * VOLATILE: established volatile-state behaviour with stronger confirmation.
 */
export function getSignalTier(coin: Coin): SignalTier {
  const accel = coin.volatilityAccelerationPct;
  const percentile = coin.volatilityPercentile;
  const hazard = coin.flipHazardPct;
  const hasPhase2 = accel !== undefined && percentile !== undefined && hazard !== undefined;

  // Backward compatibility for old saved snapshots until the first Phase 2
  // refresh replaces them.
  if (!hasPhase2) {
    const confident = coin.confidencePct >= 80;
    if (coin.regimeState === "calm") return confident ? "calm" : "building";
    return confident ? "volatile" : "awakening";
  }

  if (coin.regimeState === "calm") {
    const transitionEvidence =
      accel! >= 15 ||
      percentile! >= 68 ||
      hazard! >= 18 ||
      coin.confidencePct < 76;
    return transitionEvidence ? "building" : "calm";
  }

  const newlyVolatile = coin.streakDays <= 3;
  const stillForming = coin.confidencePct < 82;
  const volatilityNotYetEstablished = percentile! < 72 && accel! < 20;
  return newlyVolatile || stillForming || volatilityNotYetEstablished ? "awakening" : "volatile";
}
