import type { SignalState } from './types';

export function finiteNumber(value: unknown): number | null {
  if (value === null || value === undefined || typeof value === 'boolean' || (typeof value === 'string' && value.trim() === '')) return null;
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
export function nonNegative(value: unknown): number | null {
  const result = finiteNumber(value);
  return result !== null && result >= 0 ? result : null;
}
export function validTimestamp(value: unknown): string | null {
  if (typeof value !== 'string' || !/T.*(?:Z|[+-]\d{2}:?\d{2})$/.test(value)) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}
export function qualityFactor(letValue: number): number | null {
  if (!Number.isFinite(letValue) || letValue < 0) return null;
  return letValue < 10 ? 1 : letValue <= 100 ? 0.32 * letValue - 2.2 : 300 / Math.sqrt(letValue);
}
export function letSummary(centers: unknown, counts: unknown): { mean: number; highFraction: number; qWeighted: number } | null {
  if (!Array.isArray(centers) || !Array.isArray(counts) || !centers.length || centers.length !== counts.length) return null;
  const ls = centers.map(nonNegative);
  const ns = counts.map(nonNegative);
  if (ls.some((x) => x === null) || ns.some((x) => x === null)) return null;
  const values = ls as number[];
  const weights = ns as number[];
  const total = weights.reduce((sum, count) => sum + count, 0);
  if (total <= 0 || !Number.isFinite(total)) return null;
  const result = {
    mean: values.reduce((sum, value, index) => sum + value * weights[index], 0) / total,
    highFraction: values.reduce((sum, value, index) => sum + (value > 100 ? weights[index] : 0), 0) / total,
    qWeighted: values.reduce((sum, value, index) => sum + qualityFactor(value)! * weights[index], 0) / total,
  };
  return Object.values(result).every(Number.isFinite) ? result : null;
}
export function totalDose(b: number | null, e: number | null, channelsValidated: boolean): number | null {
  if (!channelsValidated || b === null || e === null || nonNegative(b) === null || nonNegative(e) === null) return null;
  const total = b + e;
  return Number.isFinite(total) ? total : null;
}
export function median(values: number[]): number | null {
  if (!values.length || values.some((value) => !Number.isFinite(value))) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
export function doseTrend(values: (number | null)[], baselineSamples: number[]): { percent: number; delta: number; baseline: number; persistence: number; state: SignalState } | null {
  if (baselineSamples.some(value => nonNegative(value) === null)) return null;
  const baseline = median(baselineSamples);
  const current = values.at(-1);
  if (baseline === null || baseline <= 0 || current === null || current === undefined || nonNegative(current) === null) return null;
  const percent = (current / baseline - 1) * 100;
  if (!Number.isFinite(percent)) return null;
  let persistence = 0;
  for (let index = values.length - 1; index >= 0; index--) {
    const value = values[index];
    if (value === null || !Number.isFinite(value) || value <= baseline * 1.2) break;
    persistence++;
  }
  return { percent, delta: current - baseline, baseline, persistence, state: persistence >= 3 ? 'attention' : percent > 20 ? 'observation' : 'normal' };
}
export function integrateDose(samples: { timestamp: string; value: number | null }[], maxGapHours = 3): { dose: number | null; coveredHours: number; complete: boolean } {
  if (samples.length < 2) return { dose: null, coveredHours: 0, complete: false };
  let dose = 0;
  let coveredHours = 0;
  let complete = true;
  for (let index = 1; index < samples.length; index++) {
    const previous = samples[index - 1];
    const current = samples[index];
    const previousTime = validTimestamp(previous.timestamp), currentTime = validTimestamp(current.timestamp);
    const duration = previousTime && currentTime ? (Date.parse(currentTime) - Date.parse(previousTime)) / 3_600_000 : NaN;
    if (!Number.isFinite(duration) || duration <= 0 || duration > maxGapHours || previous.value === null || current.value === null || nonNegative(previous.value) === null || nonNegative(current.value) === null) {
      complete = false;
      continue;
    }
    dose += previous.value * duration;
    coveredHours += duration;
  }
  return { dose: coveredHours && Number.isFinite(dose) ? dose : null, coveredHours, complete: complete && Number.isFinite(dose) };
}
export function isHighEnergy(channel: string): boolean {
  return /(?:>=?|≥)\s*100\s*MeV|100\s*\+\s*MeV/i.test(channel);
}
export function environmentalScore(count24h: number, highEnergy: boolean, context: boolean, notification: boolean) {
  const components = [
    { label: 'Frequência SEP · 8 pontos/registro', value: Math.min(40, Math.max(0, count24h) * 8) },
    { label: 'Canal de alta energia', value: highEnergy ? 25 : 0 },
    { label: 'Flare / CME relacionado', value: context ? 20 : 0 },
    { label: 'Notificação operacional', value: notification ? 15 : 0 },
  ];
  const score = components.reduce((sum, component) => sum + component.value, 0);
  return { score, components, state: score >= 75 ? 'critical' : score >= 50 ? 'attention' : score >= 25 ? 'observation' : 'normal' } as { score: number; components: typeof components; state: SignalState };
}
