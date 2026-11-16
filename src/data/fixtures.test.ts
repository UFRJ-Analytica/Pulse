import { describe, expect, it } from 'vitest';
import { INDICATORS } from './catalog';
import { SCENARIOS, getScenario } from './fixtures';
import { formatTimestamp, formatValue } from './index';

describe('demonstration scenarios', () => {
  it('covers all 30 indicators across the eleven scenarios', () => {
    expect(INDICATORS).toHaveLength(30); expect(SCENARIOS).toHaveLength(11);
    for (const scenario of SCENARIOS) {
      expect(scenario.synthetic).toBe(true);
      expect(Object.keys(scenario.records)).toHaveLength(30);
      for (const indicator of INDICATORS) {
        const record = scenario.records[indicator.id];
        expect(record).toBeDefined(); expect(record.synthetic).toBe(true);
        expect(record.unit).toBeTruthy(); expect(record.source).toBeTruthy();
        expect(record.formulaVersion).toBeTruthy(); expect(record.uncertainty).toBeTruthy();
        if (typeof record.value === 'number') expect(Number.isFinite(record.value)).toBe(true);
      }
    }
  });
  it('shows an environmental moderate score independently of physical dose', () => {
    const scenario = getScenario('sep-moderate');
    expect(scenario.records.D06.value).toBe(44);
    expect(scenario.records.D06.status).toBe('proxy');
    expect(scenario.records.R09.state).toBe('normal');
  });
  it('never fabricates dose from high-energy events', () => {
    const scenario = getScenario('high-energy');
    expect(scenario.records.D03.value).toBeGreaterThan(0);
    expect(scenario.records.R01.value).toBeNull();
    expect(scenario.timeline.every((point) => point.dose === null)).toBe(true);
  });
  it('exposes a persistent trend and a distinct high-LET scenario', () => {
    expect(getScenario('dose-trend').records.R09.persistence).toBe(4);
    expect(getScenario('dose-trend').records.R09.state).toBe('attention');
    expect(getScenario('high-let').records.R01.value).toBe(getScenario('routine').records.R01.value);
    expect(getScenario('high-let').records.R04.value).toBeGreaterThan(getScenario('routine').records.R04.value as number);
    expect(getScenario('high-let').state).not.toBe('critical');
  });
  it('does not calculate a correlation or sum unvalidated channels anywhere', () => {
    for (const scenario of SCENARIOS) for (const id of ['R03', 'R07', 'C01', 'C02', 'C03']) {
      expect(scenario.records[id].value).toBeNull();
      expect(scenario.records[id].status).toBe('missing');
    }
  });
  it('aligns delayed collection to an event 24 hours earlier', () => {
    const scenario = getScenario('delayed-biology');
    const sep = scenario.events.find((event) => event.type === 'sep')!;
    const collection = scenario.events.find((event) => event.type === 'collection')!;
    expect(Date.parse(collection.timestamp) - Date.parse(sep.timestamp)).toBe(24 * 3_600_000);
    expect(scenario.records.O01.baseline).toBe(0.12);
    expect(scenario.records.O01.confounders).toHaveLength(6);
  });
  it('critical state has multiple observations, an explicit uncertainty and protocol action', () => {
    const scenario = getScenario('critical');
    expect(scenario.records.D06.value).toBe(100);
    expect(scenario.records.R09.persistence).toBeGreaterThanOrEqual(3);
    expect(scenario.records.D06.uncertainty).toContain('Pesos demonstrativos');
    expect(scenario.action).toContain('protocolo aprovado');
  });
  it('keeps series sorted, within the common 48h window and tied to the final record', () => {
    for (const scenario of SCENARIOS) {
      for (let i = 1; i < scenario.timeline.length; i++) expect(Date.parse(scenario.timeline[i].timestamp)).toBeGreaterThan(Date.parse(scenario.timeline[i - 1].timestamp));
      expect(scenario.timeline.at(-1)?.timestamp).toBe(scenario.timestamp);
      expect(scenario.timeline.at(-1)?.dose).toBe(scenario.records.R01.value);
      const start = Date.parse(scenario.timeline[0].timestamp);
      for (const event of scenario.events) expect(Date.parse(event.timestamp)).toBeGreaterThanOrEqual(start);
    }
  });
  it('keeps vital signs normal in the radiation scenarios and absent when sources fail', () => {
    for (const id of ['routine', 'sep-moderate', 'high-energy', 'dose-trend', 'high-let', 'delayed-biology', 'critical']) {
      for (const vital of ['V01', 'V02', 'V03', 'V04', 'T01', 'O06']) expect(getScenario(id).records[vital].state).toBe('normal');
    }
    for (const vital of ['V01', 'V02', 'V03', 'V04', 'T01']) expect(getScenario('data-gap').records[vital]).toMatchObject({ value: null, state: 'no-data' });
  });
  it('classifies the hypoglycemia scenario as critical and escalates to the flight surgeon', () => {
    const scenario = getScenario('hypoglycemia');
    expect(scenario.records.V03).toMatchObject({ value: 48, state: 'critical' });
    expect(scenario.records.V03.vital?.escalation).toBe('flight-surgeon');
    expect(scenario.records.V01.state).toBe('attention');
    expect(scenario.records.V02).toMatchObject({ value: '92/58', state: 'attention' });
  });
  it('shows a week of sleep debt with mood and heart rate below or above personal baselines', () => {
    const scenario = getScenario('sleep-debt');
    expect(scenario.records.O06.state).toBe('attention');
    expect(scenario.records.V04.state).toBe('observation');
    expect(scenario.records.V01.state).toBe('observation');
    expect(scenario.records.C01.value).toBeNull();
  });
  it('renders missing/invalid values with a dash and shows explicit UTC', () => {
    expect(formatValue(getScenario('high-energy').records.R01)).toBe('—');
    expect(formatValue(getScenario('data-gap').records.R01)).toBe('—');
    expect(formatTimestamp('2026-11-05T14:00:00Z')).toContain('UTC');
    expect(formatTimestamp(null)).toBe('Horário indisponível');
  });
});
