# Phase 1 — Architecture and production hardening

This phase is intentionally structural. It does not redesign product pages.

## Changes implemented

- Refresh cron authentication is header-only. Secrets are no longer accepted in query strings.
- Rolling CoinGecko refresh work is split into two 15-asset requests per hourly slot.
- Scheduled history scans use bounded concurrency and skip long retry chains; missed assets are picked up by the next rolling refresh.
- Targeted alert refresh work is capped per invocation to protect the Vercel 60-second ceiling.
- Global security headers are defined in `next.config.ts`, including CSP, frame protection, referrer policy, content-type protection and permissions policy.
- `/watchlist` is the canonical watchlist route. `/app/watchlist` is retained only as a permanent redirect for backwards compatibility.

## Product-route decisions

- `/privacy` is the legal Privacy Policy.
- `/privacy-coins` is the privacy-coin research product. They are intentionally separate and should be labelled distinctly in navigation.
- Screener and Opportunity Radar remain separate products: the Screener is user-defined filtering; Opportunity Radar is automatic research prioritisation.

## Live verification required before phase sign-off

Repository SQL enables RLS for community chat and alert tables, but repository files alone cannot prove those policies are applied to the live Supabase project. Verify the live database before final production sign-off.

Environment values must also be verified in Vercel without exposing secret contents. Expected server-only values include `SUPABASE_SECRET_KEY`, `COINGECKO_API_KEY`, `CRON_SECRET` and `RESEND_API_KEY`. Public Supabase URL/publishable key are intentionally client-visible.

## Deferred to later phases

- Full route-by-route API rate limiting. Direct Supabase chat writes require a database-side rate-limit strategy rather than an unreliable per-instance memory limiter.
- Legacy CSS/component deletion. Old styles remain necessary until every product page has migrated to the permanent design system.
- SEO/PWA completion, sitemap, robots, structured data and branded 404 belong to the production-completeness phase.
