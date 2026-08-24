import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase server configuration missing" }, { status: 500 });

  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email;
  if (error || !email) return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: "RESEND_API_KEY missing" }, { status: 500 });

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

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json({ ok: false, error: "Email provider rejected the test", detail }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
