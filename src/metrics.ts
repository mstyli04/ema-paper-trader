import type { TradeEvent } from './types.ts';

export interface TradeStats {
  closed: number;
  wins: number;
  winRate: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  fees: number;
  netPnl: number;
}

export function tradeStats(events: TradeEvent[]): TradeStats {
  const sells = events.filter((e) => e.action === 'SELL' && e.pnl !== null);
  const wins = sells.filter((e) => (e.pnl as number) > 0);
  const losses = sells.filter((e) => (e.pnl as number) <= 0);
  const grossProfit = wins.reduce((s, e) => s + (e.pnl as number), 0);
  const grossLoss = -losses.reduce((s, e) => s + (e.pnl as number), 0);
  return {
    closed: sells.length,
    wins: wins.length,
    winRate: sells.length ? wins.length / sells.length : 0,
    grossProfit,
    grossLoss,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
    avgWin: wins.length ? grossProfit / wins.length : 0,
    avgLoss: losses.length ? grossLoss / losses.length : 0,
    fees: events.reduce((s, e) => s + e.fee, 0),
    netPnl: grossProfit - grossLoss,
  };
}

export function maxDrawdown(values: number[]): number {
  let peak = -Infinity;
  let worst = 0;
  for (const v of values) {
    peak = Math.max(peak, v);
    if (peak > 0) worst = Math.max(worst, (peak - v) / peak);
  }
  return worst;
}

export const pct = (x: number, dp = 1) => x === 0 ? `${(0).toFixed(dp)}%` : `${x > 0 ? '+' : ''}${(x * 100).toFixed(dp)}%`;
export const usd = (x: number) => `${x < 0 ? '-' : ''}$${Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const pf = (x: number) => (Number.isFinite(x) ? x.toFixed(2) : x > 0 ? '∞' : '0.00');
