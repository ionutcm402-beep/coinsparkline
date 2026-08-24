import { put, list } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import { Coin } from "@/types/coin";

const BLOB_PATHNAME = "latest-scan.json";
const PREVIOUS_BLOB_PATHNAME = "previous-scan.json";
const BLOB_TOKEN = process.env.PUBLICBLOB_READ_WRITE_TOKEN;

export interface ScanSnapshot {
  coins: Coin[];
  scannedAt: string;
}

async function readSnapshot(pathname: string): Promise<ScanSnapshot | null> {
  try {
    const { blobs } = await list({ prefix: pathname, limit: 1, token: BLOB_TOKEN });
    if (blobs.length === 0) return null;
    const exact = blobs.find((blob) => blob.pathname === pathname) ?? blobs[0];
    const resp = await fetch(exact.url, { cache: "no-store" });
    if (!resp.ok) return null;
    return (await resp.json()) as ScanSnapshot;
  } catch {
    return null;
  }
}

const readLatestCached = unstable_cache(
  () => readSnapshot(BLOB_PATHNAME),
  ["latest-scan-snapshot"],
  { revalidate: 60, tags: ["scan-snapshot"] }
);

const readPreviousCached = unstable_cache(
  () => readSnapshot(PREVIOUS_BLOB_PATHNAME),
  ["previous-scan-snapshot"],
  { revalidate: 60, tags: ["scan-snapshot"] }
);

export async function saveScanSnapshot(snapshot: ScanSnapshot): Promise<void> {
  // Writes must always read the live blob rather than the cached public snapshot,
  // otherwise a refresh could preserve stale data as the "previous" snapshot.
  const current = await readSnapshot(BLOB_PATHNAME);
  if (current?.coins?.length) {
    await put(PREVIOUS_BLOB_PATHNAME, JSON.stringify(current), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token: BLOB_TOKEN,
    });
  }

  await put(BLOB_PATHNAME, JSON.stringify(snapshot), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: BLOB_TOKEN,
  });
}

export async function getLatestScan(): Promise<ScanSnapshot | null> {
  return readLatestCached();
}

export async function getPreviousScan(): Promise<ScanSnapshot | null> {
  return readPreviousCached();
}

export async function getLatestScanFresh(): Promise<ScanSnapshot | null> {
  return readSnapshot(BLOB_PATHNAME);
}
