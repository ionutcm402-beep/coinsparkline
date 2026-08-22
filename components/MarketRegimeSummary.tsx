import { Coin } from "@/types/coin";
import { getSignalTier, TIER_CONFIG, SignalTier } from "@/lib/tiers";

export default function MarketRegimeSummary({ coins }: { coins: Coin[] }) {
  const counts: Record<SignalTier, number> = { calm: 0, building: 0, awakening: 0, volatile: 0 };
  for (const coin of coins) {
    counts[getSignalTier(coin)]++;
  }

  const tiers: SignalTier[] = ["calm", "building", "awakening", "volatile"];
  const dominant = tiers.reduce((a, b) => (counts[b] > counts[a] ? b : a));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="mb-2 text-xs font-medium tracking-wide text-gray-400 uppercase">Market regime</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {tiers.map((tier) => (
          <div key={tier} className="flex items-center gap-1.5 text-sm">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: TIER_CONFIG[tier].dot }}
            />
            <span className="font-medium text-gray-900">{counts[tier]}</span>
            <span className="text-gray-500">{TIER_CONFIG[tier].label}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Market currently: <span className="font-medium text-gray-900">{TIER_CONFIG[dominant].label}</span>
      </p>
    </div>
  );
}
