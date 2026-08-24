# Phase 1 — Architecture and production hardening

This phase is intentionally structural. It does not redesign product pages.

## Changes implemented

- Refresh cron authentication is header-only. Secrets are no longer accepted in query strings.
- Rolling CoinGecko refresh work is split into two 15-asset requests per hourly slot.
- Scheduled history scans use bounded concurrency and skip long retry chains; missed assets are picked up by the next rolling refresh.
- Targeted alert refresh work is capped per invocation to protect the Vercel 60-second ceiling.
- Global security headers are defined in `next.config.ts`, including CSP, frame protection, referrer policy, content-type protection and permissions policy.
- `/watchlist` is the canonical watchlist route. `/app/watchlist` is retained only as a permanent redirect for backwards compatibility.
- `/privacy` is the legal Privacy Policy; `/privacy-coins` is the privacy-coin research product.
- Screener and Opportunity Radar remain separate products: user-defined filtering versus automatic research prioritisation.
- Authenticated API routes use the shared `apiError` / `apiSuccess` response pattern.
- Alert-test delivery is rate limited to three attempts per ten minutes per user.
- Community chat posting is rate limited in Postgres to five messages per ten seconds and thirty per five minutes.
- Data API grants for chat and alert tables have been reduced to least privilege.

## Live verification completed

Verified against the production Supabase project on 2026-08-24:

- RLS is enabled on `community_messages`, `alert_rules` and `alert_events`.
- Ownership policies are active in the live database.
- Anonymous users only receive the intended read access to community chat.
- Alert tables are restricted to authenticated users and owner-scoped RLS.
- The database-side chat rate-limit trigger is installed.
- `alert_test_requests` is server-only and has RLS enabled with no public policies.

Verified against Vercel production on 2026-08-24:

- The Phase 1 production deployment reached READY state.
- Recent `/api/refresh` executions returned HTTP 200.
- No grouped production runtime errors were reported during the verification window.

## Non-blocking security recommendation

Supabase Security Advisor reports leaked-password protection as disabled. Supabase documents this feature as available on Pro plans and above. Enable it when the project plan supports it; it is not treated as a Phase 1 code gate.

## Deferred intentionally

- Legacy CSS/component deletion remains Phase 13 because old styles are still required by unmigrated pages.
- SEO/PWA completion, sitemap, robots, structured data and branded 404 remain in Phase 12.
- Broader performance and accessibility work remain in their dedicated phases.
