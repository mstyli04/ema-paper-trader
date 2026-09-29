# Bot A: EMA 9/21 on 4-hour candles

Updated 2026-09-29 00:19 UTC. Paper money only: no real orders are ever sent. [← Both bots](../../REPORT.md)

**Rules:** EMA 9/21 crossover on 4-hour candles; market orders at the next open (0.40% fee + 0.05% slippage); ⅓ of equity per coin; entries halt at a 15% drawdown.

**Status:** Running. Checks the market every 4 hours.

Started 2026-09-28 19:36 UTC with $10,000.00 of paper money. Go-live review on **2026-10-28**.

|  | Bot | Buy & hold (⅓ each, never sells) |
|---|---:|---:|
| Equity | $10,000.00 | $10,023.80 |
| Return | 0.00% | +0.24% |
| Max drawdown | 0.0% | -0.0% |

## Go-live bar

**Does not pass the go-live bar.** Keep it on paper or change the strategy. Do not fund it.

| Check | Needed | Now | |
|---|---|---|:-:|
| Days of paper trading | 30+ | 0.2 | ⏳ |
| Closed trades | 15+ | 0 | ⏳ |
| Net return after fees | above 0 | 0.0% | ⏳ |
| Beats buy & hold | yes | 0.0% vs +0.2% | ⏳ |
| Max drawdown | under 15%, never halted | 0.0% | ✅ |
| Backtest out-of-sample beat buy & hold | yes | -58.7% vs -35.7% | ❌ |

## Open positions

None. All cash.

## Trades so far

0 closed · 0% won · profit factor 0.00 · average win $0.00 · average loss $0.00 · fees $0.00

No decisions yet. The bot waits for the next crossover.

Full history: [`ledger.csv`](ledger.csv) · equity every tick: [`equity.csv`](equity.csv) · backtest: [BACKTEST.md](../../backtest/BACKTEST.md)
