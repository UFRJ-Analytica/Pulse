import { ArrowUpRight } from 'lucide-react';
import type { Locale } from '../i18n/messages';
import { assessVital, VITAL_REFERENCES, VITAL_SOURCES } from '../data/vitals';
import type { AssessOptions, Escalation, VitalId, VitalReading } from '../data/vitals';
import type { SignalState } from '../data/types';
import './vital-pages.css';

type Text = { pt: string; en: string };
// Latest reading of a vital page, classified by the vitals layer.
export type LatestReading = { vitalId: VitalId; label: Text; reading: VitalReading; options?: AssessOptions };

const text = (locale: Locale, pt: string, en: string) => locale === 'en' ? en : pt;

const STATE_LABELS: Record<SignalState, Text> = {
  normal: { pt: 'Normal', en: 'Normal' },
  observation: { pt: 'Observação', en: 'Observation' },
  attention: { pt: 'Atenção', en: 'Attention' },
  critical: { pt: 'Crítico', en: 'Critical' },
  'no-data': { pt: 'Sem classificação', en: 'Not classified' },
};
const ESCALATION_LABELS: Record<Escalation, Text> = {
  none: { pt: 'Não é necessário escalar', en: 'No escalation needed' },
  crew: { pt: 'Avisar a tripulação', en: 'Notify the crew' },
  'flight-surgeon': { pt: 'Informar o flight surgeon', en: 'Notify the flight surgeon' },
};

// Classification of the latest reading with the same rules as the inspector (assessVital).
export function VitalStatusPanel({ latest, locale }: { latest: LatestReading; locale: Locale }) {
  const tr = (value: Text) => text(locale, value.pt, value.en);
  const lang = locale === 'en' ? 'en' : 'pt-BR';
  const assessment = assessVital(latest.vitalId, latest.reading, latest.options);
  const reference = VITAL_REFERENCES[latest.vitalId];
  const sourceIds = [...new Set([...assessment.sources, ...reference.sources])];
  return <section className="health-panel vital-status-panel" aria-label={text(locale, 'Classificação da última leitura', 'Latest reading classification')}>
    <div className="vital-status-heading"><div><span className="sleep-eyebrow">{text(locale, 'CLASSIFICAÇÃO DA ÚLTIMA LEITURA', 'LATEST READING CLASSIFICATION')}</span><h2>{tr(latest.label)}</h2></div><span className={`vital-status-badge ${assessment.state}`}>{tr(STATE_LABELS[assessment.state])}</span></div>
    <div className="vital-status-findings">{assessment.reason === 'missing' || assessment.reason === 'invalid'
      ? <p>{text(locale, 'Leitura indisponível: a fonte está atrasada ou inválida. Ausência de dado não é um resultado normal.', 'Reading unavailable: the source is delayed or invalid. Missing data is not a normal result.')}</p>
      : assessment.reason === 'insufficient-context'
      ? <p>{text(locale, 'Interpretação indisponível: a leitura precisa de contexto (atividade, jejum ou linha de base) para ser classificada.', 'Interpretation unavailable: this reading needs context (activity, fasting, or baseline) before it can be classified.')}</p>
      : assessment.findings.length === 0
        ? <p>{text(locale, 'Dentro da referência para o contexto informado.', 'Within the reference range for the reported context.')}</p>
        : assessment.findings.map(finding => <p key={finding.label.en}><strong>{finding.label[lang]}.</strong> {finding.action[lang]}</p>)}</div>
    <dl className="vital-status-facts">
      <div><dt>{text(locale, 'Referência', 'Reference')}</dt><dd>{reference.reference[lang]}</dd></div>
      <div><dt>{text(locale, 'Escalonamento', 'Escalation')}</dt><dd>{tr(ESCALATION_LABELS[assessment.escalation])}</dd></div>
      {assessment.recheck && <div><dt>{text(locale, 'Repetir medição', 'Repeat measurement')}</dt><dd>{assessment.recheck[lang]}</dd></div>}
    </dl>
    <p className="vital-status-sources">{text(locale, 'Fontes da classificação:', 'Classification sources:')} {sourceIds.map((id, index) => { const source = VITAL_SOURCES[id]; return <span key={id}>{index > 0 && '; '}{'url' in source ? <a href={source.url} target="_blank" rel="noreferrer">{source.title} <ArrowUpRight size={10}/></a> : source.title}</span>; })}</p>
    <p className="vital-status-note">{text(locale, 'Referências clínicas terrestres não são limites operacionais aprovados pela NASA. A classificação apoia a decisão, não faz diagnóstico.', 'Terrestrial clinical references are not NASA-approved operational limits. This classification supports decisions; it does not diagnose.')}</p>
  </section>;
}
