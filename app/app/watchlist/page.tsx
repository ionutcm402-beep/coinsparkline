import Header from "@/components/Header";
import WatchlistClient,{WatchlistItem} from "@/components/WatchlistClient";
import {getLatestScan} from "@/lib/blobStorage";
import {fetchTopCoins} from "@/lib/coingecko";
import {getSignalTier,TIER_CONFIG} from "@/lib/tiers";
import {getSparkScore} from "@/lib/sparkScore";

export const revalidate=300;

export default async function WatchlistPage() {
  const [snapshot,market]=await Promise.all([
    getLatestScan(),
    fetchTopCoins(200,process.env.COINGECKO_API_KEY).catch(()=>[]),
  ]);
  const signalMap=new Map((snapshot?.coins??[]).map(c=>[c.id,c] as const));
  const marketMap=new Map(market.map(c=>[c.id,c] as const));
  const ids=new Set<string>([...signalMap.keys(),...marketMap.keys()]);
  const items:WatchlistItem[]=Array.from(ids).map(id=>{
    const signal=signalMap.get(id),m=marketMap.get(id);
    const tier=signal?getSignalTier(signal):null;
    return {
      id,
      name:signal?.name||m?.name||id,
      symbol:signal?.symbol||m?.symbol?.toUpperCase()||id.slice(0,5).toUpperCase(),
      image:signal?.logoUrl||m?.image||"",
      price:signal?.price??m?.current_price??0,
      change24h:signal?.change24hPct??m?.price_change_percentage_24h??0,
      rank:signal?.marketCapRank??m?.market_cap_rank??null,
      regime:tier?TIER_CONFIG[tier].label:undefined,
      confidence:signal?.confidencePct,
      sparkScore:signal?getSparkScore(signal).score:undefined,
    };
  }).sort((a,b)=>(a.rank??999999)-(b.rank??999999));

  return (
    <div className="flex-1 bg-[#fbfcff]">
      <Header />
      <main className="mx-auto max-w-[1240px] px-5 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">Personal market</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Your watchlist.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Keep the coins you care about together, with current price, signal, SparkScore and alert access in one place.</p>
        </div>
        <WatchlistClient items={items}/>
      </main>
    </div>
  );
}
