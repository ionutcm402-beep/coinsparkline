"use client";

import Link from "next/link";
import {useMemo,useState} from "react";
import {Coin} from "@/types/coin";
import {getSignalTier} from "@/lib/tiers";
import {getSparkScore} from "@/lib/sparkScore";
import CurrencyAmount from "@/components/CurrencyAmount";
import WatchlistButton from "@/components/WatchlistButton";
import MarketHeatmap from "@/components/MarketHeatmap";
import {Card,Input,LiveIndicator,RegimeBadge,SectionHeading,SegmentedControl,SparkBadge} from "@/components/ui";

type RadarMode="Heating up"|"Cooling down"|"Just flipped"|"Strongest";
const stablecoins=new Set(["usdt","usdc","dai","busd","tusd","usdp"]);

export default function HomeV2({coins,updatedLabel}:{coins:Coin[];updatedLabel?:string}){
 const[mode,setMode]=useState<RadarMode>("Heating up");const[query,setQuery]=useState("");const[visible,setVisible]=useState(30);
 const eligible=useMemo(()=>coins.filter(c=>!stablecoins.has(c.symbol.toLowerCase())),[coins]);
 const radar=useMemo(()=>{const fresh=(a:Coin,b:Coin)=>a.streakDays-b.streakDays||b.confidencePct-a.confidencePct;if(mode==="Heating up")return eligible.filter(c=>["awakening","volatile"].includes(getSignalTier(c))).sort(fresh).slice(0,8);if(mode==="Cooling down")return eligible.filter(c=>["building","calm"].includes(getSignalTier(c))).sort(fresh).slice(0,8);if(mode==="Just flipped")return eligible.filter(c=>c.streakDays<=2).sort(fresh).slice(0,8);return[...eligible].sort((a,b)=>getSparkScore(b).score-getSparkScore(a).score).slice(0,8)},[eligible,mode]);
 const discovered=useMemo(()=>{const q=query.trim().toLowerCase();return [...eligible].filter(c=>!q||c.name.toLowerCase().includes(q)||c.symbol.toLowerCase().includes(q)).sort((a,b)=>(a.marketCapRank??9999)-(b.marketCapRank??9999))},[eligible,query]);
 const awakening=eligible.filter(c=>getSignalTier(c)==="awakening").length,volatile=eligible.filter(c=>getSignalTier(c)==="volatile").length,strongest=[...eligible].sort((a,b)=>getSparkScore(b).score-getSparkScore(a).score)[0];
 const pulse=volatile>awakening?"Momentum is running hot.":awakening>0?"Momentum is starting to wake up.":"The market is mostly calm.";
 return <main className="cs-home">
  <section className="cs-home-hero"><div className="cs-home-shell cs-home-hero__grid"><div className="cs-home-hero__copy"><p className="cs-eyebrow">CoinSparkLine</p><h1>See the market <span>before it feels obvious.</span></h1><p>CoinSparkLine turns crypto market behaviour into a calmer signal — what is waking up, what is overheating, and what deserves your attention next.</p><div className="cs-home-actions"><Link href="#radar" className="cs-button cs-button--primary">Explore Spark Radar</Link><Link href="#heatmap" className="cs-button cs-button--secondary">Open market heatmap</Link></div></div><Card variant="raised" className="cs-pulse"><div className="cs-pulse__head"><div><p className="cs-eyebrow">Market pulse</p><h2>{pulse}</h2><p>{updatedLabel||"Latest market snapshot"}</p></div><LiveIndicator/></div><div className="cs-pulse__line" aria-hidden="true"><i/></div><div className="cs-pulse__metrics"><div><strong>{eligible.length}</strong><span>Assets tracked</span></div><div><strong>{awakening}</strong><span>Awakening</span></div><div><strong>{volatile}</strong><span>Volatile</span></div><div><strong>{strongest?getSparkScore(strongest).score:"—"}</strong><span>Top SparkScore</span></div></div></Card></div></section>

  <section id="radar" className="cs-home-section"><div className="cs-home-shell"><SectionHeading eyebrow="Flagship signal view" title="Spark Radar" description="The coins showing the clearest change in market behaviour right now." action={<SegmentedControl items={["Heating up","Cooling down","Just flipped","Strongest"]} value={mode} onChange={v=>setMode(v as RadarMode)} label="Spark Radar view"/>}/><div className="cs-radar-grid">{radar.map(coin=>{const spark=getSparkScore(coin),tier=getSignalTier(coin),positive=coin.change24hPct>=0;return <Card key={coin.id} interactive className="cs-radar-card"><div className="cs-radar-watch"><WatchlistButton coinId={coin.id} compact/></div><Link href={`/coin/${coin.id}`}><div className="cs-coin-head">{coin.logoUrl?<img src={coin.logoUrl} alt=""/>:<span className="cs-coin-fallback">{coin.symbol.slice(0,3)}</span>}<div><strong>{coin.name}</strong><span>{coin.symbol}</span></div></div><div className="cs-price-line"><strong><CurrencyAmount usd={coin.price}/></strong><span data-direction={positive?"up":"down"}>{positive?"+":""}{coin.change24hPct.toFixed(2)}%</span></div><div className="cs-radar-badges"><SparkBadge score={spark.score}/><RegimeBadge regime={({calm:"Calm",building:"Building",awakening:"Awakening",volatile:"Volatile"} as const)[tier]}/></div><div className="cs-confidence"><span>Confidence</span><strong>{coin.confidencePct.toFixed(0)}%</strong></div></Link></Card>})}</div></div></section>

  <MarketHeatmap coins={eligible}/>

  <section id="discover" className="cs-home-section"><div className="cs-home-shell"><SectionHeading eyebrow="Explore everything" title="Discover" description="A clean view across the full tracked market." action={<div className="cs-assets-count"><strong>{eligible.length}</strong><span>Assets tracked</span></div>}/><Card className="cs-discover"><Input aria-label="Search assets" placeholder="Search Bitcoin, Zcash, Solana…" value={query} onChange={e=>{setQuery(e.target.value);setVisible(30)}}/><div className="cs-discovery-grid">{discovered.slice(0,visible).map(coin=>{const positive=coin.change24hPct>=0;return <Link key={coin.id} href={`/coin/${coin.id}`} className="cs-discovery-row">{coin.logoUrl?<img src={coin.logoUrl} alt=""/>:<span className="cs-coin-fallback"/>}<div className="cs-discovery-name"><strong>{coin.name}</strong><span>{coin.symbol}{coin.marketCapRank?` · #${coin.marketCapRank}`:""}</span></div><strong className="cs-discovery-price"><CurrencyAmount usd={coin.price}/></strong><span className="cs-discovery-change" data-direction={positive?"up":"down"}>{positive?"+":""}{coin.change24hPct.toFixed(2)}%</span></Link>})}</div>{visible<discovered.length&&<div className="cs-discover-more"><button className="cs-button cs-button--secondary" onClick={()=>setVisible(v=>Math.min(v+30,discovered.length))}>Show 30 more</button></div>}</Card></div></section>
 </main>;
}
