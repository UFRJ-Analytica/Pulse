import { DEMO_MOOD } from './fixtures';
import { MOOD_SERIES } from './vitalSeries';

// Composite score (1–5) of the morning check-in, shared by Highlights, Activity History and the mood page.
export const CHECK_IN_SCORE_KEY = 'pulse-health-readiness-score';

export function readCheckInScore(): number | null {
  try {
    const saved = localStorage.getItem(CHECK_IN_SCORE_KEY);
    const score = saved === null ? NaN : Number(saved);
    return Number.isFinite(score) ? Math.round(score * 10) / 10 : null;
  } catch { return null; }
}

export function saveCheckInScore(score: number) {
  try { localStorage.setItem(CHECK_IN_SCORE_KEY, String(score)); } catch { /* Keep the score for this session. */ }
}

export function clearCheckInScore() {
  try { localStorage.removeItem(CHECK_IN_SCORE_KEY); } catch { /* Nothing saved to clear. */ }
}

// Demo week with today's check-in (15/11) in place of the demo value, when there is one.
export function moodWeek(score: number | null): number[] {
  const week = [...(MOOD_SERIES.values['7d'] ?? [])];
  if (score !== null) week[week.length - 1] = score;
  return week;
}

// Assessment input for the latest mood value: personal baseline and the earlier days as history.
export function moodAssessInput(week: number[]) {
  return {
    reading: { value: week[week.length - 1] },
    options: { baseline: DEMO_MOOD.baseline, history: week.slice(0, -1).map(value => ({ value })) },
  };
}
