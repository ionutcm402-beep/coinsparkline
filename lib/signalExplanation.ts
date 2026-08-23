import { Coin } from "@/types/coin";
import { getSignalTier, TIER_CONFIG } from "@/lib/tiers";
import { getSparkScore } from "@/lib/sparkScore";

export interface SignalExplanation {
  headline: string;
  summary: string;
  reasons: string[];
  caution: string;
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

export function explainSignal(coin: Coin): SignalExplanation {
  const tier = getSignalTier(coin);
  const tierLabel = TIER_CONFIG[tier].label;
  const spark = getSparkScore(coin);
  const reasons: string[] = [];

  if (coin.confidencePct >= 75) {
    reasons.push(`High regime confidence (${pct(coin.confidencePct)}) means the current behavioural state is relatively clear.`);
  } else if (coin.confidencePct >= 55) {
    reasons.push(`Moderate regime confidence (${pct(coin.confidencePct)}) supports the signal, but it is not yet especially strong.`);
  } else {
    reasons.push(`Low regime confidence (${pct(coin.confidencePct)}) means the model sees a less decisive market state.`);
  }

  if (coin.streakDays <= 2) {
    reasons.push(`The current regime is fresh (${coin.streakDays} day${coin.streakDays === 1 ? "" : "s"}), so recent behaviour carries extra weight.`);
  } else if (coin.streakDays >= Math.max(1, coin.medianDaysToFlip)) {
    reasons.push(`The current regime has lasted ${coin.streakDays} days, at or beyond this coin's typical flip timing (${coin.medianDaysToFlip} days).`);
  } else {
    reasons.push(`The current regime has lasted ${coin.streakDays} days versus a typical flip time of about ${coin.medianDaysToFlip} days.`);
  }

  const move = Math.abs(coin.change24hPct);
  if (move >= 8) {
    reasons.push(`24h movement is unusually large at ${move.toFixed(1)}%, adding significant activity to the SparkScore.`);
  } else if (move >= 3) {
    reasons.push(`24h movement is active at ${move.toFixed(1)}%, contributing meaningfully to the signal.`);
  } else {
    reasons.push(`24h movement is relatively contained at ${move.toFixed(1)}%, so price action is not the main driver.`);
  }

  if (spark.transitionPressure >= 80) {
    reasons.push(`Transition pressure is high (${pct(spark.transitionPressure)}), meaning the current streak is near or beyond its usual change point.`);
  } else if (spark.transitionPressure >= 45) {
    reasons.push(`Transition pressure is moderate (${pct(spark.transitionPressure)}), so a regime change is becoming more relevant.`);
  }

  let summary: string;
  if (tier === "volatile") {
    summary = `${coin.name} is in a Volatile regime because model confidence, current activity and regime intensity are collectively elevated.`;
  } else if (tier === "awakening") {
    summary = `${coin.name} is in Awakening: behaviour is becoming more active and the signal is strengthening, but it has not reached full Volatile conditions.`;
  } else if (tier === "building") {
    summary = `${coin.name} is Building: activity is increasing from quieter conditions, but the evidence is still intermediate rather than extreme.`;
  } else {
    summary = `${coin.name} is Calm: current behaviour remains comparatively quiet and the model does not yet see enough pressure for a stronger regime.`;
  }

  return {
    headline: `${tierLabel} · SparkScore ${spark.score} (${spark.label})`,
    summary,
    reasons: reasons.slice(0, 4),
    caution: "SparkScore measures behavioural activity and unusualness, not bullishness, expected return or a buy/sell recommendation.",
  };
}
