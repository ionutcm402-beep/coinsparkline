"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const KEY = "csl-watchlist-v1";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") as string[]; } catch { return []; }
}

function writeIds(ids:string[]){
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("csl-watchlist-change", { detail: ids }));
}

export default function WatchlistButton({ coinId, compact = false }: { coinId: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [busy,setBusy]=useState(false);

  async function load(){
    const local=readIds();
    try{
      const supabase=getSupabaseBrowserClient();
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){setSaved(local.includes(coinId));return;}
      const remote=Array.isArray(user.user_metadata?.watchlist)?user.user_metadata.watchlist.filter((x:unknown):x is string=>typeof x==="string"):[];
      const merged=Array.from(new Set([...remote,...local]));
      if(merged.join("|")!==remote.join("|")) await supabase.auth.updateUser({data:{watchlist:merged}});
      writeIds(merged);
      setSaved(merged.includes(coinId));
    }catch{setSaved(local.includes(coinId));}
  }

  useEffect(()=>{load();const onChange=()=>setSaved(readIds().includes(coinId));window.addEventListener("csl-watchlist-change",onChange);return()=>window.removeEventListener("csl-watchlist-change",onChange)},[coinId]);

  async function toggle() {
    if(busy)return;
    setBusy(true);
    const ids = readIds();
    const next = ids.includes(coinId) ? ids.filter((id) => id !== coinId) : [...ids, coinId];
    writeIds(next);
    setSaved(next.includes(coinId));
    try{
      const supabase=getSupabaseBrowserClient();
      const {data:{user}}=await supabase.auth.getUser();
      if(user) await supabase.auth.updateUser({data:{watchlist:next}});
    }finally{setBusy(false)}
  }

  return (
    <button type="button" onClick={toggle} disabled={busy} aria-label={saved ? "Remove from watchlist" : "Add to watchlist"} aria-pressed={saved} title={saved?"Remove from watchlist":"Add to watchlist"}
      className={`${compact ? "h-7 w-7 text-sm" : "h-8 w-8 text-base"} inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 disabled:opacity-50 ${saved ? "text-amber-500" : "text-slate-300 hover:text-slate-600"}`}>
      {busy ? "…" : saved ? "★" : "☆"}
    </button>
  );
}

export { KEY as WATCHLIST_KEY };
