export type DataFreshnessState = "fresh" | "aging" | "delayed" | "stale" | "demo";

export interface DataFreshness {
  state: DataFreshnessState;
  label: string;
  detail: string;
  ageMinutes: number | null;
  isUsable: boolean;
}

export function getDataFreshness(scannedAt?: string | null, now = Date.now()): DataFreshness {
  if (!scannedAt) {
    return { state: "demo", label: "Demo data", detail: "No successful live signal scan is available yet.", ageMinutes: null, isUsable: false };
  }

  const timestamp = new Date(scannedAt).getTime();
  if (!Number.isFinite(timestamp)) {
    return { state: "stale", label: "Signal time unknown", detail: "The latest signal timestamp could not be verified.", ageMinutes: null, isUsable: false };
  }

  const ageMinutes = Math.max(0, Math.floor((now - timestamp) / 60_000));
  const ageHours = ageMinutes / 60;
  const ageText = ageMinutes < 60 ? `${ageMinutes}m ago` : `${Math.floor(ageHours)}h ago`;

  // Phase 1 target cadence is every 6 hours. These thresholds deliberately
  // distinguish healthy data from a missed refresh instead of calling old data "live".
  if (ageHours < 8) return { state: "fresh", label: "Signals fresh", detail: `Updated ${ageText}`, ageMinutes, isUsable: true };
  if (ageHours < 16) return { state: "aging", label: "Signals aging", detail: `Updated ${ageText} · refresh may be late`, ageMinutes, isUsable: true };
  if (ageHours < 30) return { state: "delayed", label: "Signals delayed", detail: `Updated ${ageText} · use with caution`, ageMinutes, isUsable: true };
  return { state: "stale", label: "Signals stale", detail: `Updated ${ageText} · waiting for a successful refresh`, ageMinutes, isUsable: false };
}

export function freshnessTone(state: DataFreshnessState) {
  if (state === "fresh") return { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50/80", border: "border-emerald-100" };
  if (state === "aging") return { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50/80", border: "border-amber-100" };
  if (state === "delayed") return { dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50/80", border: "border-orange-100" };
  return { dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50/80", border: "border-rose-100" };
}
