import type {MarketSignal} from "@/types/market";

const SYMBOLS=["AAPL","MSFT","NVDA","TSLA","AMZN","META"] as const;

export function stockFeedConfigured(){return Boolean(process.env.TWELVE_DATA_API_KEY)&&process.env.STOCK_DATA_EXTERNAL_DISPLAY_OK==="true";}

export async function getStockSignals():Promise<MarketSignal[]>{
 if(!stockFeedConfigured())return [];
 const key=process.env.TWELVE_DATA_API_KEY!;
 const results=await Promise.allSettled(SYMBOLS.map(async symbol=>{
  const url=`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(key)}`;
  const response=await fetch(url,{next:{revalidate:60},signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error(`Stock provider ${response.status}`);const data=await response.json();if(data.status==="error")throw new Error(String(data.message||"Stock provider error"));
  const price=Number(data.close??data.price),changePct=Number(data.percent_change);
  if(!Number.isFinite(price))throw new Error("Invalid stock quote");
  return {id:`stock-${symbol.toLowerCase()}`,assetClass:"stock" as const,symbol,name:String(data.name||symbol),price,unit:String(data.currency||"USD"),change24hPct:Number.isFinite(changePct)?changePct:null,sparkScore:null,regime:null,confidencePct:null,behaviourStatus:"unavailable" as const,source:"Twelve Data licensed display feed",updatedAt:data.datetime?String(data.datetime):new Date().toISOString()};
 }));
 return results.flatMap(r=>r.status==="fulfilled"?[r.value]:[]);
}
