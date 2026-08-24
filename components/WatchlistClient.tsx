"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CurrencyAmount from "@/components/CurrencyAmount";
import WatchlistButton, { WATCHLIST_KEY } from "@/components/WatchlistButton";
import AlertRuleButton from "@/components/AlertRuleButton";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export interface WatchlistItem {
  id: string;
  name: string;
  symbol: string;
  image: string;
  price: number;
  change24h: number;
  rank: number | null;
  regime?: string;
  confidence?: number;
  sparkScore?: number;
}

function readLocal():string[]{
  try{return JSON.parse(localStorage.getItem(WATCHLIST_KEY)||"[]") as string[]}catch{return[]}
}

export default function WatchlistClient({ items }: { items: WatchlistItem[] }) {
  const [ids, setIds] = useState<string[]>([]);
  const [signedIn,setSignedIn]=useState(false);
  const [status,setStatus]=useState("Loading watchlist…");

  async function load(){
    const local=readLocal();
    try{
      const supabase=getSupabaseBrowserClient();
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){setSignedIn(false);setIds(local);setStatus("Saved on this device. Sign in to sync across devices.");return;}
      const remote=Array.isArray(user.user_metadata?.watchlist)?user.user_metadata.watchlist.filter((x:unknown):x is string=>typeof x==="string"):[];
      const merged=Array.from(new Set([...remote,...local]));
      localStorage.setItem(WATCHLIST_KEY,JSON.stringify(merged));
      if(merged.join("|")!==remote.join("|"))await supabase.auth.updateUser({data:{watchlist:merged}});
      setSignedIn(true);setIds(merged);setStatus(`Synced to your CoinSparkLine account · ${merged.length} coin${merged.length===1?"":"s"}`);
    }catch{
      setIds(local);setStatus("Account sync unavailable. Showing the device watchlist.");
    }
  }

  useEffect(() => {
    load();
    const read = () => load();
    window.addEventListener("csl-watchlist-change", read as EventListener);
    window.addEventListener("storage", read);
    return () => { window.removeEventListener("csl-watchlist-change", read as EventListener); window.removeEventListener("storage", read); };
  }, []);

  const saved = useMemo(() => ids.map(id => items.find(item => item.id === id)).filter(Boolean) as WatchlistItem[], [ids, items]);

  return <>
    <div className={`mx-auto mt-6 max-w-4xl rounded-2xl border px-4 py-3 ${signedIn?"border-emerald-100 bg-emerald-50":"border-slate-200 bg-white"}`}>
      <p className={`text-[11px] ${signedIn?"text-emerald-700":"text-slate-500"}`}><strong>{signedIn?"Account sync on":"Device-only mode"}:</strong> {status}</p>
    </div>
    {saved.length === 0 ? (
      <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="text-3xl text-amber-400">☆</div>
        <h2 className="mt-3 text-xl font-semibold">Your watchlist is empty</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">Tap the star on any coin in Market Discovery, Wider Market or a coin page. Signed-in users sync the list across devices.</p>
        <Link href="/" className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">Browse the market</Link>
      </div>
    ) : (
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{saved.map(item => {
        const positive=item.change24h>=0;
        return <article key={item.id} className="rounded-2xl border border-slate-200/75 bg-white p-4 shadow-[0_6px_20px_rgba(20,35,75,0.035)]">
          <div className="flex items-start justify-between gap-3"><Link href={`/coin/${item.id}`} className="flex min-w-0 items-center gap-3">{item.image?<img src={item.image} alt="" className="h-10 w-10 rounded-full object-contain"/>:<span className="h-10 w-10 rounded-full bg-slate-100"/>}<div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{item.name}</p><p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">{item.symbol} {item.rank?`· #${item.rank}`:""}</p></div></Link><WatchlistButton coinId={item.id} compact/></div>
          <Link href={`/coin/${item.id}`} className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50/80 p-3"><div><p className="text-[9px] uppercase tracking-wider text-slate-400">Price</p><p className="mt-1 text-sm font-semibold"><CurrencyAmount usd={item.price}/></p><p className={`mt-1 text-[10px] font-medium ${positive?"text-emerald-600":"text-rose-600"}`}>{positive?"+":""}{item.change24h.toFixed(2)}% 24h</p></div><div><p className="text-[9px] uppercase tracking-wider text-slate-400">Signal</p><p className="mt-1 text-xs font-bold uppercase text-slate-700">{item.regime||"Analyse"}</p><p className="mt-1 text-[10px] text-slate-400">{item.sparkScore!=null?`SparkScore ${item.sparkScore}`:item.confidence!=null?`${item.confidence.toFixed(0)}% confidence`:"Open coin analysis"}</p></div></Link>
          <div className="mt-3 flex items-center justify-between gap-2"><AlertRuleButton coinId={item.id} compact/><Link href={`/coin/${item.id}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600 hover:text-slate-900">Open analysis</Link></div>
        </article>
      })}</div>
    )}
  </>;
}
