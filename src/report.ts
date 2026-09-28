import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { PARAMS } from './config.ts';
import { eventsFromLedger, parseCsv } from './ledger.ts';
import { maxDrawdown, pct, pf, tradeStats, usd } from './metrics.ts';
import type { State } from './types.ts';

const DAY = 86400;
const dt = (t: number) => new Date(t * 1000).toISOString().slice(0, 16).replace('T', ' ');

export function writeReport(state: State, marks: Record<string, number>, status: 'running' | 'stopped') {
  const events = eventsFromLedger('data/ledger.csv');
  const curve = parseCsv('data/equity.csv');
  const s = tradeStats(events);
  const last = curve[curve.length - 1];
  const equity = last ? +last.equity : state.startEquity;
  const bench = last ? +last.buy_and_hold : state.startEquity;
  const ret = equity / state.startEquity - 1;
  const benchRet = bench / state.startEquity - 1;
  const dd = maxDrawdown(curve.map((r) => +r.equity));
  const benchDd = maxDrawdown(curve.map((r) => +r.buy_and_hold));
  const now = Math.floor(Date.now() / 1000);
  const daysIn = (now - state.startedAt) / DAY;
  const reviewOn = dt(state.startedAt + 30 * DAY).slice(0, 10);
  const summary = existsSync('backtest/summary.json') ? JSON.parse(readFileSync('backtest/summary.json', 'utf8')) : null;

  const statusLine = status === 'stopped'
    ? 'Stopped. A `STOP` file is in the repo, so ticks do nothing until it is deleted.'
    : state.halted
      ? `Entries halted: ${state.haltReason}. Exits still run. Needs a human review.`
      : 'Running. Checks the market every 4 hours.';

  const mark = (ok: boolean, pending = false) => (pending ? '⏳' : ok ? '✅' : '❌');
  const done = daysIn >= 30;
  const checks: [string, string, string, string][] = [
    ['Days of paper trading', '30+', daysIn.toFixed(1), mark(done, !done)],
    ['Closed trades', '15+', String(s.closed), mark(s.closed >= 15, !done && s.closed < 15)],
    ['Net return after fees', 'above 0', pct(ret), mark(ret > 0, !done)],
    ['Beats buy & hold', 'yes', `${pct(ret)} vs ${pct(benchRet)}`, mark(ret > benchRet, !done)],
    ['Max drawdown', 'under 15%, never halted', pct(-dd), mark(dd < 0.15 && !state.halted, !done && !state.halted)],
    ['Backtest out-of-sample beat buy & hold', 'yes', summary ? `${pct(summary.outOfSample.ret)} vs ${pct(summary.outOfSample.benchRet)}` : 'not run', mark(!!summary?.outOfSample.beatBenchmark)],
  ];
  const allPass = checks.every((c) => c[3] === '✅');
  const anyFail = checks.some((c) => c[3] === '❌');
  const verdict = allPass
    ? '**Passes the go-live bar.** Next step is a small real-money trial (£50–100) while the paper run continues.'
    : anyFail
      ? '**Does not pass the go-live bar.** Keep it on paper or change the strategy. Do not fund it.'
      : `**Too early to judge.** Review on ${reviewOn}.`;

  const open = PARAMS.symbols.flatMap((sym) => {
    const p = state.positions[sym];
    if (!p) return [];
    const px = marks[sym] ?? p.entryPrice;
    const value = p.qty * px;
    return [`| ${sym} | ${p.qty.toFixed(6)} | ${usd(p.entryPrice)} | ${usd(px)} | ${usd(value)} | ${usd(value - p.costBasis)} | ${dt(p.entryTime)} |`];
  });

  const recent = events.slice(-15).reverse().map((e) =>
    `| ${dt(e.t)} | ${e.symbol} | ${e.action} | ${usd(e.price)} | ${e.pnl === null ? '' : usd(e.pnl)} | ${e.reason} |`);

  const md = `# Paper trading report

Updated ${dt(now)} UTC. Paper money only: no real orders are ever sent.

**Status:** ${statusLine}

Started ${dt(state.startedAt)} UTC with ${usd(state.startEquity)} of paper money. Go-live review on **${reviewOn}**.

|  | Bot | Buy & hold (⅓ each, never sells) |
|---|---:|---:|
| Equity | ${usd(equity)} | ${usd(bench)} |
| Return | ${pct(ret, 2)} | ${pct(benchRet, 2)} |
| Max drawdown | ${pct(-dd)} | ${pct(-benchDd)} |

## Go-live bar

${verdict}

| Check | Needed | Now | |
|---|---|---|:-:|
${checks.map((c) => `| ${c.join(' | ')} |`).join('\n')}

## Open positions

${open.length ? `| Coin | Quantity | Entry | Now | Value | Unrealised P&L | Opened (UTC) |\n|---|---:|---:|---:|---:|---:|---|\n${open.join('\n')}` : 'None. All cash.'}

## Trades so far

${s.closed} closed · ${(s.winRate * 100).toFixed(0)}% won · profit factor ${pf(s.profitFactor)} · average win ${usd(s.avgWin)} · average loss ${usd(s.avgLoss)} · fees ${usd(s.fees)}

${recent.length ? `| Time (UTC) | Coin | Action | Price | P&L | Reason |\n|---|---|---|---:|---:|---|\n${recent.join('\n')}` : 'No decisions yet. The bot waits for the next crossover.'}

Full history: [\`data/ledger.csv\`](data/ledger.csv) · equity every tick: [\`data/equity.csv\`](data/equity.csv) · backtest: [\`backtest/BACKTEST.md\`](backtest/BACKTEST.md)
`;
  writeFileSync('REPORT.md', md);
}
