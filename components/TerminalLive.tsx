"use client";

import Link from "next/link";
import {useMemo,useState} from "react";
import {Coin} from "@/types/coin";
import {getSignalTier,TIER_CONFIG} from "@/lib/tiers";
import {getSparkScore} from "@/lib/sparkScore";
import CurrencyAmount from "@/components/CurrencyAmount";
import TerminalChat from "@/components/TerminalChat";
import TerminalEventFeed from "@/components/TerminalEventFeed";
import TerminalNftPulse from "@/components/TerminalNftPulse";

type View="All"|"Moving"|"Building"|"Volatile";
const stablecoins=new Set(["usdt","usdc","dai","busd","tusd","usdp"]);
const tierLabel={calm:"Calm",building:"Building",awakening:"Awakening",volatile:"Volatile"} as const;
function pct(v:number){return `${v>=0?"+":""}${v.toFixed(2)}%`}
function reason(coin:Coin){const tier=getSignalTier(coin),score=getSparkScore(coin).score;if(tier==="volatile")return score>=70?"Volatility is elevated and signal intensity remains high.":"Volatility is elevated, but the behavioural signal is less concentrated.";if(tier==="awakening")return"The model is leaning volatile while confidence is still forming.";if(tier==="building")return"Calm conditions are losing certainty and activity is building.";return"Behaviour remains comparatively stable with no strong transition pressure."}
function stateStrip(coin:Coin){const states=coin.recentStates?.slice(-18)||[];return states.length?states:Array.from({length:18},()=>0)}

export default function TerminalLive({coins,updatedLabel}:{coins:Coin[];updatedLabel?:string}){
 const[view,setView]=useState<View>("All"),[selectedId,setSelectedId]=useState<string|null>(null);
 const eligible=useMemo(()=>coins.filter(c=>!stablecoins.has(c.symbol.toLowerCase())),[coins]);
 const ranked=useMemo(()=>[...eligible].sort((a,b)=>getSparkScore(b).score-getSparkScore(a).score),[eligible]);
 const selected=eligible.find(c=>c.id===selectedId)||ranked[0]||null;
 const filtered=useMemo(()=>ranked.filter(c=>{const tier=getSignalTier(c);if(view==="Moving")return Math.abs(c.change24hPct)>=3||getSparkScore(c).score>=65;if(view==="Building")return tier==="building"||tier==="awakening";if(view==="Volatile")return tier==="volatile";return true}).slice(0,18),[ranked,view]);
 const calm=eligible.filter(c=>getSignalTier(c)==="calm").length,building=eligible.filter(c=>getSignalTier(c)==="building").length,awakening=eligible.filter(c=>getSignalTier(c)==="awakening").length,volatile=eligible.filter(c=>getSignalTier(c)==="volatile").length;
 const avgScore=Math.round(eligible.reduce((sum,c)=>sum+getSparkScore(c).score,0)/Math.max(1,eligible.length));
 const unusual=eligible.filter(c=>getSparkScore(c).score>=70).length;
 const marketLabel=volatile>awakening+building?"VOLATILE":awakening+building>calm?"ACTIVITY BUILDING":"SELECTIVE";
 const signalLane=ranked.slice(0,4);
 function selectBySymbol(symbol:string){const coin=eligible.find(c=>c.symbol.toUpperCase()===symbol.toUpperCase());if(coin)setSelectedId(coin.id)}
 return <main className="terminal-root terminal-v1-next">
  <header className="terminal-topbar"><Link href="/" className="terminal-brand">Coin<span>SparkLine</span></Link><nav aria-label="Terminal navigation"><a href="#live" data-active="true">LIVE</a><Link href="/opportunities">RADAR</Link><Link href="/watchlist">MY SIGNALS</Link></nav><div className="terminal-top-actions"><span className="terminal-snapshot">{updatedLabel||"Latest market snapshot"}</span><Link href="/methodology">Methodology</Link></div></header>
  <section className="terminal-market-strip" id="live" aria-label="Current market state"><div><span>MARKET STATE</span><strong>{marketLabel}</strong></div><div><span>SPARK PRESSURE</span><strong>{avgScore}<small>/100</small></strong></div><div><span>HIGH-INTENSITY SIGNALS</span><strong>{unusual}</strong></div><div><span>VOLATILE</span><strong>{volatile}</strong></div><div><span>BUILDING / AWAKENING</span><strong>{building+awakening}</strong></div></section>
  <div className="terminal-v1-signal-lane" aria-label="Strongest live signals">{signalLane.map((c,index)=>{const tier=getSignalTier(c),spark=getSparkScore(c).score;return <button key={c.id} onClick={()=>setSelectedId(c.id)} data-active={selected?.id===c.id}><span className="terminal-v1-signal-rank">0{index+1}</span><div><b>{c.symbol.toUpperCase()}</b><small>{tierLabel[tier]}</small></div><strong>{spark}</strong><em data-direction={c.change24hPct>=0?"up":"down"}>{pct(c.change24hPct)}</em></button>})}</div>
  <div className="terminal-ticker" aria-label="Market ticker"><div>{ranked.slice(0,14).map(c=><button key={c.id} onClick={()=>setSelectedId(c.id)}><b>{c.symbol.toUpperCase()}</b><span><CurrencyAmount usd={c.price}/></span><em data-direction={c.change24hPct>=0?"up":"down"}>{pct(c.change24hPct)}</em><i>SPK {getSparkScore(c).score}</i></button>)}</div></div>
  <div className="terminal-workspace">
   <section className="terminal-panel terminal-radar"><header className="terminal-panel-head terminal-radar-head"><div><span className="terminal-eyebrow">Spark Radar</span><h1>Where behaviour is changing now</h1><p>Ranked by SparkScore and regime behaviour, not by price gain alone.</p></div><div className="terminal-segments" role="group" aria-label="Radar filter">{(["All","Moving","Building","Volatile"] as View[]).map(item=><button key={item} data-active={view===item} onClick={()=>setView(item)}>{item}</button>)}</div></header><div className="terminal-radar-table"><div className="terminal-radar-header"><span>Asset</span><span>Price</span><span>24H</span><span>Spark</span><span>Regime</span><span>Confidence</span></div>{filtered.map(c=>{const spark=getSparkScore(c),tier=getSignalTier(c),active=selected?.id===c.id;return <button key={c.id} className="terminal-radar-row" data-active={active} onClick={()=>setSelectedId(c.id)}><span className="terminal-radar-asset">{c.logoUrl?<img src={c.logoUrl} alt=""/>:<i>{c.symbol.slice(0,2)}</i>}<span><b>{c.symbol.toUpperCase()}</b><small>{c.name}</small></span></span><span><CurrencyAmount usd={c.price}/></span><span data-direction={c.change24hPct>=0?"up":"down"}>{pct(c.change24hPct)}</span><span className="terminal-score" data-hot={spark.score>=70}>{spark.score}</span><span><em className="terminal-regime-dot" style={{background:TIER_CONFIG[tier].dot}}/>{tierLabel[tier]}</span><span>{c.confidencePct.toFixed(0)}%</span></button>})}</div></section>
   <aside className="terminal-right-stack">
    <section className="terminal-panel terminal-selected">{selected?<><header className="terminal-selected-head"><div className="terminal-selected-asset">{selected.logoUrl?<img src={selected.logoUrl} alt=""/>:null}<div><span>{selected.symbol.toUpperCase()}</span><h2>{selected.name}</h2></div></div><Link href={`/coin/${selected.id}`}>Full research ↗</Link></header><div className="terminal-selected-score"><div><span>SPARKSCORE</span><strong>{getSparkScore(selected).score}<small>/100</small></strong></div><div><span>REGIME</span><strong>{tierLabel[getSignalTier(selected)]}</strong></div></div><div className="terminal-v1-behaviour"><div><span>RECENT BEHAVIOUR</span><small>{selected.confidencePct.toFixed(0)}% confidence</small></div><div className="terminal-v1-behaviour-strip" aria-label={`${selected.name} recent regime history`}>{stateStrip(selected).map((state,i)=><i key={i} data-state={state}/>)}</div></div><p className="terminal-selected-reason">{reason(selected)}</p><dl><div><dt>24H move</dt><dd data-direction={selected.change24hPct>=0?"up":"down"}>{pct(selected.change24hPct)}</dd></div><div><dt>Confidence</dt><dd>{selected.confidencePct.toFixed(1)}%</dd></div><div><dt>Regime streak</dt><dd>{selected.streakDays}d</dd></div><div><dt>Typical flip</dt><dd>{selected.medianDaysToFlip>365?">365d":`${selected.medianDaysToFlip.toFixed(1)}d`}</dd></div></dl><div className="terminal-selected-actions"><Link href={`/compare?coins=${encodeURIComponent(selected.id)}`}>Compare</Link><Link href={`/portfolio?coin=${encodeURIComponent(selected.symbol)}`}>Portfolio</Link><Link href="/alerts">Alert</Link></div></>:<div className="terminal-empty">No market selected.</div>}</section>
    <TerminalEventFeed onSelect={selectBySymbol}/>
   </aside>
   <section className="terminal-panel terminal-regime-map"><header className="terminal-panel-head"><div><span className="terminal-eyebrow">Regime map</span><h2>Market structure</h2></div></header><div className="terminal-regime-bars">{[["Calm",calm,"calm"],["Building",building,"building"],["Awakening",awakening,"awakening"],["Volatile",volatile,"volatile"]].map(([label,value,key])=>{const count=Number(value);return <div key={String(label)}><div><span>{label}</span><strong>{count}</strong></div><div className="terminal-regime-track"><i data-regime={key} style={{width:`${Math.max(3,(count/Math.max(1,eligible.length))*100)}%`}}/></div></div>})}</div></section>
   <TerminalChat selectedSymbol={selected?.symbol} selectedScore={selected?getSparkScore(selected).score:null} selectedRegime={selected?tierLabel[getSignalTier(selected)]:null} selectedChange={selected?.change24hPct??null} onSelect={selectBySymbol}/>
  </div>
  <div className="terminal-cross-market"><TerminalNftPulse/></div>
 </main>
}
