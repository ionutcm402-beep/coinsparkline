# Phase 2 — Permanent design system

## Product design principle

Quiet surface → strong typography → exceptional hierarchy → colour only when information needs it.

CoinSparkLine should not feel like a decorative crypto dashboard. SparkScore, regime state, confidence and live system state carry semantic colour; generic containers do not.

## Locked foundations

- Neutral page canvas and white primary surfaces.
- One restrained border language and three shadow levels.
- Solid blue primary actions; gradients are exceptional brand accents, not default UI chrome.
- Tighter radius scale: 8 / 12 / 16 / 20px.
- 1200px content width with a 720px reading width.
- Consistent responsive gutters and section rhythm.
- System font stack retained for reliability and performance in this phase.
- Semantic regime colours remain stable: Calm, Building, Awakening, Volatile.
- Reduced-motion support remains global.

## Reference screen

`/coin/[id]` is the Phase 2 reference screen because it exercises:

- product hierarchy;
- SparkScore and regime prominence;
- confidence and interpretation;
- charts and historical evidence;
- metric groups;
- external actions;
- responsive layouts;
- research/disclaimer language.

The primary question is: **What is happening with this asset, and what should I investigate?**

The screen hierarchy is now:

Asset → SparkScore/regime interpretation → regime evidence → SparkScore trajectory → historical context → market structure → execution/custody/research.

## Deliberately not done yet

- No product-wide migration in this PR.
- No homepage redesign.
- No global shell rebuild.
- No deletion of legacy CSS.

The design system must pass the reference-screen quality gate before it spreads across the product.
