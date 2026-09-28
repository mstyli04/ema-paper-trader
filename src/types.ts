export interface Candle { t: number; o: number; h: number; l: number; c: number; v: number }

export interface Params {
  symbols: string[];
  fast: number;
  slow: number;
  feeRate: number;
  slippage: number;
  maxDrawdown: number;
  // Optional extras used by Bot B. Leaving them unset gives Bot A's behaviour.
  barSeconds?: number;
  orderType?: 'market' | 'limit';
  makerFee?: number;
  limitOffset?: number;
  trendSma?: number;
  volTarget?: number;
  volLookback?: number;
  barsPerYear?: number;
}

export interface Position { qty: number; entryPrice: number; entryTime: number; costBasis: number }

export interface State {
  version: 1;
  startedAt: number;
  startEquity: number;
  cash: number;
  positions: Record<string, Position | null>;
  lastProcessed: Record<string, number>;
  lastPrice: Record<string, number>;
  peakEquity: number;
  halted: boolean;
  haltReason: string | null;
  benchmarkStart: Record<string, number>;
  lastRunAt: number;
  lastDailySummary: string | null;
}

export type Action = 'BUY' | 'SELL' | 'SKIP';

export interface TradeEvent {
  t: number;
  symbol: string;
  action: Action;
  price: number;
  qty: number;
  notional: number;
  fee: number;
  pnl: number | null;
  reason: string;
  cashAfter: number;
  equityAfter: number;
}

export interface CurvePoint { t: number; equity: number }
