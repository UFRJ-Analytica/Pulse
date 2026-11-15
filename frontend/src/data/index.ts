export * from './types';
export * from './catalog';
export * from './fixtures';
export * from './formulas';
export * from './adapters/common';
export * from './adapters/donki';
export * from './adapters/rad';
export * from './adapters/osdr';
export * from './adapters/temperature';
import type { IndicatorRecord } from './types';
import type { Locale } from '../i18n/messages';
export function formatValue(record: Pick<IndicatorRecord, 'value' | 'status' | 'id'>, locale: Locale = 'pt-BR'): string {
  if (record.value === null || record.status === 'missing' || record.status === 'invalid') return '—';
  if (typeof record.value === 'string') return record.value;
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'pt-BR', { maximumFractionDigits: record.id === 'O01' ? 2 : 1 }).format(record.value);
}
export function formatTimestamp(timestamp: string | null, locale: Locale = 'pt-BR'): string {
  if (!timestamp || !Number.isFinite(Date.parse(timestamp))) return locale === 'en' ? 'Time unavailable' : 'Horário indisponível';
  return `${new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(new Date(timestamp))} UTC`;
}
