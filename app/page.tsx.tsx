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
    <div className="flex-1 bg-gray-50">
      <Header />
      <Hero />

      <div className="mx-auto max-w-6xl px-6">
        {isLiveData ? (
          <p className="mb-4 flex items-center gap-1.5 text-xs text-gray-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            Updated {formatRelativeTime(snapshot!.scannedAt)}
          </p>
        ) : (
          <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
            Showing placeholder data. Live data appears after the first daily scan runs.
          </p>
        )}
      </div>

      <HomeClient coins={coins} categories={categories} />
    </div>
  );
}
