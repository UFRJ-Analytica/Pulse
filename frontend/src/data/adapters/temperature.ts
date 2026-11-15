import { normalizeVital } from './vitals';
import type { AdapterContext } from './common';
import type { AssessOptions, MeasurementContext } from '../vitals';
import type { IndicatorRecord } from '../types';

/** A single central-temperature estimate, not a spatial thermal measurement. */
export function normalizeTemperature(value: unknown, unit: string, context: AdapterContext, measurement?: MeasurementContext, options: AssessOptions = {}): IndicatorRecord {
  return normalizeVital('core-temperature', { value, unit, measurement }, context, {
    ...options, status: 'estimated',
    notePrefix: 'Temperatura central estimada em cenário sintético; não há sensor conectado.',
    extra: { uncertainty: 'Não quantificada; leitura demonstrativa' },
  });
}

/** Continuous display scale only, not clinical severity. */
export function temperatureColor(value: number): string {
  const t = Math.max(0, Math.min(1, (value - 35) / 5));
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t).toString(16).padStart(2, '0');
  return `#${mix(49, 230)}${mix(150, 73)}${mix(194, 47)}`;
}
