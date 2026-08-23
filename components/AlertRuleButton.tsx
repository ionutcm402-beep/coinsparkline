"use client";

import { useEffect, useState } from "react";

const KEY="csl-alert-rules-v2";
export type AlertType="regime-change"|"enters-awakening"|"enters-volatile"|"spark-above";
export interface AlertRule{coinId:string;type:AlertType;threshold?:number;createdAt:string;}

function read():AlertRule[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(KEY)||"[]") as AlertRule[]}catch{return[]}}
function save(rules:AlertRule[]){localStorage.setItem(KEY,JSON.stringify(rules));window.dispatchEvent(new CustomEvent("csl-alert-rules-change"));}

export default function AlertRuleButton({coinId,compact=false}:{coinId:string;compact?:boolean}){
 const [open,setOpen]=useState(false);
 const [rules,setRules]=useState<AlertRule[]>([]);
 const [threshold,setThreshold]=useState(75);
 useEffect(()=>{const load=()=>setRules(read().filter(r=>r.coinId===coinId));load();window.addEventListener("csl-alert-rules-change",load);return()=>window.removeEventListener("csl-alert-rules-change",load)},[coinId]);
 const armed=rules.length>0;
 function toggleRule(type:AlertType){const all=read();const exists=all.some(r=>r.coinId===coinId&&r.type===type);const next=exists?all.filter(r=>!(r.coinId===coinId&&r.type===type)):[...all,{coinId,type,threshold:type==="spark-above"?threshold:undefined,createdAt:new Date().toISOString()}];save(next);}
 function has(type:AlertType){return rules.some(r=>r.type===type)}
 function updateSpark(){const all=read();const without=all.filter(r=>!(r.coinId===coinId&&r.type==="spark-above"));save([...without,{coinId,type:"spark-above",threshold,createdAt:new Date().toISOString()}]);}
 const label=compact?(armed?`Alert ${rules.length} ✓`:"Alert"):(armed?`${rules.length} alert${rules.length>1?"s":""} armed ✓`:"Create alert");
 return <>
  <button type="button" onClick={()=>setOpen(true)} aria-label="Configure coin alerts" title="Configure coin alerts" className={`${compact?"px-2 py-1 text-[8px]":"px-3 py-1.5 text-[10px]"} rounded-full border font-semibold transition ${armed?"border-violet-200 bg-violet-50 text-violet-700":"border-slate-200 bg-white text-slate-500 hover:text-slate-900"}`}>{label}</button>
  {open&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]" onMouseDown={()=>setOpen(false)}>
   <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-2xl" onMouseDown={e=>e.stopPropagation()}>
    <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-500">CoinSparkLine alerts</p><h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950">Choose what matters.</h3><p className="mt-1 text-xs leading-5 text-slate-500">Arm one or more signal conditions for this coin. Rules are saved on this device.</p></div><button onClick={()=>setOpen(false)} className="rounded-full border border-slate-200 px-2.5 py-1 text-sm text-slate-500">×</button></div>
    <div className="mt-5 space-y-2">
     {[{t:"regime-change" as AlertType,title:"Any regime change",desc:"When the model flips between calm and volatile."},{t:"enters-awakening" as AlertType,title:"Enters Awakening",desc:"When CoinSparkLine detects an early transition signal."},{t:"enters-volatile" as AlertType,title:"Enters Volatile",desc:"When the coin moves into the volatile regime."}].map(x=><button key={x.t} onClick={()=>toggleRule(x.t)} className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left ${has(x.t)?"border-violet-200 bg-violet-50":"border-slate-200 bg-white hover:bg-slate-50"}`}><span><span className="block text-sm font-semibold text-slate-900">{x.title}</span><span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{x.desc}</span></span><span className={`ml-3 rounded-full px-2 py-1 text-[9px] font-bold ${has(x.t)?"bg-violet-600 text-white":"bg-slate-100 text-slate-500"}`}>{has(x.t)?"ARMED":"ARM"}</span></button>)}
     <div className={`rounded-2xl border p-3 ${has("spark-above")?"border-violet-200 bg-violet-50":"border-slate-200 bg-white"}`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">SparkScore crosses</p><p className="mt-0.5 text-[11px] leading-4 text-slate-500">Trigger when SparkScore reaches your chosen level.</p></div>{has("spark-above")&&<button onClick={()=>toggleRule("spark-above")} className="text-[9px] font-bold text-rose-500">REMOVE</button>}</div><div className="mt-3 flex items-center gap-2"><input type="range" min="50" max="95" value={threshold} onChange={e=>setThreshold(Number(e.target.value))} className="flex-1"/><span className="w-10 rounded-lg bg-slate-950 px-2 py-1 text-center text-xs font-bold text-white">{threshold}</span><button onClick={updateSpark} className="rounded-lg bg-violet-600 px-3 py-1.5 text-[10px] font-bold text-white">{has("spark-above")?"UPDATE":"ARM"}</button></div></div>
    </div>
    <p className="mt-4 text-[10px] leading-4 text-slate-400">Email, push and Telegram delivery are not active yet. This step creates the rule system first so we can connect real notification delivery next.</p>
   </div>
  </div>}
 </>;
}
export {KEY as ALERT_RULES_KEY};
