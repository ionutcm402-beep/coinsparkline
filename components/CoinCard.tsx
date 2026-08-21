import Link from "next/link";
import { Coin } from "@/types/coin";

function formatPrice(price: number): string {
  const decimals = price >= 1 ? 2 : 4;
  return price.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function CoinCard({ coin }: { coin: Coin }) {
  const isCalm = coin.regimeState === "calm";
  const changeIsPositive = coin.change24hPct >= 0;

  return (
    <Link
      href={`/coin/${coin.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
    >
      <div className="mb-2.5 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[11px] font-medium text-blue-700">
          {coin.symbol.slice(0, 3)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{coin.name}</p>
          <p className="text-xs text-gray-400">{coin.category}</p>
        </div>
      </div>

      <p className="text-lg font-semibold text-gray-900">${formatPrice(coin.price)}</p>
      <p className={`mb-2.5 text-xs ${changeIsPositive ? "text-green-600" : "text-red-600"}`}>
        {changeIsPositive ? "+" : ""}
        {coin.change24hPct.toFixed(2)}% 24h
      </p>

      <div
        className={
          isCalm
            ? "rounded-md bg-green-50 py-1.5 text-center text-xs font-medium text-green-700"
            : "rounded-md bg-red-50 py-1.5 text-center text-xs font-medium text-red-700"
        }
      >
        {isCalm ? "Calm" : "Volatile"}
      </div>
    </Link>
  );
}
