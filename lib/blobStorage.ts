import { put, list } from "@vercel/blob";
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

export async function saveScanSnapshot(snapshot: ScanSnapshot): Promise<void> {
  // Preserve the snapshot that was live immediately before this refresh. This
  // gives the homepage a genuine previous-vs-current comparison instead of
  // trying to infer "today" changes from streak length alone.
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
  return readSnapshot(BLOB_PATHNAME);
}

export async function getPreviousScan(): Promise<ScanSnapshot | null> {
  return readSnapshot(PREVIOUS_BLOB_PATHNAME);
}
