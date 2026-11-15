import { environmentalScore, isHighEnergy, validTimestamp } from '../formulas';
import { normalizeRecord } from './common';
import type { AdapterContext } from './common';
import type { IndicatorRecord } from '../types';

export interface DonkiEvent {
  sepID: string;
  eventTime: string;
  instruments: { displayName: string }[];
  channel: string;
  linkedEvents?: { activityID: string }[];
  notifications?: string[];
  link?: string;
}
/** Receives normalized DONKI records; never interprets a SEP count as dose. */
export function normalizeDonki(events: DonkiEvent[] | null, context: AdapterContext): Record<string, IndicatorRecord> {
  if (events === null) return Object.fromEntries(['D01', 'D02', 'D03', 'D04', 'D05', 'D06'].map((id) => [id, normalizeRecord(id, null, context, { note: 'Fonte DONKI ausente.' })]));
  const now = Date.parse(context.timestamp ?? '');
  const valid = events.filter((event) => validTimestamp(event.eventTime) && Date.parse(event.eventTime) <= now);
  const partial = valid.length !== events.length;
  const current = { ...context, quality: context.quality ?? (events.length > 0 && !valid.length ? 'invalid' : partial ? 'partial' : 'valid') } as AdapterContext;
  const count24h = valid.filter((event) => Date.parse(event.eventTime) > now - 86_400_000).length;
  const high = valid.filter((event) => isHighEnergy(event.channel));
  const relations = new Set(valid.flatMap((event) => event.linkedEvents?.map((related) => related.activityID) ?? []));
  const notices = new Set(valid.flatMap((event) => event.notifications ?? []));
  const recent = valid.filter((event) => Date.parse(event.eventTime) > now - 86_400_000);
  const score = environmentalScore(count24h, recent.some((event) => isHighEnergy(event.channel)), recent.some((event) => event.linkedEvents?.length), recent.some((event) => event.notifications?.length));
  const note = partial ? 'Registros inválidos ou futuros excluídos da contagem; cobertura parcial.' : 'Contagem de registros, não de tempestades independentes.';
  const values: [string, number][] = [['D01', valid.length], ['D02', count24h], ['D03', high.length], ['D04', relations.size], ['D05', notices.size]];
  const result = Object.fromEntries(values.map(([id, value]) => [id, normalizeRecord(id, value, current, { note, uncertainty: 'Cobertura limitada aos registros disponíveis' })]));
  result.D03.channel = high.map((event) => event.channel).join(' · ') || 'Nenhum canal ≥100 MeV na janela';
  result.D03.detector = high.flatMap((event) => event.instruments.map((instrument) => instrument.displayName)).join(' · ') || 'Instrumentos DONKI';
  result.D06 = normalizeRecord('D06', score.score, current, { status: 'proxy', state: score.state, components: score.components, uncertainty: 'Pesos demonstrativos; sem calibração probabilística', note: 'Risco ambiental heurístico. Pesos próprios da demonstração, não um índice oficial NASA.' });
  return result;
}
