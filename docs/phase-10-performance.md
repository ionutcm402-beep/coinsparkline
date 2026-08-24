# Phase 10 — Performance gate

## Changes made

- Added a 60-second shared cache for read-only `latest-scan.json` and `previous-scan.json` reads.
- Kept refresh/write paths on uncached Blob reads so scheduled scans never merge against stale state.
- Invalidated the `scan-snapshot` cache tag immediately after a successful refresh write.
- Scoped `CoinPageWatchlistDock` to `/coin/[id]` instead of hydrating its pathname/watchlist client code on every route.

## Verified rendering impact

After snapshot caching, the production-style Next.js build changed these routes from request-time dynamic rendering to prerendered routes with a 1-minute revalidation window: `/`, `/compare`, `/opportunities`, `/privacy-coins`, `/screener`, and `/watchlist`.

## CoinGecko

Public research calls already use `unstable_cache`: top markets revalidate every 5 minutes and price-history / coin-detail calls every 30 minutes. The authenticated refresh job intentionally bypasses those caches because its purpose is to create a fresh market snapshot; caching the cron scan would trade accuracy for a misleading latency win.

## Bundle and loading decisions

- Recharts remains route-local to chart experiences rather than being introduced globally.
- Coin-only watchlist hydration is route-scoped.
- Existing route loading skeletons remain in place.
- The app does not load a third-party webfont, avoiding an external font request and font-layout shift.
- Fixed image containers already reserve layout space on the principal market/NFT surfaces; broad image-component migration is deferred until it can be measured against remote-provider behaviour.

## Gate

Phase 10 is complete when the branch compiles, passes TypeScript, generates the full route set, and the merged production deployment is READY.