import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return apiError("Not signed in", 401, "AUTH_REQUIRED");

  const supabase = getSupabaseAdminClient();
  if (!supabase) return apiError("Supabase server configuration missing", 503, "SERVICE_UNAVAILABLE");

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  const userId = userData.user?.id;
  if (userError || !userId) return apiError("Invalid session", 401, "INVALID_SESSION");

  const { data, error } = await supabase
    .from("alert_events")
    .select("id,coin_id,title,body,delivered_email,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return apiError("Alert history is temporarily unavailable", 503, "ALERT_HISTORY_UNAVAILABLE");
  return apiSuccess({ events: data ?? [] });
}
