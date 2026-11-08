# Bot A: EMA 9/21 on 4-hour candles

Updated 2026-11-08 20:23 UTC. Paper money only: no real orders are ever sent. [← Both bots](../../REPORT.md)

**Rules:** EMA 9/21 crossover on 4-hour candles; market orders at the next open (0.40% fee + 0.05% slippage); ⅓ of equity per coin; entries halt at a 15% drawdown.

**Status:** Entries halted: equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z. Exits still run. Needs a human review.

Started 2026-09-28 19:36 UTC with $10,000.00 of paper money. Go-live review on **2026-10-28**.

|  | Bot | Buy & hold (⅓ each, never sells) |
|---|---:|---:|
| Equity | $8,409.48 | $8,318.70 |
| Return | -15.91% | -16.81% |
| Max drawdown | -15.9% | -19.4% |

## Go-live bar

**Does not pass the go-live bar.** Keep it on paper or change the strategy. Do not fund it.

| Check | Needed | Now | |
|---|---|---|:-:|
| Days of paper trading | 30+ | 41.0 | ✅ |
| Closed trades | 15+ | 18 | ✅ |
| Net return after fees | above 0 | -15.9% | ❌ |
| Beats buy & hold | yes | -15.9% vs -16.8% | ✅ |
| Max drawdown | under 15%, never halted | -15.9% | ❌ |
| Backtest out-of-sample beat buy & hold | yes | -58.7% vs -35.7% | ❌ |

## Open positions

None. All cash.

## Trades so far

18 closed · 0% won · profit factor 0.00 · average win $0.00 · average loss $88.36 · fees $439.55

| Time (UTC) | Coin | Action | Price | P&L | Reason |
|---|---|---|---:|---:|---|
| 2026-11-05 00:00 | SOL-USD | SKIP | $95.49 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 94.08 vs EMA21 94.05 at 2026-11-05T00:00:00Z close |
| 2026-11-04 16:00 | BTC-USD | SKIP | $80,210.16 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 78050.90 vs EMA21 77815.11 at 2026-11-04T16:00:00Z close |
| 2026-11-04 08:00 | ETH-USD | SKIP | $2,300.00 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 2272.98 vs EMA21 2270.88 at 2026-11-04T08:00:00Z close |
| 2026-11-03 20:00 | ETH-USD | SKIP | $2,284.28 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 2271.26 vs EMA21 2270.04 at 2026-11-03T20:00:00Z close |
| 2026-11-02 08:00 | ETH-USD | SKIP | $2,281.61 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 2272.57 vs EMA21 2272.49 at 2026-11-02T08:00:00Z close |
| 2026-10-29 16:00 | BTC-USD | SKIP | $81,698.55 |  | Bullish crossover skipped: entries halted (equity $8422.44 fell more than 15% below its $10000.00 peak on 2026-10-29T04:00:00Z). EMA9 80654.79 vs EMA21 80598.30 at 2026-10-29T16:00:00Z close |
| 2026-10-29 08:00 | BTC-USD | SELL | $79,697.43 | -$70.82 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 80477.96 vs EMA21 80531.36 at 2026-10-29T08:00:00Z close |
| 2026-10-29 04:00 | SOL-USD | SELL | $99.51 | -$119.54 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 101.37 vs EMA21 101.45 at 2026-10-29T04:00:00Z close |
| 2026-10-29 04:00 | ETH-USD | SELL | $2,304.30 | -$104.13 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 2340.58 vs EMA21 2342.34 at 2026-10-29T04:00:00Z close |
| 2026-10-28 20:00 | SOL-USD | BUY | $103.03 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 101.70 vs EMA21 101.58 at 2026-10-28T20:00:00Z close |
| 2026-10-28 20:00 | ETH-USD | BUY | $2,370.97 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 2347.38 vs EMA21 2344.90 at 2026-10-28T20:00:00Z close |
| 2026-10-28 16:00 | SOL-USD | SELL | $100.85 | -$74.34 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 101.39 vs EMA21 101.44 at 2026-10-28T16:00:00Z close |
| 2026-10-28 16:00 | ETH-USD | SELL | $2,330.44 | -$59.16 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 2341.84 vs EMA21 2342.44 at 2026-10-28T16:00:00Z close |
| 2026-10-28 12:00 | SOL-USD | BUY | $102.64 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 101.51 vs EMA21 101.49 at 2026-10-28T12:00:00Z close |
| 2026-10-28 12:00 | ETH-USD | BUY | $2,359.28 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 2344.40 vs EMA21 2343.52 at 2026-10-28T12:00:00Z close |

Full history: [`ledger.csv`](ledger.csv) · equity every tick: [`equity.csv`](equity.csv) · backtest: [BACKTEST.md](../../backtest/BACKTEST.md)
