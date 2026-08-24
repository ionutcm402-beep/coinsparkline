import { Coin } from "@/types/coin";
import { getSignalTier } from "@/lib/tiers";
import { getSparkScore } from "@/lib/sparkScore";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

type Rule={id:string;user_id:string;coin_id:string;type:"regime-change"|"enters-awakening"|"enters-volatile"|"spark-above";threshold:number|null;enabled:boolean};
type AlertEvent={title:string;body:string;key:string;reason:string;previousTier:string;currentTier:string;previousSpark:number;currentSpark:number};

function eventFor(rule:Rule,current:Coin,previous?:Coin):AlertEvent|null{
  if(!previous)return null;
  const currentTier=getSignalTier(current),previousTier=getSignalTier(previous);
  const currentSpark=getSparkScore(current).score,previousSpark=getSparkScore(previous).score;
  if(rule.type==="regime-change"&&current.regimeState!==previous.regimeState)return {title:`${current.name} regime changed`,body:`${current.name} moved from ${previousTier} to ${currentTier}.`,reason:"The model detected a change in market regime.",key:`${rule.id}:${current.id}:regime:${previous.regimeState}->${current.regimeState}:${currentTier}`,previousTier,currentTier,previousSpark,currentSpark};
  if(rule.type==="enters-awakening"&&currentTier==="awakening"&&previousTier!=="awakening")return {title:`${current.name} entered Awakening`,body:`CoinSparkLine now classifies ${current.name} as Awakening.`,reason:"Early transition conditions strengthened enough to enter the Awakening tier.",key:`${rule.id}:${current.id}:awakening:${currentSpark}`,previousTier,currentTier,previousSpark,currentSpark};
  if(rule.type==="enters-volatile"&&currentTier==="volatile"&&previousTier!=="volatile")return {title:`${current.name} entered Volatile`,body:`${current.name} has moved into the Volatile state.`,reason:"The model detected conditions consistent with a volatile regime.",key:`${rule.id}:${current.id}:volatile:${currentSpark}`,previousTier,currentTier,previousSpark,currentSpark};
  if(rule.type==="spark-above"&&rule.threshold!=null&&currentSpark>=rule.threshold&&previousSpark<rule.threshold)return {title:`${current.name} SparkScore crossed ${rule.threshold}`,body:`SparkScore moved from ${previousSpark} to ${currentSpark}.`,reason:`Your SparkScore threshold of ${rule.threshold} was crossed.`,key:`${rule.id}:${current.id}:spark:${rule.threshold}:${currentSpark}`,previousTier,currentTier,previousSpark,currentSpark};
  return null;
}

function esc(value:string){return value.replace(/[&<>\"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[ch]||ch));}
function fmtPrice(price:number){if(price>=1000)return `$${price.toLocaleString(undefined,{maximumFractionDigits:2})}`;if(price>=1)return `$${price.toLocaleString(undefined,{maximumFractionDigits:4})}`;return `$${price.toLocaleString(undefined,{maximumSignificantDigits:5})}`;}

async function sendEmail(to:string,event:AlertEvent,coin:Coin){
  const apiKey=process.env.RESEND_API_KEY;
  const from=process.env.ALERT_FROM_EMAIL||"CoinSparkLine Alerts <alerts@coinsparkline.com>";
  if(!apiKey)return false;
  const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://coinsparkline.vercel.app").replace(/\/$/,"");
  const url=`${site}/coin/${coin.id}`;
  const change=coin.change24hPct??0;
  const changeText=`${change>=0?"+":""}${change.toFixed(2)}%`;
  const html=`<!doctype html><html><body style="margin:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#111827"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:24px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden"><tr><td style="padding:24px 28px;background:linear-gradient(135deg,#111827,#312e81);color:#fff"><div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;opacity:.75">CoinSparkLine Alert</div><h1 style="margin:8px 0 0;font-size:28px;line-height:1.2">${esc(event.title)}</h1></td></tr><tr><td style="padding:26px 28px"><p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#475569">${esc(event.body)}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:8px"><tr><td style="width:50%;padding:14px;border:1px solid #e5e7eb;border-radius:14px"><div style="font-size:11px;color:#94a3b8;text-transform:uppercase">Price</div><div style="margin-top:5px;font-size:20px;font-weight:700">${esc(fmtPrice(coin.price))}</div><div style="margin-top:3px;font-size:12px;color:${change>=0?"#059669":"#e11d48"}">${esc(changeText)} / 24h</div></td><td style="width:50%;padding:14px;border:1px solid #e5e7eb;border-radius:14px"><div style="font-size:11px;color:#94a3b8;text-transform:uppercase">Confidence</div><div style="margin-top:5px;font-size:20px;font-weight:700">${Math.round(coin.confidencePct)}%</div><div style="margin-top:3px;font-size:12px;color:#64748b">Current model confidence</div></td></tr><tr><td style="width:50%;padding:14px;border:1px solid #e5e7eb;border-radius:14px"><div style="font-size:11px;color:#94a3b8;text-transform:uppercase">Signal</div><div style="margin-top:5px;font-size:17px;font-weight:700;text-transform:capitalize">${esc(event.previousTier)} → ${esc(event.currentTier)}</div><div style="margin-top:3px;font-size:12px;color:#64748b">Tier change</div></td><td style="width:50%;padding:14px;border:1px solid #e5e7eb;border-radius:14px"><div style="font-size:11px;color:#94a3b8;text-transform:uppercase">SparkScore</div><div style="margin-top:5px;font-size:20px;font-weight:700">${event.previousSpark} → ${event.currentSpark}</div><div style="margin-top:3px;font-size:12px;color:#64748b">Signal strength</div></td></tr></table><div style="margin:20px 0;padding:16px 18px;background:#f8fafc;border-radius:14px"><div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Why you received this</div><p style="margin:7px 0 0;font-size:14px;line-height:1.6;color:#334155">${esc(event.reason)}</p></div><p style="margin:22px 0"><a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 18px;border-radius:999px">Open ${esc(coin.name)} analysis</a></p><hr style="border:0;border-top:1px solid #e5e7eb;margin:26px 0 18px"><p style="margin:0;font-size:11px;line-height:1.6;color:#94a3b8">Signal alert only. CoinSparkLine indicators are informational and are not personalised investment advice or predictions of return.</p></td></tr></table></td></tr></table></body></html>`;
  const resp=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from,to,subject:`CoinSparkLine: ${event.title}`,html})});
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
    if(email&&await sendEmail(email,event,current)){emails++;await supabase.from("alert_events").update({delivered_email:true}).eq("id",inserted.id);}
  }
  return {evaluated:true,events,emails};
}
