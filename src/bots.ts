import { BAR_SECONDS, LIVE_WINDOW_HOURS, PARAMS } from './config.ts';
import { CANDIDATES } from './candidates-def.ts';
import { aggregate, fetchDaily, fetchHourly } from './data.ts';
import type { Candle, Params } from './types.ts';

export interface GoLive {
  reviewDays: number;
  minTrades: number;
  // Drawdown must stay under this absolute limit, or under this fraction of buy & hold's.
  maxDD?: number;
  maxDDvsBench?: number;
  mustBeatBench: boolean;
  backtest: { file: string; label: string; link: string; read: (json: any) => { now: string; pass: boolean } };
}

export interface Bot {
  id: string;
  name: string;
  rules: string;
  dir: string;
  params: Params;
  goLive: GoLive;
  // Candles for every symbol (last one may be in progress) plus the latest price.
  fetch: (sym: string, now: number) => Promise<{ bars: Candle[]; mark: number }>;
}

const DAY = 86400;
const pctS = (x: number) => `${x > 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;

export const BOTS: Bot[] = [
  {
    id: 'ema-4h',
    name: 'Bot A: EMA 9/21 on 4-hour candles',
    rules: 'EMA 9/21 crossover on 4-hour candles; market orders at the next open (0.40% fee + 0.05% slippage); ⅓ of equity per coin; entries halt at a 15% drawdown.',
    dir: 'bots/ema-4h',
    params: PARAMS,
    goLive: {
      reviewDays: 30,
      minTrades: 15,
      maxDD: 0.15,
      mustBeatBench: true,
      backtest: {
        file: 'backtest/summary.json',
        label: 'Backtest out-of-sample beat buy & hold',
        link: '../../backtest/BACKTEST.md',
        read: (s) => ({ now: `${pctS(s.outOfSample.ret)} vs ${pctS(s.outOfSample.benchRet)}`, pass: s.outOfSample.beatBenchmark }),
      },
    },
    fetch: async (sym, now) => {
      const hourly = await fetchHourly(sym, now - LIVE_WINDOW_HOURS * 3600, now + 3600);
      const newest = hourly[hourly.length - 1];
      if (!newest || now - newest.t > 3 * 3600) throw new Error(`Stale hourly data for ${sym}`);
      return { bars: aggregate(hourly, BAR_SECONDS), mark: newest.c };
    },
  },
  {
    id: 'ema-daily',
    name: 'Bot B: EMA 9/21 on daily candles, limit orders',
    rules: 'Pre-registered candidate B1 (see CANDIDATES.md): EMA 9/21 crossover on daily candles; limit order 0.10% better than the next open (0.25% maker fee), or chase at that day\'s close (0.40% + 0.05%) if it doesn\'t fill; ⅓ of equity per coin; entries halt at a 25% drawdown.',
    dir: 'bots/ema-daily',
    params: CANDIDATES.find((c) => c.id === 'B1')!.params,
    goLive: {
      reviewDays: 90,
      minTrades: 4,
      maxDDvsBench: 0.5,
      mustBeatBench: false,
      backtest: {
        file: 'backtest/bot-b-summary.json',
        label: 'Backtest out-of-sample return ÷ drawdown beat buy & hold',
        link: '../../backtest/CANDIDATES.md',
        read: (s) => ({ now: `${s.outOfSample.score.toFixed(2)} vs ${s.outOfSample.benchScore.toFixed(2)}`, pass: s.outOfSample.beatBenchmark }),
      },
    },
    fetch: async (sym, now) => {
      const days = await fetchDaily(sym, now - 300 * DAY, now + DAY);
      const newest = days[days.length - 1];
      if (!newest || now - newest.t > 2 * DAY) throw new Error(`Stale daily data for ${sym}`);
      return { bars: days, mark: newest.c };
    },
  },
];
