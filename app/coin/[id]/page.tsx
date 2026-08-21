import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { getLatestScan } from "@/lib/blobStorage";
import { mockCoins } from "@/lib/mockData";

export const revalidate = 300;

export default async function CoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const snapshot = await getLatestScan();
  const coins = snapshot && snapshot.coins.length > 0 ? snapshot.coins : mockCoins;
  const coin = coins.find((c) => c.id === id);

  if (!coin) {
    notFound();
  }

  const isCalm = coin.regimeState === "calm";

  return (
    <div className="flex-1 bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          &larr; Back to all coins
        </Link>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {coin.name} ({coin.symbol})
              </h1>
              <p className="text-sm text-gray-400">{coin.category}</p>
            </div>
            <div
              className={
                isCalm
                  ? "rounded-lg bg-green-50 px-4 py-2 text-center text-sm font-medium text-green-700"
                  : "rounded-lg bg-red-50 px-4 py-2 text-center text-sm font-medium text-red-700"
              }
            >
              {isCalm ? "Calm" : "Volatile"}
              <div className="text-xs font-normal">{coin.streakDays} day streak</div>
            </div>
          </div>

          <p className="mt-4 text-2xl font-semibold text-gray-900">
            ${coin.price.toLocaleString()}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 text-sm">
            <div>
              <p className="text-gray-400">Confidence</p>
              <p className="font-medium text-gray-900">{coin.confidencePct}%</p>
            </div>
            <div>
              <p className="text-gray-400">24h change</p>
              <p className={coin.change24hPct >= 0 ? "font-medium text-green-600" : "font-medium text-red-600"}>
                {coin.change24hPct >= 0 ? "+" : ""}
                {coin.change24hPct.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-gray-400">Median days to flip</p>
              <p className="font-medium text-gray-900">{coin.medianDaysToFlip}</p>
            </div>
          </div>

          {!snapshot && (
            <p className="mt-6 text-sm text-gray-400">
              This is placeholder data. Live data (chart, tokenomics, news, videos) appears
              after the first daily scan runs, and the full profile page is coming in Step 3.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
