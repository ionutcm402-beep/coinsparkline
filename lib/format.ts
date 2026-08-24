// Abbreviates large numbers (1.45T, 282.00B, 44.90M) so they fit cleanly
// in a stat box instead of overflowing with raw comma-separated digits.
export function formatCompactNumber(value: number | null | undefined, prefix = ""): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const abs = Math.abs(value);
  const thresholds: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [threshold, suffix] of thresholds) {
    if (abs >= threshold) {
      return `${prefix}${(value / threshold).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`;
    }
  }
  return `${prefix}${value.toLocaleString()}`;
}

// Scheduled market scans use 365 days by default. HMM transition probabilities
// can approach 1.0 when no meaningful flip is observed, which mathematically
// produces enormous extrapolations (for example ~693,000 days). Those values
// are outside the observed horizon and should not be presented as precise time estimates.
export function formatFlipTime(days: number | null | undefined, horizonDays = 365): string {
  if (days === null || days === undefined || !Number.isFinite(days) || days <= 0) return "—";
  if (days > horizonDays) return `>${horizonDays}d (beyond horizon)`;
  return `${days.toFixed(1)}d`;
}
