import type {MarketSignal} from "@/types/market";

function change(current:number,previous:number){return previous?((current-previous)/previous)*100:0}

export async function getFxSignals():Promise<MarketSignal[]>{
 const end=new Date();const start=new Date(end.getTime()-7*86400000);const iso=(d:Date)=>d.toISOString().slice(0,10);const response=await fetch(`https://api.frankfurter.app/${iso(start)}..${iso(end)}?from=USD&to=GBP,EUR,JPY`,{next:{revalidate:3600},signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error(`FX provider ${response.status}`);const payload=await response.json();const dates=Object.keys(payload.rates||{}).sort();if(dates.length<2)return [];const latest=payload.rates[dates.at(-1)!],previous=payload.rates[dates.at(-2)!];const rows=[{id:"usd-gbp",symbol:"USD/GBP",name:"US Dollar / British Pound",current:Number(latest.GBP),prev:Number(previous.GBP)},{id:"usd-eur",symbol:"USD/EUR",name:"US Dollar / Euro",current:Number(latest.EUR),prev:Number(previous.EUR)},{id:"usd-jpy",symbol:"USD/JPY",name:"US Dollar / Japanese Yen",current:Number(latest.JPY),prev:Number(previous.JPY)}];return rows.map(r=>({id:r.id,assetClass:"fx",symbol:r.symbol,name:r.name,price:r.current,unit:"rate",change24hPct:change(r.current,r.prev),sparkScore:null,regime:null,confidencePct:null,behaviourStatus:"experimental",source:"Frankfurter / ECB reference rates",updatedAt:dates.at(-1)||null}));
}

export async function getGoldSignal():Promise<MarketSignal|null>{
 const response=await fetch("https://api.gold-api.com/price/XAU",{next:{revalidate:300},signal:AbortSignal.timeout(10000)});if(!response.ok)return null;const data=await response.json();const price=Number(data.price);if(!Number.isFinite(price))return null;const rawChange=Number(data.change_percent??data.changePercent??data.chp);return {id:"xau-usd",assetClass:"commodity",symbol:"XAU/USD",name:"Gold",price,unit:"USD / oz",change24hPct:Number.isFinite(rawChange)?rawChange:null,sparkScore:null,regime:null,confidencePct:null,behaviourStatus:"unavailable",source:"Gold-API",updatedAt:data.updatedAt?String(data.updatedAt):new Date().toISOString()};
}

export async function getMacroSignals(){const[fx,gold]=await Promise.allSettled([getFxSignals(),getGoldSignal()]);return [...(fx.status==="fulfilled"?fx.value:[]),...(gold.status==="fulfilled"&&gold.value?[gold.value]:[])];}
