# Paper trading: two bots

Updated 2026-10-05 17:04 UTC. Paper money only. Each bot started with $10,000 and is compared with simply buying the same three coins and holding.

| Bot | Started | Equity | Return | Buy & hold | Max drawdown | Closed trades | Status | Go-live bar |
|---|---|---:|---:|---:|---:|---:|---|---|
| [Bot A: EMA 9/21 on 4-hour candles](bots/ema-4h/REPORT.md) | 2026-09-28 | $9,760.24 | **-2.40%** | +1.29% | -2.8% | 2 | running | ❌ fails (review 2026-10-28) |
| [Bot B: EMA 9/21 on daily candles, limit orders](bots/ema-daily/REPORT.md) | 2026-09-28 | $10,000.00 | **0.00%** | +1.32% | 0.0% | 0 | running | ⏳ too early (review 2026-12-27) |

Why there are two: Bot A copies the strategy from the guide. Its backtest lost money after realistic fees ([backtest](backtest/BACKTEST.md)). Bot B is the winner of three improvements that were [written down before testing](CANDIDATES.md) ([results](backtest/CANDIDATES.md)).
