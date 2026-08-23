"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const KEY="csl-alert-rules-v2";
export type AlertType="regime-change"|"enters-awakening"|"enters-volatile"|"spark-above";
export interface AlertRule{coinId:string;type:AlertType;threshold?:number;createdAt:string;}

function read():AlertRule[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(KEY)||"[]") as AlertRule[]}catch{return[]}}
function save(rules:AlertRule[]){localStorage.setItem(KEY,JSON.stringify(rules));window.dispatchEvent(new CustomEvent("csl-alert-rules-change"));}

export default function AlertRuleButton({coinId,compact=false}:{coinId:string;compact?:boolean}){
 const [open,setOpen]=useState(false);
 const [mounted,setMounted]=useState(false);
 const [rules,setRules]=useState<AlertRule[]>([]);
 const [threshold,setThreshold]=useState(75);
 useEffect(()=>{setMounted(true);const load=()=>setRules(read().filter(r=>r.coinId===coinId));load();window.addEventListener("csl-alert-rules-change",load);return()=>window.removeEventListener("csl-alert-rules-change",load)},[coinId]);
 useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow="hidden";const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",onKey);return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",onKey)}},[open]);
 const armed=rules.length>0;
 function toggleRule(type:AlertType){const all=read();const exists=all.some(r=>r.coinId===coinId&&r.type===type);const next=exists?all.filter(r=>!(r.coinId===coinId&&r.type===type)):[...all,{coinId,type,threshold:type==="spark-above"?threshold:undefined,createdAt:new Date().toISOString()}];save(next);}
 function has(type:AlertType){return rules.some(r=>r.type===type)}
 function updateSpark(){const all=read();const without=all.filter(r=>!(r.coinId===coinId&&r.type==="spark-above"));save([...without,{coinId,type:"spark-above",threshold,createdAt:new Date().toISOString()}]);}
 const label=compact?(armed?`Alert ${rules.length} ✓`:"Alert"):(armed?`${rules.length} alert${rules.length>1?"s":""} armed ✓`:"Create alert");
 const modal=open&&mounted?createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-5 backdrop-blur-sm" onMouseDown={()=>setOpen(false)}>
   <div role="dialog" aria-modal="true" aria-label="Configure coin alerts" className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-white/15 bg-white p-6 text-left shadow-[0_30px_90px_rgba(2,6,23,0.45)] sm:p-7" onMouseDown={e=>e.stopPropagation()}>
    <div className="flex items-start justify-between gap-5"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-violet-500">CoinSparkLine alerts</p><h3 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Choose what matters.</h3><p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">Arm one or more signal conditions for this coin. Rules are saved on this device for now.</p></div><button onClick={()=>setOpen(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">×</button></div>
    <div className="mt-6 space-y-3">
     {[{t:"regime-change" as AlertType,title:"Any regime change",desc:"When the model flips between calm and volatile."},{t:"enters-awakening" as AlertType,title:"Enters Awakening",desc:"When CoinSparkLine detects an early transition signal."},{t:"enters-volatile" as AlertType,title:"Enters Volatile",desc:"When the coin moves into the volatile regime."}].map(x=><button key={x.t} onClick={()=>toggleRule(x.t)} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${has(x.t)?"border-violet-300 bg-violet-50":"border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}><span><span className="block text-[15px] font-semibold text-slate-900">{x.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{x.desc}</span></span><span className={`ml-4 rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-wide ${has(x.t)?"bg-violet-600 text-white":"bg-slate-100 text-slate-500"}`}>{has(x.t)?"ARMED":"ARM"}</span></button>)}
     <div className={`rounded-2xl border p-4 ${has("spark-above")?"border-violet-300 bg-violet-50":"border-slate-200 bg-white"}`}><div className="flex items-start justify-between gap-3"><div><p className="text-[15px] font-semibold text-slate-900">SparkScore crosses</p><p className="mt-1 text-xs leading-5 text-slate-500">Trigger when SparkScore reaches your chosen level.</p></div>{has("spark-above")&&<button onClick={()=>toggleRule("spark-above")} className="text-[10px] font-extrabold text-rose-500">REMOVE</button>}</div><div className="mt-4 flex items-center gap-3"><input type="range" min="50" max="95" value={threshold} onChange={e=>setThreshold(Number(e.target.value))} className="flex-1"/><span className="w-12 rounded-xl bg-slate-950 px-2 py-2 text-center text-sm font-bold text-white">{threshold}</span><button onClick={updateSpark} className="rounded-xl bg-violet-600 px-4 py-2 text-[11px] font-extrabold text-white shadow-sm hover:bg-violet-700">{has("spark-above")?"UPDATE":"ARM"}</button></div></div>
    </div>
    <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3"><p className="text-[11px] leading-5 text-slate-500">Email, push and Telegram delivery are not active yet. The rule engine is being built first so notification delivery can be connected cleanly next.</p></div>
   </div>
  </div>,document.body):null;
 return <>
  <button type="button" onClick={()=>setOpen(true)} aria-label="Configure coin alerts" title="Configure coin alerts" className={`${compact?"px-2.5 py-1.5 text-[9px]":"px-3.5 py-2 text-[11px]"} rounded-full border font-semibold transition ${armed?"border-violet-200 bg-violet-50 text-violet-700":"border-slate-200 bg-white text-slate-500 hover:text-slate-900"}`}>{label}</button>
  {modal}
 </>;
}
export {KEY as ALERT_RULES_KEY};
