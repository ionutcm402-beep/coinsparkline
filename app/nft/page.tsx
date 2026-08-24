import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getNftCollections } from "@/lib/nftData";

export const dynamic = "force-dynamic";

function fmt(n: number | null, digits = 2) {
  return n == null ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M6 14 14 6M8 6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function NftPage() {
  const collections = await getNftCollections();
  const ranked = [...collections].sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0));
  const volumeLeader = ranked.find((item) => item.volume24h != null);
  const floorLeader = [...collections]
    .filter((item) => item.floor != null)
    .sort((a, b) => (b.floor ?? 0) - (a.floor ?? 0))[0];
  const networks = new Set(collections.map((item) => item.chain)).size;

  return (
    <div className="csl2-page">
      <Header />
      <main className="csl2-page-main">
        <section className="csl2-page-hero overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <p className="csl-kicker">NFT Radar · powered by OpenSea</p>
              <h1 className="csl2-page-title mt-3">
                Follow the collections<br />
                <span className="csl-gradient-text">actually moving now.</span>
              </h1>
              <p className="csl2-page-copy max-w-2xl">
                Live NFT discovery with collection images, market activity, floor prices and direct OpenSea access — all inside the same CoinSparkLine research flow.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Live OpenSea data", "Trending collections", "Floor price", "24h volume", "Sales activity"].map((item) => (
                  <span key={item} className="rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-[10px] font-bold text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border border-blue-100 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-blue-500">Market pulse</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4"><span className="text-[10px] text-slate-400">Live collections</span><strong className="mt-1 block text-2xl font-black text-slate-950">{collections.length}</strong></div>
                <div className="rounded-2xl bg-slate-50 p-4"><span className="text-[10px] text-slate-400">Networks</span><strong className="mt-1 block text-2xl font-black text-slate-950">{networks || "—"}</strong></div>
                <div className="col-span-2 rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 p-4"><span className="text-[10px] text-slate-400">24h activity leader</span><strong className="mt-1 block truncate text-lg font-black text-slate-950">{volumeLeader?.name ?? "Loading live market data"}</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="csl2-section">
          <div className="csl2-section-head">
            <div>
              <p className="csl-kicker">Live collection intelligence</p>
              <h2 className="csl2-section-title mt-2">Trending on OpenSea.</h2>
              <p className="mt-2 text-sm text-slate-500">Fresh server-side data. No API key is exposed in the browser.</p>
            </div>
            <a href="https://opensea.io" target="_blank" rel="noopener noreferrer" className="csl-btn-primary">Open OpenSea <Arrow /></a>
          </div>

          {collections.length > 0 ? (
            <>
              <div className="csl2-summary-grid">
                <div className="csl2-summary-card"><span>Collections tracked</span><strong>{collections.length}</strong></div>
                <div className="csl2-summary-card"><span>24h volume leader</span><strong>{volumeLeader?.name ?? "—"}</strong></div>
                <div className="csl2-summary-card"><span>Highest floor</span><strong>{floorLeader ? `${fmt(floorLeader.floor)} Ξ` : "—"}</strong></div>
                <div className="csl2-summary-card"><span>Refresh cadence</span><strong>~5 min</strong></div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {ranked.map((collection, index) => (
                  <article key={`${collection.chain}-${collection.slug}`} className="group overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-100">
                      {collection.image ? (
                        <img src={collection.image} alt={collection.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl font-black text-indigo-200">NFT</div>
                      )}
                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[9px] font-black uppercase tracking-[.12em] text-slate-700 shadow-sm backdrop-blur">#{index + 1} · {collection.chain}</div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-xl font-black text-slate-950">{collection.name}</h3>
                          <p className="mt-1 truncate text-xs text-slate-400">{collection.slug}</p>
                        </div>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-black text-indigo-600">OPENSea</span>
                      </div>
                      <div className="mt-5 grid grid-cols-3 gap-2">
                        <div className="rounded-2xl bg-slate-50 p-3"><span className="text-[9px] font-semibold text-slate-400">Floor</span><b className="mt-1 block text-sm text-slate-900">{fmt(collection.floor)} Ξ</b></div>
                        <div className="rounded-2xl bg-slate-50 p-3"><span className="text-[9px] font-semibold text-slate-400">24h volume</span><b className="mt-1 block text-sm text-slate-900">{fmt(collection.volume24h)} Ξ</b></div>
                        <div className="rounded-2xl bg-slate-50 p-3"><span className="text-[9px] font-semibold text-slate-400">24h sales</span><b className="mt-1 block text-sm text-slate-900">{fmt(collection.sales24h, 0)}</b></div>
                      </div>
                      <a href={collection.marketplaceUrl} target="_blank" rel="noopener noreferrer" className="csl-btn-soft mt-4 w-full">Explore on OpenSea <Arrow /></a>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-[28px] border border-amber-200 bg-amber-50 p-7">
              <p className="text-lg font-black text-slate-950">Live OpenSea data could not be rendered.</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">The page is connected, but the collection response could not be converted into cards. CoinSparkLine will keep this state visible rather than pretending the feed is live.</p>
            </div>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="csl2-product-panel mt-0">
            <p className="csl-kicker">How to use it</p>
            <h2 className="mt-2 text-2xl font-extrabold">Research first. Marketplace second.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">Use CoinSparkLine to spot activity, compare floor and volume behaviour, then open the verified OpenSea collection page when you want to inspect the market itself.</p>
          </div>
          <div className="csl2-product-panel mt-0">
            <p className="csl-kicker">Before you buy</p>
            <div className="mt-4 space-y-3">
              {["Verify the collection and contract.", "Check liquidity, recent sales and holder concentration.", "Treat sudden volume spikes carefully.", "Never sign a transaction you do not understand."].map((item, index) => (
                <div key={item} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-black text-blue-600">{index + 1}</span>
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p className="mt-7 text-center text-[10px] leading-5 text-slate-400">NFT market data is informational and can change rapidly. CoinSparkLine does not verify every collection or recommend purchases.</p>
      </main>
      <Footer />
    </div>
  );
}
