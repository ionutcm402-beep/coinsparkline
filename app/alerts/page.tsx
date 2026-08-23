"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { ALERT_RULES_KEY, AlertRule } from "@/components/AlertRuleButton";

const LABELS:Record<AlertRule["type"],string>={
 "regime-change":"Any regime change",
 "enters-awakening":"Enters Awakening",
 "enters-volatile":"Enters Volatile",
 "spark-above":"SparkScore threshold",
};

export default function AlertsPage(){
 const [rules,setRules]=useState<AlertRule[]>([]);
 useEffect(()=>{const load=()=>{try{setRules(JSON.parse(localStorage.getItem(ALERT_RULES_KEY)||"[]"))}catch{setRules([])}};load();window.addEventListener("csl-alert-rules-change",load);return()=>window.removeEventListener("csl-alert-rules-change",load)},[]);
 function remove(rule:AlertRule){const next=rules.filter(r=>!(r.coinId===rule.coinId&&r.type===rule.type));localStorage.setItem(ALERT_RULES_KEY,JSON.stringify(next));setRules(next);window.dispatchEvent(new CustomEvent("csl-alert-rules-change"));}
 const grouped=rules.reduce<Record<string,AlertRule[]>>((acc,r)=>{(acc[r.coinId]??=[]).push(r);return acc},{});
 return <div className="min-h-screen bg-[#fbfcff] text-slate-950"><Header/><main className="mx-auto max-w-5xl px-5 py-10 sm:px-6"><div className="mx-auto max-w-2xl text-center"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">Signal alerts</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Watch the change, not the noise.</h1><p className="mt-3 text-sm leading-6 text-slate-500">Create rules for regime flips, Awakening, Volatile entry or SparkScore thresholds. Rules are saved locally on this device while notification delivery is being connected.</p></div><section className="mx-auto mt-8 max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">{rules.length? <div className="space-y-4">{Object.entries(grouped).map(([coinId,coinRules])=><div key={coinId} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center justify-between gap-3"><div><Link href={`/coin/${coinId}`} className="text-base font-semibold capitalize text-slate-900 hover:text-blue-600">{coinId.replace(/-/g," ")}</Link><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-400">{coinRules.length} armed condition{coinRules.length>1?"s":""}</p></div><Link href={`/coin/${coinId}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500 hover:text-slate-900">Open coin</Link></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{coinRules.map(r=><div key={`${r.coinId}-${r.type}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3"><div><p className="text-xs font-semibold text-slate-800">{LABELS[r.type]}</p><p className="mt-1 text-[10px] text-slate-400">{r.type==="spark-above"?`Trigger at SparkScore ${r.threshold??75}`:"Active rule"}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-violet-50 px-2 py-1 text-[9px] font-bold text-violet-600">ARMED</span><button onClick={()=>remove(r)} className="text-[10px] font-semibold text-rose-500">Remove</button></div></div>)}</div></div>)}</div>:<div className="py-10 text-center"><p className="text-sm font-semibold text-slate-700">No alert rules yet.</p><p className="mt-1 text-xs text-slate-400">Open any Spark Radar coin and press Alert to choose a condition.</p></div>}</section><div className="mx-auto mt-4 max-w-3xl rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3"><p className="text-[11px] leading-5 text-amber-800"><strong>Delivery status:</strong> the alert rule engine is ready, but email, push and Telegram notifications are not live yet. The next backend step will evaluate these rules after each signal refresh and deliver triggered alerts.</p></div><div className="mt-5 text-center"><Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900">← Back to market</Link></div></main></div>;
}
