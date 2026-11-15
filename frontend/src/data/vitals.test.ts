import { describe, expect, it } from 'vitest';
import { INDICATOR_BY_ID } from './catalog';
import { normalizeVital } from './adapters/vitals';
import { VITAL_INDICATOR_IDS, VITAL_REFERENCES, VITAL_SOURCES, assessVital } from './vitals';
import type { VitalId, VitalReading } from './vitals';

const rest = { activity: 'rest' as const };
const fasting = { meal: 'fasting' as const };
const readings = (values: number[], context?: VitalReading['context']): VitalReading[] => values.map(value => ({ value, context }));

describe('sinais vitais · entrada', () => {
  it('separa ausência, valor inválido e falta de contexto', () => {
    expect(assessVital('heart-rate', { value: null, context: rest })).toMatchObject({ state: 'no-data', reason: 'missing' });
    expect(assessVital('heart-rate', { value: 'abc', context: rest })).toMatchObject({ state: 'no-data', reason: 'invalid' });
    expect(assessVital('core-temperature', { value: 46, context: rest })).toMatchObject({ state: 'no-data', reason: 'invalid' });
    expect(assessVital('heart-rate', { value: 72 })).toMatchObject({ state: 'no-data', reason: 'insufficient-context' });
  });

  it('exige diastólica válida e menor que a sistólica', () => {
    expect(assessVital('blood-pressure', { value: 118 })).toMatchObject({ reason: 'invalid' });
    expect(assessVital('blood-pressure', { value: 118, secondary: 130 })).toMatchObject({ reason: 'invalid' });
  });

  it('referencia apenas fontes cadastradas', () => {
    const ids = Object.keys(VITAL_SOURCES);
    for (const reference of Object.values(VITAL_REFERENCES)) expect(reference.sources.every(id => ids.includes(id))).toBe(true);
  });
});

describe('frequência cardíaca', () => {
  it('classifica taquicardia em repouso e escala para o flight surgeon', () => {
    expect(assessVital('heart-rate', { value: 72, context: rest })).toMatchObject({ state: 'normal', findings: [] });
    expect(assessVital('heart-rate', { value: 108, context: rest })).toMatchObject({ state: 'attention', escalation: 'flight-surgeon' });
  });

  it('só escala bradicardia com sintomas', () => {
    expect(assessVital('heart-rate', { value: 38, context: rest }).state).toBe('observation');
    expect(assessVital('heart-rate', { value: 38, context: { activity: 'rest', symptomatic: true } })).toMatchObject({ state: 'attention', escalation: 'flight-surgeon' });
  });

  it('não aplica limiares de repouso ao exercício e usa 140 bpm só em EVA', () => {
    expect(assessVital('heart-rate', { value: 150, context: { activity: 'exercise' } }).state).toBe('normal');
    expect(assessVital('heart-rate', { value: 150, context: { activity: 'eva' } }).state).toBe('attention');
  });

  it('exige três leituras de repouso acima da linha de base', () => {
    const history = readings([70, 75], rest);
    expect(assessVital('heart-rate', { value: 76, context: rest }, { history, baseline: 60 }).state).toBe('normal');
    const sustained = readings([73, 74], rest);
    expect(assessVital('heart-rate', { value: 75, context: rest }, { history: sustained, baseline: 60 }).state).toBe('observation');
    const mixed = [...readings([73], rest), ...readings([140], { activity: 'exercise' }), ...readings([74], rest)];
    expect(assessVital('heart-rate', { value: 75, context: rest }, { history: mixed, baseline: [58, 60, 62] }).state).toBe('observation');
  });
});

describe('pressão arterial', () => {
  const state = (systolic: number, diastolic: number) => assessVital('blood-pressure', { value: systolic, secondary: diastolic }).state;
  it('segue as categorias AHA/ACC pelo componente mais grave', () => {
    expect(state(118, 76)).toBe('normal');
    expect(state(125, 76)).toBe('observation');
    expect(state(118, 85)).toBe('attention');
    expect(state(145, 70)).toBe('attention');
    expect(state(185, 100)).toBe('critical');
  });

  it('trata pressão baixa como dimensão separada e só escala com sintomas', () => {
    const result = assessVital('blood-pressure', { value: 85, secondary: 55 });
    expect(result).toMatchObject({ state: 'observation', escalation: 'none' });
    expect(result.findings).toHaveLength(1);
    expect(assessVital('blood-pressure', { value: 85, secondary: 55, context: { symptomatic: true } }))
      .toMatchObject({ state: 'attention', escalation: 'flight-surgeon' });
    expect(state(150, 55)).toBe('attention');
    expect(assessVital('blood-pressure', { value: 150, secondary: 55 }).findings).toHaveLength(2);
  });
});

describe('temperatura central', () => {
  it('acompanha a febre espacial de repouso, que sobe gradualmente até o dia 75', () => {
    const at = (value: number, missionDay: number) => assessVital('core-temperature', { value, context: { activity: 'rest', missionDay } }).state;
    expect(at(37.6, 0)).toBe('attention');
    expect(at(37.6, 40)).toBe('normal');
    expect(at(37.7, 30)).toBe('attention');
    expect(at(37.7, 120)).toBe('normal');
    expect(at(37.9, 120)).toBe('attention');
  });

  it('marca como críticos os extremos com risco de vida', () => {
    expect(assessVital('core-temperature', { value: 32.5, context: rest }).state).toBe('critical');
    expect(assessVital('core-temperature', { value: 35.5, context: rest }).state).toBe('observation');
  });

  it('usa limiares próprios para exercício', () => {
    expect(assessVital('core-temperature', { value: 38.6, context: rest }).state).toBe('critical');
    expect(assessVital('core-temperature', { value: 38.6, context: { activity: 'exercise' } }).state).toBe('attention');
    expect(assessVital('core-temperature', { value: 40.1, context: { activity: 'exercise' } }).state).toBe('critical');
  });

  it('sinaliza +0,6 °C acima da linha de base, com mais peso em EVA', () => {
    expect(assessVital('core-temperature', { value: 37.3, context: rest }, { baseline: 36.6 }).state).toBe('observation');
    expect(assessVital('core-temperature', { value: 37.3, context: { activity: 'eva' } }, { baseline: 36.6 }).state).toBe('attention');
  });
});

describe('glicemia', () => {
  it('classifica hipoglicemia em qualquer contexto e orienta a regra 15-15', () => {
    const level2 = assessVital('blood-glucose', { value: 48 });
    expect(level2).toMatchObject({ state: 'critical', escalation: 'flight-surgeon' });
    expect(level2.findings[0].action['pt-BR']).toContain('15 g');
    expect(assessVital('blood-glucose', { value: 62 })).toMatchObject({ state: 'attention', escalation: 'crew' });
  });

  it('sem contexto, só deixa de classificar a faixa ambígua de 100 a 140', () => {
    expect(assessVital('blood-glucose', { value: 85 }).state).toBe('normal');
    expect(assessVital('blood-glucose', { value: 128 })).toMatchObject({ state: 'no-data', reason: 'insufficient-context' });
    expect(assessVital('blood-glucose', { value: 150 }).state).toBe('observation');
    expect(assessVital('blood-glucose', { value: 230 }).state).toBe('attention');
  });

  it('separa jejum de leitura pós-refeição', () => {
    expect(assessVital('blood-glucose', { value: 85, context: fasting }).state).toBe('normal');
    expect(assessVital('blood-glucose', { value: 110, context: fasting }).state).toBe('observation');
    expect(assessVital('blood-glucose', { value: 128, context: fasting }).state).toBe('attention');
    expect(assessVital('blood-glucose', { value: 128, context: { meal: 'post-meal' } }).state).toBe('normal');
    expect(assessVital('blood-glucose', { value: 128, context: { meal: 'random' } }).state).toBe('normal');
    expect(assessVital('blood-glucose', { value: 165, context: { meal: 'post-meal' } }).state).toBe('observation');
    expect(assessVital('blood-glucose', { value: 210, context: { meal: 'random' } }).state).toBe('attention');
  });

  it('compara a tendência só entre leituras em jejum', () => {
    const history = [...readings([96, 97], fasting), ...readings([150], { meal: 'post-meal' })];
    expect(assessVital('blood-glucose', { value: 98, context: fasting }, { history, baseline: 77 }).findings.map(f => f.label.en))
      .toContain('Fasting glucose persistently above personal baseline');
  });
});

describe('sono', () => {
  it('diferencia noite curta isolada de uma semana de déficit', () => {
    expect(assessVital('sleep-hours', { value: 7.4 }).state).toBe('normal');
    expect(assessVital('sleep-hours', { value: 6.5 }).state).toBe('observation');
    expect(assessVital('sleep-hours', { value: 5.8 }, { history: readings([5.9, 5.5]) }).state).toBe('observation');
    expect(assessVital('sleep-hours', { value: 5.8 }, { history: readings([5.9, 5.5, 5.7, 5.6, 5.9, 5.4]) }).state).toBe('attention');
    expect(assessVital('sleep-hours', { value: 5.8 }, { history: readings([5.9, 6.5, 5.7, 5.6, 5.9, 5.4]) }).state).toBe('observation');
    expect(assessVital('sleep-hours', { value: 4.5 }).state).toBe('attention');
  });
});

describe('humor', () => {
  it('só avalia em relação ao padrão pessoal e nunca passa de observação', () => {
    expect(assessVital('mood', { value: 3 })).toMatchObject({ state: 'no-data', reason: 'insufficient-context' });
    expect(assessVital('mood', { value: 5 }, { history: readings([5, 5]), baseline: 8 })).toMatchObject({ state: 'observation', escalation: 'none' });
    expect(assessVital('mood', { value: 5 }, { history: readings([8, 7]), baseline: 8 }).state).toBe('normal');
    expect(assessVital('mood', { value: 6.5 }, { history: readings([6.5, 6.5]), baseline: 8 }).state).toBe('normal');
  });
});

describe('resultado', () => {
  it('lista fontes cadastradas para todas as regras disparadas', () => {
    const ids = Object.keys(VITAL_SOURCES);
    const cases: [VitalId, VitalReading][] = [
      ['heart-rate', { value: 108, context: rest }], ['blood-pressure', { value: 185, secondary: 55 }],
      ['core-temperature', { value: 39.5, context: rest }], ['blood-glucose', { value: 48 }], ['sleep-hours', { value: 4 }],
    ];
    for (const [id, reading] of cases) {
      const result = assessVital(id, reading);
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.sources.every(source => ids.includes(source))).toBe(true);
      expect(result.findings[0].state).toBe(result.state);
    }
  });
});

describe('catálogo', () => {
  it('liga cada sinal vital a um indicador existente', () => {
    for (const id of Object.values(VITAL_INDICATOR_IDS)) expect(INDICATOR_BY_ID[id]).toBeDefined();
  });
});

describe('adaptador de sinais vitais', () => {
  const context = { missionId: 'demo', timestamp: '2026-01-01T00:00:00Z', synthetic: true };
  it('grava estado, classificação e nota no registro do catálogo', () => {
    const record = normalizeVital('blood-glucose', { value: 48, unit: 'mg/dL' }, context);
    expect(record).toMatchObject({ id: 'V03', value: 48, status: 'measured', state: 'critical', synthetic: true });
    expect(record.vital?.escalation).toBe('flight-surgeon');
    expect(record.note).toContain('Hipoglicemia nível 2');
  });

  it('mostra a pressão como sistólica/diastólica', () => {
    expect(normalizeVital('blood-pressure', { value: 118, secondary: 76, unit: 'mmHg' }, context)).toMatchObject({ id: 'V02', value: '118/76', state: 'normal' });
  });

  it('mantém o valor visível quando falta contexto, sem marcar como sem dado', () => {
    expect(normalizeVital('blood-glucose', { value: 128, unit: 'mg/dL' }, context)).toMatchObject({ value: 128, state: 'observation' });
  });

  it('rejeita unidade incompatível e preserva ausência', () => {
    expect(normalizeVital('heart-rate', { value: 72, unit: 'bpm/min', measurement: { activity: 'rest' } }, context)).toMatchObject({ value: null, status: 'invalid', state: 'no-data' });
    expect(normalizeVital('mood', { value: null, unit: '0–10' }, context)).toMatchObject({ value: null, status: 'missing', state: 'no-data' });
  });

  it('respeita fonte atrasada', () => {
    expect(normalizeVital('heart-rate', { value: 72, unit: 'bpm', measurement: { activity: 'rest' } }, { ...context, quality: 'delayed' }).state).toBe('no-data');
  });
});
