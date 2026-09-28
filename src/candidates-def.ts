import type { Params } from './types.ts';

// Exactly as pre-registered in CANDIDATES.md.
const shared: Params = {
  symbols: ['BTC-USD', 'ETH-USD', 'SOL-USD'],
  fast: 9,
  slow: 21,
  feeRate: 0.004,
  slippage: 0.0005,
  maxDrawdown: 0.25,
  barSeconds: 86400,
  orderType: 'limit',
  makerFee: 0.0025,
  limitOffset: 0.001,
};

export const CANDIDATES: { id: string; name: string; params: Params }[] = [
  { id: 'B1', name: 'Daily + limit orders', params: { ...shared } },
  { id: 'B2', name: 'B1 + 200-day trend filter', params: { ...shared, trendSma: 200 } },
  { id: 'B3', name: 'B2 + volatility sizing', params: { ...shared, trendSma: 200, volTarget: 0.6, volLookback: 30, barsPerYear: 365 } },
];

export const CANDIDATES_FROM = Date.UTC(2021, 6, 1) / 1000;
