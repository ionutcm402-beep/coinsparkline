import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

const ALERT_TEST_WINDOW_MS = 10 * 60 * 1000;
const ALERT_TEST_LIMIT = 3;

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return apiError("Not signed in", 401, "AUTH_REQUIRED");

  const supabase = getSupabaseAdminClient();
  if (!supabase) return apiError("Supabase server configuration missing", 503, "SERVICE_UNAVAILABLE");

  const { data, error } = await supabase.auth.getUser(token);
  const userId = data.user?.id;
  const email = data.user?.email;
  if (error || !userId || !email) return apiError("Invalid session", 401, "INVALID_SESSION");

  const cutoff = new Date(Date.now() - ALERT_TEST_WINDOW_MS).toISOString();
  const { count, error: rateError } = await supabase
    .from("alert_test_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", cutoff);

  if (rateError) return apiError("Alert test rate limit is unavailable", 503, "RATE_LIMIT_UNAVAILABLE");
  if ((count ?? 0) >= ALERT_TEST_LIMIT) {
    return apiError("Too many test alerts. Please try again in a few minutes.", 429, "RATE_LIMITED");
  }

  const { error: auditError } = await supabase.from("alert_test_requests").insert({ user_id: userId });
  if (auditError) return apiError("Alert test could not be recorded", 503, "AUDIT_WRITE_FAILED");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return apiError("Alert email service is not configured", 503, "EMAIL_NOT_CONFIGURED");

  const from = process.env.ALERT_FROM_EMAIL || "CoinSparkLine Alerts <alerts@coinsparkline.com>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: email,
      subject: "CoinSparkLine alert test",
      html: '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>CoinSparkLine alerts are connected</h2><p>This is a test email confirming that your CoinSparkLine account can receive Spark alerts.</p><p>No market signal was triggered by this test.</p><hr/><p style="font-size:12px;color:#667085">Signal alert only. Not financial advice.</p></div>',
    }),
  });

  if (!response.ok) return apiError("Email provider rejected the test", 502, "EMAIL_PROVIDER_REJECTED");
  return apiSuccess({});
}
