"use client";

import { useEffect, useState } from "react";

const KEY="csl-alert-rules-v1";
export interface AlertRule{coinId:string;type:"regime-change";createdAt:string;}
function read():AlertRule[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(KEY)||"[]") as AlertRule[]}catch{return[]}}

export default function AlertRuleButton({coinId,compact=false}:{coinId:string;compact?:boolean}){
 const [armed,setArmed]=useState(false);
 useEffect(()=>setArmed(read().some(r=>r.coinId===coinId&&r.type==="regime-change")),[coinId]);
 function toggle(){const rules=read();const exists=rules.some(r=>r.coinId===coinId&&r.type==="regime-change");const next=exists?rules.filter(r=>!(r.coinId===coinId&&r.type==="regime-change")):[...rules,{coinId,type:"regime-change" as const,createdAt:new Date().toISOString()}];localStorage.setItem(KEY,JSON.stringify(next));setArmed(!exists);window.dispatchEvent(new CustomEvent("csl-alert-rules-change"));}
 const label=compact?(armed?"Alert ✓":"Alert"):(armed?"Alert armed ✓":"Alert on regime change");
 return <button type="button" onClick={toggle} aria-label={armed?"Remove regime-change alert":"Alert on regime change"} title="Alert on regime change" className={`${compact?"px-2 py-1 text-[8px]":"px-3 py-1.5 text-[10px]"} rounded-full border font-semibold transition ${armed?"border-violet-200 bg-violet-50 text-violet-700":"border-slate-200 bg-white text-slate-500 hover:text-slate-900"}`}>{label}</button>;
}
export {KEY as ALERT_RULES_KEY};
