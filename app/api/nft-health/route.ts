import { NextResponse } from "next/server";
import { getNftApiHealth } from "@/lib/nftData";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getNftApiHealth();
  return NextResponse.json(health, {
    status: health.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
