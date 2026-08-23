import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomeClient from "@/components/HomeClient";
import ChangeSummary from "@/components/ChangeSummary";
import Footer from "@/components/Footer";
import DataFreshnessStrip from "@/components/DataFreshnessStrip";
import { getLatestScan, getPreviousScan } from "@/lib/blobStorage";
import { mockCoins, categories } from "@/lib/mockData";
import { formatRelativeTime } from "@/lib/relativeTime";
import { getDataFreshness } from "@/lib/dataFreshness";
import { fetchTopCoins } from "@/lib/coingecko";

export const revalidate = 300;

export default async function Home() {
  const [snapshot, previousSnapshot] = await Promise.all([getLatestScan(), getPreviousScan()]);
  const coins = snapshot && snapshot.coins.length > 0 ? snapshot.coins : mockCoins;
  const freshness = getDataFreshness(snapshot?.scannedAt);
  let marketCoins = [] as Awaited<ReturnType<typeof fetchTopCoins>>;
  try { marketCoins = await fetchTopCoins(200, process.env.COINGECKO_API_KEY); } catch { marketCoins = []; }
  const relative = snapshot ? formatRelativeTime(snapshot.scannedAt) : undefined;
  const statusLabel = relative ? `${freshness.label} · ${relative}` : freshness.label;
  return <div className="flex-1">
    <Header/>
    <Hero coins={coins}/>
    <DataFreshnessStrip freshness={freshness}/>
    <ChangeSummary coins={coins} previousCoins={previousSnapshot?.coins ?? []} previousScannedAt={previousSnapshot?.scannedAt}/>
    <div className="home-client-wrap"><HomeClient coins={coins} previousCoins={previousSnapshot?.coins ?? []} previousScannedAt={previousSnapshot?.scannedAt} marketCoins={marketCoins} categories={categories} updatedLabel={statusLabel}/></div>
    <style>{`.home-client-wrap > main > section:nth-of-type(3){display:none}`}</style>
    <Footer/>
  </div>;
}
