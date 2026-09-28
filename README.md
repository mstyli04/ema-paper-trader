# EMA Paper Trader

A crypto trading bot that trades paper money in public. Every four hours it checks BTC, ETH and SOL, trades an EMA 9/21 crossover on 4-hour candles, and commits every decision to this repo. It never places a real order.

- **Live results:** [REPORT.md](REPORT.md), updated every tick
- **Every decision, with its reason:** [data/ledger.csv](data/ledger.csv)
- **Backtest, 2023 to now:** [backtest/BACKTEST.md](backtest/BACKTEST.md)

## Why it exists

AI-trading content often shows one good week of bot profits. This project asks the dull question behind it: does a popular strategy make money after realistic fees, and does one good month of paper trading tell you anything? The rules come from Miles Deutscher's Claude trading-bot guide. The testing is stricter than the guide's.

## The rules

- Buy at the next candle's open after the 9-period EMA crosses above the 21-period EMA. Sell at the next open after it crosses back below.
- Long only, spot only, a third of the account per coin.
- Every fill pays a 0.40% fee plus 0.05% slippage, which models a real UK-accessible exchange (Kraken Pro's entry-tier taker fee).
- New entries stop if the account falls 15% below its peak. A `STOP` file in the repo pauses the bot entirely.

The backtest and the live bot run the **same engine**. Tests prove it can't see future prices and that ticking every 4 hours, including late or skipped runs, gives exactly the result a single backtest pass would.

## Running it yourself

Needs Node 24 or newer. There are no dependencies.

```bash
npm test           # engine tests
npm run backtest   # downloads ~3.7 years of hourly candles from Coinbase, writes backtest/BACKTEST.md
npm run tick       # one live paper tick: updates data/ and REPORT.md
```

GitHub Actions runs `tick` on a schedule (`.github/workflows/tick.yml`). For Telegram alerts, add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as repository secrets.

Not financial advice. Paper money only.
