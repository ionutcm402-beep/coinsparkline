import { DataFreshness, freshnessTone } from "@/lib/dataFreshness";

export default function DataFreshnessStrip({ freshness }: { freshness: DataFreshness }) {
  const tone = freshnessTone(freshness.state);
  return <div className="mx-auto mt-2 max-w-[1390px] px-3 sm:px-5">
    <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border ${tone.border} ${tone.bg} px-3 py-2`}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
        <strong className={`text-[10px] ${tone.text}`}>{freshness.label}</strong>
        <span className="text-[9px] text-slate-500">{freshness.detail}</span>
      </div>
      <span className="text-[8px] font-semibold uppercase tracking-[.1em] text-slate-400">Signal model freshness</span>
    </div>
  </div>;
}
