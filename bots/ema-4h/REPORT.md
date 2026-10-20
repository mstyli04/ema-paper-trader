# Bot A: EMA 9/21 on 4-hour candles

Updated 2026-10-20 23:07 UTC. Paper money only: no real orders are ever sent. [← Both bots](../../REPORT.md)

**Rules:** EMA 9/21 crossover on 4-hour candles; market orders at the next open (0.40% fee + 0.05% slippage); ⅓ of equity per coin; entries halt at a 15% drawdown.

**Status:** Running. Checks the market every 4 hours.

Started 2026-09-28 19:36 UTC with $10,000.00 of paper money. Go-live review on **2026-10-28**.

|  | Bot | Buy & hold (⅓ each, never sells) |
|---|---:|---:|
| Equity | $9,093.64 | $9,366.04 |
| Return | -9.06% | -6.34% |
| Max drawdown | -9.3% | -12.7% |

## Go-live bar

**Does not pass the go-live bar.** Keep it on paper or change the strategy. Do not fund it.

| Check | Needed | Now | |
|---|---|---|:-:|
| Days of paper trading | 30+ | 22.1 | ⏳ |
| Closed trades | 15+ | 10 | ⏳ |
| Net return after fees | above 0 | -9.1% | ⏳ |
| Beats buy & hold | yes | -9.1% vs -6.3% | ⏳ |
| Max drawdown | under 15%, never halted | -9.3% | ✅ |
| Backtest out-of-sample beat buy & hold | yes | -58.7% vs -35.7% | ❌ |

## Open positions

| Coin | Quantity | Entry | Now | Value | Unrealised P&L | Opened (UTC) |
|---|---:|---:|---:|---:|---:|---|
| BTC-USD | 0.036541 | $82,555.68 | $82,918.18 | $3,029.88 | $1.18 | 2026-10-20 16:00 |
| SOL-USD | 28.466517 | $105.81 | $106.46 | $3,030.55 | $6.37 | 2026-10-20 16:00 |

## Trades so far

10 closed · 0% won · profit factor 0.00 · average win $0.00 · average loss $91.39 · fees $276.99

| Time (UTC) | Coin | Action | Price | P&L | Reason |
|---|---|---|---:|---:|---|
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
| 2026-10-11 20:00 | BTC-USD | BUY | $83,617.11 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 83160.29 vs EMA21 83105.61 at 2026-10-11T20:00:00Z close |
| 2026-10-07 04:00 | SOL-USD | SELL | $118.16 | -$123.59 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 120.07 vs EMA21 120.18 at 2026-10-07T04:00:00Z close |
| 2026-10-07 04:00 | ETH-USD | SELL | $2,609.08 | -$141.31 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 2683.93 vs EMA21 2693.78 at 2026-10-07T04:00:00Z close |
| 2026-10-07 04:00 | BTC-USD | SELL | $84,080.46 | -$29.72 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 85368.01 vs EMA21 85372.95 at 2026-10-07T04:00:00Z close |

Full history: [`ledger.csv`](ledger.csv) · equity every tick: [`equity.csv`](equity.csv) · backtest: [BACKTEST.md](../../backtest/BACKTEST.md)
