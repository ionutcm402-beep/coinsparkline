"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Choice = "all" | "essential";
const KEY = "csl-cookie-choice";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(!localStorage.getItem(KEY)); }, []);
  const choose = (choice: Choice) => { localStorage.setItem(KEY, choice); window.dispatchEvent(new CustomEvent("csl-consent", { detail: choice })); setOpen(false); };
  if (!open) return null;
  return <div className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur sm:p-5" role="dialog" aria-label="Cookie preferences">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-xl"><p className="text-sm font-semibold text-slate-950">Your privacy choices</p><p className="mt-1 text-xs leading-5 text-slate-500">CoinSparkLine uses essential browser storage for features such as preferences. Optional analytics or third-party media should only load with your permission. You can reject non-essential technologies and still use the site.</p><Link href="/cookies" className="mt-1 inline-block text-[11px] font-semibold text-blue-600">Cookie policy</Link></div>
      <div className="flex shrink-0 gap-2"><button onClick={()=>choose("essential")} className="rounded-full border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-700">Reject non-essential</button><button onClick={()=>choose("all")} className="rounded-full bg-slate-950 px-3 py-2 text-[11px] font-semibold text-white">Accept all</button></div>
    </div>
  </div>;
}
