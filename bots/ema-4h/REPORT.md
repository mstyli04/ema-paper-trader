# Bot A: EMA 9/21 on 4-hour candles

Updated 2026-09-29 18:01 UTC. Paper money only: no real orders are ever sent. [← Both bots](../../REPORT.md)

**Rules:** EMA 9/21 crossover on 4-hour candles; market orders at the next open (0.40% fee + 0.05% slippage); ⅓ of equity per coin; entries halt at a 15% drawdown.

**Status:** Running. Checks the market every 4 hours.

Started 2026-09-28 19:36 UTC with $10,000.00 of paper money. Go-live review on **2026-10-28**.

|  | Bot | Buy & hold (⅓ each, never sells) |
|---|---:|---:|
| Equity | $9,923.04 | $9,995.97 |
| Return | -0.77% | -0.04% |
| Max drawdown | -0.8% | -1.0% |

## Go-live bar

**Does not pass the go-live bar.** Keep it on paper or change the strategy. Do not fund it.

| Check | Needed | Now | |
|---|---|---|:-:|
| Days of paper trading | 30+ | 0.9 | ⏳ |
| Closed trades | 15+ | 0 | ⏳ |
| Net return after fees | above 0 | -0.8% | ⏳ |
| Beats buy & hold | yes | -0.8% vs -0.0% | ⏳ |
| Max drawdown | under 15%, never halted | -0.8% | ✅ |
| Backtest out-of-sample beat buy & hold | yes | -58.7% vs -35.7% | ❌ |

## Open positions

| Coin | Quantity | Entry | Now | Value | Unrealised P&L | Opened (UTC) |
|---|---:|---:|---:|---:|---:|---|
| ETH-USD | 1.214959 | $2,732.65 | $2,680.23 | $3,256.37 | -$76.96 | 2026-09-29 12:00 |

## Trades so far

0 closed · 0% won · profit factor 0.00 · average win $0.00 · average loss $0.00 · fees $13.28

| Time (UTC) | Coin | Action | Price | P&L | Reason |
|---|---|---|---:|---:|---|
| 2026-09-29 12:00 | ETH-USD | BUY | $2,732.65 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 2691.94 vs EMA21 2687.95 at 2026-09-29T12:00:00Z close |

Full history: [`ledger.csv`](ledger.csv) · equity every tick: [`equity.csv`](equity.csv) · backtest: [BACKTEST.md](../../backtest/BACKTEST.md)
