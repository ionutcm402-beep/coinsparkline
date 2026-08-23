import Header from "@/components/Header";
import WatchlistClient, { WatchlistItem } from "@/components/WatchlistClient";
import { getLatestScan } from "@/lib/blobStorage";
import { fetchTopCoins } from "@/lib/coingecko";
import { getSignalTier, TIER_CONFIG } from "@/lib/tiers";

export const revalidate = 300;

export default async function WatchlistPage() {
  const snapshot = await getLatestScan();
  const tracked = snapshot?.coins ?? [];
  let market = [] as Awaited<ReturnType<typeof fetchTopCoins>>;
  try { market = await fetchTopCoins(200, process.env.COINGECKO_API_KEY); } catch { market = []; }

  const trackedIds = new Set(tracked.map(c => c.id));
  const items: WatchlistItem[] = [
    ...tracked.map(c => {
      const tier = getSignalTier(c);
      return { id:c.id, name:c.name, symbol:c.symbol.toUpperCase(), image:c.logoUrl||"", price:c.price, change24h:c.change24hPct, rank:null, regime:TIER_CONFIG[tier].label, confidence:c.confidencePct };
    }),
    ...market.filter(c => !trackedIds.has(c.id)).map(c => ({ id:c.id, name:c.name, symbol:c.symbol.toUpperCase(), image:c.image, price:c.current_price, change24h:c.price_change_percentage_24h??0, rank:c.market_cap_rank }))
  ];

  return <div className="min-h-screen bg-[#fbfcff] text-slate-950"><Header/><main className="mx-auto max-w-[1100px] px-4 pb-16 pt-10 sm:px-6"><div className="mx-auto max-w-2xl text-center"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-500">Your market</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Watchlist</h1><p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-slate-500">Keep the coins you care about in one place. Stars are stored locally on this device and can be changed anytime.</p></div><WatchlistClient items={items}/></main></div>;
}
