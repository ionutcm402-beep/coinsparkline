# Phase 3 — Backtesting and calibration

Phase 3 exists to validate CoinSparkLine's behavioural claims before changing production thresholds or presenting SparkScore as a calibrated metric.

## What is measured

For every historical observation after a 120-day warm-up, CoinSparkLine reconstructs the regime model using only data that would have been available on that date. It then records the four-stage regime, SparkScore, and absolute forward log-move over 1, 3 and 7 days.

This is intentionally a volatility/activity validation, not a directional-return backtest. CoinSparkLine does not claim that a high score predicts whether price rises or falls.

## Score buckets

- 0–39
- 40–54
- 55–69
- 70–84
- 85–100

The main question is whether higher SparkScore buckets show meaningfully higher subsequent absolute movement than lower buckets, with enough observations to make the comparison useful.

## Regime validation

The same report groups observations by Calm, Building, Awakening and Volatile. We expect the stages to show an ordered increase in future realised activity in aggregate. If Building or Awakening do not separate from neighbouring stages, Phase 2 thresholds must be recalibrated rather than defended.

## Acceptance rules before production calibration

1. Use multiple years where available and at least 10 liquid assets; 20–30 is preferred.
2. Do not tune on a single coin.
3. Do not optimise for price direction.
4. Require a reasonable number of observations in every advertised score band.
5. Prefer stable, monotonic relationships over a formula that only looks good on one horizon.
6. Keep a later time period or separate assets as an out-of-sample check before changing production weights.

## Running

Local:

`npm run backtest`

Optional environment variables:

- `COINGECKO_API_KEY`
- `BACKTEST_COINS` (5–30, default 20)
- `BACKTEST_DAYS` (365–3650, default 1460)

GitHub Actions also contains a manual `Phase 3 Signal Backtest` workflow. Its output is stored as an artifact so calibration decisions can be reviewed before code changes.

## Important

The current SparkScore weights and Phase 2 regime thresholds remain candidates until this report is run and reviewed. No production threshold should be changed simply to make historical results look better without an out-of-sample check.
