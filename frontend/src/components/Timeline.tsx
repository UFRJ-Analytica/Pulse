import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChevronDown, Clock3, Table2 } from 'lucide-react';
import type { MissionScenario, TimelineEvent, TimelinePoint } from '../data/types';
import { useLocale, tx } from '../i18n/locale';

type Metric = 'dose' | 'let' | 'score' | 'accumulated';
const time = (ts: string, locale: 'en' | 'pt-BR') => new Date(ts).toLocaleTimeString(locale === 'en' ? 'en-US' : 'pt-BR', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });

export function Timeline({ scenario, onSelect, windowHours, onWindowChange }: { scenario: MissionScenario; onSelect: (id: string) => void; windowHours: number; onWindowChange: (value: number) => void }) {
  const locale = useLocale();
  const metrics: Record<Metric, { label: string; unit: string; color: string }> = {
    dose: { label: 'Dose B', unit: 'µGy/h', color: '#299a94' },
    let: { label: tx(locale, 'LET médio', 'Average LET'), unit: 'keV/µm', color: '#9a7ac1' },
    score: { label: tx(locale, 'Score ambiental', 'Environmental score'), unit: '0–100', color: '#bf9344' },
    accumulated: { label: tx(locale, 'Dose acumulada B', 'Accumulated dose B'), unit: 'µGy', color: '#428ac2' },
  };
  const eventLabels: Record<TimelineEvent['type'], string> = { sep: 'SEP', flare: tx(locale, 'Erupção solar', 'Solar flare'), cme: 'CME', collection: tx(locale, 'Coleta', 'Collection'), eva: 'EVA', exercise: tx(locale, 'Exercício', 'Exercise'), shielding: tx(locale, 'Blindagem', 'Shielding') };
  const [metric, setMetric] = useState<Metric>('dose');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [table, setTable] = useState(false);
  const config = metrics[metric];
  const cutoff = new Date(scenario.timestamp).getTime() - windowHours * 3600000;
  const points = useMemo(() => scenario.timeline.filter(p => new Date(p.timestamp).getTime() >= cutoff).map(p => ({ ...p, ms: new Date(p.timestamp).getTime() })), [scenario, cutoff]);
  const events = scenario.events.filter(e => new Date(e.timestamp).getTime() >= cutoff);
  const start = points[0]?.ms ?? cutoff;
  const end = points.at(-1)?.ms ?? new Date(scenario.timestamp).getTime();
  const selected = events.find(e => e.id === selectedEvent);
  const hasValues = points.some(p => p[metric] !== null);

  return <section className="timeline-panel" aria-labelledby="timeline-title">
    <div className="timeline-header"><div className="timeline-title"><Clock3 size={16} /><h2 id="timeline-title">{tx(locale, 'Linha do tempo da missão', 'Mission timeline')}</h2><span className="muted">UTC</span></div>
      <div className="timeline-actions"><div className="segmented metric-tabs" aria-label={tx(locale, 'Série temporal', 'Time series')}>{(Object.keys(metrics) as Metric[]).map(key => <button key={key} className={metric === key ? 'active' : ''} onClick={() => setMetric(key)} aria-pressed={metric === key}>{metrics[key].label}</button>)}</div>
        <label className="compact-select"><select aria-label={tx(locale, 'Janela temporal', 'Time window')} value={windowHours} onChange={e => onWindowChange(Number(e.target.value))}><option value={12}>{tx(locale, 'Últimas 12 h', 'Last 12 h')}</option><option value={24}>{tx(locale, 'Últimas 24 h', 'Last 24 h')}</option><option value={48}>{tx(locale, '48 h disponíveis', '48 h available')}</option></select><ChevronDown size={12} /></label>
        <button className={`icon-button ${table ? 'active' : ''}`} onClick={() => setTable(!table)} aria-label={table ? tx(locale, 'Fechar tabela da linha do tempo', 'Close timeline table') : tx(locale, 'Ver tabela da linha do tempo', 'View timeline table')} aria-expanded={table}><Table2 size={16} /></button>
      </div>
    </div>
    <div className="timeline-content">
      <div className="timeline-key"><span className="legend-dot" style={{ background: config.color }} />{config.label}<span>{config.unit}</span><small>{tx(locale, 'Dados simulados · intervalos sem dado não são interpolados', 'Simulated data · missing intervals are not interpolated')}</small></div>
      <div className="chart-container" aria-label={tx(locale, `Série temporal de ${config.label}, em ${config.unit}. Alternativa textual disponível em Ver tabela.`, `Time series for ${config.label}, in ${config.unit}. A text alternative is available in View table.`)}>
        {!hasValues && <div className="chart-no-data">{tx(locale, 'Sem dado válido nesta janela', 'No valid data in this window')}</div>}
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 800, height: 115 }}>
          <AreaChart data={points} margin={{ top: 10, right: 20, bottom: 0, left: 0 }} accessibilityLayer>
            <defs><linearGradient id="timelineGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={config.color} stopOpacity={.18} /><stop offset="100%" stopColor={config.color} stopOpacity={.01} /></linearGradient></defs>
            <CartesianGrid vertical={false} stroke="#e8edef" strokeDasharray="3 4" />
            <XAxis dataKey="ms" type="number" domain={[start, end]} ticks={points.filter((_, i) => i % Math.max(1, Math.ceil((points.length - 1) / 4)) === 0).map(p => p.ms)} tickFormatter={value => time(new Date(Number(value)).toISOString(), locale)} tick={{ fill: '#6f858f', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={65} />
            <YAxis width={40} tick={{ fill: '#86929b', fontSize: 10 }} axisLine={false} tickLine={false} tickCount={4} domain={metric === 'score' ? [0, 100] : ['auto', 'auto']} />
            <Tooltip labelFormatter={label => `${new Date(Number(label)).toLocaleString(locale === 'en' ? 'en-US' : 'pt-BR', { timeZone: 'UTC' })} UTC`} formatter={value => [`${value ?? tx(locale, 'Sem dado', 'No data')} ${config.unit}`, config.label]} contentStyle={{ borderRadius: 9, border: '1px solid #dde5e8', fontSize: 11 }} />
            {events.filter(e => e.type === 'sep' || e.type === 'collection').map(event => <ReferenceLine key={event.id} x={new Date(event.timestamp).getTime()} stroke={event.type === 'collection' ? '#b199c9' : '#d8b777'} strokeDasharray="3 4" />)}
            <Area dataKey={metric} type="linear" stroke={config.color} strokeWidth={2} fill="url(#timelineGradient)" connectNulls={false} isAnimationActive={false} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="event-track" aria-label={tx(locale, 'Eventos alinhados por horário', 'Events aligned by time')}><span className="event-track-label">{tx(locale, 'EVENTOS', 'EVENTS')}</span><div className="event-rail">{events.map((event, i) => <button key={event.id} className={`event-marker event-${event.type} ${selectedEvent === event.id ? 'selected' : ''}`} style={{ left: `${Math.max(1, Math.min(97, (new Date(event.timestamp).getTime() - start) / Math.max(end - start, 1) * 100))}%`, top: i % 2 === 0 ? 0 : 22 }} title={`${event.label} · ${time(event.timestamp, locale)} UTC`} aria-label={`${event.label}, ${time(event.timestamp, locale)} UTC`} onClick={() => { setSelectedEvent(event.id); if (event.indicatorId) onSelect(event.indicatorId); }}><i /><span>{eventLabels[event.type]}</span></button>)}</div></div>
      {selected && <div className="event-detail" role="status"><strong>{selected.label}</strong><span>{time(selected.timestamp, locale)} UTC · {selected.source === 'mission' ? tx(locale, 'missão', 'mission') : selected.source}</span><p>{selected.detail}</p>{selected.channel && <span>{tx(locale, 'Canal', 'Channel')}: {selected.channel} · {selected.instrument}</span>}</div>}
      {table && <div className="timeline-table-wrap"><table className="data-table"><caption>{tx(locale, 'Dados de demonstração — todas as fontes alinhadas em UTC; ausência ≠ zero.', 'Demonstration data — all sources aligned to UTC; missing ≠ zero.')}</caption><thead><tr><th>{tx(locale, 'Horário UTC', 'UTC time')}</th><th>Dose B · µGy/h</th><th>Dose E · µGy/h</th><th>LET · keV/µm</th><th>{tx(locale, 'Score', 'Score')} · 0–100</th><th>{tx(locale, 'Acumulada B', 'Accumulated B')} · µGy</th></tr></thead><tbody>{points.map((p: TimelinePoint) => <tr key={p.timestamp}><th>{new Date(p.timestamp).toLocaleString(locale === 'en' ? 'en-US' : 'pt-BR', { timeZone: 'UTC' })}</th>{(['dose', 'doseE', 'let', 'score', 'accumulated'] as const).map(k => <td key={k}>{p[k] === null ? tx(locale, 'Sem dado', 'No data') : p[k]?.toLocaleString(locale === 'en' ? 'en-US' : 'pt-BR', { maximumFractionDigits: 2 })}</td>)}</tr>)}</tbody></table></div>}
    </div>
  </section>;
}
