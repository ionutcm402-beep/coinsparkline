import {fitRegime} from "@/lib/regimeModel";

type ValidationResult={symbol:string;observations:number;transitions:number;calmShare:number;volatileShare:number;confidence:number;medianDaysToFlip:number|null;compatible:boolean;notes:string[]};

async function fxHistory(currency:"GBP"|"EUR"|"JPY",days=460){
 const end=new Date();const start=new Date(end.getTime()-days*86400000);const iso=(d:Date)=>d.toISOString().slice(0,10);const r=await fetch(`https://api.frankfurter.app/${iso(start)}..${iso(end)}?from=USD&to=${currency}`,{next:{revalidate:21600},signal:AbortSignal.timeout(12000)});if(!r.ok)throw new Error(`FX history ${r.status}`);const data=await r.json();return Object.entries(data.rates||{}).sort(([a],[b])=>a.localeCompare(b)).map(([date,row]:any)=>({date,close:Number(row[currency])})).filter(x=>Number.isFinite(x.close)&&x.close>0);
}

function evaluate(symbol:string,history:{date:string;close:number}[]):ValidationResult{
 const fit=fitRegime(history);if(!fit)return {symbol,observations:history.length,transitions:0,calmShare:0,volatileShare:0,confidence:0,medianDaysToFlip:null,compatible:false,notes:["Model could not fit the available history."]};
 const calm=fit.hiddenStates.filter(x=>x===0).length,volatile=fit.hiddenStates.length-calm,total=Math.max(1,fit.hiddenStates.length);const calmShare=calm/total,volatileShare=volatile/total;const notes:string[]=[];
 if(total<250)notes.push("Fewer than 250 usable observations.");if(fit.transitions.length<4)notes.push("Too few historical regime transitions.");if(calmShare<.1||volatileShare<.1)notes.push("One regime occupies less than 10% of history.");if(!Number.isFinite(fit.confidence))notes.push("Current confidence is not finite.");if(!Number.isFinite(fit.medianDaysToFlip)||fit.medianDaysToFlip>365)notes.push("Typical flip estimate exceeds the validation horizon.");
 return {symbol,observations:total,transitions:fit.transitions.length,calmShare:Number((calmShare*100).toFixed(1)),volatileShare:Number((volatileShare*100).toFixed(1)),confidence:Number((fit.confidence*100).toFixed(1)),medianDaysToFlip:Number.isFinite(fit.medianDaysToFlip)?Number(fit.medianDaysToFlip.toFixed(1)):null,compatible:notes.length===0,notes};
}

export async function validateFxModel(){const pairs=await Promise.allSettled((["GBP","EUR","JPY"] as const).map(async currency=>evaluate(`USD/${currency}`,await fxHistory(currency))));return pairs.map((result,index)=>result.status==="fulfilled"?result.value:{symbol:`USD/${["GBP","EUR","JPY"][index]}`,observations:0,transitions:0,calmShare:0,volatileShare:0,confidence:0,medianDaysToFlip:null,compatible:false,notes:["Historical provider unavailable."]});}
