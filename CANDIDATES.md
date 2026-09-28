# Bot B: pre-registered candidates

Written and committed **before** any of these were backtested. Git history dates this file ahead of the results in `backtest/CANDIDATES.md`, which shows the winner was picked by the rule below and not by trying ideas until one looked good.

## What Bot A's backtest showed

EMA 9/21 on 4-hour candles lost 49.6% against buy & hold's +371.8% (2023 to Sep 2026). With the same trades at 0.10% fees instead of 0.45%, it made +80.7%. The losses came from three things: fees, too many trades (about 12 a month) and whipsaws in sideways markets.

## Candidates

All three share these settings: BTC-USD, ETH-USD, SOL-USD · **daily** candles (UTC) · EMA 9/21 crossover · long-only spot · at most ⅓ of equity per coin.

**Order model (all three).** When a signal forms on day *i*'s close, a limit order is placed at day *i+1*'s open, 0.10% better than that open (a buy below it, a sell above it).
- If day *i+1*'s low (buy) or high (sell) reaches the limit, it fills at the limit price and pays the **0.25% maker fee**.
- If not, the bot chases: it fills at day *i+1*'s close, paying the **0.40% taker fee plus 0.05% slippage**.

| | Name | Entry | Exit | Size per coin |
|---|---|---|---|---|
| **B1** | Daily + limit orders | EMA 9 crosses above EMA 21 | EMA 9 crosses below EMA 21 | ⅓ of equity |
| **B2** | B1 + 200-day trend filter | As B1, **and** the close is above its 200-day simple average | As B1, **or** the close drops below its 200-day average | ⅓ of equity |
| **B3** | B2 + volatility sizing | As B2 | As B2 | ⅓ of equity × min(1, 60% ÷ the coin's annualised 30-day volatility) |

B3 only ever sizes *down*. When a coin swings harder than 60% a year, its position shrinks in proportion.

## Selection rule

- **Data:** Coinbase daily candles from 1 Jul 2021. The first 200 days are warm-up for the 200-day average. The first 70% of the remaining days is in-sample and the last 30% is out-of-sample.
- **Score:** out-of-sample return divided by out-of-sample maximum drawdown ("return per unit of worst drop"). Highest score wins. On a tie, fewer trades wins.
- **The winner becomes Bot B and runs on paper next to Bot A**, even if every candidate loses money. The point is to measure it honestly, not to find something that looks good.
- **Robustness checks, reported for the winner only:** EMA 8/20, 10/22 and 12/26; each coin on its own; everything paying taker fees.

## Bot B's go-live bar

A daily strategy makes only a few trades a month, so one month can't judge it. The review is at **90 days**, and all of these must hold:

1. 90+ days of paper trading
2. 4+ closed trades
3. Net return after fees above 0
4. Maximum drawdown under **half** of buy & hold's over the same period
5. Out-of-sample backtest return per unit of drawdown better than buy & hold's

The live bot stops opening new positions if equity falls 25% below its peak.
