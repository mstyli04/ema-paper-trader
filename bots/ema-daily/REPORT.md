# Bot B: EMA 9/21 on daily candles, limit orders

Updated 2026-09-29 23:38 UTC. Paper money only: no real orders are ever sent. [← Both bots](../../REPORT.md)

**Rules:** Pre-registered candidate B1 (see CANDIDATES.md): EMA 9/21 crossover on daily candles; limit order 0.10% better than the next open (0.25% maker fee), or chase at that day's close (0.40% + 0.05%) if it doesn't fill; ⅓ of equity per coin; entries halt at a 25% drawdown.

**Status:** Running. Checks the market every 4 hours.

Started 2026-09-28 19:59 UTC with $10,000.00 of paper money. Go-live review on **2026-12-27**.

|  | Bot | Buy & hold (⅓ each, never sells) |
|---|---:|---:|
| Equity | $10,000.00 | $10,043.16 |
| Return | 0.00% | +0.43% |
| Max drawdown | 0.0% | -1.1% |

## Go-live bar

**Too early to judge.** Review on 2026-12-27.

| Check | Needed | Now | |
|---|---|---|:-:|
| Days of paper trading | 90+ | 1.2 | ⏳ |
| Closed trades | 4+ | 0 | ⏳ |
| Net return after fees | above 0 | 0.0% | ⏳ |
| Max drawdown | under 50% of buy & hold's (-1.1%) | 0.0% | ✅ |
| Backtest out-of-sample return ÷ drawdown beat buy & hold | yes | 0.82 vs 0.09 | ✅ |

## Open positions

None. All cash.

## Trades so far

0 closed · 0% won · profit factor 0.00 · average win $0.00 · average loss $0.00 · fees $0.00

No decisions yet. The bot waits for the next crossover.

Full history: [`ledger.csv`](ledger.csv) · equity every tick: [`equity.csv`](equity.csv) · backtest: [CANDIDATES.md](../../backtest/CANDIDATES.md)
