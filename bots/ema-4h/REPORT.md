# Bot A: EMA 9/21 on 4-hour candles

Updated 2026-10-13 01:58 UTC. Paper money only: no real orders are ever sent. [← Both bots](../../REPORT.md)

**Rules:** EMA 9/21 crossover on 4-hour candles; market orders at the next open (0.40% fee + 0.05% slippage); ⅓ of equity per coin; entries halt at a 15% drawdown.

**Status:** Running. Checks the market every 4 hours.

Started 2026-09-28 19:36 UTC with $10,000.00 of paper money. Go-live review on **2026-10-28**.

|  | Bot | Buy & hold (⅓ each, never sells) |
|---|---:|---:|
| Equity | $9,310.44 | $9,320.23 |
| Return | -6.90% | -6.80% |
| Max drawdown | -6.9% | -9.6% |

## Go-live bar

**Does not pass the go-live bar.** Keep it on paper or change the strategy. Do not fund it.

| Check | Needed | Now | |
|---|---|---|:-:|
| Days of paper trading | 30+ | 14.3 | ⏳ |
| Closed trades | 15+ | 7 | ⏳ |
| Net return after fees | above 0 | -6.9% | ⏳ |
| Beats buy & hold | yes | -6.9% vs -6.8% | ⏳ |
| Max drawdown | under 15%, never halted | -6.9% | ✅ |
| Backtest out-of-sample beat buy & hold | yes | -58.7% vs -35.7% | ❌ |

## Open positions

None. All cash.

## Trades so far

7 closed · 0% won · profit factor 0.00 · average win $0.00 · average loss $98.51 · fees $179.87

| Time (UTC) | Coin | Action | Price | P&L | Reason |
|---|---|---|---:|---:|---|
| 2026-10-13 00:00 | ETH-USD | SELL | $2,442.60 | -$173.38 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 2511.98 vs EMA21 2520.39 at 2026-10-13T00:00:00Z close |
| 2026-10-12 20:00 | BTC-USD | SELL | $82,721.54 | -$59.14 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 83154.39 vs EMA21 83162.69 at 2026-10-12T20:00:00Z close |
| 2026-10-12 08:00 | ETH-USD | BUY | $2,562.85 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 2530.01 vs EMA21 2527.73 at 2026-10-12T08:00:00Z close |
| 2026-10-11 20:00 | BTC-USD | BUY | $83,617.11 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 83160.29 vs EMA21 83105.61 at 2026-10-11T20:00:00Z close |
| 2026-10-07 04:00 | SOL-USD | SELL | $118.16 | -$123.59 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 120.07 vs EMA21 120.18 at 2026-10-07T04:00:00Z close |
| 2026-10-07 04:00 | ETH-USD | SELL | $2,609.08 | -$141.31 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 2683.93 vs EMA21 2693.78 at 2026-10-07T04:00:00Z close |
| 2026-10-07 04:00 | BTC-USD | SELL | $84,080.46 | -$29.72 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 85368.01 vs EMA21 85372.95 at 2026-10-07T04:00:00Z close |
| 2026-10-04 08:00 | ETH-USD | BUY | $2,706.33 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 2691.67 vs EMA21 2691.28 at 2026-10-04T08:00:00Z close |
| 2026-10-03 04:00 | ETH-USD | SELL | $2,680.27 | -$58.81 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 2692.27 vs EMA21 2692.85 at 2026-10-03T04:00:00Z close |
| 2026-10-02 08:00 | SOL-USD | BUY | $121.76 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 119.35 vs EMA21 119.07 at 2026-10-02T08:00:00Z close |
| 2026-10-01 16:00 | BTC-USD | BUY | $84,172.14 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 83742.35 vs EMA21 83728.60 at 2026-10-01T16:00:00Z close |
| 2026-10-01 12:00 | ETH-USD | BUY | $2,707.17 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 2686.96 vs EMA21 2685.38 at 2026-10-01T12:00:00Z close |
| 2026-09-30 04:00 | ETH-USD | SELL | $2,668.97 | -$103.61 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 2683.04 vs EMA21 2684.57 at 2026-09-30T04:00:00Z close |
| 2026-09-29 12:00 | ETH-USD | BUY | $2,732.65 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 2691.94 vs EMA21 2687.95 at 2026-09-29T12:00:00Z close |

Full history: [`ledger.csv`](ledger.csv) · equity every tick: [`equity.csv`](equity.csv) · backtest: [BACKTEST.md](../../backtest/BACKTEST.md)
