import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { Bot } from './bots.ts';
import { eventsFromLedger, parseCsv } from './ledger.ts';
import { maxDrawdown, pct, pf, tradeStats, usd } from './metrics.ts';
import type { State } from './types.ts';

const DAY = 86400;
const dt = (t: number) => new Date(t * 1000).toISOString().slice(0, 16).replace('T', ' ');

export interface Snapshot {
  bot: Bot;
  state: State;
  status: 'running' | 'stopped' | 'error';
  equity: number;
  bench: number;
  ret: number;
  benchRet: number;
  dd: number;
  benchDD: number;
  closed: number;
  verdict: 'pass' | 'fail' | 'early';
  reviewOn: string;
}

export function writeBotReport(bot: Bot, state: State, marks: Record<string, number>, status: Snapshot['status']): Snapshot {
  const events = eventsFromLedger(`${bot.dir}/ledger.csv`);
  const curve = parseCsv(`${bot.dir}/equity.csv`);
  const s = tradeStats(events);
  const last = curve[curve.length - 1];
  const equity = last ? +last.equity : state.startEquity;
  const bench = last ? +last.buy_and_hold : state.startEquity;
  const ret = equity / state.startEquity - 1;
  const benchRet = bench / state.startEquity - 1;
  const dd = maxDrawdown(curve.map((r) => +r.equity));
  const benchDD = maxDrawdown(curve.map((r) => +r.buy_and_hold));
  const now = Math.floor(Date.now() / 1000);
  const g = bot.goLive;
  const daysIn = (now - state.startedAt) / DAY;
  const reviewOn = dt(state.startedAt + g.reviewDays * DAY).slice(0, 10);
  const bt = existsSync(g.backtest.file) ? g.backtest.read(JSON.parse(readFileSync(g.backtest.file, 'utf8'))) : { now: 'not run', pass: false };

  const statusLine = status === 'stopped'
    ? 'Stopped. A `STOP` file is in the repo, so ticks do nothing until it is deleted.'
    : status === 'error'
      ? 'The latest tick failed (see the Actions tab). The numbers below are from the last successful tick.'
      : state.halted
        ? `Entries halted: ${state.haltReason}. Exits still run. Needs a human review.`
        : 'Running. Checks the market every 4 hours.';

  const done = daysIn >= g.reviewDays;
  const mark = (ok: boolean, pending: boolean) => (ok ? '✅' : pending ? '⏳' : '❌');
  const ddOk = (g.maxDD !== undefined ? dd < g.maxDD : dd < benchDD * (g.maxDDvsBench ?? 1)) && !state.halted;
  const ddNeed = g.maxDD !== undefined ? `under ${(g.maxDD * 100).toFixed(0)}%, never halted` : `under ${((g.maxDDvsBench ?? 1) * 100).toFixed(0)}% of buy & hold's (${pct(-benchDD)})`;
  const checks: [string, string, string, string][] = [
    ['Days of paper trading', `${g.reviewDays}+`, daysIn.toFixed(1), mark(done, true)],
    ['Closed trades', `${g.minTrades}+`, String(s.closed), mark(s.closed >= g.minTrades, !done)],
    ['Net return after fees', 'above 0', pct(ret), mark(ret > 0, !done)],
    ...(g.mustBeatBench ? [['Beats buy & hold', 'yes', `${pct(ret)} vs ${pct(benchRet)}`, mark(ret > benchRet, !done)] as [string, string, string, string]] : []),
    ['Max drawdown', ddNeed, pct(-dd), mark(ddOk, !done && !state.halted)],
    [g.backtest.label, 'yes', bt.now, mark(bt.pass, false)],
  ];
  const verdict: Snapshot['verdict'] = checks.every((c) => c[3] === '✅') ? 'pass' : checks.some((c) => c[3] === '❌') ? 'fail' : 'early';
  const verdictText = {
    pass: '**Passes the go-live bar.** Next step is a small real-money trial (£50–100) while the paper run continues.',
    fail: '**Does not pass the go-live bar.** Keep it on paper or change the strategy. Do not fund it.',
    early: `**Too early to judge.** Review on ${reviewOn}.`,
  }[verdict];

  const open = bot.params.symbols.flatMap((sym) => {
    const p = state.positions[sym];
    if (!p) return [];
    const px = marks[sym] ?? p.entryPrice;
    const value = p.qty * px;
    return [`| ${sym} | ${p.qty.toFixed(6)} | ${usd(p.entryPrice)} | ${usd(px)} | ${usd(value)} | ${usd(value - p.costBasis)} | ${dt(p.entryTime)} |`];
  });
  const recent = events.slice(-15).reverse().map((e) =>
    `| ${dt(e.t)} | ${e.symbol} | ${e.action} | ${usd(e.price)} | ${e.pnl === null ? '' : usd(e.pnl)} | ${e.reason} |`);

  writeFileSync(`${bot.dir}/REPORT.md`, `# ${bot.name}

Updated ${dt(now)} UTC. Paper money only: no real orders are ever sent. [← Both bots](../../REPORT.md)

**Rules:** ${bot.rules}

**Status:** ${statusLine}

Started ${dt(state.startedAt)} UTC with ${usd(state.startEquity)} of paper money. Go-live review on **${reviewOn}**.

|  | Bot | Buy & hold (⅓ each, never sells) |
|---|---:|---:|
| Equity | ${usd(equity)} | ${usd(bench)} |
| Return | ${pct(ret, 2)} | ${pct(benchRet, 2)} |
| Max drawdown | ${pct(-dd)} | ${pct(-benchDD)} |

## Go-live bar

${verdictText}

| Check | Needed | Now | |
|---|---|---|:-:|
${checks.map((c) => `| ${c.join(' | ')} |`).join('\n')}

## Open positions

${open.length ? `| Coin | Quantity | Entry | Now | Value | Unrealised P&L | Opened (UTC) |\n|---|---:|---:|---:|---:|---:|---|\n${open.join('\n')}` : 'None. All cash.'}

## Trades so far

${s.closed} closed · ${(s.winRate * 100).toFixed(0)}% won · profit factor ${pf(s.profitFactor)} · average win ${usd(s.avgWin)} · average loss ${usd(s.avgLoss)} · fees ${usd(s.fees)}

${recent.length ? `| Time (UTC) | Coin | Action | Price | P&L | Reason |\n|---|---|---|---:|---:|---|\n${recent.join('\n')}` : 'No decisions yet. The bot waits for the next crossover.'}

Full history: [\`ledger.csv\`](ledger.csv) · equity every tick: [\`equity.csv\`](equity.csv) · backtest: [${g.backtest.link.split('/').pop()}](${g.backtest.link})
`);
  return { bot, state, status, equity, bench, ret, benchRet, dd, benchDD, closed: s.closed, verdict, reviewOn };
}

export function writeOverview(snaps: Snapshot[]) {
  const label = { pass: '✅ passes', fail: '❌ fails', early: '⏳ too early' };
  const rows = snaps.map((s) => `| [${s.bot.name}](${s.bot.dir}/REPORT.md) | ${dt(s.state.startedAt).slice(0, 10)} | ${usd(s.equity)} | **${pct(s.ret, 2)}** | ${pct(s.benchRet, 2)} | ${pct(-s.dd)} | ${s.closed} | ${s.status === 'running' ? (s.state.halted ? 'halted' : 'running') : s.status} | ${label[s.verdict]} (review ${s.reviewOn}) |`);
  writeFileSync('REPORT.md', `# Paper trading: two bots

Updated ${dt(Math.floor(Date.now() / 1000))} UTC. Paper money only. Each bot started with $10,000 and is compared with simply buying the same three coins and holding.

| Bot | Started | Equity | Return | Buy & hold | Max drawdown | Closed trades | Status | Go-live bar |
|---|---|---:|---:|---:|---:|---:|---|---|
${rows.join('\n')}

Why there are two: Bot A copies the strategy from the guide. Its backtest lost money after realistic fees ([backtest](backtest/BACKTEST.md)). Bot B is the winner of three improvements that were [written down before testing](CANDIDATES.md) ([results](backtest/CANDIDATES.md)).
`);
}
