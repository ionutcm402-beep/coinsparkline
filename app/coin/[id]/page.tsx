import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { mockCoins } from "@/lib/mockData";

export default async function CoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coin = mockCoins.find((c) => c.id === id);

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

          <p className="mt-6 text-sm text-gray-400">
            Full profile page (chart, tokenomics, news, videos) coming in Step 3 of the
            build. This is placeholder data, not live.
          </p>
        </div>
      </main>
    </div>
  );
}
