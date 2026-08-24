"use client";

import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import type {Coin} from "@/types/coin";
import type {MarketSignal} from "@/types/market";
import {getSignalTier} from "@/lib/tiers";
import {getSparkScore} from "@/lib/sparkScore";
import CurrencyAmount from "@/components/CurrencyAmount";

type Mode="crypto"|"nft";
const stablecoins=new Set(["usdt","usdc","dai","busd","tusd","usdp","usde","usds","usdd"]);
const tierLabel={calm:"Calm",building:"Building",awakening:"Awakening",volatile:"Volatile"} as const;
function pct(v:number|null|undefined){if(typeof v!=="number")return"—";return`${v>=0?"+":""}${v.toFixed(2)}%`}
function cryptoReason(coin:Coin){const tier=getSignalTier(coin),score=getSparkScore(coin).score;if(tier==="volatile")return score>=70?"Volatility is elevated and the behavioural signal is concentrated.":"Volatility is elevated, but the signal is less concentrated.";if(tier==="awakening")return"The model is leaning volatile while confidence is still forming.";if(tier==="building")return"Calm conditions are losing certainty and activity is building.";return"Behaviour remains comparatively stable with no strong transition pressure."}
function nftReason(asset:MarketSignal){const score=asset.activityScore??0;if(score>=75)return"Unusually strong collection activity is showing across the current OpenSea snapshot.";if(score>=55)return"Collection activity is above the quieter part of the current NFT market.";return"No strong activity anomaly is visible in the latest NFT snapshot."}

export default function TerminalLive({coins,updatedLabel}:{coins:Coin[];updatedLabel?:string}){
 const[mode,setMode]=useState<Mode>("crypto");
 const[selectedCoinId,setSelectedCoinId]=useState<string|null>(null);
 const[selectedNftId,setSelectedNftId]=useState<string|null>(null);
 const[nfts,setNfts]=useState<MarketSignal[]>([]);
 const[nftState,setNftState]=useState<"loading"|"live"|"error">("loading");
 const crypto=useMemo(()=>coins.filter(c=>!stablecoins.has(c.symbol.toLowerCase())).sort((a,b)=>getSparkScore(b).score-getSparkScore(a).score),[coins]);
 const selectedCoin=crypto.find(c=>c.id===selectedCoinId)||crypto[0]||null;
 const selectedNft=nfts.find(n=>n.id===selectedNftId)||nfts[0]||null;
 useEffect(()=>{let mounted=true;async function load(){try{const r=await fetch("/api/nft-market",{cache:"no-store"});if(!r.ok)throw new Error();const j=await r.json();if(mounted){const assets=Array.isArray(j.assets)?j.assets:[];setNfts(assets.sort((a:MarketSignal,b:MarketSignal)=>(b.activityScore??0)-(a.activityScore??0)));setNftState("live")}}catch{if(mounted)setNftState("error")}}void load();return()=>{mounted=false}},[]);
 const topCrypto=crypto.slice(0,16),topNfts=nfts.slice(0,16);
 const hotCrypto=crypto.filter(c=>getSparkScore(c).score>=70).length;
 const hotNfts=nfts.filter(n=>(n.activityScore??0)>=70).length;
 return <main className="simple-live-root">
  <header className="simple-live-header"><Link href="/" className="simple-live-brand">Coin<span>SparkLine</span></Link><nav><Link href="/" data-active="true">LIVE</Link><Link href="/signals">MY SIGNALS</Link></nav><div><span>{updatedLabel||"Latest scan"}</span><Link href="/methodology">How it works</Link></div></header>

  <section className="simple-live-intro"><div><span className="simple-kicker">Behavioural intelligence</span><h1>What is changing now?</h1><p>CoinSparkLine uses behavioural signals to surface crypto and NFT activity that deserves a closer look.</p></div><div className="simple-mode-switch" role="tablist" aria-label="Market type"><button role="tab" aria-selected={mode==="crypto"} data-active={mode==="crypto"} onClick={()=>setMode("crypto")}>CRYPTO <small>{hotCrypto} hot</small></button><button role="tab" aria-selected={mode==="nft"} data-active={mode==="nft"} onClick={()=>setMode("nft")}>NFT <small>{nftState==="live"?`${hotNfts} hot`:nftState==="loading"?"loading":"offline"}</small></button></div></section>

  {mode==="crypto"?<>
   <section className="simple-summary" aria-label="Crypto signal summary"><div><span>Strong signals</span><strong>{hotCrypto}</strong></div><div><span>Top SparkScore</span><strong>{selectedCoin?getSparkScore(crypto[0]).score:"—"}</strong></div><div><span>Tracked assets</span><strong>{crypto.length}</strong></div></section>
   <section className="simple-live-grid"><div className="simple-list"><div className="simple-list-head"><span>Crypto</span><b>Ranked by SparkScore</b></div>{topCrypto.map((c,index)=>{const score=getSparkScore(c).score,tier=getSignalTier(c);return <button key={c.id} data-active={selectedCoin?.id===c.id} onClick={()=>setSelectedCoinId(c.id)}><span className="simple-rank">{String(index+1).padStart(2,"0")}</span><span className="simple-asset">{c.logoUrl?<img src={c.logoUrl} alt=""/>:null}<span><b>{c.symbol.toUpperCase()}</b><small>{c.name}</small></span></span><span><CurrencyAmount usd={c.price}/><small data-direction={c.change24hPct>=0?"up":"down"}>{pct(c.change24hPct)}</small></span><strong className="simple-score">{score}</strong><em>{tierLabel[tier]}</em></button>})}</div>
    {selectedCoin?<aside className="simple-detail"><div className="simple-detail-top"><span>Selected signal</span><Link href={`/coin/${selectedCoin.id}`}>Full details ↗</Link></div><div className="simple-detail-identity">{selectedCoin.logoUrl?<img src={selectedCoin.logoUrl} alt=""/>:null}<div><small>{selectedCoin.symbol.toUpperCase()}</small><h2>{selectedCoin.name}</h2></div></div><div className="simple-big-score"><strong>{getSparkScore(selectedCoin).score}</strong><span>SparkScore<br/>{tierLabel[getSignalTier(selectedCoin)]}</span></div><p>{cryptoReason(selectedCoin)}</p><dl><div><dt>24h</dt><dd data-direction={selectedCoin.change24hPct>=0?"up":"down"}>{pct(selectedCoin.change24hPct)}</dd></div><div><dt>Confidence</dt><dd>{selectedCoin.confidencePct.toFixed(0)}%</dd></div><div><dt>Regime streak</dt><dd>{selectedCoin.streakDays}d</dd></div></dl><div className="simple-detail-actions"><Link href={`/signals?tab=watching&coin=${encodeURIComponent(selectedCoin.symbol)}`}>Watch</Link><Link href="/signals?tab=alerts">Create alert</Link></div></aside>:null}</section>
  </>:<>
   <section className="simple-summary" aria-label="NFT activity summary"><div><span>High activity</span><strong>{nftState==="live"?hotNfts:"—"}</strong></div><div><span>Top NFT Spark</span><strong>{topNfts[0]?.activityScore??"—"}</strong></div><div><span>Collections</span><strong>{nftState==="live"?nfts.length:"—"}</strong></div></section>
   {nftState==="error"?<div className="simple-status-card">NFT data is temporarily unavailable. Crypto intelligence remains live.</div>:null}
   <section className="simple-live-grid"><div className="simple-list"><div className="simple-list-head"><span>NFT</span><b>Experimental activity ranking</b></div>{nftState==="loading"?<div className="simple-status-card">Loading OpenSea activity…</div>:topNfts.map((n,index)=><button key={n.id} data-active={selectedNft?.id===n.id} onClick={()=>setSelectedNftId(n.id)}><span className="simple-rank">{String(index+1).padStart(2,"0")}</span><span className="simple-asset">{n.imageUrl?<img src={n.imageUrl} alt=""/>:<i>NFT</i>}<span><b>{n.symbol||"NFT"}</b><small>{n.name}</small></span></span><span>{n.price==null?"—":`${n.price.toFixed(2)} ETH`}<small>floor</small></span><strong className="simple-score">{n.activityScore??"—"}</strong><em>activity</em></button>)}</div>
    {selectedNft?<aside className="simple-detail"><div className="simple-detail-top"><span>NFT signal</span>{selectedNft.metadata?.marketplaceUrl?<a href={String(selectedNft.metadata.marketplaceUrl)} target="_blank" rel="noreferrer">OpenSea ↗</a>:null}</div><div className="simple-detail-identity">{selectedNft.imageUrl?<img src={selectedNft.imageUrl} alt=""/>:null}<div><small>NFT COLLECTION</small><h2>{selectedNft.name}</h2></div></div><div className="simple-big-score"><strong>{selectedNft.activityScore??"—"}</strong><span>NFT Spark<br/>experimental</span></div><p>{nftReason(selectedNft)}</p><dl><div><dt>Floor</dt><dd>{selectedNft.price==null?"—":`${selectedNft.price.toFixed(2)} ETH`}</dd></div><div><dt>24h volume</dt><dd>{typeof selectedNft.metadata?.volume24h==="number"?Number(selectedNft.metadata.volume24h).toFixed(1):"—"}</dd></div><div><dt>24h change</dt><dd>{pct(selectedNft.change24hPct)}</dd></div></dl><small className="simple-experimental-note">NFT Spark is an experimental activity score. It is not presented as the validated crypto SparkScore model.</small></aside>:null}</section>
  </>}

  <footer className="simple-live-footer"><p>Behavioural signals are research tools, not financial advice.</p><div><Link href="/methodology">Methodology</Link><Link href="/risk">Risk</Link><Link href="/disclaimer">Disclaimer</Link></div></footer>
 </main>
}
