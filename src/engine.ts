import { ema } from './indicators.ts';
import type { Candle, CurvePoint, Params, State, TradeEvent } from './types.ts';

// The one engine shared by the backtest and the live paper bot.
//
// Rules: a signal forms on the close of candle i and fills at the open of
// candle i+1. A candle is only acted on once candle i+1 exists, so nothing
// ever sees a price from the future. Each symbol gets an equal slice of
// equity; long-only; entries stop (exits still run) once equity falls
// maxDrawdown below its peak.

export function newState(startEquity: number, now: number): State {
  return {
    version: 1,
    startedAt: now,
    startEquity,
    cash: startEquity,
    positions: {},
    lastProcessed: {},
    lastPrice: {},
    peakEquity: startEquity,
    halted: false,
    haltReason: null,
    benchmarkStart: {},
    lastRunAt: 0,
    lastDailySummary: null,
  };
}

export function equityOf(state: State, prices: Record<string, number>): number {
  let e = state.cash;
  for (const [sym, p] of Object.entries(state.positions)) {
    if (p) e += p.qty * (prices[sym] ?? p.entryPrice);
  }
  return e;
}

const iso = (t: number) => new Date(t * 1000).toISOString().replace('.000Z', 'Z');

export function step(
  state: State,
  candles: Record<string, Candle[]>,
  params: Params,
): { events: TradeEvent[]; curve: CurvePoint[] } {
  const events: TradeEvent[] = [];
  const curve: CurvePoint[] = [];
  const n = params.symbols.length;
  const per: Record<string, { fast: number[]; slow: number[]; idx: Map<number, number> }> = {};
  const times = new Set<number>();

  for (const sym of params.symbols) {
    const cs = candles[sym];
    if (!cs || cs.length < 2) continue;
    const closes = cs.map((c) => c.c);
    per[sym] = {
      fast: ema(closes, params.fast),
      slow: ema(closes, params.slow),
      idx: new Map(cs.map((c, i) => [c.t, i])),
    };
    // A fresh bot starts from the latest closed candle: no retroactive trades.
    if (state.lastProcessed[sym] === undefined) state.lastProcessed[sym] = cs[cs.length - 2].t;
    for (let i = 1; i < cs.length; i++) {
      if (cs[i - 1].t > state.lastProcessed[sym]) times.add(cs[i].t);
    }
  }

  for (const t of [...times].sort((a, b) => a - b)) {
    for (const sym of params.symbols) {
      const j = per[sym]?.idx.get(t);
      if (j !== undefined) state.lastPrice[sym] = candles[sym][j].o;
    }

    for (const sym of params.symbols) {
      const p = per[sym];
      const j = p?.idx.get(t);
      if (!p || j === undefined || j < 1) continue;
      const i = j - 1;
      const cs = candles[sym];
      if (cs[i].t <= state.lastProcessed[sym]) continue;
      state.lastProcessed[sym] = cs[i].t;
      if (i < 1) continue;

      const crossUp = p.fast[i] > p.slow[i] && p.fast[i - 1] <= p.slow[i - 1];
      const crossDown = p.fast[i] < p.slow[i] && p.fast[i - 1] >= p.slow[i - 1];
      const pos = state.positions[sym] ?? null;
      const open = cs[j].o;
      const emaNote = `EMA${params.fast} ${p.fast[i].toFixed(2)} vs EMA${params.slow} ${p.slow[i].toFixed(2)} at ${iso(t)} close`;

      if (crossUp && !pos) {
        const equity = equityOf(state, state.lastPrice);
        const price = open * (1 + params.slippage);
        const budget = Math.min(state.cash, equity / n);
        if (state.halted || budget < 1) {
          events.push({
            t, symbol: sym, action: 'SKIP', price, qty: 0, notional: 0, fee: 0, pnl: null,
            reason: `Bullish crossover skipped: ${state.halted ? `entries halted (${state.haltReason})` : 'no free cash'}. ${emaNote}`,
            cashAfter: state.cash, equityAfter: equity,
          });
          continue;
        }
        const qty = budget / (price * (1 + params.feeRate));
        const notional = qty * price;
        const fee = notional * params.feeRate;
        state.cash -= notional + fee;
        state.positions[sym] = { qty, entryPrice: price, entryTime: t, costBasis: notional + fee };
        events.push({
          t, symbol: sym, action: 'BUY', price, qty, notional, fee, pnl: null,
          reason: `Bullish crossover: EMA${params.fast} crossed above EMA${params.slow}. ${emaNote}`,
          cashAfter: state.cash, equityAfter: equityOf(state, state.lastPrice),
        });
      } else if (crossDown && pos) {
        const price = open * (1 - params.slippage);
        const notional = pos.qty * price;
        const fee = notional * params.feeRate;
        const pnl = notional - fee - pos.costBasis;
        state.cash += notional - fee;
        state.positions[sym] = null;
        events.push({
          t, symbol: sym, action: 'SELL', price, qty: pos.qty, notional, fee, pnl,
          reason: `Bearish crossover: EMA${params.fast} crossed below EMA${params.slow}. ${emaNote}`,
          cashAfter: state.cash, equityAfter: equityOf(state, state.lastPrice),
        });
      }
    }

    const eq = equityOf(state, state.lastPrice);
    state.peakEquity = Math.max(state.peakEquity, eq);
    if (!state.halted && eq < state.peakEquity * (1 - params.maxDrawdown)) {
      state.halted = true;
      state.haltReason = `equity $${eq.toFixed(2)} fell more than ${(params.maxDrawdown * 100).toFixed(0)}% below its $${state.peakEquity.toFixed(2)} peak on ${iso(t)}`;
    }
    curve.push({ t, equity: eq });
  }

  return { events, curve };
}
