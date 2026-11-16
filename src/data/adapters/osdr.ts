import { normalizeRecord } from './common';
import { finiteNumber } from '../formulas';
import type { AdapterContext } from './common';
import { assessVital } from '../vitals';
import { vitalNote, vitalState } from './vitals';
import type { IndicatorRecord } from '../types';
export const CONFOUNDERS = ['Microgravidade', 'Duração da missão', 'Exercício', 'Nutrição', 'Sono', 'Hidratação'];
export interface BiologicalSample {
  indicatorId: string;
  value: unknown;
  unit: string;
  collectionDate: string;
  baseline: number | null;
  biologicalDelay?: string;
  context: string;
  uncertainty?: string;
  confounders?: string[];
  // Previous values in chronological order (used for O06, where sleep debt builds over consecutive nights).
  history?: number[];
}
/** Study/sample adapter, deliberately separate from real-time instrument telemetry. */
export function normalizeOsdr(samples: BiologicalSample[], context: AdapterContext): Record<string, IndicatorRecord> {
  return Object.fromEntries(['O01', 'O02', 'O03', 'O04', 'O05', 'O06', 'O07'].map((id) => {
    const sample = samples.find((candidate) => candidate.indicatorId === id);
    const baseline = finiteNumber(sample?.baseline);
    const sleepValue = finiteNumber(sample?.value);
    const invalidSleep = id === 'O06' && sample != null && (sample.unit !== 'h' || (sleepValue !== null && (sleepValue < 0 || sleepValue > 24)));
    const sleepBaseline = baseline !== null && (baseline < 0 || baseline > 24) ? null : baseline;
    const sleep = id === 'O06' && sample && !invalidSleep
      ? assessVital('sleep-hours', { value: sample.value }, { baseline: sleepBaseline, history: (sample.history ?? []).map(value => ({ value })) })
      : null;
    return [id, normalizeRecord(id, sample?.value ?? null, { ...context, timestamp: sample?.collectionDate ?? null }, {
      baseline: id === 'O06' ? sleepBaseline : baseline, collectionDate: sample?.collectionDate,
      biologicalDelay: sample?.biologicalDelay ?? 'Atraso não caracterizado para esta medida',
      confounders: sample?.confounders?.length ? sample.confounders : [...CONFOUNDERS], context: sample?.context ?? 'Sem coleta vinculada à missão ou experimento',
      uncertainty: sample?.uncertainty ?? 'Variabilidade biológica e analítica não quantificada',
      ...(sample ? { unit: sample.unit } : {}),
      ...(id === 'O06' && sample ? { status: invalidSleep ? 'invalid' as const : 'estimated' as const, state: sleep ? vitalState(sleep) : 'observation' as const } : {}),
      ...(sleep ? { vital: sleep } : {}),
      note: id === 'O06' && sample ? `Sono autorreferido em coleta longitudinal. Não há dados conectados de actigrafia ou estágios de sono. ${sleep ? vitalNote(sleep) : ''}`.trim() : sample ? `Coleta longitudinal; baseline individual ${baseline === null ? 'não disponível; comparação não calculável' : 'disponível'}. Confundidores não ajustados quantitativamente.` : 'Sem coleta válida: não inferir biomarcador a partir de dose ou eventos solares.',
    })];
  }));
}
