import type { Params } from './types.ts';

export const BAR_SECONDS = 4 * 3600;

// Fees model a real UK-accessible spot venue, not an idealised one.
// Kraken Pro entry tier is 0.25% maker / 0.40% taker; we assume every fill is a
// taker fill at the next candle's open, plus 0.05% slippage. Check current rates.
export const PARAMS: Params = {
  symbols: ['BTC-USD', 'ETH-USD', 'SOL-USD'],
  fast: 9,
  slow: 21,
  feeRate: 0.004,
  slippage: 0.0005,
  maxDrawdown: 0.15,
};

export const START_EQUITY = 10_000;

// Hours of history pulled on each live tick: 600h = 150 four-hour candles,
// enough for the EMAs to fully converge before the newest candle.
export const LIVE_WINDOW_HOURS = 600;

export const BACKTEST_FROM = Date.UTC(2023, 0, 1) / 1000;
