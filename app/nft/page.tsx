import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NftCollectionExplorer from "@/components/NftCollectionExplorer";
import { getNftCollections } from "@/lib/nftData";

export const dynamic = "force-dynamic";

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M6 14 14 6M8 6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function fmt(n: number | null, digits = 2) {
  return n == null ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export default async function NftPage() {
  const collections = await getNftCollections();
  const ranked = [...collections].sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0));
  const volumeLeader = ranked.find((item) => item.volume24h != null);
  const floorValues = collections.map((item) => item.floor).filter((n): n is number => n != null && n > 0);
  const typicalFloor = median(floorValues);
  const floorThreshold = typicalFloor > 0 ? Math.max(typicalFloor * 20, 100) : 100;
  const verifiedFloorLeader = [...collections].filter((item) => item.floor != null && item.floor <= floorThreshold).sort((a, b) => (b.floor ?? 0) - (a.floor ?? 0))[0];
  const networks = new Set(collections.map((item) => item.chain)).size;

  return (
    <div className="csl2-page">
      <Header />
      <main className="csl2-page-main">
        <section className="csl2-page-hero overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <p className="csl-kicker">NFT Radar · powered by OpenSea</p>
              <h1 className="csl2-page-title mt-3">Follow the collections<br /><span className="csl-gradient-text">actually moving now.</span></h1>
              <p className="csl2-page-copy max-w-2xl">Live NFT discovery with collection images, market activity, floor prices and direct OpenSea access — all inside the same CoinSparkLine research flow.</p>
              <div className="mt-6 flex flex-wrap gap-2">{["Live OpenSea data", "Trending collections", "Floor price", "24h volume", "Sales activity"].map((item) => <span key={item} className="rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-[10px] font-bold text-slate-600">{item}</span>)}</div>
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
            <div><p className="csl-kicker">Live collection intelligence</p><h2 className="csl2-section-title mt-2">Trending on OpenSea.</h2><p className="mt-2 text-sm text-slate-500">Fresh server-side data with safer outlier handling. No API key is exposed in the browser.</p></div>
            <a href="https://opensea.io" target="_blank" rel="noopener noreferrer" className="csl-btn-primary">Open OpenSea <Arrow /></a>
          </div>

          {collections.length > 0 ? (
            <>
              <div className="csl2-summary-grid">
                <div className="csl2-summary-card"><span>Collections tracked</span><strong>{collections.length}</strong></div>
                <div className="csl2-summary-card"><span>24h volume leader</span><strong>{volumeLeader?.name ?? "—"}</strong></div>
                <div className="csl2-summary-card"><span>Highest normal floor</span><strong>{verifiedFloorLeader ? `${fmt(verifiedFloorLeader.floor)} Ξ` : "—"}</strong><small className="mt-1 block text-[9px] font-semibold text-slate-400">Extreme outliers excluded</small></div>
                <div className="csl2-summary-card"><span>Refresh cadence</span><strong>~5 min</strong></div>
              </div>
              <NftCollectionExplorer collections={collections} />
            </>
          ) : (
            <div className="mt-6 rounded-[28px] border border-amber-200 bg-amber-50 p-7"><p className="text-lg font-black text-slate-950">Live OpenSea data could not be rendered.</p><p className="mt-2 text-sm leading-6 text-slate-600">The page is connected, but the collection response could not be converted into cards. CoinSparkLine will keep this state visible rather than pretending the feed is live.</p></div>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="csl2-product-panel mt-0"><p className="csl-kicker">How to use it</p><h2 className="mt-2 text-2xl font-extrabold">Research first. Marketplace second.</h2><p className="mt-3 text-sm leading-7 text-slate-500">Use CoinSparkLine to spot activity, compare floor and volume behaviour, then open the verified OpenSea collection page when you want to inspect the market itself.</p></div>
          <div className="csl2-product-panel mt-0"><p className="csl-kicker">Before you buy</p><div className="mt-4 space-y-3">{["Verify the collection and contract.", "Check liquidity, recent sales and holder concentration.", "Treat sudden volume spikes carefully.", "Never sign a transaction you do not understand."].map((item, index) => <div key={item} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-black text-blue-600">{index + 1}</span><p className="text-sm leading-6 text-slate-600">{item}</p></div>)}</div></div>
        </section>

        <p className="mt-7 text-center text-[10px] leading-5 text-slate-400">NFT market data is informational and can change rapidly. Outlier flags are heuristic and should be verified on the marketplace. CoinSparkLine does not recommend purchases.</p>
      </main>
      <Footer />
    </div>
  );
}
