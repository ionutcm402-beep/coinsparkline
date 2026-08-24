# Phase 6 — CoinSpark Live

CoinSpark Live is the combined real-time market + community experience.

## Product rules
- Market refresh state must be truthful; failed refreshes retain the last successful snapshot and show a delayed state.
- Realtime chat state comes from the Supabase channel subscription, never from a static badge.
- $TICKER mentions are interactive and move the user back to the relevant market context.
- Mobile uses one explicit Market / Chat switch instead of trying to compress both panes side by side.
- Selected-asset context is shared across market and chat.
- Community failures expose a reconnect action.
- No fake activity indicators.
