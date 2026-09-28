# Bot B candidate results

Generated 2026-09-28 19:59 UTC by `npm run candidates`. The rules and the selection rule were committed in [CANDIDATES.md](../CANDIDATES.md) before this ran.

**Data:** Coinbase daily candles. Evaluation runs from 2022-01-27 (after 200 days of warm-up) to 2026-09-28. In-sample is up to 2025-05-03 and out-of-sample is after it. The 25% live drawdown halt is off in backtests.

## Selection: out-of-sample return ÷ drawdown

| Rank | Candidate | Out-of-sample return | Out-of-sample drawdown | **Score** |
|---|---|---:|---:|---:|
| 1 | B1: Daily + limit orders | +27.2% | -33.2% | **0.82** |
| 2 | B3: B2 + volatility sizing | -8.6% | -24.1% | **-0.36** |
| 3 | B2: B1 + 200-day trend filter | -9.5% | -25.5% | **-0.37** |
| | *Buy & hold, same period* | +5.9% | -64.8% | 0.09 |

**Winner: B1 (Daily + limit orders).** It becomes Bot B. Its out-of-sample score of 0.82 is **better** than buy & hold's 0.09.

**Read this before trusting the score.** Out-of-sample, B1's closed trades made -$1,161.13. The rest of its +27.2% ($3,881.74) is unrealised gains on positions still open at the end of the data. The score depends heavily on whether a rally that hasn't been cashed in yet holds up.

## Every candidate in full

| Run | Strategy | Buy & hold | Max drawdown | B&H drawdown | Return ÷ drawdown | B&H return ÷ drawdown | Closed trades | Trades / month | Win rate | Profit factor | Limit fills | Fees |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| B1 full period | +184.0% | +58.1% | -52.5% | -76.1% | 3.50 | 0.76 | 107 | 1.9 | 31% | 1.38 | 98% | $2,564.96 |
| B1 in-sample | +90.9% | +65.8% | -52.5% | -76.1% | 1.73 | 0.86 | 78 | 2.0 | 29% | 1.44 | 99% | $1,466.80 |
| **B1 out-of-sample** | +27.2% | +5.9% | -33.2% | -64.8% | 0.82 | 0.09 | 26 | 1.5 | 27% | 0.72 | 96% | $466.86 |
| B2 full period | -22.2% | +58.1% | -48.2% | -76.1% | -0.46 | 0.76 | 45 | 0.8 | 22% | 0.66 | 98% | $723.45 |
| B2 in-sample | -14.0% | +65.8% | -37.8% | -76.1% | -0.37 | 0.86 | 35 | 0.9 | 23% | 0.78 | 99% | $575.43 |
| **B2 out-of-sample** | -9.5% | +5.9% | -25.5% | -64.8% | -0.37 | 0.09 | 10 | 0.6 | 20% | 0.20 | 95% | $172.08 |
| B3 full period | -20.4% | +58.1% | -44.2% | -76.1% | -0.46 | 0.76 | 45 | 0.8 | 22% | 0.64 | 98% | $661.13 |
| B3 in-sample | -12.9% | +65.8% | -33.6% | -76.1% | -0.38 | 0.86 | 35 | 0.9 | 23% | 0.77 | 99% | $516.40 |
| **B3 out-of-sample** | -8.6% | +5.9% | -24.1% | -64.8% | -0.36 | 0.09 | 10 | 0.6 | 20% | 0.20 | 95% | $166.22 |

## Robustness checks on the winner (full period)

| Run | Strategy | Buy & hold | Max drawdown | B&H drawdown | Return ÷ drawdown | B&H return ÷ drawdown | Closed trades | Trades / month | Win rate | Profit factor | Limit fills | Fees |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| EMA 8/20 | +182.1% | +58.1% | -52.8% | -76.1% | 3.45 | 0.76 | 114 | 2.0 | 30% | 1.36 | 98% | $2,735.91 |
| **EMA 9/21 (B1)** | +184.0% | +58.1% | -52.5% | -76.1% | 3.50 | 0.76 | 107 | 1.9 | 31% | 1.38 | 98% | $2,564.96 |
| EMA 10/22 | +203.3% | +58.1% | -49.1% | -76.1% | 4.14 | 0.76 | 97 | 1.7 | 30% | 1.41 | 98% | $2,574.94 |
| EMA 12/26 | +147.9% | +58.1% | -50.5% | -76.1% | 2.93 | 0.76 | 80 | 1.4 | 30% | 1.29 | 98% | $1,950.77 |
| BTC-USD alone | +77.0% | +127.1% | -56.1% | -66.8% | 1.37 | 1.90 | 37 | 0.7 | 32% | 1.28 | 97% | $2,172.93 |
| ETH-USD alone | +24.3% | +10.9% | -54.1% | -71.8% | 0.45 | 0.15 | 35 | 0.6 | 29% | 0.90 | 97% | $1,309.30 |
| SOL-USD alone | +339.7% | +36.2% | -69.2% | -93.0% | 4.91 | 0.39 | 35 | 0.6 | 31% | 1.40 | 100% | $3,782.70 |
| All fills pay taker fees | +139.2% | +58.1% | -54.2% | -76.1% | 2.57 | 0.76 | 107 | 1.9 | 29% | 1.27 | 0% | $3,652.43 |

## Reading this

- **Return ÷ drawdown** is how much the strategy made for each 1% of its worst drop. Buy & hold usually wins on raw return in a bull market. Trend-following earns its keep by making the drops smaller.
- **Limit fills** is the share of trades that got the cheaper maker fee instead of chasing at the close.
- If the neighbouring EMA settings or single coins tell a very different story from 9/21, treat the headline number with suspicion.
