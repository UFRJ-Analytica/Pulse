// Synthetic demonstration series for the vital pages. No value comes from a real person or mission.
// Same views as the body temperature page; a vital may offer only one of them.
export type SeriesView = '24h' | '7d';
export type SeriesLabel = string | { pt: string; en: string };
export type VitalSeries = {
  values: Partial<Record<SeriesView, number[]>>;
  // Second value per point, such as diastolic pressure.
  secondary?: Partial<Record<SeriesView, number[]>>;
  labels: Partial<Record<SeriesView, SeriesLabel[]>>;
};

const DAY_LABELS = ['07:00', '12:00', '14:00'];
const WEEK_LABELS = ['09/11', '10/11', '11/11', '12/11', '13/11', '14/11', '15/11'];
const last = (values: number[] = []) => values[values.length - 1];

// Heart rate: hourly values over 24 h (waking rest at 07:00, exercise at 12:00) and the daily resting reading
// at waking over 7 days. Baseline 63 bpm matches the V01 fixture.
export const HEART_RATE_BASELINE = 63;
export const HEART_RATE_SERIES: VitalSeries = {
  values: {
    '24h': [56, 55, 54, 54, 55, 57, 60, 63, 68, 72, 74, 96, 132, 104, 78, 72, 70, 69, 68, 66, 64, 62, 60, 58],
    '7d': [62, 63, 61, 64, 63, 62, 64],
  },
  labels: { '24h': DAY_LABELS, '7d': WEEK_LABELS },
};

// Blood pressure: systolic (values) and diastolic (secondary), hourly over 24 h with a night dip and an
// exercise rise at 12:00, and the daily morning reading over 7 days. The last reading matches the V02 fixture.
export const BLOOD_PRESSURE_SERIES: VitalSeries = {
  values: {
    '24h': [104, 102, 101, 100, 101, 103, 108, 112, 116, 118, 117, 119, 122, 120, 116, 114, 113, 112, 111, 110, 109, 108, 106, 105],
    '7d': [113, 111, 112, 114, 110, 112, 112],
  },
  secondary: {
    '24h': [64, 63, 62, 62, 63, 64, 68, 72, 75, 76, 75, 77, 79, 78, 75, 74, 73, 72, 71, 70, 69, 68, 66, 65],
    '7d': [73, 71, 72, 74, 70, 72, 72],
  },
  labels: { '24h': DAY_LABELS, '7d': WEEK_LABELS },
};

// Blood glucose: three readings in one day (fasting, before lunch, 2 h after the meal) and the daily fasting
// reading over 7 days. Baseline 82 mg/dL matches the V03 fixture.
export const BLOOD_GLUCOSE_BASELINE = 82;
export const BLOOD_GLUCOSE_SERIES: VitalSeries = {
  values: { '24h': [82, 88, 128], '7d': [80, 84, 79, 83, 81, 85, 82] },
  labels: {
    '24h': [
      { pt: '07:00 · jejum', en: '07:00 · fasting' },
      { pt: '12:00 · pré-refeição', en: '12:00 · pre-meal' },
      { pt: '14:00 · 2 h pós-refeição', en: '14:00 · 2 h post-meal' },
    ],
    '7d': WEEK_LABELS,
  },
};

// Mood: one morning check-in composite (1–5) per day. The last three days match DEMO_MOOD and the V04 fixture.
export const MOOD_SERIES: VitalSeries = {
  values: { '7d': [4.2, 4.4, 4.1, 4.2, 4.0, 4.3, 4.1] },
  labels: { '7d': WEEK_LABELS },
};

// Last reading of the week, shown on the Highlights cards.
export const HEART_RATE_LATEST = last(HEART_RATE_SERIES.values['7d']);
export const BLOOD_PRESSURE_LATEST = { systolic: last(BLOOD_PRESSURE_SERIES.values['7d']), diastolic: last(BLOOD_PRESSURE_SERIES.secondary?.['7d']) };
export const BLOOD_GLUCOSE_LATEST = last(BLOOD_GLUCOSE_SERIES.values['7d']);
export const MOOD_LATEST = last(MOOD_SERIES.values['7d']);
