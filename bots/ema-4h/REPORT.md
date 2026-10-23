# Bot A: EMA 9/21 on 4-hour candles

Updated 2026-10-23 04:35 UTC. Paper money only: no real orders are ever sent. [← Both bots](../../REPORT.md)

**Rules:** EMA 9/21 crossover on 4-hour candles; market orders at the next open (0.40% fee + 0.05% slippage); ⅓ of equity per coin; entries halt at a 15% drawdown.

**Status:** Running. Checks the market every 4 hours.

Started 2026-09-28 19:36 UTC with $10,000.00 of paper money. Go-live review on **2026-10-28**.

|  | Bot | Buy & hold (⅓ each, never sells) |
|---|---:|---:|
| Equity | $8,837.46 | $9,168.86 |
| Return | -11.63% | -8.31% |
| Max drawdown | -11.6% | -12.7% |

## Go-live bar

**Does not pass the go-live bar.** Keep it on paper or change the strategy. Do not fund it.

| Check | Needed | Now | |
|---|---|---|:-:|
| Days of paper trading | 30+ | 24.4 | ⏳ |
| Closed trades | 15+ | 13 | ⏳ |
| Net return after fees | above 0 | -11.6% | ⏳ |
| Beats buy & hold | yes | -11.6% vs -8.3% | ⏳ |
| Max drawdown | under 15%, never halted | -11.6% | ✅ |
| Backtest out-of-sample beat buy & hold | yes | -58.7% vs -35.7% | ❌ |

## Open positions

None. All cash.

## Trades so far

13 closed · 0% won · profit factor 0.00 · average win $0.00 · average loss $89.43 · fees $324.56

| Time (UTC) | Coin | Action | Price | P&L | Reason |
|---|---|---|---:|---:|---|
| 2026-10-22 20:00 | SOL-USD | SELL | $103.45 | -$91.14 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 105.07 vs EMA21 105.27 at 2026-10-22T20:00:00Z close |
| 2026-10-22 20:00 | BTC-USD | SELL | $81,340.80 | -$68.35 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 82320.25 vs EMA21 82427.38 at 2026-10-22T20:00:00Z close |
| 2026-10-22 16:00 | ETH-USD | SELL | $2,394.91 | -$89.14 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 2432.20 vs EMA21 2432.70 at 2026-10-22T16:00:00Z close |
| 2026-10-21 00:00 | ETH-USD | BUY | $2,447.81 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 2418.56 vs EMA21 2415.31 at 2026-10-21T00:00:00Z close |
| 2026-10-20 16:00 | SOL-USD | BUY | $105.81 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 104.60 vs EMA21 104.47 at 2026-10-20T16:00:00Z close |
| 2026-10-20 16:00 | BTC-USD | BUY | $82,555.68 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 81893.50 vs EMA21 81860.08 at 2026-10-20T16:00:00Z close |
| 2026-10-20 12:00 | SOL-USD | SELL | $103.93 | -$62.61 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 104.31 vs EMA21 104.34 at 2026-10-20T12:00:00Z close |
| 2026-10-20 08:00 | BTC-USD | SELL | $81,419.09 | -$70.95 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 81826.10 vs EMA21 81835.42 at 2026-10-20T08:00:00Z close |
| 2026-10-20 04:00 | SOL-USD | BUY | $105.25 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 104.43 vs EMA21 104.39 at 2026-10-20T04:00:00Z close |
| 2026-10-19 08:00 | BTC-USD | BUY | $82,679.14 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 81882.42 vs EMA21 81831.44 at 2026-10-19T08:00:00Z close |
| 2026-10-14 16:00 | BTC-USD | SELL | $81,504.51 | -$90.79 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 82965.57 vs EMA21 83080.20 at 2026-10-14T16:00:00Z close |
| 2026-10-13 12:00 | BTC-USD | BUY | $83,291.70 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 83135.57 vs EMA21 83128.08 at 2026-10-13T12:00:00Z close |
| 2026-10-13 00:00 | ETH-USD | SELL | $2,442.60 | -$173.38 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 2511.98 vs EMA21 2520.39 at 2026-10-13T00:00:00Z close |
| 2026-10-12 20:00 | BTC-USD | SELL | $82,721.54 | -$59.14 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 83154.39 vs EMA21 83162.69 at 2026-10-12T20:00:00Z close |
| 2026-10-12 08:00 | ETH-USD | BUY | $2,562.85 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 2530.01 vs EMA21 2527.73 at 2026-10-12T08:00:00Z close |

Full history: [`ledger.csv`](ledger.csv) · equity every tick: [`equity.csv`](equity.csv) · backtest: [BACKTEST.md](../../backtest/BACKTEST.md)
