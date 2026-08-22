export type RegimeState = "calm" | "volatile";

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  category: string;
  price: number;
  change24hPct: number;
  regimeState: RegimeState;
  confidencePct: number;
  streakDays: number;
  medianDaysToFlip: number;
  logoUrl?: string;
  marketCap?: number | null;
  // Last ~30 days of regime states (0=calm, 1=volatile), for the mini
  // sparkline on each card. Represents the SIGNAL, not raw price, per design intent.
  recentStates?: number[];
}
