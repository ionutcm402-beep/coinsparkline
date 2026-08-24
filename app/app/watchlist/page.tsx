import { permanentRedirect } from "next/navigation";

export default function LegacyWatchlistRoute() {
  permanentRedirect("/watchlist");
}
