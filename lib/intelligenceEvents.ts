import {Coin} from "@/types/coin";
import {getSignalTier} from "@/lib/tiers";
import {getSparkScore} from "@/lib/sparkScore";
import {getSupabaseAdminClient} from "@/lib/supabaseServer";

export type IntelligenceEventType="regime_change"|"tier_change"|"spark_cross"|"spark_jump"|"confidence_jump";
export type IntelligenceEvent={id:string;asset_class:string;asset_id:string;symbol:string;name:string;event_type:IntelligenceEventType;title:string;body:string;previous_value:number|null;current_value:number|null;previous_state:string|null;current_state:string|null;importance:number;created_at:string};

type Draft=Omit<IntelligenceEvent,"id"|"created_at">&{event_key:string};

function draft(current:Coin,previous:Coin):Draft[]{
 const events:Draft[]=[];const nowTier=getSignalTier(current),prevTier=getSignalTier(previous);const nowSpark=getSparkScore(current).score,prevSpark=getSparkScore(previous).score;
 const base={asset_class:"crypto",asset_id:current.id,symbol:current.symbol.toUpperCase(),name:current.name};
 if(current.regimeState!==previous.regimeState)events.push({...base,event_type:"regime_change",title:`${current.symbol.toUpperCase()} regime changed`,body:`${current.name} moved from ${previous.regimeState} to ${current.regimeState}.`,previous_value:null,current_value:null,previous_state:previous.regimeState,current_state:current.regimeState,importance:95,event_key:`crypto:${current.id}:regime:${previous.regimeState}:${current.regimeState}:${current.streakDays}`});
 if(nowTier!==prevTier)events.push({...base,event_type:"tier_change",title:`${current.symbol.toUpperCase()} entered ${nowTier}`,body:`Signal tier changed from ${prevTier} to ${nowTier}.`,previous_value:null,current_value:null,previous_state:prevTier,current_state:nowTier,importance:nowTier==="volatile"?90:nowTier==="awakening"?82:72,event_key:`crypto:${current.id}:tier:${prevTier}:${nowTier}:${nowSpark}`});
 for(const threshold of [55,70,85])if(nowSpark>=threshold&&prevSpark<threshold)events.push({...base,event_type:"spark_cross",title:`${current.symbol.toUpperCase()} SparkScore crossed ${threshold}`,body:`SparkScore moved from ${prevSpark} to ${nowSpark}.`,previous_value:prevSpark,current_value:nowSpark,previous_state:prevTier,current_state:nowTier,importance:threshold===85?94:threshold===70?86:74,event_key:`crypto:${current.id}:spark-cross:${threshold}:${nowSpark}`});
 const sparkDelta=nowSpark-prevSpark;if(Math.abs(sparkDelta)>=12)events.push({...base,event_type:"spark_jump",title:`${current.symbol.toUpperCase()} SparkScore ${sparkDelta>0?"accelerated":"cooled"}`,body:`SparkScore changed ${sparkDelta>0?"+":""}${sparkDelta} points since the previous scan.`,previous_value:prevSpark,current_value:nowSpark,previous_state:prevTier,current_state:nowTier,importance:Math.min(92,72+Math.abs(sparkDelta)),event_key:`crypto:${current.id}:spark-jump:${prevSpark}:${nowSpark}`});
 const confidenceDelta=current.confidencePct-previous.confidencePct;if(Math.abs(confidenceDelta)>=15)events.push({...base,event_type:"confidence_jump",title:`${current.symbol.toUpperCase()} model confidence shifted`,body:`Confidence changed from ${previous.confidencePct.toFixed(0)}% to ${current.confidencePct.toFixed(0)}%.`,previous_value:previous.confidencePct,current_value:current.confidencePct,previous_state:prevTier,current_state:nowTier,importance:70,event_key:`crypto:${current.id}:confidence:${Math.round(previous.confidencePct)}:${Math.round(current.confidencePct)}`});
 return events;
}

export async function recordIntelligenceEvents(currentCoins:Coin[],previousCoins:Coin[]){
 const supabase=getSupabaseAdminClient();if(!supabase)return {recorded:0,available:false};const previous=new Map(previousCoins.map(c=>[c.id,c]));const rows=currentCoins.flatMap(c=>{const p=previous.get(c.id);return p?draft(c,p):[]}).sort((a,b)=>b.importance-a.importance).slice(0,80);if(!rows.length)return {recorded:0,available:true};
 let recorded=0;for(const row of rows){const {error}=await supabase.from("intelligence_events").insert(row);if(!error)recorded++;}
 return {recorded,available:true};
}

export async function getLatestIntelligenceEvents(limit=24):Promise<IntelligenceEvent[]>{
 const supabase=getSupabaseAdminClient();if(!supabase)return [];const {data,error}=await supabase.from("intelligence_events").select("id,asset_class,asset_id,symbol,name,event_type,title,body,previous_value,current_value,previous_state,current_state,importance,created_at").order("created_at",{ascending:false}).order("importance",{ascending:false}).limit(Math.max(1,Math.min(limit,50)));if(error)return [];return (data||[]) as IntelligenceEvent[];
}
