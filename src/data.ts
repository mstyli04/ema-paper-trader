import type { Candle } from './types.ts';

const BASE = 'https://api.exchange.coinbase.com';
const HOUR = 3600;
const PAGE = 300; // Coinbase returns at most 300 candles per request

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson(url: string): Promise<unknown> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'ema-paper-trader', Accept: 'application/json' } });
      if (res.ok) return await res.json();
      lastErr = new Error(`${res.status} ${res.statusText} for ${url}`);
      if (res.status < 500 && res.status !== 429) break;
    } catch (err) {
      lastErr = err;
    }
    await sleep(1000 * 2 ** attempt);
  }
  throw lastErr;
}

// Hourly candles in [fromSec, toSec), oldest first.
export const fetchHourly = (product: string, fromSec: number, toSec: number) => fetchCandles(product, HOUR, fromSec, toSec);

// UTC daily candles in [fromSec, toSec), oldest first.
export const fetchDaily = (product: string, fromSec: number, toSec: number) => fetchCandles(product, 86400, fromSec, toSec);

export async function fetchCandles(product: string, gran: number, fromSec: number, toSec: number): Promise<Candle[]> {
  const out = new Map<number, Candle>();
  const from = Math.floor(fromSec / gran) * gran;
  for (let s = from; s < toSec; s += PAGE * gran) {
    const e = s + (PAGE - 1) * gran;
    const url = `${BASE}/products/${product}/candles?granularity=${gran}` +
      `&start=${new Date(s * 1000).toISOString()}&end=${new Date(e * 1000).toISOString()}`;
    const rows = (await getJson(url)) as number[][];
    if (!Array.isArray(rows)) throw new Error(`Unexpected response for ${url}: ${JSON.stringify(rows).slice(0, 200)}`);
    for (const [t, l, h, o, c, v] of rows) {
      if (t >= s && t <= e && t < toSec) out.set(t, { t, o, h, l, c, v });
    }
    await sleep(150);
  }
  return [...out.values()].sort((a, b) => a.t - b.t);
}

// Group hourly candles into UTC-aligned buckets (00:00, 04:00, ... for 4h).
export function aggregate(hourly: Candle[], barSeconds: number): Candle[] {
  const buckets = new Map<number, Candle>();
  for (const h of hourly) {
    const t = Math.floor(h.t / barSeconds) * barSeconds;
    const b = buckets.get(t);
    if (!b) buckets.set(t, { t, o: h.o, h: h.h, l: h.l, c: h.c, v: h.v });
    else {
      b.h = Math.max(b.h, h.h);
      b.l = Math.min(b.l, h.l);
      b.c = h.c;
      b.v += h.v;
    }
  }
  return [...buckets.values()].sort((a, b) => a.t - b.t);
}
