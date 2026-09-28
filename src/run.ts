import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { BAR_SECONDS, LIVE_WINDOW_HOURS, PARAMS, START_EQUITY } from './config.ts';
import { aggregate, fetchHourly } from './data.ts';
import { equityOf, newState, step } from './engine.ts';
import { appendRows, EQUITY_HEAD, ledgerRow } from './ledger.ts';
import { pct, usd } from './metrics.ts';
import { telegram } from './notify.ts';
import { writeReport } from './report.ts';
import type { Candle, State } from './types.ts';

const STATE_FILE = 'data/state.json';
const now = Math.floor(Date.now() / 1000);
mkdirSync('data', { recursive: true });

const state: State = existsSync(STATE_FILE)
  ? JSON.parse(readFileSync(STATE_FILE, 'utf8'))
  : newState(START_EQUITY, now);

if (existsSync('STOP')) {
  console.log('STOP file present: skipping this tick.');
  writeReport(state, state.lastPrice, 'stopped');
  process.exit(0);
}

const bars: Record<string, Candle[]> = {};
const marks: Record<string, number> = {};
for (const sym of PARAMS.symbols) {
  const hourly = await fetchHourly(sym, now - LIVE_WINDOW_HOURS * 3600, now + 3600);
  const newest = hourly[hourly.length - 1];
  if (!newest || now - newest.t > 3 * 3600) {
    throw new Error(`Stale data for ${sym}: newest candle ${newest ? new Date(newest.t * 1000).toISOString() : 'none'}. Nothing was traded.`);
  }
  bars[sym] = aggregate(hourly, BAR_SECONDS);
  marks[sym] = newest.c;
}

const firstRun = Object.keys(state.benchmarkStart).length === 0;
if (firstRun) state.benchmarkStart = { ...marks };
const wasHalted = state.halted;

const { events } = step(state, bars, PARAMS);
Object.assign(state.lastPrice, marks);

const equity = equityOf(state, marks);
const rel = PARAMS.symbols.map((s) => marks[s] / state.benchmarkStart[s]);
const bench = state.startEquity * (rel.reduce((a, b) => a + b, 0) / rel.length);

appendRows('data/ledger.csv', 'time_utc,symbol,action,price,qty,notional,fee,pnl,reason,cash_after,equity_after', events.map(ledgerRow));
appendRows('data/equity.csv', EQUITY_HEAD, [[
  new Date(now * 1000).toISOString().replace(/\.\d+Z$/, 'Z'), equity.toFixed(2), state.cash.toFixed(2), bench.toFixed(2),
  ...PARAMS.symbols.map((s) => marks[s].toFixed(4)), state.halted ? 'yes' : 'no',
].join(',')]);

state.lastRunAt = now;
writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
writeReport(state, marks, 'running');

const summary = `Equity ${usd(equity)} (${pct(equity / state.startEquity - 1, 2)}) · buy & hold ${pct(bench / state.startEquity - 1, 2)}`;
console.log(`${firstRun ? 'First run: bot started. ' : ''}${events.length} decision(s). ${summary}`);
for (const e of events) console.log(`  ${e.action} ${e.symbol} @ ${usd(e.price)}${e.pnl !== null ? ` P&L ${usd(e.pnl)}` : ''}`);

if (firstRun) await telegram(`📄 Paper bot started with ${usd(state.startEquity)} of paper money. It waits for the next EMA crossover.`);
for (const e of events) {
  await telegram(`${e.action === 'BUY' ? '🟢' : e.action === 'SELL' ? '🔴' : '⚪'} PAPER ${e.action} ${e.symbol} @ ${usd(e.price)}` +
    `${e.pnl !== null ? `\nP&L ${usd(e.pnl)}` : ''}\n${e.reason}\n${summary}`);
}
if (state.halted && !wasHalted) await telegram(`⛔ Entries halted: ${state.haltReason}`);
const today = new Date(now * 1000).toISOString().slice(0, 10);
if (state.lastDailySummary !== today && new Date(now * 1000).getUTCHours() >= 7) {
  state.lastDailySummary = today;
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
  await telegram(`☀️ Daily check-in: bot is alive.\n${summary}`);
}
