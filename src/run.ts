import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { START_EQUITY } from './config.ts';
import { BOTS } from './bots.ts';
import { equityOf, newState, step } from './engine.ts';
import { appendRows, EQUITY_HEAD, ledgerRow } from './ledger.ts';
import { pct, usd } from './metrics.ts';
import { telegram } from './notify.ts';
import { writeBotReport, writeOverview, type Snapshot } from './report.ts';
import type { Candle, State } from './types.ts';

const LEDGER_HEAD = 'time_utc,symbol,action,price,qty,notional,fee,pnl,reason,cash_after,equity_after';
const now = Math.floor(Date.now() / 1000);
const stopped = existsSync('STOP');
const snaps: Snapshot[] = [];
const failures: string[] = [];

for (const bot of BOTS) {
  mkdirSync(bot.dir, { recursive: true });
  const stateFile = `${bot.dir}/state.json`;
  const state: State = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : newState(START_EQUITY, now);
  const short = bot.name.split(':')[0];

  if (stopped) {
    console.log(`${short}: STOP file present, skipping.`);
    snaps.push(writeBotReport(bot, state, state.lastPrice, 'stopped'));
    continue;
  }

  try {
    const bars: Record<string, Candle[]> = {};
    const marks: Record<string, number> = {};
    for (const sym of bot.params.symbols) {
      const got = await bot.fetch(sym, now);
      bars[sym] = got.bars;
      marks[sym] = got.mark;
    }

    const firstRun = Object.keys(state.benchmarkStart).length === 0;
    if (firstRun) state.benchmarkStart = { ...marks };
    const wasHalted = state.halted;
    const { events } = step(state, bars, bot.params);
    Object.assign(state.lastPrice, marks);

    const equity = equityOf(state, marks);
    const rel = bot.params.symbols.map((s) => marks[s] / state.benchmarkStart[s]);
    const bench = state.startEquity * (rel.reduce((a, b) => a + b, 0) / rel.length);
    appendRows(`${bot.dir}/ledger.csv`, LEDGER_HEAD, events.map(ledgerRow));
    appendRows(`${bot.dir}/equity.csv`, EQUITY_HEAD, [[
      new Date(now * 1000).toISOString().replace(/\.\d+Z$/, 'Z'), equity.toFixed(2), state.cash.toFixed(2), bench.toFixed(2),
      ...bot.params.symbols.map((s) => marks[s].toFixed(4)), state.halted ? 'yes' : 'no',
    ].join(',')]);
    state.lastRunAt = now;

    const summary = `${short} equity ${usd(equity)} (${pct(equity / state.startEquity - 1, 2)}) · buy & hold ${pct(bench / state.startEquity - 1, 2)}`;
    console.log(`${firstRun ? 'First run. ' : ''}${summary} · ${events.length} decision(s)`);
    for (const e of events) console.log(`  ${e.action} ${e.symbol} @ ${usd(e.price)}${e.pnl !== null ? ` P&L ${usd(e.pnl)}` : ''}`);

    if (firstRun) await telegram(`📄 ${bot.name} started with ${usd(state.startEquity)} of paper money.`);
    for (const e of events) {
      await telegram(`${e.action === 'BUY' ? '🟢' : e.action === 'SELL' ? '🔴' : '⚪'} ${short} PAPER ${e.action} ${e.symbol} @ ${usd(e.price)}` +
        `${e.pnl !== null ? `\nP&L ${usd(e.pnl)}` : ''}\n${e.reason}\n${summary}`);
    }
    if (state.halted && !wasHalted) await telegram(`⛔ ${short} entries halted: ${state.haltReason}`);
    const today = new Date(now * 1000).toISOString().slice(0, 10);
    if (state.lastDailySummary !== today && new Date(now * 1000).getUTCHours() >= 7) {
      state.lastDailySummary = today;
      await telegram(`☀️ Daily check-in: ${summary}`);
    }

    writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n');
    snaps.push(writeBotReport(bot, state, marks, 'running'));
  } catch (err) {
    const msg = `${short} tick failed, nothing was traded: ${(err as Error).message}`;
    console.error(msg);
    failures.push(msg);
    snaps.push(writeBotReport(bot, state, state.lastPrice, 'error'));
  }
}

writeOverview(snaps);
if (failures.length) {
  await telegram(`⚠️ ${failures.join('\n')}`);
  process.exit(1);
}
