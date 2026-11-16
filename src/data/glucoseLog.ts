import type { Locale } from '../i18n/messages';
import { assessVital } from './vitals';

// Glucose results logged from the Highlights modal, shared by the Highlights card, Exam Logs and the glucose page.
export type GlucoseEntryContext = 'fasting' | 'post-meal' | 'pre-eva';
export const GLUCOSE_MEAL: Record<GlucoseEntryContext, 'fasting' | 'post-meal' | 'random'> = { fasting: 'fasting', 'post-meal': 'post-meal', 'pre-eva': 'random' };
export const GLUCOSE_CONTEXT_LABELS: Record<GlucoseEntryContext, { title: { pt: string; en: string }; short: { pt: string; en: string } }> = {
  fasting: { title: { pt: 'Glicemia em jejum', en: 'Fasting blood glucose' }, short: { pt: 'jejum', en: 'fasting' } },
  'post-meal': { title: { pt: 'Glicemia pós-refeição', en: 'Post-meal blood glucose' }, short: { pt: 'pós-refeição', en: 'post-meal' } },
  'pre-eva': { title: { pt: 'Glicemia pré-EVA', en: 'Pre-EVA blood glucose' }, short: { pt: 'pré-EVA', en: 'pre-EVA' } },
};
export const GLUCOSE_LOG_KEY = 'pulse-health-glucose-result';
// Logs saved before the context was recorded are read as fasting, the only context offered then.
export type GlucoseLog = { value: number; loggedAt: string; notes?: string[]; context?: GlucoseEntryContext };

export function readGlucoseLog(): GlucoseLog | null {
  try {
    const saved = localStorage.getItem(GLUCOSE_LOG_KEY);
    return saved ? JSON.parse(saved) as GlucoseLog : null;
  } catch { return null; }
}
export const glucoseLogContext = (log: GlucoseLog) => log.context ?? 'fasting';
// Same classification as the V03 indicator and the log modal.
export const glucoseLogReading = (log: GlucoseLog) => ({ value: log.value, context: { meal: GLUCOSE_MEAL[glucoseLogContext(log)] } });
export const assessGlucoseLog = (log: GlucoseLog) => assessVital('blood-glucose', glucoseLogReading(log));
export const glucoseLogLabel = (log: GlucoseLog, locale: Locale) => assessGlucoseLog(log).findings[0]?.label[locale] ?? 'Normal';
