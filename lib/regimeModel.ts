// Converts a raw price series into log-returns + rolling volatility, fits a
// 2-state HMM, then adds continuous diagnostics used by the four-stage UI.
import { fitGaussianHmm } from "./hmm";

export interface PricePoint { date: string; close: number; }
export interface RegimeTransition { date: string; fromState: number; toState: number; }

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
  currentVolatility: number;
  baselineVolatility: number;
  volatilityAccelerationPct: number;
  volatilityPercentile: number;
  flipHazardPct: number;
}

export function buildFeatures(prices: PricePoint[], volWindow = 12): { X: number[][]; dates: string[]; closes: number[] } {
  const sorted = [...prices].sort((a, b) => a.date.localeCompare(b.date));
  const logRet: number[] = [NaN];
  for (let i = 1; i < sorted.length; i++) logRet.push(Math.log(sorted[i].close / sorted[i - 1].close));
  const realizedVol: number[] = new Array(sorted.length).fill(NaN);
  for (let i = 0; i < sorted.length; i++) {
    if (i < volWindow) continue;
    const window = logRet.slice(i - volWindow + 1, i + 1);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((a, b) => a + (b - mean) ** 2, 0) / (window.length - 1);
    realizedVol[i] = Math.sqrt(variance);
  }
  const X:number[][]=[]; const dates:string[]=[]; const closes:number[]=[];
  for(let i=0;i<sorted.length;i++){if(isNaN(logRet[i])||isNaN(realizedVol[i]))continue;X.push([logRet[i],realizedVol[i]]);dates.push(sorted[i].date);closes.push(sorted[i].close)}
  return { X, dates, closes };
}

function median(values:number[]):number{if(!values.length)return 0;const s=[...values].sort((a,b)=>a-b);const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2}

export function fitRegime(prices: PricePoint[], minObservations = 40): RegimeFit | null {
  const { X, dates, closes } = buildFeatures(prices);
  if (X.length < minObservations) return null;
  const fit = fitGaussianHmm(X, 2);
  const volByState=[0,1].map(state=>{const ix=fit.hiddenStates.map((s,i)=>s===state?i:-1).filter(i=>i>=0);if(!ix.length)return Infinity;return ix.reduce((sum,i)=>sum+X[i][1],0)/ix.length});
  const order=volByState[0]<=volByState[1]?[0,1]:[1,0];
  const relabel:Record<number,number>={[order[0]]:0,[order[1]]:1};
  const hiddenStates=fit.hiddenStates.map(s=>relabel[s]);
  const stateProbs=fit.stateProbs.map(row=>[row[order[0]],row[order[1]]]);
  const transmat=[[fit.transmat[order[0]][order[0]],fit.transmat[order[0]][order[1]]],[fit.transmat[order[1]][order[0]],fit.transmat[order[1]][order[1]]]];
  const n=hiddenStates.length;const currentState=hiddenStates[n-1];const confidence=stateProbs[n-1][currentState];
  let streakDays=1;for(let i=n-2;i>=0&&hiddenStates[i]===currentState;i--)streakDays++;
  const transitions:RegimeTransition[]=[];const streakLengths:number[]=[];const streakStates:number[]=[];let runStart=0;
  for(let i=1;i<=n;i++){if(i===n||hiddenStates[i]!==hiddenStates[runStart]){streakLengths.push(i-runStart);streakStates.push(hiddenStates[runStart]);if(i<n)transitions.push({date:dates[i],fromState:hiddenStates[i-1],toState:hiddenStates[i]});runStart=i}}
  const previousStreakDays=streakLengths.length>=2?streakLengths[streakLengths.length-2]:null;
  const previousState=streakStates.length>=2?streakStates[streakStates.length-2]:null;
  const longestStreakByState:[number,number]=[0,0];for(let i=0;i<streakLengths.length;i++){const s=streakStates[i];if(streakLengths[i]>longestStreakByState[s])longestStreakByState[s]=streakLengths[i]}
  const pStay=Math.min(transmat[currentState][currentState],0.999999);const medianDaysToFlip=Math.log(.5)/Math.log(pStay);const meanDaysToFlip=1/(1-pStay);

  // Phase 2 diagnostics: compare today's realised volatility with the prior
  // 30-observation median, place it in its own 1-year distribution, and expose
  // the fitted state's one-step probability of leaving the current regime.
  const volSeries=X.map(row=>row[1]);
  const currentVolatility=volSeries[volSeries.length-1];
  const priorWindow=volSeries.slice(Math.max(0,volSeries.length-31),-1);
  const baselineVolatility=median(priorWindow.length?priorWindow:volSeries.slice(0,-1));
  const volatilityAccelerationPct=baselineVolatility>0?((currentVolatility/baselineVolatility)-1)*100:0;
  const volatilityPercentile=(volSeries.filter(v=>v<=currentVolatility).length/volSeries.length)*100;
  const flipHazardPct=Math.max(0,Math.min(100,transmat[currentState][1-currentState]*100));

  return {hiddenStates,stateProbs,transmat,dates,closes,currentState,confidence,streakDays,medianDaysToFlip,meanDaysToFlip,transitions:transitions.reverse(),previousStreakDays,previousState,longestStreakByState,currentVolatility,baselineVolatility,volatilityAccelerationPct,volatilityPercentile,flipHazardPct};
}
