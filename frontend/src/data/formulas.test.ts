import { describe, expect, it } from 'vitest';
import { doseTrend, environmentalScore, finiteNumber, integrateDose, isHighEnergy, letSummary, qualityFactor, totalDose, validTimestamp } from './formulas';

describe('scientific calculation boundaries', () => {
  it.each([null, undefined, '', ' ', true, false, 'NaN', Number.NaN, Infinity, {}, []])('rejects missing/non-finite input %s without converting to zero', (value) => {
    expect(finiteNumber(value)).toBeNull();
  });
  it('accepts a genuine zero or numeric string', () => { expect(finiteNumber(0)).toBe(0); expect(finiteNumber('8.4')).toBe(8.4); });
  it('requires timezone-aware valid timestamps', () => {
    expect(validTimestamp('2026-11-05T14:00:00')).toBeNull();
    expect(validTimestamp('not-a-date')).toBeNull();
    expect(validTimestamp('2026-11-05T11:00:00-03:00')).toBe('2026-11-05T14:00:00.000Z');
  });
  it('uses the specified piecewise Q including boundary values', () => {
    expect(qualityFactor(9)).toBe(1);
    expect(qualityFactor(10)).toBeCloseTo(1);
    expect(qualityFactor(100)).toBeCloseTo(29.8);
    expect(qualityFactor(400)).toBe(15);
    expect(qualityFactor(-1)).toBeNull();
  });
  it('weights LET by counts and treats 100 as outside the >100 tail', () => {
    const summary = letSummary([5, 100, 200], [2, 1, 1]);
    expect(summary?.mean).toBe(77.5);
    expect(summary?.highFraction).toBe(0.25);
    expect(summary?.qWeighted).toBeCloseTo((2 + 29.8 + 300 / Math.sqrt(200)) / 4);
  });
  it.each([[[], []], [[10], [0]], [[10, 20], [1]], [[10], [-1]], [[NaN], [1]], [null, []]])('rejects unusable LET spectra', (centers, counts) => {
    expect(letSummary(centers, counts)).toBeNull();
  });
  it('never sums unvalidated or missing channels', () => {
    expect(totalDose(8.4, 3.9, false)).toBeNull();
    expect(totalDose(null, 3.9, true)).toBeNull();
    expect(totalDose(-1, 3.9, true)).toBeNull();
    expect(totalDose(8.4, 3.9, true)).toBeCloseTo(12.3);
  });
  it('requires three persistent increases and breaks persistence at a gap', () => {
    expect(doseTrend([8, 8, 12], [8, 8, 8])?.state).toBe('observation');
    expect(doseTrend([8, 12, 13, 14], [8, 8, 8])).toMatchObject({ state: 'attention', persistence: 3, percent: 75, delta: 6 });
    expect(doseTrend([12, 13, null, 14], [8, 8, 8])?.persistence).toBe(1);
    expect(doseTrend([12], [0])).toBeNull();
    expect(doseTrend([null], [8])).toBeNull();
  });
  it('integrates elapsed hours without filling missing or oversized gaps', () => {
    const sample = (hour: number, value: number | null) => ({ timestamp: `2026-11-05T${String(hour).padStart(2, '0')}:00:00Z`, value });
    expect(integrateDose([sample(0, 8), sample(2, 10), sample(4, 12)])).toEqual({ dose: 36, coveredHours: 4, complete: true });
    expect(integrateDose([sample(0, 8), sample(2, null), sample(4, 12)]).dose).toBeNull();
    expect(integrateDose([sample(0, 8), sample(8, 12)]).dose).toBeNull();
    expect(integrateDose([sample(0, 8), sample(2, 10), sample(4, null)])).toEqual({ dose: 16, coveredHours: 2, complete: false });
  });
  it.each(['>=100 MeV', '>100 MeV', '≥ 100 MeV', '100+ MeV'])('recognizes high-energy channel %s', (channel) => expect(isHighEnergy(channel)).toBe(true));
  it('does not interpret 10 MeV as high energy', () => expect(isHighEnergy('>10 MeV')).toBe(false));
  it('keeps environmental scores bounded and decomposable', () => {
    const moderate = environmentalScore(3, false, true, false);
    expect(moderate.score).toBe(44); expect(moderate.state).toBe('observation');
    const critical = environmentalScore(99, true, true, true);
    expect(critical.score).toBe(100);
    expect(critical.components.reduce((sum, component) => sum + component.value, 0)).toBe(critical.score);
  });
});
