import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { BACKTEST_FROM, BAR_SECONDS, PARAMS, START_EQUITY } from './config.ts';
import { aggregate, fetchHourly } from './data.ts';
import { equityOf, newState, step } from './engine.ts';
import { maxDrawdown, pct, pf, tradeStats, usd } from './metrics.ts';
import type { Candle, CurvePoint, Params, TradeEvent } from './types.ts';

const DAY = 86400;
const BARS_PER_DAY = DAY / BAR_SECONDS;

async function loadHistory(sym: string): Promise<Candle[]> {
  mkdirSync('cache', { recursive: true });
  const file = `cache/${sym}-1h.json`;
  const now = Math.floor(Date.now() / 1000);
  let hourly: Candle[] = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  const from = hourly.length ? hourly[hourly.length - 1].t + 3600 : BACKTEST_FROM;
  if (now - from > 3600) {
    process.stdout.write(`fetching ${sym} hourly candles from ${new Date(from * 1000).toISOString().slice(0, 10)}... `);
    const fresh = await fetchHourly(sym, from, now);
    hourly = [...hourly, ...fresh];
    writeFileSync(file, JSON.stringify(hourly));
    console.log(`${fresh.length} new`);
  }
  // Drop the in-progress bucket so every backtest candle is closed.
  const bars = aggregate(hourly, BAR_SECONDS);
  return bars.filter((b) => b.t + BAR_SECONDS <= now);
}

interface Result {
  params: Params;
  fromT: number;
  toT: number;
  events: TradeEvent[];
  curve: CurvePoint[];
  bench: number[];
  finalEquity: number;
  ret: number;
  benchRet: number;
  maxDD: number;
  benchMaxDD: number;
}

function run(all: Record<string, Candle[]>, params: Params, fromT: number, toT: number): Result {
  const warm = params.slow * 3;
  const sliced: Record<string, Candle[]> = {};
  const state = newState(START_EQUITY, fromT);
  const benchStart: Record<string, number> = {};
  const opensAt: Record<string, Map<number, number>> = {};
  const lastClose: Record<string, number> = {};

  for (const sym of params.symbols) {
    const cs = all[sym].filter((c) => c.t <= toT);
    const startIdx = cs.findIndex((c) => c.t >= fromT);
    const lo = Math.max(1, startIdx - warm);
    sliced[sym] = cs.slice(lo - 1);
    state.lastProcessed[sym] = cs[startIdx - 1].t;
    benchStart[sym] = cs[startIdx + 1].o;
    opensAt[sym] = new Map(cs.map((c) => [c.t, c.o]));
    lastClose[sym] = cs[cs.length - 1].c;
  }

  const { events, curve } = step(state, sliced, params);
  const finalEquity = equityOf(state, lastClose);
  const endT = Math.max(...params.symbols.map((s) => sliced[s][sliced[s].length - 1].t)) + BAR_SECONDS;
  curve.push({ t: endT, equity: finalEquity });

  const lastOpen: Record<string, number> = { ...benchStart };
  const bench = curve.map((pt, k) => {
    const isFinal = k === curve.length - 1;
    const rel = params.symbols.map((s) => {
      const px = isFinal ? lastClose[s] : opensAt[s].get(pt.t) ?? lastOpen[s];
      lastOpen[s] = px;
      return px / benchStart[s];
    });
    return START_EQUITY * (rel.reduce((a, b) => a + b, 0) / rel.length);
  });

  return {
    params, fromT, toT: endT, events, curve, bench, finalEquity,
    ret: finalEquity / START_EQUITY - 1,
    benchRet: bench[bench.length - 1] / START_EQUITY - 1,
    maxDD: maxDrawdown(curve.map((p) => p.equity)),
    benchMaxDD: maxDrawdown(bench),
  };
}

const d = (t: number) => new Date(t * 1000).toISOString().slice(0, 10);
const days = (r: Result) => (r.toT - r.fromT) / DAY;
const tradesPerMonth = (r: Result) => tradeStats(r.events).closed / (days(r) / 30);

function row(label: string, r: Result): string {
  const s = tradeStats(r.events);
  return `| ${label} | ${pct(r.ret)} | ${pct(r.benchRet)} | ${pct(r.ret - r.benchRet)} | ${pct(-r.maxDD)} | ${s.closed} | ${tradesPerMonth(r).toFixed(1)} | ${(s.winRate * 100).toFixed(0)}% | ${pf(s.profitFactor)} | ${usd(s.fees)} |`;
}
const HEAD = '| Run | Strategy | Buy & hold | Difference | Max drawdown | Closed trades | Trades / month | Win rate | Profit factor | Fees paid |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|';

// Every 30-day window, stepped daily: would this month have passed the go-live
// bar, and what happened in the 90 days after it?
function monthlyWindows(r: Result) {
  const win = 30 * BARS_PER_DAY;
  const next = 90 * BARS_PER_DAY;
  const eq = r.curve.map((p) => p.equity);
  const out = { total: 0, profitable: 0, beatBench: 0, enoughTrades: 0, passed: 0, passedWithNext: 0, nextBeatBench: 0, nextProfitable: 0, nextExcessSum: 0, tradeCounts: [] as number[] };
  for (let s = 0; s + win < eq.length; s += BARS_PER_DAY) {
    const e = s + win;
    const rs = eq[e] / eq[s] - 1;
    const rb = r.bench[e] / r.bench[s] - 1;
    const trades = r.events.filter((ev) => ev.action === 'SELL' && ev.t > r.curve[s].t && ev.t <= r.curve[e].t).length;
    const dd = maxDrawdown(eq.slice(s, e + 1));
    out.total++;
    out.tradeCounts.push(trades);
    if (rs > 0) out.profitable++;
    if (rs > rb) out.beatBench++;
    if (trades >= 15) out.enoughTrades++;
    const passed = trades >= 15 && rs > 0 && rs > rb && dd < 0.15;
    if (!passed) continue;
    out.passed++;
    if (e + next < eq.length) {
      out.passedWithNext++;
      const ns = eq[e + next] / eq[e] - 1;
      const nb = r.bench[e + next] / r.bench[e] - 1;
      if (ns > 0) out.nextProfitable++;
      if (ns > nb) out.nextBeatBench++;
      out.nextExcessSum += ns - nb;
    }
  }
  const sorted = [...out.tradeCounts].sort((a, b) => a - b);
  return { ...out, medianTrades: sorted[Math.floor(sorted.length / 2)] ?? 0 };
}

const all: Record<string, Candle[]> = {};
for (const sym of PARAMS.symbols) all[sym] = await loadHistory(sym);

const fromT = BACKTEST_FROM + PARAMS.slow * 3 * BAR_SECONDS + BAR_SECONDS;
const toT = Math.min(...PARAMS.symbols.map((s) => all[s][all[s].length - 1].t));
const split = fromT + Math.floor((toT - fromT) * 0.7 / BAR_SECONDS) * BAR_SECONDS;

// The drawdown halt is a live safety switch, not part of the strategy. With it
// on, one early 15% dip freezes the whole backtest, so rules are judged without it.
const BT: Params = { ...PARAMS, maxDrawdown: 1 };
const base = run(all, BT, fromT, toT);
const cheap = run(all, { ...BT, feeRate: 0.001, slippage: 0 }, fromT, toT);
const n1 = run(all, { ...BT, fast: 8, slow: 20 }, fromT, toT);
const n2 = run(all, { ...BT, fast: 10, slow: 22 }, fromT, toT);
const n3 = run(all, { ...BT, fast: 12, slow: 26 }, fromT, toT);
const ins = run(all, BT, fromT, split);
const oos = run(all, BT, split, toT);
const perSym = PARAMS.symbols.map((s) => [s, run(all, { ...BT, symbols: [s] }, fromT, toT)] as const);
const last30 = run(all, BT, toT - 30 * DAY, toT);
const w = monthlyWindows(base);
const s = tradeStats(base.events);

const verdictBits = [
  base.ret > base.benchRet ? 'beat' : 'lost to',
  oos.ret > oos.benchRet ? 'beat' : 'lost to',
];

const md = `# Backtest

Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC by \`npm run backtest\`. Same engine as the live paper bot.

**Strategy:** EMA ${PARAMS.fast}/${PARAMS.slow} crossover, long-only, on 4-hour candles for ${PARAMS.symbols.join(', ')}. Buy at the next candle's open after the fast EMA crosses above the slow one. Sell at the next open after it crosses back below. Each coin gets a third of the account. The live bot also stops new entries if the account falls ${PARAMS.maxDrawdown * 100}% below its peak. That switch is off here so the rules themselves are measured.

**Costs:** ${(PARAMS.feeRate * 100).toFixed(2)}% fee per side (Kraken Pro taker, entry tier) plus ${(PARAMS.slippage * 100).toFixed(2)}% slippage. **Data:** Coinbase hourly candles grouped into UTC 4-hour candles, ${d(fromT)} to ${d(toT)}. **Buy & hold** means splitting the same $${START_EQUITY.toLocaleString()} equally across the three coins at the start and never selling.

## Headline

Over the full period the strategy **${verdictBits[0]} buy & hold** (${pct(base.ret)} against ${pct(base.benchRet)}), and on the out-of-sample 30% it had never been judged on, it **${verdictBits[1]} buy & hold** (${pct(oos.ret)} against ${pct(oos.benchRet)}). It closed ${s.closed} trades, about ${tradesPerMonth(base).toFixed(1)} a month, winning ${(s.winRate * 100).toFixed(0)}% of them with a profit factor of ${pf(s.profitFactor)}. Fees cost ${usd(s.fees)}.

${HEAD}
${row('Full period, realistic costs', base)}
${row("Full period, 0.10% fee and no slippage (Miles's video)", cheap)}
${row('In-sample (first 70%)', ins)}
${row('**Out-of-sample (last 30%)**', oos)}
${row('Last 30 days', last30)}

## Do neighbouring settings also work?

If only 9/21 works, the result is probably curve-fitted to the past.

${HEAD}
${row('EMA 8/20', n1)}
${row('**EMA 9/21**', base)}
${row('EMA 10/22', n2)}
${row('EMA 12/26', n3)}

## Each coin on its own

${HEAD}
${perSym.map(([sym, r]) => row(sym, r)).join('\n')}

## What one month of paper trading can tell you

This replays every 30-day window in the history, stepped one day at a time (${w.total} windows). Each window is checked against the go-live bar: 15+ closed trades, a profit after fees, beating buy & hold and a drawdown under 15%. For the windows that pass, it then looks at the following 90 days.

| | |
|---|---:|
| 30-day windows tested | ${w.total} |
| Strategy made money | ${(w.profitable / w.total * 100).toFixed(0)}% |
| Strategy beat buy & hold | ${(w.beatBench / w.total * 100).toFixed(0)}% |
| Median closed trades in a month | ${w.medianTrades} |
| Windows with 15+ closed trades | ${(w.enoughTrades / w.total * 100).toFixed(0)}% |
| **Windows that passed the whole go-live bar** | **${(w.passed / w.total * 100).toFixed(1)}%** (${w.passed} of ${w.total}) |
| ...of those, strategy made money in the next 90 days | ${w.passedWithNext ? (w.nextProfitable / w.passedWithNext * 100).toFixed(0) + '%' : 'n/a'} |
| ...of those, strategy beat buy & hold in the next 90 days | ${w.passedWithNext ? (w.nextBeatBench / w.passedWithNext * 100).toFixed(0) + '%' : 'n/a'} |
| ...average lead over buy & hold in the next 90 days | ${w.passedWithNext ? pct(w.nextExcessSum / w.passedWithNext) : 'n/a'} |

This table is the answer to whether a good month means the bot is worth funding.

## Caveats

- A backtest is a best case. Real fills can be worse than the next candle's open, especially for SOL in fast markets.
- Out-of-sample here means data the rules weren't tuned on. EMA 9/21 itself was chosen because it's popular, and it's popular partly because it worked in the past.
- Three coins that move together aren't three independent bets. When crypto falls, all three usually fall together.
`;

mkdirSync('backtest', { recursive: true });
writeFileSync('backtest/BACKTEST.md', md);
writeFileSync('backtest/summary.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  from: d(fromT), to: d(toT),
  full: { ret: base.ret, benchRet: base.benchRet, maxDD: base.maxDD, trades: s.closed, tradesPerMonth: tradesPerMonth(base) },
  outOfSample: { from: d(split), ret: oos.ret, benchRet: oos.benchRet, beatBenchmark: oos.ret > oos.benchRet },
  monthlyWindows: { total: w.total, passedPct: w.passed / w.total, nextBeatBenchPct: w.passedWithNext ? w.nextBeatBench / w.passedWithNext : null },
}, null, 2));
console.log(md);
