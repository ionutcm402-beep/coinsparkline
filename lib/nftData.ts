export type NftCollection = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  floor: number | null;
  volume24h: number | null;
  volume7d: number | null;
  sales24h: number | null;
  owners: number | null;
  tokenCount: number | null;
  chain: string;
  marketplaceUrl: string;
};

const API = "https://api.opensea.io/api/v2";

function numberOrNull(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function firstDefined<T>(...values: T[]): T | undefined {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function slugFromRankingRow(row: any): string | null {
  if (typeof row?.collection === "string") return row.collection;
  return (
    firstDefined(
      row?.collection?.slug,
      row?.slug,
      row?.collection_slug,
      row?.collectionSlug,
      row?.id,
    ) || null
  );
}

async function openSea(path: string): Promise<any> {
  const key = process.env.OPENSEA_API_KEY;
  if (!key) throw new Error("OPENSEA_API_KEY is not configured");

  const response = await fetch(`${API}${path}`, {
    headers: {
      accept: "application/json",
      "x-api-key": key,
    },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`OpenSea request failed (${response.status}) for ${path}`);
  }

  return response.json();
}

function rankingRows(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.collections)) return payload.collections;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function interval(stats: any, label: string): any {
  const intervals = Array.isArray(stats?.intervals) ? stats.intervals : [];
  const target = label.toLowerCase();
  return (
    intervals.find((item: any) =>
      String(item?.interval ?? item?.period ?? item?.timeframe ?? "")
        .toLowerCase()
        .includes(target),
    ) || {}
  );
}

async function enrichCollection(row: any): Promise<NftCollection | null> {
  const slug = slugFromRankingRow(row);
  if (!slug) return null;

  const [detailsResult, statsResult] = await Promise.allSettled([
    openSea(`/collections/${encodeURIComponent(slug)}`),
    openSea(`/collections/${encodeURIComponent(slug)}/stats`),
  ]);

  const details = detailsResult.status === "fulfilled" ? detailsResult.value : {};
  const stats = statsResult.status === "fulfilled" ? statsResult.value : {};
  const collection = details?.collection ?? details ?? {};
  const total = stats?.total ?? stats?.stats?.total ?? {};
  const oneDay =
    stats?.intervals?.find?.((x: any) =>
      ["one_day", "1d", "day", "one day"].includes(
        String(x?.interval ?? x?.period ?? x?.timeframe ?? "").toLowerCase(),
      ),
    ) ?? interval(stats, "day");
  const sevenDay =
    stats?.intervals?.find?.((x: any) =>
      ["seven_day", "7d", "seven days", "week"].includes(
        String(x?.interval ?? x?.period ?? x?.timeframe ?? "").toLowerCase(),
      ),
    ) ?? interval(stats, "7");

  const rowStats = row?.stats ?? row?.statistics ?? {};
  const rowTotal = rowStats?.total ?? {};
  const rowOneDay = rowStats?.one_day ?? rowStats?.oneDay ?? row?.one_day ?? {};
  const rowSevenDay = rowStats?.seven_day ?? rowStats?.sevenDay ?? row?.seven_day ?? {};

  const chainRaw = String(
    firstDefined(
      collection?.contracts?.[0]?.chain,
      collection?.chain,
      row?.chain,
      row?.collection?.chain,
      "ethereum",
    ),
  );

  const name = String(
    firstDefined(
      collection?.name,
      row?.collection?.name,
      row?.name,
      slug
        .split("-")
        .filter(Boolean)
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    ),
  );

  return {
    id: slug,
    slug,
    name,
    image:
      firstDefined(
        collection?.image_url,
        collection?.imageUrl,
        collection?.image,
        row?.collection?.image_url,
        row?.collection?.image,
        row?.image_url,
        row?.image,
      ) || null,
    floor: numberOrNull(
      firstDefined(
        total?.floor_price,
        total?.floorPrice,
        stats?.floor_price,
        stats?.floorPrice,
        rowTotal?.floor_price,
        rowTotal?.floorPrice,
        row?.floor_price,
        row?.floorPrice,
      ),
    ),
    volume24h: numberOrNull(
      firstDefined(
        oneDay?.volume,
        oneDay?.total_volume,
        oneDay?.volume_eth,
        rowOneDay?.volume,
        row?.one_day_volume,
        row?.volume_1d,
        row?.volume24h,
      ),
    ),
    volume7d: numberOrNull(
      firstDefined(
        sevenDay?.volume,
        sevenDay?.total_volume,
        rowSevenDay?.volume,
        row?.seven_day_volume,
        row?.volume_7d,
        row?.volume7d,
      ),
    ),
    sales24h: numberOrNull(
      firstDefined(
        oneDay?.sales,
        oneDay?.sales_count,
        rowOneDay?.sales,
        row?.one_day_sales,
        row?.sales_1d,
        row?.sales24h,
      ),
    ),
    owners: numberOrNull(
      firstDefined(
        total?.num_owners,
        total?.numOwners,
        total?.owners,
        rowTotal?.num_owners,
        row?.num_owners,
        row?.owner_count,
      ),
    ),
    tokenCount: numberOrNull(
      firstDefined(
        collection?.total_supply,
        collection?.totalSupply,
        collection?.nfts_count,
        row?.total_supply,
        row?.token_count,
      ),
    ),
    chain: chainRaw.charAt(0).toUpperCase() + chainRaw.slice(1),
    marketplaceUrl: `https://opensea.io/collection/${encodeURIComponent(slug)}`,
  };
}

export async function getNftCollections(): Promise<NftCollection[]> {
  if (!process.env.OPENSEA_API_KEY) return [];

  let seedRows: any[] = [];
  const sources = [
    "/collections/trending?limit=12&timeframe=one_day",
    "/collections/top?limit=12",
  ];

  for (const path of sources) {
    try {
      const payload = await openSea(path);
      seedRows = rankingRows(payload);
      if (seedRows.length > 0) break;
    } catch {
      // Try the next OpenSea ranking endpoint.
    }
  }

  if (seedRows.length === 0) return [];

  const enriched = await Promise.all(
    seedRows.slice(0, 12).map((row) => enrichCollection(row)),
  );

  return enriched.filter((item): item is NftCollection => Boolean(item));
}

export async function getNftApiHealth() {
  const configured = Boolean(process.env.OPENSEA_API_KEY);
  if (!configured) {
    return { configured: false, ok: false, status: 503, message: "OPENSEA_API_KEY is not configured." };
  }

  const endpoint = "/collections/trending?limit=5&timeframe=one_day";
  try {
    const payload = await openSea(endpoint);
    const rows = rankingRows(payload);
    return {
      configured: true,
      ok: rows.length > 0,
      status: 200,
      endpoint,
      message: rows.length > 0 ? "OpenSea returned collection data." : "OpenSea responded but returned no collection rows.",
      responseKeys: payload && typeof payload === "object" ? Object.keys(payload) : [],
      rowCount: rows.length,
    };
  } catch (error) {
    return {
      configured: true,
      ok: false,
      status: 503,
      endpoint,
      message: error instanceof Error ? error.message : "OpenSea request failed.",
    };
  }
}
