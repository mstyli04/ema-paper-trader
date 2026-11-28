# Bot A: EMA 9/21 on 4-hour candles

Updated 2026-11-28 07:33 UTC. Paper money only: no real orders are ever sent. [← Both bots](../../REPORT.md)

**Rules:** EMA 9/21 crossover on 4-hour candles; market orders at the next open (0.40% fee + 0.05% slippage); ⅓ of equity per coin; entries halt at a 15% drawdown.

**Status:** Entries halted: equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z. Exits still run. Needs a human review.

Started 2026-09-28 19:36 UTC with $10,000.00 of paper money. Go-live review on **2026-10-28**.

|  | Bot | Buy & hold (⅓ each, never sells) |
|---|---:|---:|
| Equity | $8,409.48 | $6,449.93 |
| Return | -15.91% | -35.50% |
| Max drawdown | -15.9% | -39.4% |

## Go-live bar

**Does not pass the go-live bar.** Keep it on paper or change the strategy. Do not fund it.

| Check | Needed | Now | |
|---|---|---|:-:|
| Days of paper trading | 30+ | 60.5 | ✅ |
| Closed trades | 15+ | 18 | ✅ |
| Net return after fees | above 0 | -15.9% | ❌ |
| Beats buy & hold | yes | -15.9% vs -35.5% | ✅ |
| Max drawdown | under 15%, never halted | -15.9% | ❌ |
| Backtest out-of-sample beat buy & hold | yes | -58.7% vs -35.7% | ❌ |

## Open positions

None. All cash.

## Trades so far

18 closed · 0% won · profit factor 0.00 · average win $0.00 · average loss $88.36 · fees $439.55

| Time (UTC) | Coin | Action | Price | P&L | Reason |
|---|---|---|---:|---:|---|
| 2026-11-27 04:00 | ETH-USD | SKIP | $1,726.36 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 1695.66 vs EMA21 1691.85 at 2026-11-27T04:00:00Z close |
| 2026-11-26 20:00 | BTC-USD | SKIP | $60,641.82 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 60262.97 vs EMA21 60214.62 at 2026-11-26T20:00:00Z close |
| 2026-11-26 16:00 | SOL-USD | SKIP | $70.96 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 70.28 vs EMA21 70.27 at 2026-11-26T16:00:00Z close |
| 2026-11-23 16:00 | BTC-USD | SKIP | $62,822.81 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 61204.35 vs EMA21 60997.78 at 2026-11-23T16:00:00Z close |
| 2026-11-23 12:00 | SOL-USD | SKIP | $72.44 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 70.99 vs EMA21 70.85 at 2026-11-23T12:00:00Z close |
| 2026-11-23 12:00 | ETH-USD | SKIP | $1,723.58 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 1709.37 vs EMA21 1708.72 at 2026-11-23T12:00:00Z close |
| 2026-11-19 08:00 | SOL-USD | SKIP | $74.85 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 73.93 vs EMA21 73.83 at 2026-11-19T08:00:00Z close |
| 2026-11-18 12:00 | SOL-USD | SKIP | $74.36 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 73.82 vs EMA21 73.80 at 2026-11-18T12:00:00Z close |
| 2026-11-05 00:00 | SOL-USD | SKIP | $95.49 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 94.08 vs EMA21 94.05 at 2026-11-05T00:00:00Z close |
| 2026-11-04 16:00 | BTC-USD | SKIP | $80,210.16 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 78050.90 vs EMA21 77815.11 at 2026-11-04T16:00:00Z close |
| 2026-11-04 08:00 | ETH-USD | SKIP | $2,300.00 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 2272.98 vs EMA21 2270.88 at 2026-11-04T08:00:00Z close |
| 2026-11-03 20:00 | ETH-USD | SKIP | $2,284.28 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 2271.26 vs EMA21 2270.04 at 2026-11-03T20:00:00Z close |
| 2026-11-02 08:00 | ETH-USD | SKIP | $2,281.61 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 2272.57 vs EMA21 2272.49 at 2026-11-02T08:00:00Z close |
| 2026-10-29 16:00 | BTC-USD | SKIP | $81,698.55 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 80654.79 vs EMA21 80598.30 at 2026-10-29T16:00:00Z close |
| 2026-10-29 08:00 | BTC-USD | SELL | $79,697.43 | -$70.82 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 80477.96 vs EMA21 80531.36 at 2026-10-29T08:00:00Z close |

Full history: [`ledger.csv`](ledger.csv) · equity every tick: [`equity.csv`](equity.csv) · backtest: [BACKTEST.md](../../backtest/BACKTEST.md)
