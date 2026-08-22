// Port of regime_model.py's build_features + fit_hmm. Converts a raw price
// series into log-returns + rolling volatility, fits the 2-state HMM, and
// relabels states so 0 = calmest ("stasis") and 1 = most volatile
// ("punctuation") -- HMM label order is otherwise arbitrary.

import { fitGaussianHmm } from "./hmm";

export interface PricePoint {
  date: string;
  close: number;
}

export interface RegimeTransition {
  date: string;
  fromState: number;
  toState: number;
}

export interface RegimeFit {
  hiddenStates: number[];
  stateProbs: number[][];
  transmat: number[][];
  dates: string[];
  closes: number[];
  currentState: number;
  confidence: number;
  streakDays: number;
  medianDaysToFlip: number;
  meanDaysToFlip: number;
  transitions: RegimeTransition[];
  previousStreakDays: number | null;
  previousState: number | null;
  longestStreakByState: [number, number];
}

export function buildFeatures(prices: PricePoint[], volWindow = 12): { X: number[][]; dates: string[]; closes: number[] } {
  const sorted = [...prices].sort((a, b) => a.date.localeCompare(b.date));
  const logRet: number[] = [NaN];
  for (let i = 1; i < sorted.length; i++) {
    logRet.push(Math.log(sorted[i].close / sorted[i - 1].close));
  }

  const realizedVol: number[] = new Array(sorted.length).fill(NaN);
  for (let i = 0; i < sorted.length; i++) {
    if (i < volWindow) continue;
    const window = logRet.slice(i - volWindow + 1, i + 1);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((a, b) => a + (b - mean) ** 2, 0) / (window.length - 1);
    realizedVol[i] = Math.sqrt(variance);
  }

  const X: number[][] = [];
  const dates: string[] = [];
  const closes: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (isNaN(logRet[i]) || isNaN(realizedVol[i])) continue;
    X.push([logRet[i], realizedVol[i]]);
    dates.push(sorted[i].date);
    closes.push(sorted[i].close);
  }

  return { X, dates, closes };
}

export function fitRegime(prices: PricePoint[], minObservations = 40): RegimeFit | null {
  const { X, dates, closes } = buildFeatures(prices);
  if (X.length < minObservations) return null;

  const fit = fitGaussianHmm(X, 2);

  const volByState = [0, 1].map((state) => {
    const indices = fit.hiddenStates.map((s, i) => (s === state ? i : -1)).filter((i) => i >= 0);
    if (indices.length === 0) return Infinity;
    return indices.reduce((sum, i) => sum + X[i][1], 0) / indices.length;
  });
  const order = volByState[0] <= volByState[1] ? [0, 1] : [1, 0];
  const relabel: Record<number, number> = { [order[0]]: 0, [order[1]]: 1 };

  const hiddenStates = fit.hiddenStates.map((s) => relabel[s]);
  const stateProbs = fit.stateProbs.map((row) => [row[order[0]], row[order[1]]]);
  const transmat = [
    [fit.transmat[order[0]][order[0]], fit.transmat[order[0]][order[1]]],
    [fit.transmat[order[1]][order[0]], fit.transmat[order[1]][order[1]]],
  ];

  const n = hiddenStates.length;
  const currentState = hiddenStates[n - 1];
  const confidence = stateProbs[n - 1][currentState];

  let streakDays = 1;
  for (let i = n - 2; i >= 0 && hiddenStates[i] === currentState; i--) streakDays++;

  const transitions: RegimeTransition[] = [];
  const streakLengths: number[] = [];
  const streakStates: number[] = [];
  let runStart = 0;
  for (let i = 1; i <= n; i++) {
    if (i === n || hiddenStates[i] !== hiddenStates[runStart]) {
      streakLengths.push(i - runStart);
      streakStates.push(hiddenStates[runStart]);
      if (i < n) {
        transitions.push({ date: dates[i], fromState: hiddenStates[i - 1], toState: hiddenStates[i] });
      }
      runStart = i;
    }
  }
  const previousStreakDays = streakLengths.length >= 2 ? streakLengths[streakLengths.length - 2] : null;
  const previousState = streakStates.length >= 2 ? streakStates[streakStates.length - 2] : null;

  const longestStreakByState: [number, number] = [0, 0];
  for (let i = 0; i < streakLengths.length; i++) {
    const s = streakStates[i];
    if (streakLengths[i] > longestStreakByState[s]) longestStreakByState[s] = streakLengths[i];
  }

  const pStay = Math.min(transmat[currentState][currentState], 0.999999);
  const medianDaysToFlip = Math.log(0.5) / Math.log(pStay);
  const meanDaysToFlip = 1 / (1 - pStay);

  return {
    hiddenStates,
    stateProbs,
    transmat,
    dates,
    closes,
    currentState,
    confidence,
    streakDays,
    medianDaysToFlip,
    meanDaysToFlip,
    transitions: transitions.reverse(),
    previousStreakDays,
    previousState,
    longestStreakByState,
  };
}
