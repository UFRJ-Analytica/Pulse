import { normalizeRecord, type AdapterContext } from './common';
import { INDICATOR_BY_ID } from '../catalog';
import { finiteNumber } from '../formulas';
import { VITAL_INDICATOR_IDS, assessVital } from '../vitals';
import type { AssessOptions, MeasurementContext, VitalAssessment, VitalId } from '../vitals';
import type { DataStatus, IndicatorRecord, SignalState } from '../types';

export interface VitalInput {
  value: unknown;
  unit: string;
  // Diastolic pressure for blood-pressure.
  secondary?: unknown;
  measurement?: MeasurementContext;
}

export interface VitalOptions extends AssessOptions {
  status?: DataStatus;
  // Text shown before the classification note, e.g. the nature of the reading.
  notePrefix?: string;
  extra?: Partial<IndicatorRecord>;
}

/** Inspector note derived from the classification, in Portuguese like the rest of the data layer. */
export function vitalNote(assessment: VitalAssessment): string {
  if (assessment.reason === 'insufficient-context') return 'Interpretação indisponível: falta contexto da medição (atividade, jejum ou linha de base).';
  const finding = assessment.findings[0];
  if (!finding) return 'Dentro da referência para o contexto informado.';
  return `${finding.label['pt-BR']}. ${finding.action['pt-BR']}`;
}

/** A readable value with data but no interpretation keeps the current 'observation' state, not 'no-data'. */
export function vitalState(assessment: VitalAssessment): SignalState {
  return assessment.reason === 'insufficient-context' ? 'observation' : assessment.state;
}

export function normalizeVital(vitalId: VitalId, input: VitalInput, context: AdapterContext, options: VitalOptions = {}): IndicatorRecord {
  const id = VITAL_INDICATOR_IDS[vitalId];
  const assessment = assessVital(vitalId, { value: input.value, secondary: input.secondary, context: input.measurement }, options);
  const missing = input.value === null || input.value === undefined;
  const invalid = !missing && (input.unit !== INDICATOR_BY_ID[id].unit || assessment.reason === 'invalid');
  const baseline = Array.isArray(options.baseline) ? null : options.baseline ?? null;
  const record = normalizeRecord(id, input.value, context, {
    baseline, ...options.extra,
    status: invalid ? 'invalid' : options.status ?? 'measured',
    state: vitalState(assessment),
  });
  if (record.status === 'missing' || record.status === 'invalid') return record;
  const note = [options.notePrefix, vitalNote(assessment)].filter(Boolean).join(' ');
  return {
    ...record, note, vital: assessment,
    // Blood pressure is shown as systolic/diastolic.
    ...(vitalId === 'blood-pressure' ? { value: `${record.value}/${finiteNumber(input.secondary)}` } : {}),
  };
}
