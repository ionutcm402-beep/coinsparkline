"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { ALERT_RULES_KEY, AlertRule } from "@/components/AlertRuleButton";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const LABELS:Record<AlertRule["type"],string>={
 "regime-change":"Any regime change",
 "enters-awakening":"Enters Awakening",
 "enters-volatile":"Enters Volatile",
 "spark-above":"SparkScore threshold",
};

type AlertRuleRow={coin_id:string;type:AlertRule["type"];threshold:number|null;created_at:string};

function readLocal():AlertRule[]{
 if(typeof window==="undefined")return[];
 try{return JSON.parse(localStorage.getItem(ALERT_RULES_KEY)||"[]") as AlertRule[]}catch{return[]}
}

function writeLocal(rules:AlertRule[]){
 localStorage.setItem(ALERT_RULES_KEY,JSON.stringify(rules));
 window.dispatchEvent(new CustomEvent("csl-alert-rules-change"));
}

export default function AlertsPage(){
 const[rules,setRules]=useState<AlertRule[]>([]);
 const[loading,setLoading]=useState(true);
 const[signedIn,setSignedIn]=useState(false);
 const[status,setStatus]=useState("Checking account sync…");
 const[testState,setTestState]=useState<"idle"|"sending"|"sent"|"error">("idle");
 const[testMessage,setTestMessage]=useState("");

 async function load(){
  const local=readLocal();
  try{
   const supabase=getSupabaseBrowserClient();
   const{data:{user}}=await supabase.auth.getUser();
   if(!user){setSignedIn(false);setRules(local);setStatus("Saved on this device. Sign in to sync alerts across devices.");return;}
   setSignedIn(true);
   const response=await supabase.from("alert_rules").select("coin_id,type,threshold,created_at").eq("user_id",user.id).eq("enabled",true).order("created_at",{ascending:false});
   if(response.error)throw response.error;
   const remote:AlertRule[]=((response.data??[]) as AlertRuleRow[]).map(r=>({coinId:r.coin_id,type:r.type,threshold:r.threshold??undefined,createdAt:r.created_at}));
   const merged:AlertRule[]=[...remote];
   for(const item of local){if(!merged.some(r=>r.coinId===item.coinId&&r.type===item.type))merged.push(item)}
   setRules(merged);
   setStatus(`Synced to your CoinSparkLine account · ${remote.length} cloud rule${remote.length===1?"":"s"}`);
  }catch(err){setRules(local);setStatus(err instanceof Error?`Account sync unavailable: ${err.message}`:"Account sync unavailable. Showing device rules.");}
  finally{setLoading(false)}
 }

 useEffect(()=>{
  load();
  const reload=()=>load();
  window.addEventListener("csl-alert-rules-change",reload);
  return()=>window.removeEventListener("csl-alert-rules-change",reload);
 },[]);

 async function sendTestEmail(){
  setTestState("sending");setTestMessage("");
  try{
   const supabase=getSupabaseBrowserClient();
   const{data:{session},error}=await supabase.auth.getSession();
   if(error||!session?.access_token)throw new Error("Please sign in again before testing email delivery.");
   const response=await fetch("/api/test-alert",{method:"POST",headers:{Authorization:`Bearer ${session.access_token}`}});
   const result=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(result?.error||"Test email could not be sent.");
   setTestState("sent");setTestMessage("Test email sent. Check the inbox for your CoinSparkLine account.");
  }catch(err){setTestState("error");setTestMessage(err instanceof Error?err.message:"Test email could not be sent.");}
 }

 async function remove(rule:AlertRule){
  const next=readLocal().filter(r=>!(r.coinId===rule.coinId&&r.type===rule.type));
  writeLocal(next);
  if(signedIn){
   try{
    const supabase=getSupabaseBrowserClient();
    const{data:{user}}=await supabase.auth.getUser();
    if(user){
     const{error}=await supabase.from("alert_rules").delete().eq("user_id",user.id).eq("coin_id",rule.coinId).eq("type",rule.type);
     if(error)throw error;
    }
   }catch(err){setStatus(err instanceof Error?`Removed on this device; cloud removal failed: ${err.message}`:"Removed on this device; cloud removal failed.")}
  }
  await load();
 }

 const grouped=useMemo(()=>rules.reduce<Record<string,AlertRule[]>>((acc,r)=>{(acc[r.coinId]??=[]).push(r);return acc},{}),[rules]);

 return <div className="min-h-screen bg-[#fbfcff] text-slate-950"><Header/><main className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
  <div className="mx-auto max-w-2xl text-center"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">Signal alerts</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Watch the change, not the noise.</h1><p className="mt-3 text-sm leading-6 text-slate-500">Create rules for regime flips, Awakening, Volatile entry or SparkScore thresholds. Signed-in users sync rules through their CoinSparkLine account.</p></div>
  <div className={`mx-auto mt-6 max-w-3xl rounded-2xl border px-4 py-3 ${signedIn?"border-emerald-100 bg-emerald-50":"border-slate-200 bg-white"}`}><div className="flex items-center justify-between gap-3"><p className={`text-[11px] leading-5 ${signedIn?"text-emerald-700":"text-slate-500"}`}><strong>{signedIn?"Account sync on":"Device-only mode"}:</strong> {status}</p>{!signedIn&&<Link href="/signin" className="shrink-0 rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-bold text-white">Sign in</Link>}</div></div>
  {signedIn&&<div className="mx-auto mt-4 max-w-3xl rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold text-blue-900">Email delivery test</p><p className="mt-1 text-[10px] text-blue-700">Send a harmless test message to the email address on your signed-in CoinSparkLine account.</p></div><button onClick={sendTestEmail} disabled={testState==="sending"} className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-[10px] font-bold text-white disabled:opacity-50">{testState==="sending"?"Sending…":"Send test email"}</button></div>{testMessage&&<p className={`mt-2 text-[10px] ${testState==="sent"?"text-emerald-700":"text-rose-600"}`}>{testMessage}</p>}</div>}
  <section className="mx-auto mt-4 max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">{loading?<div className="py-10 text-center text-xs text-slate-400">Loading alerts…</div>:rules.length?<div className="space-y-4">{Object.entries(grouped).map(([coinId,coinRules])=><div key={coinId} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center justify-between gap-3"><div><Link href={`/coin/${coinId}`} className="text-base font-semibold capitalize text-slate-900 hover:text-blue-600">{coinId.replace(/-/g," ")}</Link><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-400">{coinRules.length} armed condition{coinRules.length>1?"s":""}</p></div><Link href={`/coin/${coinId}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500 hover:text-slate-900">Open coin</Link></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{coinRules.map(r=><div key={`${r.coinId}-${r.type}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3"><div><p className="text-xs font-semibold text-slate-800">{LABELS[r.type]}</p><p className="mt-1 text-[10px] text-slate-400">{r.type==="spark-above"?`Trigger at SparkScore ${r.threshold??75}`:"Active rule"}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-violet-50 px-2 py-1 text-[9px] font-bold text-violet-600">ARMED</span><button onClick={()=>remove(r)} className="text-[10px] font-semibold text-rose-500">Remove</button></div></div>)}</div></div>)}</div>:<div className="py-10 text-center"><p className="text-sm font-semibold text-slate-700">No alert rules yet.</p><p className="mt-1 text-xs text-slate-400">Open any Spark Radar coin and press Alert to choose a condition.</p></div>}</section>
  <div className="mx-auto mt-4 max-w-3xl rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3"><p className="text-[11px] leading-5 text-emerald-800"><strong>Automatic email delivery: active.</strong> CoinSparkLine performs the scheduled market scan in the background and checks armed cloud rules even when you are not on the website. Armed coins are prioritised in the scan; when a rule crosses its condition, an email is sent automatically.</p></div>
  <div className="mt-5 text-center"><Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900">← Back to market</Link></div>
 </main></div>;
}
