import { Coin } from "@/types/coin";
import { getSignalTier } from "@/lib/tiers";
import { getSparkScore } from "@/lib/sparkScore";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

type Rule={id:string;user_id:string;coin_id:string;type:"regime-change"|"enters-awakening"|"enters-volatile"|"spark-above";threshold:number|null;enabled:boolean};

function eventFor(rule:Rule,current:Coin,previous?:Coin){
  if(!previous)return null;
  const currentTier=getSignalTier(current),previousTier=getSignalTier(previous);
  const currentSpark=getSparkScore(current).score,previousSpark=getSparkScore(previous).score;
  if(rule.type==="regime-change"&&current.regimeState!==previous.regimeState)return {title:`${current.name} regime changed`,body:`${current.name} moved from ${previousTier} to ${currentTier}. SparkScore ${currentSpark}.`,key:`${rule.id}:${current.id}:regime:${previous.regimeState}->${current.regimeState}:${currentTier}`};
  if(rule.type==="enters-awakening"&&currentTier==="awakening"&&previousTier!=="awakening")return {title:`${current.name} entered Awakening`,body:`CoinSparkLine now classifies ${current.name} as Awakening with ${current.confidencePct.toFixed(0)}% confidence. SparkScore ${currentSpark}.`,key:`${rule.id}:${current.id}:awakening:${currentSpark}`};
  if(rule.type==="enters-volatile"&&currentTier==="volatile"&&previousTier!=="volatile")return {title:`${current.name} entered Volatile`,body:`${current.name} has moved into the Volatile state with ${current.confidencePct.toFixed(0)}% confidence. SparkScore ${currentSpark}.`,key:`${rule.id}:${current.id}:volatile:${currentSpark}`};
  if(rule.type==="spark-above"&&rule.threshold!=null&&currentSpark>=rule.threshold&&previousSpark<rule.threshold)return {title:`${current.name} SparkScore crossed ${rule.threshold}`,body:`SparkScore moved from ${previousSpark} to ${currentSpark}. Current signal: ${currentTier}.`,key:`${rule.id}:${current.id}:spark:${rule.threshold}:${currentSpark}`};
  return null;
}

async function sendEmail(to:string,title:string,body:string,coinId:string){
  const apiKey=process.env.RESEND_API_KEY;
  const from=process.env.ALERT_FROM_EMAIL||"CoinSparkLine Alerts <alerts@coinsparkline.com>";
  if(!apiKey)return false;
  const site=process.env.NEXT_PUBLIC_SITE_URL||"https://coinsparkline.vercel.app";
  const resp=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from,to,subject:`CoinSparkLine: ${title}`,html:`<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:auto\"><h2>${title}</h2><p>${body}</p><p><a href=\"${site}/coin/${coinId}\">Open CoinSparkLine analysis</a></p><hr/><p style=\"font-size:12px;color:#667085\">Signal alert only. Not financial advice.</p></div>`})});
  return resp.ok;
}

export async function evaluateAndDeliverAlerts(currentCoins:Coin[],previousCoins:Coin[]){
  const supabase=getSupabaseAdminClient();
  if(!supabase)return {evaluated:false,reason:"SUPABASE_SECRET_KEY missing",events:0,emails:0};
  const {data:rules,error}=await supabase.from("alert_rules").select("id,user_id,coin_id,type,threshold,enabled").eq("enabled",true);
  if(error)return {evaluated:false,reason:error.message,events:0,emails:0};
  const currentMap=new Map(currentCoins.map(c=>[c.id,c])),previousMap=new Map(previousCoins.map(c=>[c.id,c]));
  let events=0,emails=0;
  for(const raw of rules||[]){const rule=raw as Rule;const current=currentMap.get(rule.coin_id);if(!current)continue;const event=eventFor(rule,current,previousMap.get(rule.coin_id));if(!event)continue;
    const {data:inserted,error:insertError}=await supabase.from("alert_events").insert({user_id:rule.user_id,rule_id:rule.id,coin_id:rule.coin_id,title:event.title,body:event.body,event_key:event.key}).select("id").maybeSingle();
    if(insertError||!inserted)continue;events++;
    const {data:userData}=await supabase.auth.admin.getUserById(rule.user_id);const email=userData?.user?.email;
    if(email&&await sendEmail(email,event.title,event.body,rule.coin_id)){emails++;await supabase.from("alert_events").update({delivered_email:true}).eq("id",inserted.id);}
  }
  return {evaluated:true,events,emails};
}
