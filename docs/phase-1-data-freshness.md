# Phase 1 — Data freshness and reliability

CoinSparkLine now distinguishes fresh, aging, delayed and stale behavioural signals instead of presenting every saved snapshot as live.

## Target cadence

The first production target is one signal refresh every 6 hours for the tracked Top 30. The wider 200+ market remains available through the lighter market-data request used by the homepage.

Vercel Hobby only supports one Vercel Cron invocation per day, so `vercel.json` remains the daily fallback. The repository also includes `.github/workflows/refresh-signals.yml` as the primary 6-hour external scheduler.

## Required GitHub Actions secrets

In GitHub → Settings → Secrets and variables → Actions, add:

- `CSL_REFRESH_URL` — the stable production URL ending in `/api/refresh`, for example `https://YOUR-PRODUCTION-DOMAIN/api/refresh`
- `CSL_CRON_SECRET` — exactly the same secret value configured as `CRON_SECRET` in Vercel

After those are added, run the workflow manually once from GitHub Actions. A successful response includes `success`, `scannedAt`, `coinCount`, `days`, and `durationMs`.

## Freshness states

- Fresh: less than 8 hours old
- Aging: 8–16 hours old
- Delayed: 16–30 hours old
- Stale: more than 30 hours old

The dashboard should never call delayed or stale behavioural signals live.
