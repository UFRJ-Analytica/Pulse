import { describe, expect, it } from 'vitest';
import { getScenario, SCENARIOS } from './fixtures';
import { scenarioReadings, scenarioVitals } from './scenarioVitals';
import { assessVital } from './vitals';

describe('scenario vitals', () => {
  it('match the V01–V04 and O06 fixtures in every scenario', () => {
    for (const { id } of SCENARIOS) {
      const vitals = scenarioVitals(id);
      const readings = scenarioReadings(vitals);
      const { records } = getScenario(id);
      expect(readings.heartRate.reading.value, id).toBe(records.V01.value);
      const bp = readings.bloodPressure.reading;
      expect(bp.value === null ? null : `${bp.value}/${bp.secondary}`, id).toBe(records.V02.value);
      expect(readings.glucose.reading.value, id).toBe(records.V03.value);
      expect(readings.mood.reading.value, id).toBe(records.V04.value);
      if (readings.sleep) expect(readings.sleep.reading.value, id).toBe(records.O06.value);
      if (vitals.missing) continue;
      expect(assessVital('heart-rate', readings.heartRate.reading, readings.heartRate.options).state, id).toBe(records.V01.state);
      expect(assessVital('blood-pressure', readings.bloodPressure.reading).state, id).toBe(records.V02.state);
      expect(assessVital('blood-glucose', readings.glucose.reading, readings.glucose.options).state, id).toBe(records.V03.state);
      expect(assessVital('mood', readings.mood.reading, readings.mood.options).state, id).toBe(records.V04.state);
    }
  });
});
