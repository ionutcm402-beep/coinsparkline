import { Coin } from "@/types/coin";

// Four-tier signal system, derived entirely from the real 2-state HMM's
// confidence score -- not a separate model. High-confidence calm/volatile
// keep their plain names; lower-confidence (closer to the 50/50 boundary,
// meaning the model is less sure) get the "Building"/"Awakening" label to
// convey "leaning this way, but less certain" -- an honest reframing of
// real continuous data into a more expressive 4-tier UI.
export type SignalTier = "calm" | "building" | "awakening" | "volatile";

export const TIER_CONFIG: Record<SignalTier, { label: string; bg: string; text: string; dot: string }> = {
  calm: { label: "Calm", bg: "bg-green-50", text: "text-green-700", dot: "#2f9e44" },
  building: { label: "Building", bg: "bg-yellow-50", text: "text-yellow-700", dot: "#f5b400" },
  awakening: { label: "Awakening", bg: "bg-orange-50", text: "text-orange-700", dot: "#e8590c" },
  volatile: { label: "Volatile", bg: "bg-red-50", text: "text-red-700", dot: "#d6336c" },
};

const CONFIDENCE_THRESHOLD = 80; // above this = "confident", below = "building/awakening"

export function getSignalTier(coin: Coin): SignalTier {
  const confident = coin.confidencePct >= CONFIDENCE_THRESHOLD;
  if (coin.regimeState === "calm") return confident ? "calm" : "building";
  return confident ? "volatile" : "awakening";
}
