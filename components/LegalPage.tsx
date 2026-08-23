import Link from "next/link";
import Header from "@/components/Header";

export default function LegalPage({ title, intro, children }: { title:string; intro:string; children:React.ReactNode }) {
 return <div className="min-h-screen bg-[#fbfcff] text-slate-950"><Header/><main className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-600">CoinSparkLine · Legal & trust</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.035em]">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-500">{intro}</p><div className="mt-7 space-y-6 rounded-2xl border border-slate-200/70 bg-white p-6 text-sm leading-6 text-slate-600 shadow-sm">{children}</div><div className="mt-8 flex flex-wrap gap-4 border-t border-slate-200 pt-5 text-[11px] text-slate-500"><Link href="/risk">Risk Disclosure</Link><Link href="/disclaimer">Disclaimer</Link><Link href="/privacy">Privacy</Link><Link href="/cookies">Cookies</Link><Link href="/terms">Terms</Link><Link href="/methodology">Methodology</Link></div></main></div>;
}
