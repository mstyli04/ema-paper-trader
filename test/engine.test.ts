import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ema } from '../src/indicators.ts';
import { equityOf, newState, step } from '../src/engine.ts';
import type { Candle, Params } from '../src/types.ts';

const BAR = 14400;
const params: Params = { symbols: ['AAA', 'BBB'], fast: 3, slow: 6, feeRate: 0.004, slippage: 0.0005, maxDrawdown: 0.5 };

function series(prices: number[], t0 = 0): Candle[] {
  return prices.map((p, i) => ({ t: t0 + i * BAR, o: i ? prices[i - 1] : p, h: p * 1.01, l: p * 0.99, c: p, v: 1 }));
}

function randomWalk(n: number, seed: number): number[] {
  let x = seed;
  const rnd = () => ((x = (x * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const out = [100];
  for (let i = 1; i < n; i++) out.push(out[i - 1] * (1 + (rnd() - 0.5) * 0.06));
  return out;
}

test('ema matches hand calculation', () => {
  const out = ema([1, 2, 3], 3); // k = 0.5
  assert.deepEqual(out, [1, 1.5, 2.25]);
});

test('buys on bullish cross and sells on bearish cross, filling at the next open with fees', () => {
  const prices = [...Array(10).fill(100).map((p, i) => p - i), ...[92, 96, 100, 104, 108, 112], ...[106, 100, 94, 88, 82, 76]];
  const cs = series(prices);
  const p1: Params = { ...params, symbols: ['AAA'] };
  const s = newState(1000, 0);
  s.lastProcessed.AAA = cs[0].t;
  const { events } = step(s, { AAA: cs }, p1);
  const trades = events.filter((e) => e.action !== 'SKIP');
  assert.equal(trades[0].action, 'BUY');
  assert.equal(trades[1].action, 'SELL');
  const buyIdx = cs.findIndex((c) => c.t === trades[0].t);
  assert.equal(trades[0].price, cs[buyIdx].o * (1 + p1.slippage));
  // flat at the end: all money is cash, and cash = start + realised P&L
  assert.equal(s.positions.AAA, null);
  assert.ok(Math.abs(s.cash - (1000 + (trades[1].pnl as number))) < 1e-9);
  assert.ok((trades[1].pnl as number) < 0 || (trades[1].pnl as number) > 0);
});

test('fresh live state never trades retroactively', () => {
  const cs = series(randomWalk(200, 7));
  const s = newState(1000, 0);
  const { events } = step(s, { AAA: cs, BBB: cs }, params);
  assert.equal(events.length, 0);
  assert.equal(s.lastProcessed.AAA, cs[cs.length - 2].t);
});

test('ticking candle by candle gives identical results to one pass (no look-ahead, catch-up works)', () => {
  const a = series(randomWalk(600, 11));
  const b = series(randomWalk(600, 99));
  const init = () => {
    const s = newState(10_000, 0);
    s.lastProcessed = { AAA: a[20].t, BBB: b[20].t };
    return s;
  };

  const once = init();
  const full = step(once, { AAA: a, BBB: b }, params);

  const inc = init();
  const incEvents = [];
  let k = 22;
  let gap = 1;
  while (k <= a.length) {
    incEvents.push(...step(inc, { AAA: a.slice(0, k), BBB: b.slice(0, k) }, params).events);
    gap = (gap % 5) + 1; // uneven gaps simulate skipped/late scheduled runs
    k += gap;
  }
  if (k - gap < a.length) incEvents.push(...step(inc, { AAA: a, BBB: b }, params).events);

  assert.ok(full.events.length > 10, 'test series should produce trades');
  assert.deepEqual(incEvents, full.events);
  assert.equal(inc.cash, once.cash);
});

test('a future candle cannot change an earlier decision', () => {
  const a = series(randomWalk(300, 5));
  const s1 = newState(1000, 0); s1.lastProcessed.AAA = a[20].t;
  const s2 = newState(1000, 0); s2.lastProcessed.AAA = a[20].t;
  const p1: Params = { ...params, symbols: ['AAA'] };
  const cut = 200;
  const r1 = step(s1, { AAA: a.slice(0, cut) }, p1).events;
  const tampered = a.map((c, i) => (i >= cut ? { ...c, o: c.o * 3, c: c.c * 3 } : c));
  const r2 = step(s2, { AAA: tampered }, p1).events.filter((e) => e.t < a[cut].t);
  assert.deepEqual(r2, r1);
});

test('drawdown halt blocks new entries but still allows exits', () => {
  const s = newState(1000, 0);
  s.halted = true;
  s.haltReason = 'test';
  const prices = [...Array(10).fill(0).map((_, i) => 100 - i), 95, 100, 105, 110, 115, 108, 100, 92, 85];
  const cs = series(prices);
  s.lastProcessed.AAA = cs[0].t;
  const { events } = step(s, { AAA: cs }, { ...params, symbols: ['AAA'] });
  assert.ok(events.some((e) => e.action === 'SKIP'));
  assert.ok(!events.some((e) => e.action === 'BUY'));
  assert.equal(equityOf(s, s.lastPrice), 1000);
});

const DAY = 86400;
const botB: Params = {
  symbols: ['AAA', 'BBB'], fast: 3, slow: 6, feeRate: 0.004, slippage: 0.0005, maxDrawdown: 0.9,
  barSeconds: DAY, orderType: 'limit', makerFee: 0.0025, limitOffset: 0.001,
  trendSma: 20, volTarget: 0.6, volLookback: 10, barsPerYear: 365,
};
function dailySeries(prices: number[], seed: number): Candle[] {
  let x = seed;
  const rnd = () => ((x = (x * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  return prices.map((p, i) => {
    const o = i ? prices[i - 1] : p;
    return { t: i * DAY, o, h: Math.max(o, p) * (1 + rnd() * 0.004), l: Math.min(o, p) * (1 - rnd() * 0.004), c: p, v: 1 };
  });
}

test('limit-order bot: ticking day by day gives identical results to one pass', () => {
  const a = dailySeries(randomWalk(700, 3), 1);
  const b = dailySeries(randomWalk(700, 42), 2);
  const init = () => { const s = newState(10_000, 0); s.lastProcessed = { AAA: a[30].t, BBB: b[30].t }; return s; };
  const once = init();
  const full = step(once, { AAA: a, BBB: b }, botB);
  const inc = init();
  const incEvents = [];
  for (let k = 33; k <= a.length; k += 1 + (k % 3)) incEvents.push(...step(inc, { AAA: a.slice(0, k), BBB: b.slice(0, k) }, botB).events);
  incEvents.push(...step(inc, { AAA: a, BBB: b }, botB).events);
  assert.ok(full.events.filter((e) => e.action !== 'SKIP').length > 10);
  assert.deepEqual(incEvents, full.events);
});

test('limit-order bot: a future candle cannot change an earlier decision', () => {
  const a = dailySeries(randomWalk(400, 8), 3);
  const p1: Params = { ...botB, symbols: ['AAA'] };
  const s1 = newState(1000, 0); s1.lastProcessed.AAA = a[30].t;
  const s2 = newState(1000, 0); s2.lastProcessed.AAA = a[30].t;
  const cut = 250;
  const r1 = step(s1, { AAA: a.slice(0, cut) }, p1).events;
  const tampered = a.map((c, i) => (i >= cut ? { ...c, o: c.o * 3, h: c.h * 3, l: c.l * 3, c: c.c * 3 } : c));
  const r2 = step(s2, { AAA: tampered }, p1).events.filter((e) => e.t < a[cut].t);
  assert.deepEqual(r2, r1);
});

test('limit fills at the limit with the maker fee when the next day trades through it, else chases at the close', () => {
  const base = [...Array(10).fill(0).map((_, i) => 100 - i), 92, 96, 100, 104, 108, 112, 118];
  const cs = dailySeries(base, 5);
  const p1: Params = { ...botB, symbols: ['AAA'], trendSma: undefined, volTarget: undefined };
  const s = newState(1000, 0); s.lastProcessed.AAA = cs[0].t;
  const buy = step(s, { AAA: cs }, p1).events.find((e) => e.action === 'BUY')!;
  const i = cs.findIndex((c) => c.t === buy.t) - 1;
  const next = cs[i + 1];
  const lim = next.o * 0.999;
  if (next.l <= lim) { assert.equal(buy.price, lim); assert.ok(Math.abs(buy.fee - buy.notional * 0.0025) < 1e-9); }
  else assert.fail('expected a maker fill in this fixture');
  // force a miss: next day never trades below its open
  const missed = cs.map((c, j) => (j === i + 1 ? { ...c, l: c.o } : c));
  const s2 = newState(1000, 0); s2.lastProcessed.AAA = cs[0].t;
  const buy2 = step(s2, { AAA: missed }, p1).events.find((e) => e.action === 'BUY')!;
  assert.equal(buy2.price, next.c * (1 + p1.slippage));
  assert.equal(buy2.t, next.t + DAY);
});

test('trend filter blocks entries below the long average', () => {
  const down = dailySeries([...Array(40).fill(0).map((_, i) => 300 - i * 5), 100, 103, 106, 109, 112, 115, 118, 121, 124], 9);
  const s = newState(1000, 0); s.lastProcessed.AAA = down[25].t;
  const ev = step(s, { AAA: down }, { ...botB, symbols: ['AAA'] }).events;
  assert.ok(!ev.some((e) => e.action === 'BUY'));
  assert.ok(ev.some((e) => e.action === 'SKIP' && e.reason.includes('downtrend filter')));
});
