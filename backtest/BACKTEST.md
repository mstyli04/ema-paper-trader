# Backtest

Generated 2026-09-28 19:55 UTC by `npm run backtest`. Same engine as the live paper bot.

**Strategy:** EMA 9/21 crossover, long-only, on 4-hour candles for BTC-USD, ETH-USD, SOL-USD. Buy at the next candle's open after the fast EMA crosses above the slow one. Sell at the next open after it crosses back below. Each coin gets a third of the account. The live bot also stops new entries if the account falls 15% below its peak. That switch is off here so the rules themselves are measured.

**Costs:** 0.40% fee per side (Kraken Pro taker, entry tier) plus 0.05% slippage. **Data:** Coinbase hourly candles grouped into UTC 4-hour candles, 2023-01-11 to 2026-09-28. **Buy & hold** means splitting the same $10,000 equally across the three coins at the start and never selling.

## Headline

Over the full period the strategy **lost to buy & hold** (-49.6% against +371.8%), and on the out-of-sample 30% it had never been judged on, it **lost to buy & hold** (-58.7% against -35.7%). It closed 554 trades, about 12.3 a month, winning 26% of them with a profit factor of 0.89. Fees cost $15,923.95.

| Run | Strategy | Buy & hold | Difference | Max drawdown | Closed trades | Trades / month | Win rate | Profit factor | Fees paid |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Full period, realistic costs | -49.6% | +371.8% | -421.5% | -80.0% | 554 | 12.3 | 26% | 0.89 | $15,923.95 |
| Full period, 0.10% fee and no slippage (Miles's video) | +80.7% | +371.8% | -291.1% | -60.4% | 554 | 12.3 | 29% | 1.09 | $7,451.45 |
| In-sample (first 70%) | +23.8% | +632.6% | -608.8% | -52.9% | 375 | 11.9 | 29% | 1.06 | $12,656.35 |
| **Out-of-sample (last 30%)** | -58.7% | -35.7% | -22.9% | -67.0% | 178 | 13.1 | 20% | 0.34 | $2,669.77 |
| Last 30 days | -3.4% | +9.9% | -13.3% | -10.0% | 16 | 15.9 | 13% | 0.31 | $413.16 |

## Do neighbouring settings also work?

If only 9/21 works, the result is probably curve-fitted to the past.

| Run | Strategy | Buy & hold | Difference | Max drawdown | Closed trades | Trades / month | Win rate | Profit factor | Fees paid |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| EMA 8/20 | -60.4% | +371.8% | -432.2% | -82.2% | 598 | 13.2 | 26% | 0.86 | $15,092.33 |
| **EMA 9/21** | -49.6% | +371.8% | -421.5% | -80.0% | 554 | 12.3 | 26% | 0.89 | $15,923.95 |
| EMA 10/22 | -37.6% | +371.8% | -409.4% | -75.6% | 513 | 11.3 | 26% | 0.92 | $15,551.94 |
| EMA 12/26 | -27.1% | +371.8% | -398.9% | -72.0% | 434 | 9.6 | 25% | 0.94 | $13,620.30 |

## Each coin on its own

| Run | Strategy | Buy & hold | Difference | Max drawdown | Closed trades | Trades / month | Win rate | Profit factor | Fees paid |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| BTC-USD | -45.8% | +374.9% | -420.6% | -72.1% | 174 | 3.8 | 27% | 0.86 | $14,094.71 |
| ETH-USD | -84.2% | +99.3% | -183.6% | -87.5% | 201 | 4.4 | 21% | 0.70 | $9,209.67 |
| SOL-USD | -15.3% | +641.3% | -656.6% | -85.1% | 179 | 4.0 | 30% | 0.97 | $25,069.80 |

## What one month of paper trading can tell you

This replays every 30-day window in the history, stepped one day at a time (1326 windows). Each window is checked against the go-live bar: 15+ closed trades, a profit after fees, beating buy & hold and a drawdown under 15%. For the windows that pass, it then looks at the following 90 days.

| | |
|---|---:|
| 30-day windows tested | 1326 |
| Strategy made money | 39% |
| Strategy beat buy & hold | 29% |
| Median closed trades in a month | 12 |
| Windows with 15+ closed trades | 26% |
| **Windows that passed the whole go-live bar** | **0.3%** (4 of 1326) |
| ...of those, strategy made money in the next 90 days | 0% |
| ...of those, strategy beat buy & hold in the next 90 days | 0% |
| ...average lead over buy & hold in the next 90 days | -35.6% |

This table is the answer to whether a good month means the bot is worth funding.

## Caveats

- A backtest is a best case. Real fills can be worse than the next candle's open, especially for SOL in fast markets.
- Out-of-sample here means data the rules weren't tuned on. EMA 9/21 itself was chosen because it's popular, and it's popular partly because it worked in the past.
- Three coins that move together aren't three independent bets. When crypto falls, all three usually fall together.
