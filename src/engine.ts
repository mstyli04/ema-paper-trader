import { ema, rollingVol, sma } from './indicators.ts';
import type { Candle, CurvePoint, Params, State, TradeEvent } from './types.ts';

// The one engine shared by every backtest and live paper bot.
//
// A signal forms on the close of candle i.
// - Market orders (Bot A) fill at the open of candle i+1, so candle i is
//   acted on once candle i+1 exists.
// - Limit orders (Bot B) rest 'limitOffset' better than candle i+1's open.
//   They fill at the limit if candle i+1 trades through it (maker fee),
//   otherwise at candle i+1's close (taker fee + slippage). Candle i is
//   therefore only resolved once candle i+1 has closed, i.e. candle i+2 exists.
// Nothing ever sees a price from the future. Long-only; each symbol gets at
// most an equal slice of equity; entries stop (exits still run) once equity
// falls maxDrawdown below its peak.

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
const money = (x: number) => x.toFixed(2);

interface Fill { t: number; price: number; feeRate: number; how: string }

export function step(
  state: State,
  candles: Record<string, Candle[]>,
  params: Params,
): { events: TradeEvent[]; curve: CurvePoint[] } {
  const events: TradeEvent[] = [];
  const curve: CurvePoint[] = [];
  const n = params.symbols.length;
  const limit = params.orderType === 'limit';
  const lag = limit ? 2 : 1;
  const bar = params.barSeconds ?? 14400;
  const per: Record<string, { fast: number[]; slow: number[]; trend: number[] | null; vol: number[] | null; idx: Map<number, number> }> = {};
  const times = new Set<number>();

  for (const sym of params.symbols) {
    const cs = candles[sym];
    if (!cs || cs.length < lag + 1) continue;
    const closes = cs.map((c) => c.c);
    per[sym] = {
      fast: ema(closes, params.fast),
      slow: ema(closes, params.slow),
      trend: params.trendSma ? sma(closes, params.trendSma) : null,
      vol: params.volTarget ? rollingVol(closes, params.volLookback ?? 30, params.barsPerYear ?? 365) : null,
      idx: new Map(cs.map((c, i) => [c.t, i])),
    };
    // A fresh bot starts from the latest closed candle: no retroactive trades.
    if (state.lastProcessed[sym] === undefined) state.lastProcessed[sym] = cs[cs.length - 2].t;
    for (let i = 0; i + lag < cs.length; i++) {
      if (cs[i].t > state.lastProcessed[sym]) times.add(cs[i + lag].t);
    }
  }

  const fillBuy = (cs: Candle[], i: number): Fill => {
    const next = cs[i + 1];
    if (!limit) return { t: next.t, price: next.o * (1 + params.slippage), feeRate: params.feeRate, how: 'market order at the open' };
    const lim = next.o * (1 - (params.limitOffset ?? 0));
    if (next.l <= lim) return { t: next.t, price: lim, feeRate: params.makerFee ?? params.feeRate, how: 'limit order filled (maker fee)' };
    return { t: next.t + bar, price: next.c * (1 + params.slippage), feeRate: params.feeRate, how: 'limit order missed, bought at the close (taker fee)' };
  };
  const fillSell = (cs: Candle[], i: number): Fill => {
    const next = cs[i + 1];
    if (!limit) return { t: next.t, price: next.o * (1 - params.slippage), feeRate: params.feeRate, how: 'market order at the open' };
    const lim = next.o * (1 + (params.limitOffset ?? 0));
    if (next.h >= lim) return { t: next.t, price: lim, feeRate: params.makerFee ?? params.feeRate, how: 'limit order filled (maker fee)' };
    return { t: next.t + bar, price: next.c * (1 - params.slippage), feeRate: params.feeRate, how: 'limit order missed, sold at the close (taker fee)' };
  };

  for (const key of [...times].sort((a, b) => a - b)) {
    // Mark every symbol at the latest price that is known at decision time.
    for (const sym of params.symbols) {
      const k = per[sym]?.idx.get(key);
      if (k === undefined) continue;
      const cs = candles[sym];
      state.lastPrice[sym] = limit ? cs[k - lag].c : cs[k].o;
    }

    for (const sym of params.symbols) {
      const p = per[sym];
      const k = p?.idx.get(key);
      if (!p || k === undefined || k < lag) continue;
      const i = k - lag;
      const cs = candles[sym];
      if (cs[i].t <= state.lastProcessed[sym]) continue;
      state.lastProcessed[sym] = cs[i].t;
      if (i < 1) continue;

      const crossUp = p.fast[i] > p.slow[i] && p.fast[i - 1] <= p.slow[i - 1];
      const crossDown = p.fast[i] < p.slow[i] && p.fast[i - 1] >= p.slow[i - 1];
      const aboveTrend = p.trend ? cs[i].c > p.trend[i] : true;
      const belowTrend = p.trend ? cs[i].c < p.trend[i] : false;
      const pos = state.positions[sym] ?? null;
      const signalAt = iso(cs[i].t + bar);
      const emaNote = `EMA${params.fast} ${money(p.fast[i])} vs EMA${params.slow} ${money(p.slow[i])} at ${signalAt} close`;
      const trendNote = p.trend ? `; close ${money(cs[i].c)} vs ${params.trendSma}-bar average ${money(p.trend[i])}` : '';

      if (crossUp && !pos) {
        const equity = equityOf(state, state.lastPrice);
        const skip = (why: string) => events.push({
          t: cs[i + 1].t, symbol: sym, action: 'SKIP', price: cs[i + 1].o, qty: 0, notional: 0, fee: 0, pnl: null,
          reason: `Bullish crossover skipped: ${why}. ${emaNote}${trendNote}`,
          cashAfter: state.cash, equityAfter: equity,
        });
        if (!aboveTrend) { skip(`price is below its ${params.trendSma}-bar average (downtrend filter)`); continue; }
        if (state.halted) { skip(`entries halted (${state.haltReason})`); continue; }
        let scale = 1;
        let sizeNote = '';
        if (p.vol && params.volTarget) {
          const v = p.vol[i];
          if (Number.isFinite(v) && v > 0) scale = Math.min(1, params.volTarget / v);
          sizeNote = ` Size ${(scale * 100).toFixed(0)}% of a full slot (volatility ${(v * 100).toFixed(0)}% vs ${(params.volTarget * 100).toFixed(0)}% target).`;
        }
        const budget = Math.min(state.cash, (equity / n) * scale);
        if (budget < 1) { skip('no free cash'); continue; }
        const f = fillBuy(cs, i);
        const qty = budget / (f.price * (1 + f.feeRate));
        const notional = qty * f.price;
        const fee = notional * f.feeRate;
        state.cash -= notional + fee;
        state.positions[sym] = { qty, entryPrice: f.price, entryTime: f.t, costBasis: notional + fee };
        events.push({
          t: f.t, symbol: sym, action: 'BUY', price: f.price, qty, notional, fee, pnl: null,
          reason: `Bullish crossover: EMA${params.fast} crossed above EMA${params.slow}${p.trend ? ` and price is above its ${params.trendSma}-bar average` : ''}; ${f.how}.${sizeNote} ${emaNote}${trendNote}`,
          cashAfter: state.cash, equityAfter: equityOf(state, state.lastPrice),
        });
      } else if (pos && (crossDown || belowTrend)) {
        const f = fillSell(cs, i);
        const notional = pos.qty * f.price;
        const fee = notional * f.feeRate;
        const pnl = notional - fee - pos.costBasis;
        state.cash += notional - fee;
        state.positions[sym] = null;
        const why = crossDown
          ? `Bearish crossover: EMA${params.fast} crossed below EMA${params.slow}`
          : `Trend exit: price closed below its ${params.trendSma}-bar average`;
        events.push({
          t: f.t, symbol: sym, action: 'SELL', price: f.price, qty: pos.qty, notional, fee, pnl,
          reason: `${why}; ${f.how}. ${emaNote}${trendNote}`,
          cashAfter: state.cash, equityAfter: equityOf(state, state.lastPrice),
        });
      }
    }

    const eq = equityOf(state, state.lastPrice);
    state.peakEquity = Math.max(state.peakEquity, eq);
    if (!state.halted && eq < state.peakEquity * (1 - params.maxDrawdown)) {
      state.halted = true;
      state.haltReason = `equity $${eq.toFixed(2)} fell more than ${(params.maxDrawdown * 100).toFixed(0)}% below its $${state.peakEquity.toFixed(2)} peak on ${iso(key)}`;
    }
    curve.push({ t: key - (lag - 1) * bar, equity: eq });
  }

  return { events, curve };
}
