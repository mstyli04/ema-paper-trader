# EMA Paper Trader

Two crypto trading bots that trade paper money in public. Every four hours they check BTC, ETH and SOL and commit every decision to this repo. Neither ever places a real order.

- **Live results for both bots:** [REPORT.md](REPORT.md), updated every tick
- **Bot A** copies the strategy from the guide: EMA 9/21 on 4-hour candles. [Report](bots/ema-4h/REPORT.md) · [ledger](bots/ema-4h/ledger.csv) · [backtest, 2023 to now](backtest/BACKTEST.md)
- **Bot B** is the winner of three improvements [pre-registered before testing](CANDIDATES.md): EMA 9/21 on daily candles with limit orders. [Report](bots/ema-daily/REPORT.md) · [ledger](bots/ema-daily/ledger.csv) · [candidate results](backtest/CANDIDATES.md)

## Why it exists

AI-trading content often shows one good week of bot profits. This project asks the dull question behind it: does a popular strategy make money after realistic fees, and does one good month of paper trading tell you anything? The rules come from Miles Deutscher's Claude trading-bot guide. The testing is stricter than the guide's.

## Bot A's rules

- Buy at the next candle's open after the 9-period EMA crosses above the 21-period EMA. Sell at the next open after it crosses back below.
- Long only, spot only, a third of the account per coin.
- Every fill pays a 0.40% fee plus 0.05% slippage, which models a real UK-accessible exchange (Kraken Pro's entry-tier taker fee).
- New entries stop if the account falls 15% below its peak. A `STOP` file in the repo pauses the bot entirely.

## Bot B's rules

The same crossover on **daily** candles. Orders are limit orders 0.10% better than the next day's open, paying the 0.25% maker fee. If one doesn't fill that day, the bot pays the taker fee at the close. It stops new entries at a 25% drawdown. Bot B came from three candidates (daily + limit orders, plus a 200-day trend filter, plus volatility sizing). The rule for choosing between them was committed before any of them were backtested, and the trend filter turned out to make things worse.

Every backtest and both live bots run the **same engine**. Tests prove it can't see future prices and that ticking every 4 hours, including late or skipped runs, gives exactly the result a single backtest pass would.

## Running it yourself

Needs Node 24 or newer. There are no dependencies.

```bash
npm test           # engine tests
npm run backtest     # Bot A: ~3.7 years of hourly candles from Coinbase, writes backtest/BACKTEST.md
npm run candidates   # Bot B's three pre-registered candidates on daily candles, writes backtest/CANDIDATES.md
npm run tick         # one live paper tick for both bots: updates bots/ and REPORT.md
```

GitHub Actions runs `tick` on a schedule (`.github/workflows/tick.yml`). For Telegram alerts, add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as repository secrets.

Not financial advice. Paper money only.
