import { describe, expect, it } from 'vitest';
import { normalizeTemperature, temperatureColor } from './adapters/temperature';

const context = { missionId: 'demo', timestamp: '2026-01-01T00:00:00Z', synthetic: true };
describe('temperatura central', () => {
  it('preserva a leitura estimada e não interpreta sem contexto de atividade', () => {
    const record = normalizeTemperature(37.4, '°C', context);
    expect(record).toMatchObject({ value: 37.4, unit: '°C', status: 'estimated', state: 'observation', synthetic: true });
    expect(record.vital?.reason).toBe('insufficient-context');
    expect(record.note).toContain('Interpretação indisponível');
  });
  it('classifica a leitura de repouso conforme o dia da missão', () => {
    expect(normalizeTemperature(37.4, '°C', context, { activity: 'rest', missionDay: 42 })).toMatchObject({ state: 'normal' });
    expect(normalizeTemperature(37.7, '°C', context, { activity: 'rest', missionDay: 10 })).toMatchObject({ state: 'attention' });
    expect(normalizeTemperature(38.6, '°C', context, { activity: 'rest', missionDay: 10 }).vital?.escalation).toBe('flight-surgeon');
  });
  it('rejeita entrada inválida e preserva ausência', () => {
    expect(normalizeTemperature(98.6, '°F', context)).toMatchObject({ value: null, status: 'invalid', state: 'no-data' });
    expect(normalizeTemperature(46, '°C', context)).toMatchObject({ value: null, status: 'invalid', state: 'no-data' });
    expect(normalizeTemperature(null, '°C', context)).toMatchObject({ value: null, status: 'missing', state: 'no-data' });
  });
  it('limita a escala visual às cores das extremidades', () => {
    expect(temperatureColor(30)).toBe(temperatureColor(35));
    expect(temperatureColor(45)).toBe(temperatureColor(40));
    expect(temperatureColor(35)).not.toBe(temperatureColor(40));
  });
});
