"use client";
import Link from "next/link";
import {useEffect,useState} from "react";

const KEY="coinsparkline-risk-notice-v1";

export default function MarketRiskWelcome(){
 const[open,setOpen]=useState(false);
 useEffect(()=>{try{if(localStorage.getItem(KEY)!=="accepted")setOpen(true)}catch{setOpen(true)}},[]);
 function accept(){try{localStorage.setItem(KEY,"accepted")}catch{}setOpen(false)}
 if(!open)return null;
 return <div className="clean2030-risk-overlay" role="presentation">
  <section className="clean2030-risk-modal" role="dialog" aria-modal="true" aria-labelledby="market-risk-title" aria-describedby="market-risk-copy">
   <span className="clean2030-kicker">Before you explore CoinSparkLine</span>
   <h1 id="market-risk-title">Understand the signal. Understand the risk.</h1>
   <p id="market-risk-copy" className="clean2030-risk-lead">CoinSparkLine is a market analytics tool. It helps you see changes in market behaviour — it does not tell you what to buy or sell.</p>
   <div className="clean2030-risk-formula">
    <span>HOW THE MODEL WORKS</span>
    <strong>Market data → behaviour → SparkScore → regime + context</strong>
    <p>Our formula combines market inputs into proprietary analytical scores and classifications. SparkScore, regimes, confidence and activity labels describe observed market conditions. They are not price predictions, trading signals or guarantees of future performance.</p>
   </div>
   <div className="clean2030-risk-warning">
    <strong>Cryptoassets are highly volatile and high risk.</strong>
    <p>You can lose all the money you invest. CoinSparkLine provides general information and analytics only, not financial, investment, legal or tax advice. Always do your own research and make your own decisions.</p>
   </div>
   <label className="clean2030-risk-check"><input type="checkbox" required id="csl-risk-confirm"/><span>I understand that CoinSparkLine does not recommend buying or selling cryptoassets and that I may lose all money invested.</span></label>
   <button className="clean2030-risk-enter" onClick={()=>{const box=document.getElementById("csl-risk-confirm") as HTMLInputElement|null;if(box?.checked)accept();else box?.focus()}}>I UNDERSTAND — ENTER COINSPARKLINE</button>
   <p className="clean2030-risk-links">Read the <Link href="/disclaimer">full disclaimer</Link> and <Link href="/risk">risk disclosure</Link>.</p>
  </section>
 </div>
}
