"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";
import {DisplayCurrency,useCurrency} from "@/components/CurrencyProvider";
import {getSupabaseBrowserClient} from "@/lib/supabaseClient";
import GlobalCommand from "@/components/GlobalCommand";
import {Coin} from "@/types/coin";

function Logo(){return <span className="csl-shell-wordmark">Coin<strong>SparkLine</strong></span>}

const nav=[
 {href:"/",label:"Market"},{href:"/live",label:"Live"},{href:"/opportunities",label:"Radar"},{href:"/screener",label:"Screener"},{href:"/compare",label:"Compare"},{href:"/watchlist",label:"Watchlist"},{href:"/portfolio",label:"Portfolio"},{href:"/alerts",label:"Alerts"}
];

export default function Header({coins=[]}:{coins?:Coin[]}){
 const pathname=usePathname();const{currency,setCurrency}=useCurrency();const[menu,setMenu]=useState(false);const[signedIn,setSignedIn]=useState(false);const[ready,setReady]=useState(false);
 useEffect(()=>{setMenu(false)},[pathname]);
 useEffect(()=>{let active=true;try{const s=getSupabaseBrowserClient();s.auth.getUser().then(({data})=>{if(active){setSignedIn(!!data.user);setReady(true)}});const{data:{subscription}}=s.auth.onAuthStateChange((_e,session)=>{if(active){setSignedIn(!!session?.user);setReady(true)}});return()=>{active=false;subscription.unsubscribe()}}catch{setReady(true);return()=>{active=false}}},[]);
 async function signOut(){try{await getSupabaseBrowserClient().auth.signOut()}finally{window.location.href="/"}}
 const isActive=(href:string)=>href==="/"?pathname==="/":pathname===href||pathname.startsWith(href+"/");
 return <header className="csl-shell-header"><div className="csl-shell csl-shell-header__inner"><Link href="/" className="csl-shell-brand" aria-label="CoinSparkLine home"><Logo/></Link><nav className="csl-shell-nav" aria-label="Primary navigation">{nav.map(item=>{const active=isActive(item.href);return <Link key={item.href} href={item.href} data-active={active} aria-current={active?"page":undefined}>{item.label}{item.href==="/live"?<span className="csl-live-dot" aria-hidden="true"/>:null}</Link>})}</nav><div className="csl-shell-actions">{coins.length>0?<GlobalCommand coins={coins} buttonOnly/>:null}<div className="csl-shell-currency" role="group" aria-label="Display currency">{(["USD","GBP","EUR"] as DisplayCurrency[]).map(code=><button key={code} onClick={()=>setCurrency(code)} data-active={currency===code} aria-pressed={currency===code} aria-label={`Display prices in ${code}`}>{code==="USD"?"$":code==="GBP"?"£":"€"}</button>)}</div>{ready&&signedIn?<><Link href="/watchlist" className="csl-btn-soft">Account</Link><button onClick={signOut} className="csl-btn-primary">Sign out</button></>:<><Link href="/signin" className="csl-btn-soft">Sign in</Link><Link href="/signup" className="csl-btn-primary">Sign up</Link></>}<button type="button" onClick={()=>setMenu(v=>!v)} className="csl-shell-menu-button" aria-label={menu?"Close menu":"Open menu"} aria-expanded={menu} aria-controls="mobile-navigation">{menu?"×":"☰"}</button></div></div><div id="mobile-navigation" className="csl-shell-mobile" data-open={menu}><div className="csl-shell csl-shell-mobile__inner"><nav aria-label="Mobile navigation">{nav.map(item=>{const active=isActive(item.href);return <Link key={item.href} href={item.href} data-active={active} aria-current={active?"page":undefined}>{item.label}{item.href==="/live"?<span className="csl-live-dot" aria-hidden="true"/>:null}</Link>})}</nav><div className="csl-shell-mobile__account">{signedIn?<><Link href="/watchlist" className="csl-btn-soft">Account</Link><button onClick={signOut} className="csl-btn-primary">Sign out</button></>:<><Link href="/signin" className="csl-btn-soft">Sign in</Link><Link href="/signup" className="csl-btn-primary">Sign up</Link></>}</div></div></div></header>;
}
