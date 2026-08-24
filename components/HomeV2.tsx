"use client";

import Link from "next/link";
import {useMemo,useState} from "react";
import {Coin} from "@/types/coin";
import {getSignalTier} from "@/lib/tiers";
import {getSparkScore} from "@/lib/sparkScore";
import CurrencyAmount from "@/components/CurrencyAmount";
import WatchlistButton from "@/components/WatchlistButton";
import {RegimeBadge,SparkBadge} from "@/components/ui";

type RadarMode="Heating up"|"Just flipped"|"Strongest";
const stablecoins=new Set(["usdt","usdc","dai","busd","tusd","usdp"]);
const regimeLabel={calm:"Calm",building:"Building",awakening:"Awakening",volatile:"Volatile"} as const;

export default function HomeV2({coins,updatedLabel}:{coins:Coin[];updatedLabel?:string}){
 const[mode,setMode]=useState<RadarMode>("Heating up");
 const eligible=useMemo(()=>coins.filter(c=>!stablecoins.has(c.symbol.toLowerCase())),[coins]);
 const ranked=useMemo(()=>[...eligible].sort((a,b)=>getSparkScore(b).score-getSparkScore(a).score),[eligible]);
 const awakening=eligible.filter(c=>getSignalTier(c)==="awakening").length;
 const volatile=eligible.filter(c=>getSignalTier(c)==="volatile").length;
 const building=eligible.filter(c=>getSignalTier(c)==="building").length;
 const calm=eligible.filter(c=>getSignalTier(c)==="calm").length;
 const strongest=ranked[0];
 const radar=useMemo(()=>{
  if(mode==="Just flipped")return [...eligible].filter(c=>c.streakDays<=2).sort((a,b)=>getSparkScore(b).score-getSparkScore(a).score).slice(0,6);
  if(mode==="Strongest")return ranked.slice(0,6);
  return [...eligible].filter(c=>["awakening","volatile"].includes(getSignalTier(c))).sort((a,b)=>getSparkScore(b).score-getSparkScore(a).score).slice(0,6);
 },[eligible,mode,ranked]);
 const marketState=volatile>=awakening&&volatile>building?"Risk appetite is elevated.":awakening+building>calm?"Market behaviour is becoming more active.":"The market remains selective and relatively calm.";
 const marketContext=volatile>0?`${volatile} assets are already in a volatile regime while ${awakening} are still awakening.`:awakening>0?`${awakening} assets are beginning to wake up before broad volatility has arrived.`:`Most tracked assets remain in calm or building regimes, so selectivity matters more than headline price moves.`;
 return <main className="csl4-home">
  <section className="csl4-hero"><div className="csl4-shell"><p className="csl4-kicker">Market behaviour intelligence</p><h1>See what is changing<br/>before price tables make it obvious.</h1><p className="csl4-hero-copy">CoinSparkLine interprets regime shifts, SparkScore and market context so you can see which crypto assets are becoming more active, which are overheating, and what deserves deeper investigation.</p><div className="csl4-actions"><Link href="#market-state" className="csl-btn-primary">Read the market</Link><Link href="/methodology" className="csl-btn-soft">How SparkScore works</Link></div><p className="csl4-freshness">{updatedLabel||"Latest market snapshot"}</p></div></section>

  <section id="market-state" className="csl4-section"><div className="csl4-shell"><div className="csl4-section-head"><div><p className="csl4-kicker">Live interpretation</p><h2>{marketState}</h2><p>{marketContext}</p></div>{strongest&&<Link href={`/coin/${strongest.id}`} className="csl4-lead-signal"><span>Highest current SparkScore</span><strong>{strongest.name}</strong><div><SparkBadge score={getSparkScore(strongest).score}/><RegimeBadge regime={regimeLabel[getSignalTier(strongest)]}/></div></Link>}</div><div className="csl4-regime-grid"><article><strong>{calm}</strong><span>Calm</span><p>Low behavioural change.</p></article><article><strong>{building}</strong><span>Building</span><p>Activity is increasing.</p></article><article><strong>{awakening}</strong><span>Awakening</span><p>Momentum is becoming notable.</p></article><article><strong>{volatile}</strong><span>Volatile</span><p>Conditions are already hot.</p></article></div></div></section>

  <section id="radar" className="csl4-section csl4-section--surface"><div className="csl4-shell"><div className="csl4-section-head"><div><p className="csl4-kicker">Spark Radar</p><h2>What deserves attention now?</h2><p>Ranked by behavioural change, not by whichever coin happens to be up the most today.</p></div><div className="csl4-segmented" role="group" aria-label="Spark Radar view">{(["Heating up","Just flipped","Strongest"] as RadarMode[]).map(item=><button key={item} onClick={()=>setMode(item)} data-active={mode===item}>{item}</button>)}</div></div><div className="csl4-radar-list">{radar.map((coin,index)=>{const spark=getSparkScore(coin);const tier=getSignalTier(coin);const positive=coin.change24hPct>=0;return <article key={coin.id} className="csl4-radar-row"><div className="csl4-rank">{String(index+1).padStart(2,"0")}</div><Link href={`/coin/${coin.id}`} className="csl4-asset"><div className="csl4-asset-mark">{coin.logoUrl?<img src={coin.logoUrl} alt=""/>:<span>{coin.symbol.slice(0,2)}</span>}</div><div><strong>{coin.name}</strong><span>{coin.symbol.toUpperCase()}</span></div></Link><div className="csl4-price"><strong><CurrencyAmount usd={coin.price}/></strong><span data-direction={positive?"up":"down"}>{positive?"+":""}{coin.change24hPct.toFixed(2)}%</span></div><div className="csl4-signal"><SparkBadge score={spark.score}/><RegimeBadge regime={regimeLabel[tier]}/></div><p className="csl4-reason">{tier==="volatile"?"Behaviour is already hot; investigate whether the move is becoming crowded.":tier==="awakening"?"Momentum and activity are strengthening while the regime is still developing.":tier==="building"?"Conditions are improving, but the signal is not yet fully developed.":"Signal remains early and selective."}</p><div className="csl4-row-actions"><WatchlistButton coinId={coin.id} compact/><Link href={`/coin/${coin.id}`}>Investigate →</Link></div></article>})}</div><div className="csl4-section-link"><Link href="/opportunities">Open full Opportunity Radar →</Link></div></div></section>

  <section className="csl4-section"><div className="csl4-shell"><div className="csl4-why"><div><p className="csl4-kicker">Why the signal matters</p><h2>Price tells you what happened.<br/>Behaviour tells you what is changing.</h2></div><div className="csl4-why-grid"><article><span>01</span><h3>SparkScore</h3><p>Compresses several behavioural inputs into one research signal so unusual activity becomes easier to compare.</p></article><article><span>02</span><h3>Regime</h3><p>Shows whether an asset is calm, building, awakening or already volatile, which changes how a move should be interpreted.</p></article><article><span>03</span><h3>Context</h3><p>Separates a simple price move from a broader shift in market behaviour, confidence and persistence.</p></article></div></div></div></section>

  <section className="csl4-section csl4-section--final"><div className="csl4-shell"><div className="csl4-final"><div><p className="csl4-kicker">Go deeper</p><h2>Investigate the signal, not the headline.</h2><p>Use Coin Detail, Compare, Screener and Methodology to understand what is behind a market move before making your own decision.</p></div><div className="csl4-tool-grid"><Link href="/opportunities"><strong>Opportunity Radar</strong><span>Find assets with changing behaviour.</span></Link><Link href="/screener"><strong>Screener</strong><span>Filter for the conditions you care about.</span></Link><Link href="/compare"><strong>Compare</strong><span>See how assets behave differently.</span></Link><Link href="/methodology"><strong>Methodology</strong><span>Understand how the signals are built.</span></Link></div></div></div></section>
 </main>;
}
