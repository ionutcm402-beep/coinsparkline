"use client";

import { useCurrency } from "@/components/CurrencyProvider";

export default function CurrencyAmount({
  usd,
  compact = false,
  className,
}: {
  usd: number | null | undefined;
  compact?: boolean;
  className?: string;
}) {
  const { currency, convert } = useCurrency();

  if (usd === null || usd === undefined || Number.isNaN(usd)) return <span className={className}>—</span>;

  const value = convert(usd);
  const absolute = Math.abs(value);
  const maximumFractionDigits = compact ? (absolute >= 1_000_000 ? 2 : absolute >= 1 ? 2 : 4) : absolute >= 1 ? 2 : 4;

  return (
    <span className={className}>
      {new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        notation: compact && absolute >= 1_000 ? "compact" : "standard",
        maximumFractionDigits,
        minimumFractionDigits: compact ? 0 : maximumFractionDigits,
      }).format(value)}
    </span>
  );
}
