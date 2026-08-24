import {SparkHistoryPoint} from "@/lib/sparkHistory";

export interface HorizonStats{days:number;sampleSize:number;median:number;positiveRate:number;best:number;worst:number;q25:number;q75:number}
export interface SignalBacktest{matches:number;scoreTolerance:number;confidenceTolerance:number;currentScore:number;currentConfidence:number;currentRegime:"calm"|"volatile";horizons:HorizonStats[]}
function percentile(values:number[],p:number){if(!values.length)return 0;const a=[...values].sort((x,y)=>x-y);const i=(a.length-1)*p;const lo=Math.floor(i),hi=Math.ceil(i);if(lo===hi)return a[lo];const w=i-lo;return a[lo]*(1-w)+a[hi]*w}
export function buildSignalBacktest(points:SparkHistoryPoint[],scoreTolerance=7,confidenceTolerance=12):SignalBacktest|null{
 if(points.length<120)return null;const current=points[points.length-1];const horizons=[7,30,90];const eligible=points.map((p,i)=>({p,i})).filter(({p,i})=>i<points.length-91&&p.regime===current.regime&&Math.abs(p.score-current.score)<=scoreTolerance&&Math.abs(p.confidence-current.confidence)<=confidenceTolerance);
 const stats=horizons.map(days=>{const returns=eligible.filter(({i})=>i+days<points.length).map(({p,i})=>((points[i+days].price-p.price)/p.price)*100).filter(Number.isFinite);return{days,sampleSize:returns.length,median:percentile(returns,.5),positiveRate:returns.length?returns.filter(v=>v>0).length/returns.length*100:0,best:returns.length?Math.max(...returns):0,worst:returns.length?Math.min(...returns):0,q25:percentile(returns,.25),q75:percentile(returns,.75)}});
 return{matches:eligible.length,scoreTolerance,confidenceTolerance,currentScore:current.score,currentConfidence:current.confidence,currentRegime:current.regime,horizons:stats}
}
