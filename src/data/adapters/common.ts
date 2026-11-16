import { INDICATOR_BY_ID } from '../catalog';
import { finiteNumber, validTimestamp } from '../formulas';
import { FORMULA_VERSION } from '../types';
import type { DataStatus, IndicatorRecord, Quality, SignalState } from '../types';

export interface AdapterContext {
  missionId: string | null;
  timestamp: string | null;
  synthetic?: boolean;
  quality?: Quality;
}
export function normalizeRecord(id: string, input: unknown, context: AdapterContext, extra: Partial<IndicatorRecord> = {}): IndicatorRecord {
  const definition = INDICATOR_BY_ID[id];
  if (!definition) throw new Error(`Unknown indicator: ${id}`);
  const missing = input === null || input === undefined;
  const parsed = finiteNumber(input);
  const timestamp = validTimestamp(context.timestamp);
  let status: DataStatus = extra.status === 'invalid' ? 'invalid' : missing ? 'missing' : parsed === null ? 'invalid' : extra.status ?? 'measured';
  if (!timestamp && !missing) status = 'invalid';
  if (context.quality === 'invalid' && !missing) status = 'invalid';
  const state: SignalState = status === 'missing' || status === 'invalid' || context.quality === 'delayed' ? 'no-data' : extra.state ?? 'normal';
  const value = status === 'invalid' || status === 'missing' ? null : parsed;
  return {
    id, unit: definition.unit, source: definition.source,
    timestamp, timezone: timestamp ? 'UTC' : null, missionId: context.missionId,
    uncertainty: 'Não quantificada', formulaVersion: FORMULA_VERSION,
    quality: context.quality ?? (status === 'invalid' ? 'invalid' : status === 'missing' ? 'partial' : 'valid'),
    synthetic: context.synthetic ?? false, sourceUrl: definition.sourceUrl,
    ...extra, value, status, state,
  };
}
