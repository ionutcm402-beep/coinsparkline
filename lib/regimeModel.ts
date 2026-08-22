// Port of regime_model.py's build_features + fit_hmm. Converts a raw price
// series into log-returns + rolling volatility, fits the 2-state HMM, and
// relabels states so 0 = calmest ("stasis") and 1 = most volatile
// ("punctuation") -- HMM label order is otherwise arbitrary.

import { fitGaussianHmm } from "./hmm";

export interface PricePoint {
  date: string; // ISO date
  close: number;
}

export interface RegimeTransition {
  date: string;
  fromState: number;
  toState: number;
}

export interface RegimeFit {
  hiddenStates: number[]; // 0 = calm, 1 = volatile, aligned to `dates`
  stateProbs: number[][]; // [obs][state]
  transmat: number[][];
  dates: string[];
  closes: number[];
  currentState: number;
  confidence: number;
  streakDays: number;
  medianDaysToFlip: number;
  meanDaysToFlip: number;
  transitions: RegimeTransition[]; // every real regime change found in the history, oldest first
  previousStreakDays: number | null; // length of the streak immediately before this one (null if none)
  previousState: number | null;
  longestStreakByState: [number, number]; // [longest calm streak, longest volatile streak] ever observed
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
  const closes:
