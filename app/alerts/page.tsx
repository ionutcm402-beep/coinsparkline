"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { ALERT_RULES_KEY, AlertRule } from "@/components/AlertRuleButton";

export default function AlertsPage(){
 const [rules,setRules]=useState<AlertRule[]>([]);
 useEffect(()=>{const load=()=>{try{setRules(JSON.parse(localStorage.getItem(ALERT_RULES_KEY)||"[]"))}catch{setRules([])}};load();window.addEventListener("csl-alert-rules-change",load);return()=>window.removeEventListener("csl-alert-rules-change",load)},[]);
 return <div className="min-h-screen bg-[#fbfcff] text-slate-950"><Header/><main className="mx-auto max-w-4xl px-5 py-10 sm:px-6"><div className="mx-auto max-w-2xl text-center"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">Alerts architecture</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Regime alerts.</h1><p className="mt-3 text-sm leading-6 text-slate-500">Rules can now be armed locally. Delivery by email, push or Telegram is not active yet; this page establishes the alert rule system without pretending notifications already work.</p></div><section className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">{rules.length? <div className="space-y-2">{rules.map(r=><div key={`${r.coinId}-${r.type}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><div><Link href={`/coin/${r.coinId}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600">{r.coinId.replace(/-/g," ")}</Link><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">Regime change</p></div><span className="rounded-full bg-violet-50 px-2 py-1 text-[9px] font-bold text-violet-600">ARMED</span></div>)}</div>:<div className="py-8 text-center"><p className="text-sm font-semibold text-slate-700">No alert rules yet.</p><p className="mt-1 text-xs text-slate-400">Open a tracked coin card and arm a regime-change alert.</p></div>}</section><div className="mt-5 text-center"><Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900">← Back to market</Link></div></main></div>;
}
