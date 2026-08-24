import Link from "next/link";

const groups=[
  ["Product",[["Market","/"],["Watchlist","/watchlist"],["Portfolio","/portfolio"],["Compare","/compare"],["Alerts","/alerts"]]],
  ["Learn",[["How it works","/about"],["Methodology","/methodology"],["Crypto School","/school"]]],
  ["Account",[["Sign in","/signin"],["Sign up","/signup"],["My portfolio","/portfolio"],["My watchlist","/watchlist"]]],
  ["Legal & privacy",[["Risk disclosure","/risk"],["Disclaimer","/disclaimer"],["Privacy policy","/privacy"],["Cookie policy","/cookies"],["Terms of service","/terms"]]],
] as const;

export default function Footer(){
  return <footer className="mt-6 border-t border-slate-200/80 bg-white/72">
    <div className="mx-auto max-w-[1390px] px-5 py-7 lg:grid lg:grid-cols-[1.35fr_.8fr_.8fr_.8fr_1fr] lg:gap-7 lg:py-8">
      <div className="pb-5 lg:pb-0"><div className="flex items-center gap-2"><span className="h-[3px] w-9 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500"/><strong className="text-[18px] tracking-[-.045em] text-slate-950">Coin<span className="bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">SparkLine</span></strong></div><p className="mt-2 text-[12px] font-semibold text-slate-800">Track the calm. <span className="bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">Catch the move.</span></p><p className="mt-3 max-w-xs text-[10px] leading-4 text-slate-500">Market behaviour intelligence for spotting when crypto conditions move from calm toward activity.</p><p className="mt-3 text-[9px] leading-4 text-slate-400">Signals and SparkScore are informational indicators, not personalised investment advice or predictions of return.</p></div>
      {groups.map(([title,links])=><div key={title} className="border-t border-slate-100 py-1 lg:border-0 lg:py-0"><details className="group lg:hidden"><summary className="flex cursor-pointer list-none items-center justify-between py-3 text-[10px] font-bold uppercase tracking-[.1em] text-slate-500">{title}<span className="text-base font-normal transition group-open:rotate-45">+</span></summary><div className="grid gap-2 pb-4 text-[11px] text-slate-600">{links.map(([label,href])=><Link key={label} href={href}>{label}</Link>)}{title==="Learn"&&<span className="text-slate-400">Data via CoinGecko</span>}{title==="Legal & privacy"&&<a href="#top" className="font-semibold text-blue-600">Back to top ↑</a>}</div></details><div className="hidden lg:block"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-slate-400">{title}</p><div className="mt-3 grid gap-2 text-[10px] text-slate-600">{links.map(([label,href])=><Link key={label} href={href}>{label}</Link>)}{title==="Learn"&&<span className="text-slate-400">Data via CoinGecko</span>}{title==="Legal & privacy"&&<a href="#top" className="mt-1 font-semibold text-blue-600">Back to top ↑</a>}</div></div></div>)}
    </div>
    <div className="border-t border-slate-200/70"><div className="mx-auto flex max-w-[1390px] flex-col gap-1 px-5 py-3 text-[8px] text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} CoinSparkLine. All rights reserved.</span><span>Cryptoassets are high risk. You may lose all money invested.</span></div></div>
  </footer>;
}
