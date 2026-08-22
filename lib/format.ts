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
