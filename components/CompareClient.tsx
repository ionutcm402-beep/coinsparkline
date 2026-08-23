"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CurrencyAmount from "@/components/CurrencyAmount";
import { Coin } from "@/types/coin";
import { getSignalTier, TIER_CONFIG } from "@/lib/tiers";
import { getSparkScore } from "@/lib/sparkScore";

export default function CompareClient({ coins }: { coins: Coin[] }) {
  const [ids,setIds]=useState<string[]>(coins.slice(0,3).map(c=>c.id));
  const selected=useMemo(()=>ids.map(id=>coins.find(c=>c.id===id)).filter(Boolean) as Coin[],[ids,coins]);
  function setAt(index:number,id:string){setIds(prev=>{const next=[...prev];next[index]=id;return next;});}
  return <div>
    <div className="grid gap-2 sm:grid-cols-3">{[0,1,2].map(i=><select key={i} value={ids[i]||""} onChange={e=>setAt(i,e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-sm">{coins.map(c=><option key={c.id} value={c.id}>{c.name} ({c.symbol.toUpperCase()})</option>)}</select>)}</div>
    <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[680px] text-left text-xs"><thead><tr className="border-b border-slate-200 bg-slate-50"><th className="px-4 py-3 text-slate-400">Metric</th>{selected.map(c=><th key={c.id} className="px-4 py-3"><Link href={`/coin/${c.id}`} className="font-semibold text-slate-900 hover:text-blue-600">{c.name}</Link><div className="mt-0.5 text-[9px] text-slate-400">{c.symbol.toUpperCase()}</div></th>)}</tr></thead><tbody>
      {[
        ["Price",(c:Coin)=><CurrencyAmount usd={c.price}/>],
        ["24h move",(c:Coin)=><span className={c.change24hPct>=0?"text-emerald-600":"text-rose-600"}>{c.change24hPct>=0?"+":""}{c.change24hPct.toFixed(2)}%</span>],
        ["Regime",(c:Coin)=>{const t=getSignalTier(c),cfg=TIER_CONFIG[t];return <span className={`font-semibold ${cfg.text}`}>{cfg.label}</span>}],
        ["Signal strength",(c:Coin)=>`${c.confidencePct.toFixed(0)}%`],
        ["SparkScore",(c:Coin)=>{const s=getSparkScore(c);return <span className="font-semibold">{s.score} · {s.label}</span>}],
        ["Days in regime",(c:Coin)=>`${c.streakDays}d`],
        ["Typical flip time",(c:Coin)=>`${c.medianDaysToFlip.toFixed(1)}d`],
        ["Market cap",(c:Coin)=><CurrencyAmount usd={c.marketCap} compact />],
      ].map(([label,render])=><tr key={label as string} className="border-b border-slate-100 last:border-0"><td className="px-4 py-3 font-medium text-slate-400">{label as string}</td>{selected.map(c=><td key={c.id} className="px-4 py-3 text-slate-700">{(render as (c:Coin)=>React.ReactNode)(c)}</td>)}</tr>)}
    </tbody></table></div>
    <p className="mt-3 text-center text-[10px] leading-5 text-slate-400">Comparison focuses on observed behaviour and signal state. It is not an investment ranking.</p>
  </div>;
}
