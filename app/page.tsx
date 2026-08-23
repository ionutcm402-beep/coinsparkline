import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomeClient from "@/components/HomeClient";
import { getLatestScan } from "@/lib/blobStorage";
import { mockCoins, categories } from "@/lib/mockData";
import { formatRelativeTime } from "@/lib/relativeTime";
import { fetchTopCoins } from "@/lib/coingecko";

export const revalidate = 300;

export default async function Home() {
  const snapshot = await getLatestScan();
  const coins = snapshot && snapshot.coins.length > 0 ? snapshot.coins : mockCoins;
  const isLiveData = Boolean(snapshot);

  let marketCoins = [] as Awaited<ReturnType<typeof fetchTopCoins>>;
  try {
    marketCoins = await fetchTopCoins(200, process.env.COINGECKO_API_KEY);
  } catch {
    marketCoins = [];
  }

  return (
    <div className="flex-1">
      <Header />
      <Hero coins={coins} />
      <HomeClient
        coins={coins}
        marketCoins={marketCoins}
        categories={categories}
        updatedLabel={isLiveData ? formatRelativeTime(snapshot!.scannedAt) : undefined}
      />
    </div>
  );
}
