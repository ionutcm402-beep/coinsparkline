import { Coin } from "@/types/coin";
import { getSignalTier } from "@/lib/tiers";

export interface SparkScoreBreakdown {
  score: number;
  confidence: number;
  freshness: number;
  transitionPressure: number;
  marketMove: number;
  regimeIntensity: number;
  label: "Quiet" | "Stirring" | "Active" | "Hot" | "Extreme";
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

/**
 * SparkScore v1 measures how active/unusual a coin's current behaviour looks.
 * It is deliberately NOT a bullishness, return-probability, or buy score.
 *
 * Inputs are limited to metrics CoinSparkLine already calculates:
 * - HMM regime confidence (30%)
 * - freshness of the current regime streak (20%)
 * - proximity to the coin's historical median regime flip timing (20%)
 * - absolute 24h market movement (15%)
 * - current four-tier regime intensity (15%)
 */
export function getSparkScore(coin: Coin): SparkScoreBreakdown {
  const confidence = clamp(coin.confidencePct);

  // Fresh regime changes deserve more attention than very old streaks.
  const freshness = clamp(100 - Math.max(0, coin.streakDays - 1) * 8);

  // Pressure rises as a streak approaches/exceeds its own typical flip time.
  const median = Math.max(1, coin.medianDaysToFlip || 1);
  const ratio = coin.streakDays / median;
  const transitionPressure = clamp(ratio * 100);

  // 15%+ absolute daily movement saturates this component.
  const marketMove = clamp((Math.abs(coin.change24hPct) / 15) * 100);

  const tier = getSignalTier(coin);
  const regimeIntensity = tier === "volatile" ? 100 : tier === "awakening" ? 78 : tier === "building" ? 50 : 22;

  const score = Math.round(
    confidence * 0.30 +
    freshness * 0.20 +
    transitionPressure * 0.20 +
    marketMove * 0.15 +
    regimeIntensity * 0.15
  );

  const label: SparkScoreBreakdown["label"] =
    score >= 85 ? "Extreme" : score >= 70 ? "Hot" : score >= 55 ? "Active" : score >= 40 ? "Stirring" : "Quiet";

  return { score, confidence, freshness, transitionPressure, marketMove, regimeIntensity, label };
}
