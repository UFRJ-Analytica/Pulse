import { ArrowUpRight, Check, CircleHelp, Database, Minus, TriangleAlert } from 'lucide-react';
import { DATA_STATUS_LABELS, STATE_LABELS, formatTimestamp, formatValue } from '../data';
import type { IndicatorDefinition, IndicatorRecord, SignalState } from '../data/types';
import { useLocale, tx } from '../i18n/locale';
import { localizeSource, localizeState, localizeUnit } from '../data/localization';

export function StatusBadge({ state, compact = false }: { state: SignalState; compact?: boolean }) {
  const locale = useLocale();
  const Icon = state === 'normal' ? Check : state === 'no-data' ? Minus : TriangleAlert;
  return <span className={`status-badge state-${state} ${compact ? 'compact' : ''}`}><Icon size={11} strokeWidth={2.3} />{localizeState(STATE_LABELS[state], locale)}</span>;
}

export function Sparkline({ values, color = '#2c9c91' }: { values: (number | null)[]; color?: string }) {
  const valid = values.filter((v): v is number => v !== null && Number.isFinite(v));
  if (!valid.length) return <svg className="sparkline" viewBox="0 0 110 34" aria-hidden="true"><path d="M0 22H110" stroke="#bdc7cd" strokeDasharray="3 4" /></svg>;
  const min = Math.min(...valid) * .85;
  const max = Math.max(...valid) * 1.1;
  const paths: string[] = [];
  let connected = false;
  values.forEach((v, i) => {
    if (v === null) { connected = false; return; }
    paths.push(`${connected ? 'L' : 'M'}${(i / Math.max(values.length - 1, 1)) * 110},${30 - (v - min) / Math.max(max - min, 1) * 26}`);
    connected = true;
  });
  return <svg className="sparkline" viewBox="0 0 110 34" aria-hidden="true"><path d={paths.join(' ')} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>;
}

export function IndicatorCard({ definition, record, selected, onSelect, sparkline, compact = false }: {
  definition: IndicatorDefinition; record: IndicatorRecord; selected: boolean; onSelect: () => void; sparkline?: (number | null)[]; compact?: boolean;
}) {
  const locale = useLocale();
  const numberLocale = locale === 'en' ? 'en-US' : 'pt-BR';
  const dataStatus = record.quality === 'delayed' ? tx(locale, 'Fonte atrasada', 'Source delayed') : localizeState(DATA_STATUS_LABELS[record.status], locale);
  return <button className={`indicator-card ${selected ? 'selected' : ''} ${compact ? 'small-card' : ''}`} onClick={onSelect} aria-pressed={selected} aria-label={`${definition.id} ${definition.title}`}>
    <span className="card-heading"><span>{definition.shortTitle}</span><ArrowUpRight size={13} /></span>
    <span className="card-reading"><span className="reading">{formatValue(record, locale)}</span>{record.value !== null && record.unit && <span className="unit">{localizeUnit(record.id, record.unit, locale)}</span>}{sparkline && <Sparkline values={sparkline} color={definition.group === 'environment' ? '#c99435' : definition.group === 'biology' ? '#9880bd' : '#42a69e'} />}</span>
    <span className="card-status"><StatusBadge state={record.state} compact /><span className="data-label">{dataStatus}</span></span>
    {definition.group === 'biology' && <span className="card-baseline">{tx(locale, 'Baseline individual', 'Individual baseline')}: {record.baseline != null ? `${record.baseline.toLocaleString(numberLocale)} ${record.unit ?? ''}` : tx(locale, 'não disponível', 'unavailable')}</span>}
    {record.uncertainty != null && <span className="uncertainty">{typeof record.uncertainty === 'number' ? `${tx(locale, 'Incerteza', 'Uncertainty')}: ±${record.uncertainty} ${record.unit ?? ''}` : record.uncertainty}</span>}
    <span className="card-provenance"><span>{localizeSource(record.source, locale)} <span>· {definition.id}</span></span><time dateTime={record.timestamp ?? undefined}>{record.timestamp ? formatTimestamp(record.timestamp, locale) : tx(locale, 'Sem horário válido', 'No valid timestamp')}</time></span>
  </button>;
}

export function EmptyData({ children }: { children: React.ReactNode }) {
  return <div className="empty-data"><Database size={20} /><p>{children}</p></div>;
}

export function DataNote({ children }: { children: React.ReactNode }) {
  return <div className="data-note"><CircleHelp size={14} /><span>{children}</span></div>;
}

