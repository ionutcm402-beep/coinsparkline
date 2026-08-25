"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useCurrency,type DisplayCurrency} from "@/components/CurrencyProvider";
import {getSupabaseBrowserClient} from "@/lib/supabaseClient";

export default function Clean2030Controls(){
 const{currency,setCurrency}=useCurrency();
 const[theme,setTheme]=useState<"day"|"night">("day");
 const[email,setEmail]=useState<string|null>(null);
 useEffect(()=>{
  const saved=window.localStorage.getItem("csl-theme");const next=saved==="night"?"night":"day";setTheme(next);document.documentElement.dataset.theme=next;
  const supabase=getSupabaseBrowserClient();
  void supabase.auth.getUser().then(({data})=>setEmail(data.user?.email||null));
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setEmail(session?.user.email||null));
  return()=>subscription.unsubscribe();
 },[]);
 function toggleTheme(){const next=theme==="day"?"night":"day";setTheme(next);window.localStorage.setItem("csl-theme",next);document.documentElement.dataset.theme=next}
 async function signOut(){await getSupabaseBrowserClient().auth.signOut();setEmail(null);window.location.href="/crypto"}
 return <div className="clean2030-controls">
  <div className="clean2030-currency" aria-label="Display currency">{(["USD","GBP","EUR"] as DisplayCurrency[]).map(item=><button key={item} data-active={currency===item} onClick={()=>setCurrency(item)}>{item}</button>)}</div>
  <button className="clean2030-theme" onClick={toggleTheme} aria-label={`Switch to ${theme==="day"?"night":"day"} mode`}>{theme==="day"?"◐":"☀"}</button>
  {email?<div className="clean2030-user"><span>{email.split("@")[0]}</span><button onClick={signOut}>SIGN OUT</button></div>:<Link className="clean2030-login" href="/signin">SIGN IN</Link>}
 </div>
}
