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
  logoUrl?: string;
}
