import Link from "next/link";

export default function Footer(){
  return <footer className="mt-8 border-t border-slate-200/80 bg-white/65">
    <div className="mx-auto grid max-w-[1390px] gap-7 px-5 py-8 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.2fr]">
      <div>
        <div className="flex items-center gap-2"><span className="h-[2px] w-7 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500"/><strong className="text-sm tracking-[-.03em] text-slate-950">CoinSparkLine</strong></div>
        <p className="mt-2 max-w-xs text-[10px] leading-4 text-slate-500">Market behaviour intelligence for spotting when crypto conditions move from calm toward activity.</p>
        <p className="mt-3 text-[9px] leading-4 text-slate-400">Signals and SparkScore are informational indicators, not personalised investment advice or predictions of return.</p>
      </div>
      <div><p className="text-[9px] font-bold uppercase tracking-[.13em] text-slate-400">Product</p><div className="mt-2 grid gap-1.5 text-[10px] text-slate-600"><Link href="/">Market</Link><Link href="/watchlist">Watchlist</Link><Link href="/compare">Compare</Link><Link href="/alerts">Alerts</Link></div></div>
      <div><p className="text-[9px] font-bold uppercase tracking-[.13em] text-slate-400">Understand</p><div className="mt-2 grid gap-1.5 text-[10px] text-slate-600"><Link href="/about">About</Link><Link href="/methodology">Methodology</Link><Link href="/school">Crypto School</Link><span className="text-slate-400">Market data via CoinGecko</span></div></div>
      <div><p className="text-[9px] font-bold uppercase tracking-[.13em] text-slate-400">Legal & privacy</p><div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-slate-600"><Link href="/risk">Risk disclosure</Link><Link href="/disclaimer">Disclaimer</Link><Link href="/privacy">Privacy</Link><Link href="/cookies">Cookies</Link><Link href="/terms">Terms</Link><a href="#top">Back to top ↑</a></div></div>
    </div>
    <div className="border-t border-slate-200/70"><div className="mx-auto flex max-w-[1390px] flex-wrap items-center justify-between gap-2 px-5 py-3 text-[8px] text-slate-400"><span>© {new Date().getFullYear()} CoinSparkLine</span><span>Cryptoassets are high risk. You may lose all money invested.</span></div></div>
  </footer>;
}
