import { Coin } from "@/types/coin";

// Fallback data, used only when no cached scan exists yet (e.g. before the
// first daily cron run has ever fired). Once real data is cached, this is
// never shown to a real visitor.
export const mockCoins: Coin[] = [
  {
    id: "bitcoin", symbol: "BTC", name: "Bitcoin", category: "Layer 1",
    price: 73616.0, change24hPct: 4.9, regimeState: "calm",
    confidencePct: 88.3, streakDays: 183, medianDaysToFlip: 27.6,
  },
  {
    id: "ethereum", symbol: "ETH", name: "Ethereum", category: "Layer 1",
    price: 2251.73, change24hPct: 18.5, regimeState: "volatile",
    confidencePct: 99.8, streakDays: 1, medianDaysToFlip: 17.5,
  },
  {
    id: "solana", symbol: "SOL", name: "Solana", category: "Layer 1",
    price: 85.33, change24hPct: 7.8, regimeState: "calm",
    confidencePct: 99.4, streakDays: 185, medianDaysToFlip: 64.8,
  },
  {
    id: "sui", symbol: "SUI", name: "Sui", category: "Layer 1",
    price: 0.706, change24hPct: 2.1, regimeState: "calm",
    confidencePct: 99.1, streakDays: 90, medianDaysToFlip: 20.4,
  },
  {
    id: "chainlink", symbol: "LINK", name: "Chainlink", category: "DeFi",
    price: 10.74, change24hPct: 0.4, regimeState: "calm",
    confidencePct: 94.7, streakDays: 67, medianDaysToFlip: 28.5,
  },
  {
    id: "dogecoin", symbol: "DOGE", name: "Dogecoin", category: "Meme",
    price: 0.184, change24hPct: 3.1, regimeState: "calm",
    confidencePct: 91.2, streakDays: 22, medianDaysToFlip: 33.2,
  },
];

export const categories = ["All coins", "Layer 1", "DeFi", "Meme", "Stablecoins"];
