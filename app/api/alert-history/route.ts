import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase server configuration missing" }, { status: 500 });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  const userId = userData.user?.id;
  if (userError || !userId) return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });

  const { data, error } = await supabase
    .from("alert_events")
    .select("id,coin_id,title,body,delivered_email,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, events: data ?? [] });
}
