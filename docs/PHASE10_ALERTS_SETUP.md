# Phase 10 — Behavioural email alerts

CoinSparkLine evaluates account alert rules after each successful signal refresh.

## Required environment variables

Add these to Vercel Production and Preview environments:

- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service-role key. Server only. Never expose with `NEXT_PUBLIC_`.
- `RESEND_API_KEY` — API key from Resend.
- `ALERT_FROM_EMAIL` — verified sender, for example `CoinSparkLine <alerts@yourdomain.com>`.

Phase 8 variables are also required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Run the latest `supabase/schema.sql` in Supabase SQL Editor so `alert_rules` includes `last_triggered_at` and `last_fingerprint`.

## Supported rules

- `regime-change` — fires when the four-stage CoinSparkLine regime changes.
- `entered-awakening` — fires specifically when an asset enters Awakening.
- `spark-threshold` — fires when SparkScore crosses upward through the user-selected threshold.
- `heating-up` — fires when volatility acceleration crosses 15% versus its recent baseline.

Alerts are checked only after a completed signal refresh, so delivery frequency follows the CoinSparkLine signal refresh cadence. The engine records an event fingerprint to avoid repeatedly sending the same transition.

## Security

The service-role key is used only in server-side alert evaluation to read all enabled rules and resolve account email addresses. Browser access remains protected by Supabase Row Level Security. Never send the service-role key to the client.
