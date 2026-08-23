import { Coin } from "@/types/coin";
import { fitRegime, PricePoint } from "@/lib/regimeModel";
import { getSignalTier } from "@/lib/tiers";
import { getSparkScore } from "@/lib/sparkScore";

export interface BacktestObservation {
  date: string;
  score: number;
  tier: ReturnType<typeof getSignalTier>;
  futureVol1d: number | null;
  futureVol3d: number | null;
  futureVol7d: number | null;
}

function realisedMove(prices: PricePoint[], start: number, horizon: number): number | null {
  const end = start + horizon;
  if (end >= prices.length) return null;
  const a = prices[start].close;
  const b = prices[end].close;
  if (!a || !b) return null;
  return Math.abs(Math.log(b / a)) * 100;
}

export function backtestSeries(prices: PricePoint[], minHistory = 120): BacktestObservation[] {
  const sorted = [...prices].sort((a,b)=>a.date.localeCompare(b.date));
  const out: BacktestObservation[] = [];
  for (let end = minHistory; end < sorted.length - 1; end++) {
    const window = sorted.slice(0, end + 1);
    const fit = fitRegime(window);
    if (!fit) continue;
    const currentPrice = sorted[end].close;
    const prev = end > 0 ? sorted[end - 1].close : currentPrice;
    const coin: Coin = {
      id: "backtest",
      symbol: "BT",
      name: "Backtest",
      category: "Backtest",
      price: currentPrice,
      change24hPct: prev ? ((currentPrice / prev) - 1) * 100 : 0,
      regimeState: fit.currentState === 0 ? "calm" : "volatile",
      confidencePct: fit.confidence * 100,
      streakDays: fit.streakDays,
      medianDaysToFlip: fit.medianDaysToFlip,
      volatilityAcceleration: fit.volatilityAcceleration,
      volatilityPercentile: fit.volatilityPercentile,
      flipHazardPct: fit.flipHazardPct,
      recentStates: fit.hiddenStates.slice(-30),
    };
    out.push({
      date: sorted[end].date,
      score: getSparkScore(coin).score,
      tier: getSignalTier(coin),
      futureVol1d: realisedMove(sorted, end, 1),
      futureVol3d: realisedMove(sorted, end, 3),
      futureVol7d: realisedMove(sorted, end, 7),
    });
  }
  return out;
}

export interface ScoreBucketSummary {
  bucket: string;
  observations: number;
  avgFutureVol1d: number | null;
  avgFutureVol3d: number | null;
  avgFutureVol7d: number | null;
}

function average(values:(number|null)[]):number|null{const valid=values.filter((v):v is number=>v!==null&&Number.isFinite(v));return valid.length?valid.reduce((a,b)=>a+b,0)/valid.length:null}

export function summariseByScore(observations: BacktestObservation[]): ScoreBucketSummary[] {
  const buckets = [
    {label:"0-39",min:0,max:39},
    {label:"40-54",min:40,max:54},
    {label:"55-69",min:55,max:69},
    {label:"70-84",min:70,max:84},
    {label:"85-100",min:85,max:100},
  ];
  return buckets.map(b=>{
    const rows=observations.filter(o=>o.score>=b.min&&o.score<=b.max);
    return {bucket:b.label,observations:rows.length,avgFutureVol1d:average(rows.map(r=>r.futureVol1d)),avgFutureVol3d:average(rows.map(r=>r.futureVol3d)),avgFutureVol7d:average(rows.map(r=>r.futureVol7d))};
  });
}

export function summariseByTier(observations: BacktestObservation[]) {
  return (["calm","building","awakening","volatile"] as const).map(tier=>{
    const rows=observations.filter(o=>o.tier===tier);
    return {tier,observations:rows.length,avgFutureVol1d:average(rows.map(r=>r.futureVol1d)),avgFutureVol3d:average(rows.map(r=>r.futureVol3d)),avgFutureVol7d:average(rows.map(r=>r.futureVol7d))};
  });
}
