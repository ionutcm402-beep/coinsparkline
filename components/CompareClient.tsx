"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import CurrencyAmount from "@/components/CurrencyAmount";
import {Coin} from "@/types/coin";
import {getSignalTier,TIER_CONFIG} from "@/lib/tiers";
import {getSparkScore} from "@/lib/sparkScore";

type Detail={id:string;current?:number|null;ath?:number|null;athDistancePct?:number|null;return30?:number|null;return90?:number|null;return365?:number|null;volatility90?:number|null;sparkHistory?:{date:string;score:number}[];error?:boolean};
function fmtPct(v:number|null|undefined,d=1){if(v==null||!Number.isFinite(v))return"—";return`${v>=0?"+":""}${v.toFixed(d)}%`}
function tone(v:number|null|undefined){if(v==null)return"text-slate-400";return v>=0?"text-emerald-600":"text-rose-600"}
function SparkMini({points}:{points:{date:string;score:number}[]}){if(points.length<2)return <span className="text-slate-400">—</span>;const sample=points.slice(-90);const w=170,h=48,pad=3;const min=Math.min(...sample.map(p=>p.score)),max=Math.max(...sample.map(p=>p.score));const span=Math.max(1,max-min);const path=sample.map((p,i)=>`${i?"L":"M"}${pad+(i/(sample.length-1))*(w-pad*2)},${h-pad-((p.score-min)/span)*(h-pad*2)}`).join(" ");const delta=sample.at(-1)!.score-sample[0].score;return <div><svg viewBox={`0 0 ${w} ${h}`} className="h-12 w-full max-w-[170px]" preserveAspectRatio="none"><path d={path} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="text-indigo-500"/></svg><span className={`text-[10px] font-bold ${tone(delta)}`}>{delta>=0?"+":""}{delta} pts / 90d</span></div>}

export default function CompareClient({coins}:{coins:Coin[]}){
 const[ids,setIds]=useState<string[]>(coins.slice(0,3).map(c=>c.id));const[details,setDetails]=useState<Record<string,Detail>>({});const[loading,setLoading]=useState(false);
 const selected=useMemo(()=>ids.map(id=>coins.find(c=>c.id===id)).filter(Boolean) as Coin[],[ids,coins]);
 function setAt(index:number,id:string){setIds(prev=>{const next=[...prev];next[index]=id;return next})}
 useEffect(()=>{const unique=[...new Set(ids.filter(Boolean))];if(!unique.length)return;let active=true;setLoading(true);fetch(`/api/compare-details?ids=${encodeURIComponent(unique.join(","))}`).then(r=>r.json()).then(data=>{if(!active)return;const map:Record<string,Detail>={};for(const item of data.items||[])map[item.id]=item;setDetails(map)}).catch(()=>{}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[ids]);
 const metrics:{label:string;render:(c:Coin,d?:Detail)=>React.ReactNode;note?:string}[]=[
  {label:"Price",render:c=><CurrencyAmount usd={c.price}/>},
  {label:"24h move",render:c=><span className={`font-bold ${tone(c.change24hPct)}`}>{fmtPct(c.change24hPct,2)}</span>},
  {label:"30d performance",render:(_c,d)=><span className={`font-bold ${tone(d?.return30)}`}>{fmtPct(d?.return30)}</span>},
  {label:"90d performance",render:(_c,d)=><span className={`font-bold ${tone(d?.return90)}`}>{fmtPct(d?.return90)}</span>},
  {label:"1y performance",render:(_c,d)=><span className={`font-bold ${tone(d?.return365)}`}>{fmtPct(d?.return365)}</span>},
  {label:"90d volatility",render:(_c,d)=>d?.volatility90!=null?`${d.volatility90.toFixed(1)}% annualised`:"—",note:"Higher means price has moved more aggressively."},
  {label:"ATH distance",render:(_c,d)=><span className={tone(d?.athDistancePct)}>{fmtPct(d?.athDistancePct)}</span>,note:"0% means at ATH; negative means below ATH."},
  {label:"Regime",render:c=>{const t=getSignalTier(c),cfg=TIER_CONFIG[t];return <span className={`rounded-full px-2.5 py-1 font-bold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>}},
  {label:"Confidence",render:c=>`${c.confidencePct.toFixed(0)}%`},
  {label:"SparkScore",render:c=>{const s=getSparkScore(c);return <span className="font-extrabold text-indigo-600">{s.score} · {s.label}</span>}},
  {label:"SparkScore trend",render:(_c,d)=><SparkMini points={d?.sparkHistory||[]}/>,note:"Historical scores are reconstructed with the current SparkScore framework."},
  {label:"Days in regime",render:c=>`${c.streakDays}d`},
  {label:"Typical flip time",render:c=>`${c.medianDaysToFlip.toFixed(1)}d`},
  {label:"Market cap",render:c=><CurrencyAmount usd={c.marketCap} compact/>},
 ];
 const strongest=[...selected].sort((a,b)=>getSparkScore(b).score-getSparkScore(a).score)[0];const leastVol=[...selected].sort((a,b)=>(details[a.id]?.volatility90??Infinity)-(details[b.id]?.volatility90??Infinity))[0];const best90=[...selected].sort((a,b)=>(details[b.id]?.return90??-Infinity)-(details[a.id]?.return90??-Infinity))[0];
 return <div>
  <div className="mb-5 grid gap-3 md:grid-cols-3">{[0,1,2].map(i=><div key={i} className="rounded-[20px] border border-slate-200/70 bg-white p-3"><p className="mb-2 text-[9px] font-extrabold uppercase tracking-[.12em] text-slate-400">Asset {i+1}</p><select value={ids[i]||""} onChange={e=>setAt(i,e.target.value)} className="csl2-select w-full">{coins.map(c=><option key={c.id} value={c.id}>{c.name} ({c.symbol.toUpperCase()})</option>)}</select></div>)}</div>
  <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="csl2-summary-card"><span>Highest SparkScore</span><strong className="text-[18px]">{strongest?`${strongest.symbol.toUpperCase()} · ${getSparkScore(strongest).score}`:"—"}</strong></div><div className="csl2-summary-card"><span>Best 90d performance</span><strong className="text-[18px]">{best90&&details[best90.id]?.return90!=null?`${best90.symbol.toUpperCase()} · ${fmtPct(details[best90.id].return90)}`:"—"}</strong></div><div className="csl2-summary-card"><span>Lowest 90d volatility</span><strong className="text-[18px]">{leastVol&&details[leastVol.id]?.volatility90!=null?`${leastVol.symbol.toUpperCase()} · ${details[leastVol.id].volatility90!.toFixed(1)}%`:"—"}</strong></div></div>
  {loading&&<div className="mb-4 rounded-2xl bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-700">Loading historical comparison data…</div>}
  <div className="csl2-compare-table"><table className="text-left text-xs"><thead><tr><th className="text-slate-400">Metric</th>{selected.map(c=><th key={c.id}><Link href={`/coin/${c.id}`} className="text-[14px] font-extrabold tracking-[-.02em] text-slate-950 hover:text-blue-600">{c.name}</Link><div className="mt-1 text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">{c.symbol.toUpperCase()}</div></th>)}</tr></thead><tbody>{metrics.map(row=><tr key={row.label}><td className="font-bold text-slate-400"><div>{row.label}</div>{row.note&&<div className="mt-1 max-w-[170px] text-[9px] font-medium leading-4 text-slate-300">{row.note}</div>}</td>{selected.map(c=><td key={c.id} className="font-semibold text-slate-700">{row.render(c,details[c.id])}</td>)}</tr>)}</tbody></table></div>
  <p className="mt-4 text-center text-[10px] leading-5 text-slate-400">Compare 2.0 combines current CoinSparkLine signals with historical price behaviour. It is a research tool, not an investment ranking.</p>
 </div>;
}
