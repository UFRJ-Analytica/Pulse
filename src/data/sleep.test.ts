import { describe, expect, it } from 'vitest';
import { normalizeOsdr } from './adapters/osdr';

const context = { missionId: 'demo', timestamp: '2026-01-01T00:00:00Z', synthetic: true };
const sample = { indicatorId: 'O06', value: 7.4, unit: 'h', collectionDate: context.timestamp, baseline: 8, context: 'Autorreferido' };

describe('horas de sono', () => {
  it('preserva duração e baseline e classifica pela recomendação de 7 h', () => {
    const record = normalizeOsdr([sample], context).O06;
    expect(record).toMatchObject({ value: 7.4, baseline: 8, status: 'estimated', state: 'normal', synthetic: true });
    expect(normalizeOsdr([{ ...sample, value: 6.5 }], context).O06.state).toBe('observation');
  });

  it('usa as noites anteriores para detectar uma semana de déficit', () => {
    const week = { ...sample, value: 5.8, history: [5.9, 5.5, 5.7, 5.6, 5.9, 5.4] };
    const record = normalizeOsdr([week], context).O06;
    expect(record).toMatchObject({ state: 'attention' });
    expect(record.vital?.escalation).toBe('flight-surgeon');
    expect(record.note).toContain('Menos de 6 h por uma semana');
  });

  it('rejeita duração fora de 0–24 h ou unidade incompatível', () => {
    for (const bad of [{ ...sample, value: -1 }, { ...sample, value: 25 }, { ...sample, unit: 'min' }]) {
      expect(normalizeOsdr([bad], context).O06).toMatchObject({ value: null, status: 'invalid', state: 'no-data' });
    }
  });

  it('mantém ausência de coleta e baseline inválido explícitos', () => {
    expect(normalizeOsdr([], context).O06).toMatchObject({ value: null, status: 'missing', state: 'no-data' });
    expect(normalizeOsdr([{ ...sample, baseline: 30 }], context).O06.baseline).toBeNull();
  });
});
