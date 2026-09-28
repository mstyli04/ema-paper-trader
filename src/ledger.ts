import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { TradeEvent } from './types.ts';

const LEDGER_HEAD = 'time_utc,symbol,action,price,qty,notional,fee,pnl,reason,cash_after,equity_after';
export const EQUITY_HEAD = 'time_utc,equity,cash,buy_and_hold,btc,eth,sol,halted';

const iso = (t: number) => new Date(t * 1000).toISOString().replace('.000Z', 'Z');
const q = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

export function appendRows(file: string, head: string, rows: string[]) {
  if (!existsSync(file)) writeFileSync(file, head + '\n');
  if (rows.length) appendFileSync(file, rows.join('\n') + '\n');
}

export function ledgerRow(e: TradeEvent): string {
  return [iso(e.t), e.symbol, e.action, e.price.toFixed(4), e.qty.toFixed(8), e.notional.toFixed(2), e.fee.toFixed(2),
    e.pnl === null ? '' : e.pnl.toFixed(2), q(e.reason), e.cashAfter.toFixed(2), e.equityAfter.toFixed(2)].join(',');
}

export function parseCsv(file: string): Record<string, string>[] {
  if (!existsSync(file)) return [];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQ = false;
  const text = readFileSync(file, 'utf8');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cell += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

export function eventsFromLedger(file: string): TradeEvent[] {
  return parseCsv(file).map((r) => ({
    t: Date.parse(r.time_utc) / 1000,
    symbol: r.symbol,
    action: r.action as TradeEvent['action'],
    price: +r.price, qty: +r.qty, notional: +r.notional, fee: +r.fee,
    pnl: r.pnl === '' ? null : +r.pnl,
    reason: r.reason, cashAfter: +r.cash_after, equityAfter: +r.equity_after,
  }));
}
