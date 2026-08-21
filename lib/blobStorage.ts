import { put, list } from "@vercel/blob";
import { Coin } from "@/types/coin";

const BLOB_PATHNAME = "latest-scan.json";
// Using a custom prefix ("PUBLICBLOB") on the Vercel Blob connection since
// this project already had a private store using the default "BLOB" prefix.
// @vercel/blob's put()/list() don't auto-detect a custom-prefixed token, so
// it has to be passed explicitly here.
const BLOB_TOKEN = process.env.PUBLICBLOB_READ_WRITE_TOKEN;

export interface ScanSnapshot {
  coins: Coin[];
  scannedAt: string; // ISO timestamp
}

export async function saveScanSnapshot(snapshot: ScanSnapshot): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(snapshot), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: BLOB_TOKEN,
  });
}

// Reads the latest cached scan. Returns null if no scan has ever run yet
// (e.g. before the first cron trigger) or if the fetch fails for any
// reason -- callers should fall back to placeholder data rather than crash.
export async function getLatestScan(): Promise<ScanSnapshot | null> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1, token: BLOB_TOKEN });
    if (blobs.length === 0) return null;
    const resp = await fetch(blobs[0].url, { cache: "no-store" });
    if (!resp.ok) return null;
    return (await resp.json()) as ScanSnapshot;
  } catch {
    return null;
  }
}
