export function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out = new Array<number>(values.length);
  let prev = values[0];
  for (let i = 0; i < values.length; i++) {
    prev = i === 0 ? values[0] : values[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

export function sma(values: number[], period: number): number[] {
  const out = new Array<number>(values.length).fill(NaN);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

// Annualised standard deviation of log returns over the trailing `lookback` bars.
export function rollingVol(values: number[], lookback: number, barsPerYear: number): number[] {
  const out = new Array<number>(values.length).fill(NaN);
  const r = values.map((v, i) => (i ? Math.log(v / values[i - 1]) : 0));
  for (let i = lookback; i < values.length; i++) {
    const w = r.slice(i - lookback + 1, i + 1);
    const m = w.reduce((a, b) => a + b, 0) / lookback;
    const v = w.reduce((a, b) => a + (b - m) ** 2, 0) / (lookback - 1);
    out[i] = Math.sqrt(v * barsPerYear);
  }
  return out;
}
