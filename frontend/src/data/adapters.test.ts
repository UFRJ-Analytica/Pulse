import { describe, expect, it } from 'vitest';
import { normalizeRecord } from './adapters/common';
import { normalizeDonki } from './adapters/donki';
import { normalizeRad } from './adapters/rad';
import { normalizeOsdr } from './adapters/osdr';
import type { DonkiEvent } from './adapters/donki';
import type { RadSample } from './adapters/rad';
const context = { timestamp: '2026-11-05T14:00:00Z', missionId: 'test', synthetic: false };
const sample: RadSample = { timestamp: context.timestamp, Dose_B_uGy_h: 8.4, Dose_E_uGy_h: 3.9, LET_Energy_Centers: [5, 20], LET_Counts: [3, 1] };

describe('source adapters preserve provenance and refuse invalid values', () => {
  it('distinguishes missing, invalid and measured zero', () => {
    expect(normalizeRecord('R01', null, context).status).toBe('missing');
    expect(normalizeRecord('R01', 'bad', context)).toMatchObject({ status: 'invalid', value: null, state: 'no-data' });
    expect(normalizeRecord('R01', 0, context)).toMatchObject({ status: 'measured', value: 0, synthetic: false, timezone: 'UTC' });
    expect(normalizeRecord('R01', 8, { ...context, timestamp: null }).status).toBe('invalid');
  });
  it('marks stale observations as no-data, retaining their historical value and time', () => {
    expect(normalizeRecord('R01', 8, { ...context, quality: 'delayed' })).toMatchObject({ value: 8, quality: 'delayed', state: 'no-data' });
  });
  it('does not combine B and E without explicit channel validation', () => {
    const records = normalizeRad([sample], context, { channelsValidated: false, baselineSamples: [8.4] });
    expect(records.R01.value).toBe(8.4); expect(records.R02.value).toBe(3.9);
    expect(records.R03).toMatchObject({ status: 'missing', value: null });
    expect(records.R07).toMatchObject({ status: 'missing', value: null, unit: 'proxy µSv/h' });
  });
  it('labels a validated derived equivalent value strictly as proxy', () => {
    const records = normalizeRad([sample], context, { channelsValidated: true, baselineSamples: [8.4] });
    expect(records.R03.value).toBeCloseTo(12.3);
    expect(records.R07.status).toBe('proxy'); expect(records.R07.unit).toBe('proxy µSv/h');
  });
  it('rejects corrupted or negative dosimeter values', () => {
    const records = normalizeRad([{ ...sample, Dose_B_uGy_h: 'INVALID', Dose_E_uGy_h: -4 }], context, { channelsValidated: true, baselineSamples: [8] });
    expect(records.R01.status).toBe('invalid'); expect(records.R02.status).toBe('invalid');
    expect(records.R03.value).toBeNull(); expect(records.R07.value).toBeNull();
  });
  it('keeps exact 24h boundary out and ignores future or invalid events', () => {
    const event = (eventTime: string): DonkiEvent => ({ sepID: eventTime, eventTime, instruments: [], channel: '>10 MeV' });
    const records = normalizeDonki([event('2026-11-04T14:00:00Z'), event('2026-11-04T14:00:01Z'), event('2026-11-06T14:00:00Z')], context);
    expect(records.D01.value).toBe(2); expect(records.D02.value).toBe(1);
    expect(records.D01.quality).toBe('partial');
  });
  it('does not turn a missing feed or entirely corrupt feed into a zero score', () => {
    expect(normalizeDonki(null, context).D06.value).toBeNull();
    expect(normalizeDonki([{ sepID: 'bad', eventTime: 'invalid', instruments: [], channel: '>10 MeV' }], context).D06.status).toBe('invalid');
  });
  it('biological absence keeps null baseline and collection time', () => {
    const records = normalizeOsdr([], context);
    expect(Object.keys(records)).toHaveLength(7);
    expect(records.O01).toMatchObject({ value: null, baseline: null, status: 'missing', timestamp: null });
    expect(records.O01.confounders).toHaveLength(6);
  });
  it('does not announce a biological baseline when the source omits or corrupts it', () => {
    const records = normalizeOsdr([{ indicatorId: 'O01', value: .2, unit: 'focos/célula', baseline: NaN, collectionDate: context.timestamp, context: 'Study' }], context);
    expect(records.O01.baseline).toBeNull();
    expect(records.O01.note).toContain('baseline individual não disponível');
  });
  it('does not count duplicate timestamps or long gaps as persistent dose', () => {
    const high = { ...sample, Dose_B_uGy_h: 20 };
    const duplicate = normalizeRad([high, high, high], context, { channelsValidated: false, baselineSamples: [8] });
    expect(duplicate.R09.persistence).toBe(1);
    expect(duplicate.R09.state).toBe('observation');
    const gapped = normalizeRad([{ ...high, timestamp: '2026-11-03T14:00:00Z' }, { ...high, timestamp: '2026-11-04T14:00:00Z' }, high], context, { channelsValidated: false, baselineSamples: [8] });
    expect(gapped.R09.persistence).toBe(1);
    expect(gapped.R08.value).toBeNull();
  });
});
