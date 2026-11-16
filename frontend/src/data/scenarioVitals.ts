import { DEMO_MOOD } from './fixtures';
import { BLOOD_GLUCOSE_BASELINE, BLOOD_GLUCOSE_SERIES, BLOOD_PRESSURE_SERIES, HEART_RATE_BASELINE, HEART_RATE_SERIES, MOOD_SERIES } from './vitalSeries';
import type { AssessOptions, MeasurementContext, VitalReading } from './vitals';

// Vital readings of each demo scenario, aligned with the V01–V04 and O06 fixtures (data/fixtures.ts),
// so cards, pages and the atlas inspector show the same values. The last day of each week is 15/11.
export const DEFAULT_SCENARIO_ID = 'sep-moderate';
export const VITAL_SCENARIO_IDS = ['hypoglycemia', 'sleep-debt'] as const;

export type ScenarioVitals = {
  // Scenario that changes vital readings; the other scenarios keep the demo series.
  vitalScenario: boolean;
  // Sources unavailable in this scenario: the latest vital readings are missing.
  missing: boolean;
  heartRate: { week: number[]; context: MeasurementContext };
  bloodPressure: { systolic: number[]; diastolic: number[]; context: MeasurementContext };
  glucose: { week: number[]; context: MeasurementContext; source: 'fingerstick' | 'cgm' };
  mood: { week: number[] };
  // Total sleep for the seven nights (Sol 136–142); null keeps the sleep page demo week.
  sleepNights: number[] | null;
};

const withTail = (values: number[] = [], tail: number[]) => [...values.slice(0, values.length - tail.length), ...tail];
const isVitalScenario = (id: string) => (VITAL_SCENARIO_IDS as readonly string[]).includes(id);

export function scenarioVitals(id: string): ScenarioVitals {
  const hypo = id === 'hypoglycemia';
  const debt = id === 'sleep-debt';
  const rest: MeasurementContext = { activity: 'rest', missionDay: 42 };
  return {
    vitalScenario: isVitalScenario(id),
    missing: id === 'data-gap',
    heartRate: {
      week: withTail(HEART_RATE_SERIES.values['7d'], hypo ? [104] : debt ? [77, 79, 78] : []),
      context: { ...rest, symptomatic: hypo },
    },
    bloodPressure: {
      systolic: withTail(BLOOD_PRESSURE_SERIES.values['7d'], hypo ? [92] : []),
      diastolic: withTail(BLOOD_PRESSURE_SERIES.secondary?.['7d'], hypo ? [58] : []),
      context: { symptomatic: hypo },
    },
    glucose: {
      week: withTail(BLOOD_GLUCOSE_SERIES.values['7d'], hypo ? [48] : []),
      context: { meal: hypo ? 'random' : 'fasting' },
      source: hypo ? 'cgm' : 'fingerstick',
    },
    mood: { week: withTail(MOOD_SERIES.values['7d'], debt ? [3.2, 3.0, 3.1] : []) },
    sleepNights: debt ? [5.8, 5.5, 5.9, 5.7, 5.4, 5.8, 5.6] : null,
  };
}

type ReadingInput = { reading: VitalReading; options?: AssessOptions };
const last = (values: number[]) => values[values.length - 1];
const history = (values: number[], context?: MeasurementContext) => values.slice(0, -1).map(value => ({ value, context }));

// Classification input of the latest reading of each vital in a scenario, shared by the Highlights cards and the pages.
export function scenarioReadings(vitals: ScenarioVitals): Record<'heartRate' | 'bloodPressure' | 'glucose' | 'mood', ReadingInput> & { sleep: ReadingInput | null } {
  const value = (values: number[]) => vitals.missing ? null : last(values);
  const { heartRate, bloodPressure, glucose, mood, sleepNights } = vitals;
  return {
    heartRate: { reading: { value: value(heartRate.week), context: heartRate.context }, options: { baseline: HEART_RATE_BASELINE, history: history(heartRate.week, { activity: 'rest' }) } },
    bloodPressure: { reading: { value: value(bloodPressure.systolic), secondary: last(bloodPressure.diastolic), context: bloodPressure.context } },
    glucose: { reading: { value: value(glucose.week), context: glucose.context }, options: { baseline: BLOOD_GLUCOSE_BASELINE, history: history(glucose.week, { meal: 'fasting' }) } },
    mood: { reading: { value: value(mood.week) }, options: { baseline: DEMO_MOOD.baseline, history: history(mood.week) } },
    sleep: sleepNights ? { reading: { value: last(sleepNights) }, options: { history: history(sleepNights) } } : null,
  };
}
