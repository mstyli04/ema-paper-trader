# Bot A: EMA 9/21 on 4-hour candles

Updated 2026-10-02 14:41 UTC. Paper money only: no real orders are ever sent. [← Both bots](../../REPORT.md)

**Rules:** EMA 9/21 crossover on 4-hour candles; market orders at the next open (0.40% fee + 0.05% slippage); ⅓ of equity per coin; entries halt at a 15% drawdown.

**Status:** Running. Checks the market every 4 hours.

Started 2026-09-28 19:36 UTC with $10,000.00 of paper money. Go-live review on **2026-10-28**.

|  | Bot | Buy & hold (⅓ each, never sells) |
|---|---:|---:|
| Equity | $9,935.75 | $10,250.79 |
| Return | -0.64% | +2.51% |
| Max drawdown | -1.4% | -1.0% |

## Go-live bar

**Does not pass the go-live bar.** Keep it on paper or change the strategy. Do not fund it.

| Check | Needed | Now | |
|---|---|---|:-:|
| Days of paper trading | 30+ | 3.8 | ⏳ |
| Closed trades | 15+ | 1 | ⏳ |
| Net return after fees | above 0 | -0.6% | ⏳ |
| Beats buy & hold | yes | -0.6% vs +2.5% | ⏳ |
| Max drawdown | under 15%, never halted | -1.4% | ✅ |
| Backtest out-of-sample beat buy & hold | yes | -58.7% vs -35.7% | ❌ |

## Open positions

| Coin | Quantity | Entry | Now | Value | Unrealised P&L | Opened (UTC) |
|---|---:|---:|---:|---:|---:|---|
| BTC-USD | 0.038861 | $84,172.14 | $85,977.28 | $3,341.17 | $57.07 | 2026-10-01 16:00 |
| ETH-USD | 1.213685 | $2,707.17 | $2,724.80 | $3,307.05 | $8.25 | 2026-10-01 12:00 |
| SOL-USD | 27.104692 | $121.76 | $121.29 | $3,287.53 | -$25.96 | 2026-10-02 08:00 |

## Trades so far

1 closed · 0% won · profit factor 0.00 · average win $0.00 · average loss $103.61 · fees $65.67

| Time (UTC) | Coin | Action | Price | P&L | Reason |
|---|---|---|---:|---:|---|
| 2026-10-02 08:00 | SOL-USD | BUY | $121.76 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 119.35 vs EMA21 119.07 at 2026-10-02T08:00:00Z close |
| 2026-10-01 16:00 | BTC-USD | BUY | $84,172.14 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 83742.35 vs EMA21 83728.60 at 2026-10-01T16:00:00Z close |
| 2026-10-01 12:00 | ETH-USD | BUY | $2,707.17 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 2686.96 vs EMA21 2685.38 at 2026-10-01T12:00:00Z close |
| 2026-09-30 04:00 | ETH-USD | SELL | $2,668.97 | -$103.61 | Bearish crossover: EMA9 crossed below EMA21; market order at the open. EMA9 2683.04 vs EMA21 2684.57 at 2026-09-30T04:00:00Z close |
| 2026-09-29 12:00 | ETH-USD | BUY | $2,732.65 |  | Bullish crossover: EMA9 crossed above EMA21; market order at the open. EMA9 2691.94 vs EMA21 2687.95 at 2026-09-29T12:00:00Z close |

Full history: [`ledger.csv`](ledger.csv) · equity every tick: [`equity.csv`](equity.csv) · backtest: [BACKTEST.md](../../backtest/BACKTEST.md)
