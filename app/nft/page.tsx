import Header from "@/components/Header";

function ArrowIcon(){return <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M6 14 14 6M8 6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
function SparkIcon(){return <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true"><path d="M12 2.5 14 9l6.5 2-6.5 2-2 6.5-2-6.5-6.5-2 6.5-2 2-6.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>}

const links=[
  {title:"Trending NFTs",copy:"See collections gaining attention right now across OpenSea.",href:"https://opensea.io/collections/trending",tag:"LIVE DISCOVERY"},
  {title:"Top collections",copy:"Browse leading NFT collections ranked by marketplace activity.",href:"https://opensea.io/collections/top",tag:"MARKET LEADERS"},
  {title:"Explore OpenSea",copy:"Search collections, items, creators and wallets across supported chains.",href:"https://opensea.io/collections",tag:"OPEN MARKETPLACE"},
];

const checks=["Verify the collection and contract before buying.","Look at floor price together with sales and owner distribution.","Treat sudden volume spikes carefully — activity does not guarantee quality.","Never connect a wallet or sign a transaction you do not understand."];

export default function NftPage(){
  return <div className="flex-1">
    <Header/>
    <main className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 sm:py-12">
      <section className="relative overflow-hidden rounded-[34px] border border-blue-100/70 bg-white/90 px-5 py-9 shadow-[0_26px_80px_rgba(59,130,246,.08)] sm:px-9 sm:py-12">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-200/45 via-violet-200/35 to-pink-200/30 blur-3xl"/>
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.15em] text-blue-600"><SparkIcon/> NFT PULSE</div>
          <h1 className="mt-5 text-4xl font-bold tracking-[-.055em] text-slate-950 sm:text-6xl">Discover NFTs without leaving the CoinSparkLine flow.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">A clean gateway into NFT discovery. Use CoinSparkLine to understand market movement, then jump into verified OpenSea discovery pages for collections and activity.</p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {links.map((item,i)=><a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" className="group rounded-[28px] border border-blue-100/70 bg-white/88 p-5 shadow-[0_16px_44px_rgba(59,130,246,.055)] transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_54px_rgba(59,130,246,.10)] sm:p-6">
          <div className="flex items-start justify-between gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 text-sm font-bold text-white shadow-[0_10px_24px_rgba(79,70,229,.22)]">{i+1}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-bold tracking-[.12em] text-blue-600">{item.tag}</span></div>
          <h2 className="mt-6 text-2xl font-bold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{item.copy}</p>
          <div className="mt-6 flex items-center gap-2 text-sm font-bold text-blue-600">Open on OpenSea <span className="transition-transform group-hover:translate-x-1"><ArrowIcon/></span></div>
        </a>)}
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[30px] border border-violet-100/70 bg-gradient-to-br from-white via-blue-50/35 to-violet-50/55 p-6 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-violet-500">NFT RADAR</p><h2 className="mt-2 text-3xl font-bold">The next version can become live.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">OpenSea now provides APIs for NFT metadata, collections, orders, search and analytics. Once an OpenSea API key is added securely to Vercel, CoinSparkLine can show live trending collections, floor prices, 24h volume and collection movement directly on this page.</p>
          <div className="mt-5 flex flex-wrap gap-2">{["Trending collections","Floor price","24h volume","Sales","Chains","Collection search"].map(x=><span key={x} className="rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">{x}</span>)}</div>
        </div>
        <div className="rounded-[30px] border border-blue-100/70 bg-white/90 p-6 sm:p-8"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-blue-500">BEFORE YOU BUY</p><h2 className="mt-2 text-2xl font-bold">Quick checks</h2><div className="mt-5 space-y-4">{checks.map((x,i)=><div key={x} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">{i+1}</span><p className="text-sm leading-6 text-slate-600">{x}</p></div>)}</div></div>
      </section>

      <p className="mx-auto mt-7 max-w-3xl text-center text-xs leading-5 text-slate-400">NFT marketplace links and collection data are informational only. CoinSparkLine does not verify every listing or recommend purchases.</p>
    </main>
  </div>;
}
