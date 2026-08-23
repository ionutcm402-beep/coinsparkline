import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomeClient from "@/components/HomeClient";
import { getLatestScan } from "@/lib/blobStorage";
import { mockCoins, categories } from "@/lib/mockData";
import { formatRelativeTime } from "@/lib/relativeTime";

// Revalidate this page's cache every 5 minutes. Cheap to do even though the
// underlying data only truly changes once a day (the cron schedule) --
// this just controls how quickly a fresh cron run becomes visible to visitors.
export const revalidate = 300;

export default async function Home() {
  const snapshot = await getLatestScan();
  const coins = snapshot && snapshot.coins.length > 0 ? snapshot.coins : mockCoins;
  const isLiveData = Boolean(snapshot);

  return (
    <div className="flex-1">
      <Header />
      <Hero coins={coins} />

      <HomeClient
        coins={coins}
        categories={categories}
        updatedLabel={isLiveData ? formatRelativeTime(snapshot!.scannedAt) : undefined}
      />
    </div>
  );
}
