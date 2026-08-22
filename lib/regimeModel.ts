import { fitGaussianHmm } from "./hmm";

interface PricePoint {
  date: string;
  close: number;
}

export interface RegimeFit {
  closes: number[];
  currentState: number; // 0 = calm, 1 = volatile
  confidence: number; // 0-1, probability of the current state
  streakDays: number;
  medianDaysToFlip: number;
  hiddenStates: number[]; // 0 = calm, 1 = volatile, per day
  stateProbs: number[][];
}

const MIN_POINTS = 30;
const VOL_WINDOW = 7;

export function fitRegime(points: PricePoint[]): RegimeFit | null {
  if (points.length < MIN_POINTS) return null;

  const sorted = [...points].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const closes = sorted.map((p) => p.close);

  const logReturns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    logReturns.push(Math.log(closes[i] / closes[i - 1]));
  }

  const features: number[][] = logReturns.map((_, i) => {
    const start = Math.max(0, i - VOL_WINDOW + 1);
    const window = logReturns.slice(start, i + 1);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((a, b) => a + (b - mean) ** 2, 0) / window.length;
    return [logReturns[i], Math.sqrt(variance)];
  });

  if (features.length < 10) return null;

  const fit = fitGaussianHmm(features, 2);

  // Whichever raw state has the lower mean volatility is "calm" (0).
  const calmRawState = fit.means[0][1] <= fit.means[1][1] ? 0 : 1;
  const remap = (s: number) => (s === calmRawState ? 0 : 1);

  const hiddenStates = fit.hiddenStates.map(remap);
  const stateProbs = fit.stateProbs.map((p) =>
    calmRawState === 0 ? p : [p[1], p[0]]
  );

  const currentState = hiddenStates[hiddenStates.length - 1];
  const confidence = stateProbs[stateProbs.length - 1][currentState];

  let streakDays = 1;
  for (let i = hiddenStates.length - 2; i >= 0; i--) {
    if (hiddenStates[i] === currentState) streakDays++;
    else break;
  }

  const selfProbRaw =
    currentState === 0
      ? fit.transmat[calmRawState][calmRawState]
      : fit.transmat[1 - calmRawState][1 - calmRawState];
  const p = Math.min(Math.max(selfProbRaw, 1e-6), 1 - 1e-6);
  const medianDaysToFlip = Math.log(0.5) / Math.log(p);

  return { closes, currentState, confidence, streakDays, medianDaysToFlip, hiddenStates, stateProbs };
}
