import Link from "next/link";
import Header from "@/components/Header";

export default function WatchlistPage() {
  return (
    <div className="flex-1 bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900">Watchlist</h1>
        <p className="mt-4 text-sm text-gray-600">
          Saved coin watchlists are coming in a future update. For now, you can browse and check
          any coin&apos;s regime status from the homepage.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-gray-300"
        >
          ← Back to all coins
        </Link>
      </main>
    </div>
  );
}
