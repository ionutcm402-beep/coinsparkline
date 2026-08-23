// Port of the CATEGORY_COINS mapping from the Python dashboard. Best-effort,
// hand-curated classification -- coins not in any list fall through to "Other".

export const CATEGORY_COINS: Record<string, Set<string>> = {
  Stablecoins: new Set([
    "tether", "usd-coin", "usds", "dai", "binance-usd", "true-usd", "frax",
    "usdd", "gemini-dollar", "paypal-usd", "first-digital-usd", "usde",
    "ethena-usde", "usdb", "fdusd", "pyusd", "tusd", "usdp", "susds", "usd1",
  ]),
  "Meme coins": new Set([
    "dogecoin", "shiba-inu", "pepe", "floki", "bonk", "dogwifcoin",
    "brett-based", "mog-coin", "book-of-meme", "turbo", "memecoin",
  ]),
  "Layer 1": new Set([
    "bitcoin", "ethereum", "solana", "cardano", "avalanche-2", "polkadot",
    "near", "aptos", "sui", "cosmos", "algorand", "internet-computer",
    "tron", "binancecoin", "litecoin",
  ]),
  DeFi: new Set([
    "uniswap", "aave", "compound-governance-token", "curve-dao-token",
    "maker", "lido-dao", "pancakeswap-token", "sushi", "1inch",
    "havven", "yearn-finance",
  ]),
  "Exchange tokens": new Set([
    "binancecoin", "okb", "leo-token", "kucoin-shares", "gate-token",
    "huobi-token", "bitget-token",
  ]),
};

export function coinCategory(coinId: string): string {
  for (const [category, ids] of Object.entries(CATEGORY_COINS)) {
    if (ids.has(coinId)) return category;
  }
  return "Other";
}

// Discovery signals focus on assets capable of meaningful price movement.
// This uses the central category mapping, so it applies to every discovery
// ranking rather than hiding only the current UI results.
export function isStablecoin(coinId: string): boolean {
  return CATEGORY_COINS.Stablecoins.has(coinId);
}
