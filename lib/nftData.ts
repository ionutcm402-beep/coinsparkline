import { unstable_cache } from "next/cache";

export type NftCollection = {
  id: string;
  name: string;
  slug: string | null;
  image: string | null;
  floor: number | null;
  volume24h: number | null;
  volume7d: number | null;
  sales24h: number | null;
  owners: number | null;
  tokenCount: number | null;
  chain: string;
  marketplaceUrl: string | null;
};

export type NftApiHealth = {
  configured: boolean;
  ok: boolean;
  status: number | null;
  endpoint: string | null;
  message: string;
  responseKeys: string[];
  rowCount: number;
};

const API = "https://api.opensea.io/api/v2";

function num(v: any) {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function first(...values: any[]) {
  return values.find((v) => v !== undefined && v !== null);
}

function mapCollection(c: any): NftCollection {
  const collection = c.collection || c.collection_data || c;
  const stats = c.stats || c.statistics || c.collection_stats || {};
  const total = stats.total || c.total || {};
  const oneDay =
    stats.intervals?.find?.((x: any) =>
      ["one_day", "1_day", "1d", "day", "ONE_DAY"].includes(String(x.interval || x.period || x.timeframe || ""))
    ) ||
    c.one_day ||
    c.oneDay ||
    c.one_day_stats ||
    {};
  const sevenDay =
    stats.intervals?.find?.((x: any) =>
      ["seven_days", "7_days", "7d", "SEVEN_DAYS"].includes(String(x.interval || x.period || x.timeframe || ""))
    ) ||
    c.seven_day ||
    c.sevenDay ||
    c.seven_day_stats ||
    {};

  const slug = String(first(collection.slug, c.slug, collection.collection, "") || "") || null;
  const chainRaw = String(
    first(collection.chain, c.chain, collection.contracts?.[0]?.chain, collection.contracts?.[0]?.chain_identifier, "ethereum") ||
      "ethereum"
  );

  return {
    id: String(first(slug, collection.id, collection.collection, c.id, collection.name, "unknown")),
    name: String(first(collection.name, c.name, slug, "Unknown collection")),
    slug,
    image: first(collection.image_url, collection.imageUrl, collection.image, c.image_url, c.imageUrl, c.image) || null,
    floor: num(
      first(
        c.floor_price,
        c.floorPrice,
        c.floor?.price,
        c.floor?.value,
        stats.floor_price,
        total.floor_price,
        total.floorPrice,
        oneDay.floor_price,
        oneDay.floorPrice
      )
    ),
    volume24h: num(
      first(
        c.one_day_volume,
        c.volume_1d,
        c.volume24h,
        c.volume?.one_day,
        c.volume?.oneDay,
        oneDay.volume,
        oneDay.total_volume
      )
    ),
    volume7d: num(
      first(
        c.seven_day_volume,
        c.volume_7d,
        c.volume7d,
        c.volume?.seven_days,
        c.volume?.sevenDays,
        sevenDay.volume,
        sevenDay.total_volume
      )
    ),
    sales24h: num(
      first(c.one_day_sales, c.sales_1d, c.sales24h, c.sales?.one_day, oneDay.sales, oneDay.sales_count)
    ),
    owners: num(first(c.num_owners, c.owner_count, c.owners, stats.num_owners, total.num_owners, total.numOwners)),
    tokenCount: num(first(collection.total_supply, collection.totalSupply, c.total_supply, c.token_count, c.tokenCount)),
    chain: chainRaw.charAt(0).toUpperCase() + chainRaw.slice(1),
    marketplaceUrl: slug ? `https://opensea.io/collection/${slug}` : null,
  };
}

async function request(path: string) {
  const key = process.env.OPENSEA_API_KEY;
  if (!key) return { ok: false, status: null, data: null as any, message: "OPENSEA_API_KEY is not configured." };

  try {
    const r = await fetch(`${API}${path}`, {
      headers: { "X-API-KEY": key, accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    const text = await r.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    if (!r.ok) {
      const apiMessage = data?.detail || data?.message || data?.error || text.slice(0, 160) || `HTTP ${r.status}`;
      return { ok: false, status: r.status, data, message: `OpenSea ${r.status}: ${String(apiMessage)}` };
    }
    return { ok: true, status: r.status, data, message: "Connected to OpenSea." };
  } catch (error) {
    return { ok: false, status: null, data: null, message: error instanceof Error ? error.message : "OpenSea request failed." };
  }
}

function rows(d: any) {
  if (!d) return [];
  for (const key of [
    "collections",
    "collection_rankings",
    "rankings",
    "results",
    "data",
    "items",
  ]) {
    if (Array.isArray(d[key])) return d[key];
  }
  if (Array.isArray(d)) return d;
  return [];
}

async function load() {
  if (!process.env.OPENSEA_API_KEY) return [];
  const attempts = [
    "/collections/trending?limit=30",
    "/collections/trending?limit=30&timeframe=ONE_DAY",
    "/collections/top?limit=30",
  ];

  for (const path of attempts) {
    const result = await request(path);
    if (!result.ok) continue;
    const mapped = rows(result.data)
      .map(mapCollection)
      .filter((c: NftCollection) => c.slug && c.name);
    if (mapped.length) return mapped;
  }
  return [];
}

export async function getNftApiHealth(): Promise<NftApiHealth> {
  const configured = Boolean(process.env.OPENSEA_API_KEY);
  if (!configured) {
    return {
      configured: false,
      ok: false,
      status: null,
      endpoint: null,
      message: "OPENSEA_API_KEY is not configured in this deployment.",
      responseKeys: [],
      rowCount: 0,
    };
  }

  const endpoints = ["/collections/trending?limit=5", "/collections/top?limit=5"];
  let last: NftApiHealth = {
    configured: true,
    ok: false,
    status: null,
    endpoint: null,
    message: "No OpenSea endpoint returned usable data.",
    responseKeys: [],
    rowCount: 0,
  };

  for (const endpoint of endpoints) {
    const result = await request(endpoint);
    const responseKeys = result.data && typeof result.data === "object" ? Object.keys(result.data) : [];
    const rowCount = rows(result.data).length;
    last = {
      configured: true,
      ok: result.ok && rowCount > 0,
      status: result.status,
      endpoint,
      message: result.ok
        ? rowCount > 0
          ? "OpenSea returned collection data."
          : "OpenSea responded successfully, but the response shape contained no recognized collection rows."
        : result.message,
      responseKeys,
      rowCount,
    };
    if (last.ok) return last;
  }

  return last;
}

export const getNftCollections = unstable_cache(load, ["nft-opensea-top-v2"], {
  revalidate: 300,
  tags: ["nft-market"],
});
