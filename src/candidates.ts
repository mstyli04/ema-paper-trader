import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { START_EQUITY } from './config.ts';
import { CANDIDATES, CANDIDATES_FROM } from './candidates-def.ts';
import { fetchDaily } from './data.ts';
import { equityOf, newState, step } from './engine.ts';
import { maxDrawdown, pct, pf, tradeStats, usd } from './metrics.ts';
import type { Candle, CurvePoint, Params, TradeEvent } from './types.ts';

const DAY = 86400;
const WARM = 210; // covers the 200-day average and EMA warm-up for every candidate

async function loadDaily(sym: string): Promise<Candle[]> {
  mkdirSync('cache', { recursive: true });
  const now = Math.floor(Date.now() / 1000);
  const file = `cache/${sym}-1d.json`;
  let days: Candle[] = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  if (!days.length || now - days[days.length - 1].t > 2 * DAY) {
    days = await fetchDaily(sym, CANDIDATES_FROM, now);
    writeFileSync(file, JSON.stringify(days));
  }
  return days.filter((d) => d.t + DAY <= now); // closed days only
}

interface Result { events: TradeEvent[]; curve: CurvePoint[]; bench: number[]; ret: number; benchRet: number; dd: number; benchDD: number; days: number }

function run(all: Record<string, Candle[]>, params: Params, fromT: number, toT: number): Result {
  const state = newState(START_EQUITY, fromT);
  const sliced: Record<string, Candle[]> = {};
  const benchStart: Record<string, number> = {};
  const opensAt: Record<string, Map<number, number>> = {};
  const lastClose: Record<string, number> = {};
  for (const sym of params.symbols) {
    const cs = all[sym].filter((c) => c.t <= toT);
    const startIdx = cs.findIndex((c) => c.t >= fromT);
    sliced[sym] = cs.slice(Math.max(0, startIdx - WARM));
    state.lastProcessed[sym] = cs[startIdx - 1].t;
    benchStart[sym] = cs[startIdx + 1].o;
    opensAt[sym] = new Map(cs.map((c) => [c.t, c.o]));
    lastClose[sym] = cs[cs.length - 1].c;
  }
  const { events, curve } = step(state, sliced, params);
  const finalEquity = equityOf(state, lastClose);
  const endT = Math.max(...params.symbols.map((s) => sliced[s][sliced[s].length - 1].t)) + DAY;
  curve.push({ t: endT, equity: finalEquity });
  const last: Record<string, number> = { ...benchStart };
  const bench = curve.map((pt, k) => {
    const rel = params.symbols.map((s) => {
      const px = k === curve.length - 1 ? lastClose[s] : opensAt[s].get(pt.t) ?? last[s];
      last[s] = px;
      return px / benchStart[s];
    });
    return START_EQUITY * (rel.reduce((a, b) => a + b, 0) / rel.length);
  });
  return {
    events, curve, bench,
    ret: finalEquity / START_EQUITY - 1,
    benchRet: bench[bench.length - 1] / START_EQUITY - 1,
    dd: maxDrawdown(curve.map((p) => p.equity)),
    benchDD: maxDrawdown(bench),
    days: (endT - fromT) / DAY,
  };
}

const score = (ret: number, dd: number) => (dd > 0 ? ret / dd : ret > 0 ? Infinity : ret);
const sc = (x: number) => (Number.isFinite(x) ? x.toFixed(2) : '∞');
const d = (t: number) => new Date(t * 1000).toISOString().slice(0, 10);
const makerShare = (ev: TradeEvent[]) => {
  const fills = ev.filter((e) => e.action !== 'SKIP');
  return fills.length ? fills.filter((e) => e.reason.includes('maker')).length / fills.length : 0;
};
const HEAD = '| Run | Strategy | Buy & hold | Max drawdown | B&H drawdown | Return ÷ drawdown | B&H return ÷ drawdown | Closed trades | Trades / month | Win rate | Profit factor | Limit fills | Fees |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|';
function row(label: string, r: Result) {
  const s = tradeStats(r.events);
  return `| ${label} | ${pct(r.ret)} | ${pct(r.benchRet)} | ${pct(-r.dd)} | ${pct(-r.benchDD)} | ${sc(score(r.ret, r.dd))} | ${sc(score(r.benchRet, r.benchDD))} | ${s.closed} | ${(s.closed / (r.days / 30)).toFixed(1)} | ${(s.winRate * 100).toFixed(0)}% | ${pf(s.profitFactor)} | ${(makerShare(r.events) * 100).toFixed(0)}% | ${usd(s.fees)} |`;
}

const syms = CANDIDATES[0].params.symbols;
const all: Record<string, Candle[]> = {};
for (const s of syms) all[s] = await loadDaily(s);

const start = Math.max(...syms.map((s) => all[s][0].t)) + WARM * DAY;
const end = Math.min(...syms.map((s) => all[s][all[s].length - 1].t));
const split = start + Math.floor(((end - start) * 0.7) / DAY) * DAY;

const bt = (p: Params) => ({ ...p, maxDrawdown: 1 }); // live halt is off in backtests
const results = CANDIDATES.map((c) => ({
  ...c,
  full: run(all, bt(c.params), start, end),
  ins: run(all, bt(c.params), start, split),
  oos: run(all, bt(c.params), split, end),
}));
const ranked = [...results].sort((a, b) =>
  score(b.oos.ret, b.oos.dd) - score(a.oos.ret, a.oos.dd) || tradeStats(a.oos.events).closed - tradeStats(b.oos.events).closed);
const win = ranked[0];
const wp = bt(win.params);
const robust = [
  ['EMA 8/20', run(all, { ...wp, fast: 8, slow: 20 }, start, end)],
  [`**EMA 9/21 (${win.id})**`, win.full],
  ['EMA 10/22', run(all, { ...wp, fast: 10, slow: 22 }, start, end)],
  ['EMA 12/26', run(all, { ...wp, fast: 12, slow: 26 }, start, end)],
  ...syms.map((s) => [s + ' alone', run(all, { ...wp, symbols: [s] }, start, end)]),
  ['All fills pay taker fees', run(all, { ...wp, orderType: 'market' }, start, end)],
] as [string, Result][];
const winRealised = win.oos.events.reduce((a, e) => a + (e.pnl ?? 0), 0);
const winUnrealised = win.oos.ret * START_EQUITY - winRealised;
const oosBench = score(win.oos.benchRet, win.oos.benchDD);
const oosWin = score(win.oos.ret, win.oos.dd);

const md = `# Bot B candidate results

Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC by \`npm run candidates\`. The rules and the selection rule were committed in [CANDIDATES.md](../CANDIDATES.md) before this ran.

**Data:** Coinbase daily candles. Evaluation runs from ${d(start)} (after 200 days of warm-up) to ${d(end + DAY)}. In-sample is up to ${d(split)} and out-of-sample is after it. The 25% live drawdown halt is off in backtests.

## Selection: out-of-sample return ÷ drawdown

| Rank | Candidate | Out-of-sample return | Out-of-sample drawdown | **Score** |
|---|---|---:|---:|---:|
${ranked.map((r, k) => `| ${k + 1} | ${r.id}: ${r.name} | ${pct(r.oos.ret)} | ${pct(-r.oos.dd)} | **${sc(score(r.oos.ret, r.oos.dd))}** |`).join('\n')}
| | *Buy & hold, same period* | ${pct(win.oos.benchRet)} | ${pct(-win.oos.benchDD)} | ${sc(oosBench)} |

**Winner: ${win.id} (${win.name}).** It becomes Bot B. Its out-of-sample score of ${sc(oosWin)} is ${oosWin > oosBench ? '**better**' : '**worse**'} than buy & hold's ${sc(oosBench)}.

**Read this before trusting the score.** Out-of-sample, ${win.id}'s closed trades made ${usd(winRealised)}. The rest of its ${pct(win.oos.ret)} (${usd(winUnrealised)}) is unrealised gains on positions still open at the end of the data. The score depends heavily on whether a rally that hasn't been cashed in yet holds up.

## Every candidate in full

${HEAD}
${results.map((r) => [row(`${r.id} full period`, r.full), row(`${r.id} in-sample`, r.ins), row(`**${r.id} out-of-sample**`, r.oos)].join('\n')).join('\n')}

## Robustness checks on the winner (full period)

${HEAD}
${robust.map(([l, r]) => row(l, r)).join('\n')}

## Reading this

- **Return ÷ drawdown** is how much the strategy made for each 1% of its worst drop. Buy & hold usually wins on raw return in a bull market. Trend-following earns its keep by making the drops smaller.
- **Limit fills** is the share of trades that got the cheaper maker fee instead of chasing at the close.
- If the neighbouring EMA settings or single coins tell a very different story from 9/21, treat the headline number with suspicion.
`;
mkdirSync('backtest', { recursive: true });
writeFileSync('backtest/CANDIDATES.md', md);
writeFileSync('backtest/bot-b-summary.json', JSON.stringify({
  generatedAt: new Date().toISOString(), winner: win.id, from: d(start), split: d(split), to: d(end + DAY),
  outOfSample: { ret: win.oos.ret, dd: win.oos.dd, score: oosWin, benchRet: win.oos.benchRet, benchDD: win.oos.benchDD, benchScore: oosBench, beatBenchmark: oosWin > oosBench },
}, null, 2));
console.log(md);
