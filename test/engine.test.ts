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
