import { doseTrend, integrateDose, letSummary, nonNegative, totalDose, validTimestamp } from '../formulas';
import { normalizeRecord } from './common';
import type { AdapterContext } from './common';
import type { IndicatorRecord } from '../types';
export interface RadSample {
  timestamp: string;
  Dose_B_uGy_h: unknown;
  Dose_E_uGy_h: unknown;
  LET_Energy_Centers: unknown;
  LET_Counts: unknown;
  detector?: string;
}
export interface RadOptions {
  /** Explicit validation of complementary, synchronized and non-overlapping channels. */
  channelsValidated: boolean;
  baselineSamples: number[];
  maxGapHours?: number;
}
export function normalizeRad(samples: RadSample[], context: AdapterContext, options: RadOptions): Record<string, IndicatorRecord> {
  const latest = samples.at(-1);
  const current = { ...context, timestamp: latest?.timestamp ?? context.timestamp };
  const b = nonNegative(latest?.Dose_B_uGy_h);
  const e = nonNegative(latest?.Dose_E_uGy_h);
  const spectrum = letSummary(latest?.LET_Energy_Centers, latest?.LET_Counts);
  const total = totalDose(b, e, options.channelsValidated);
  // A repeated timestamp or long gap cannot count as persistent exposure.
  const trendValues: (number | null)[] = [];
  samples.forEach((sample, index) => {
    const timestamp = validTimestamp(sample.timestamp);
    const previous = index ? validTimestamp(samples[index - 1].timestamp) : null;
    const deltaHours = timestamp && previous ? (Date.parse(timestamp) - Date.parse(previous)) / 3_600_000 : null;
    if (index && (deltaHours === null || deltaHours <= 0 || deltaHours > (options.maxGapHours ?? 3))) trendValues.push(null);
    trendValues.push(timestamp ? nonNegative(sample.Dose_B_uGy_h) : null);
  });
  const trend = doseTrend(trendValues, options.baselineSamples);
  const accumulated = integrateDose(samples.map((sample) => ({ timestamp: sample.timestamp, value: nonNegative(sample.Dose_B_uGy_h) })), options.maxGapHours);
  const detector = latest?.detector ?? 'Detector não informado';
  const base = { detector, uncertainty: 'Incerteza instrumental não fornecida' };
  const invalidIfPresent = (raw: unknown, parsed: number | null) => parsed === null && raw !== null && raw !== undefined ? 'invalid' as const : undefined;
  const records: Record<string, IndicatorRecord> = {
    R01: normalizeRecord('R01', b, current, { ...base, status: invalidIfPresent(latest?.Dose_B_uGy_h, b), channel: 'B', baseline: trend?.baseline, state: trend?.state }),
    R02: normalizeRecord('R02', e, current, { ...base, status: invalidIfPresent(latest?.Dose_E_uGy_h, e), channel: 'E' }),
    R03: normalizeRecord('R03', total, current, { ...base, status: total === null ? 'missing' : 'estimated', note: options.channelsValidated ? 'Soma exploratória de canais explicitamente validados.' : 'Soma bloqueada: complementaridade dos canais B e E não validada.' }),
    R04: normalizeRecord('R04', spectrum?.mean ?? null, current, { ...base, status: 'estimated', note: 'Média ponderada por contagens; não localização anatômica.' }),
    R05: normalizeRecord('R05', spectrum ? spectrum.highFraction * 100 : null, current, { ...base, status: 'estimated', note: 'Fração >100 keV/µm apresentada em %. Não gera estado crítico isoladamente.' }),
    R06: normalizeRecord('R06', spectrum?.qWeighted ?? null, current, { ...base, status: 'proxy', note: 'Q provisório, ponderado por contagens. Não é calibração radiobiológica.' }),
    R07: normalizeRecord('R07', total !== null && spectrum ? total * spectrum.qWeighted : null, current, { ...base, status: 'proxy', note: total === null ? 'Proxy bloqueado: a dose total não foi validada.' : 'Proxy exploratório; não é sievert oficial nem dose clínica.' }),
    R08: normalizeRecord('R08', accumulated.dose, { ...current, quality: context.quality === 'invalid' ? 'invalid' : accumulated.complete ? context.quality : 'partial' }, { ...base, status: 'estimated', channel: 'B', note: `${accumulated.coveredHours} h cobertas, somente canal B. ${accumulated.complete ? 'Janela sem lacunas.' : 'Acumulação parcial: lacunas não interpoladas.'} Fase: habitat. Trânsito, superfície e EVA: sem dosimetria segmentada.` }),
    R09: normalizeRecord('R09', trend?.percent ?? null, current, { ...base, status: 'estimated', baseline: trend?.baseline, delta: trend?.delta, persistence: trend?.persistence ?? 0, state: trend?.state, note: 'Limiar demonstrativo: +20% do baseline por ≥3 amostras consecutivas; não limite clínico.' }),
  };
  return records;
}
