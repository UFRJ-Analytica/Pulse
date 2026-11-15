import { ArrowUpRight, ShieldCheck, Stethoscope } from 'lucide-react';
import { VITAL_REFERENCES, VITAL_SOURCES } from '../data/vitals';
import type { EvidenceKind, Escalation } from '../data/vitals';
import type { IndicatorRecord } from '../data/types';
import { useLocale, tx } from '../i18n/locale-context';

const ESCALATION_LABELS: Record<Escalation, string> = {
  none: 'Não é necessário escalar',
  crew: 'Avisar a tripulação',
  'flight-surgeon': 'Informar o flight surgeon',
};
const KIND_LABELS: Record<EvidenceKind, string> = {
  nasa: 'NASA',
  'peer-reviewed': 'Artigo revisado por pares',
  'terrestrial-clinical': 'Referência clínica terrestre',
  'aerospace-regulator': 'Regulador aeroespacial',
  'project-analysis': 'Análise do projeto',
};

/** Classification, guidance and sources of a vital sign record. */
export function VitalAssessmentSection({ record }: { record: IndicatorRecord }) {
  const locale = useLocale();
  const assessment = record.vital;
  if (!assessment) return null;
  const reference = VITAL_REFERENCES[assessment.vitalId];
  const sourceIds = [...new Set([...assessment.sources, ...reference.sources])];
  return <section className="inspection-section" aria-label={tx(locale, 'Classificação do sinal vital', 'Vital sign classification')}>
    <h3><Stethoscope size={14} />{tx(locale, 'Classificação e conduta', 'Classification and guidance')}</h3>
    {assessment.reason === 'insufficient-context'
      ? <p>{tx(locale, 'Interpretação indisponível: a leitura precisa de contexto (atividade, jejum ou linha de base) para ser classificada.', 'Interpretation unavailable: this reading needs context (activity, fasting, or baseline) before it can be classified.')}</p>
      : assessment.findings.length === 0
        ? <p>{tx(locale, 'Dentro da referência para o contexto informado.', 'Within the reference range for the reported context.')}</p>
        : assessment.findings.map(finding => <p key={finding.label.en}><strong>{finding.label[locale]}.</strong> {finding.action[locale]}</p>)}
    <dl className="metadata-list">
      <div><dt>{tx(locale, 'Referência', 'Reference')}</dt><dd>{reference.reference[locale]}</dd></div>
      <div><dt>{tx(locale, 'Escalonamento', 'Escalation')}</dt><dd>{locale === 'en' ? ({ none: 'No escalation needed', crew: 'Notify the crew', 'flight-surgeon': 'Notify the flight surgeon' } as const)[assessment.escalation] : ESCALATION_LABELS[assessment.escalation]}</dd></div>
      {assessment.recheck && <div><dt>{tx(locale, 'Repetir medição', 'Repeat measurement')}</dt><dd>{assessment.recheck[locale]}</dd></div>}
    </dl>
    <h3><ShieldCheck size={14} />{tx(locale, 'Fontes da classificação', 'Classification sources')}</h3>
    {sourceIds.map(id => {
      const source = VITAL_SOURCES[id];
      const context = 'context' in source ? source.context : undefined;
      return <p key={id} className="tiny">
        <strong>{KIND_LABELS[source.kind]}:</strong> {'url' in source ? <a className="text-link" href={source.url} target="_blank" rel="noreferrer">{source.title} <ArrowUpRight size={9} /></a> : source.title}
        {context && <> · {context[locale]}</>}
      </p>;
    })}
    <p className="tiny">{tx(locale, 'Referências clínicas terrestres não são limites operacionais aprovados pela NASA. A classificação apoia a decisão, não faz diagnóstico.', 'Terrestrial clinical references are not NASA-approved operational limits. This classification supports decisions; it does not diagnose.')}</p>
  </section>;
}

export function HeartRateContext() {
  const locale = useLocale();
  if (locale === 'en') return <section className="inspection-section" aria-label="Heart rate context">
    <h3>Why monitor it</h3><p>Heart rate reflects cardiovascular response to exertion, heat, and stress. During long flights it is usually stable, so a persistent change from personal baseline merits attention.</p>
    <h3>Mission factors</h3><p>Microgravity shifts fluids toward the head and deconditions the cardiovascular system, increasing orthostatic intolerance after landing. Isolation, workload, cabin heat, and exercise also affect heart rate. Radiation is studied as a long-term cardiovascular risk, not as an immediate cause of a reading.</p>
    <h3>Review and response</h3><p>At rest, above 100 bpm meets the terrestrial tachycardia reference: repeat after 5 minutes of rest and notify the flight surgeon if it persists. Below 40 bpm can be common in conditioned crew; symptoms such as dizziness, fatigue, or chest pain matter. Above 140 bpm during EVA is associated with reduced performance.</p>
    <h3>Measurement</h3><p>Measure at rest, ideally after waking and before caffeine or exercise: count the pulse for 30 seconds and multiply by two, or use a wearable or onboard ECG. Record activity because resting thresholds do not apply during exercise.</p>
  </section>;
  return <section className="inspection-section" aria-label="Contexto da frequência cardíaca">
    <h3>Por que acompanhar</h3>
    <p>A frequência cardíaca resume a resposta do sistema cardiovascular ao esforço, ao calor e ao estresse. Em voos longos ela fica praticamente estável, então uma mudança persistente em relação ao padrão pessoal merece atenção.</p>
    <h3>Fatores da missão</h3>
    <p>A microgravidade desloca líquidos para a cabeça e descondiciona o sistema cardiovascular, o que favorece a intolerância ortostática no pouso. Isolamento, carga de trabalho, calor da cabine e exercício também alteram a FC. A radiação é estudada como risco cardiovascular de longo prazo, sem efeito imediato na leitura.</p>
    <h3>Quando revisar e como agir</h3>
    <p>Em repouso, acima de 100 bpm é taquicardia pela referência terrestre: repita após 5 minutos de repouso e informe o flight surgeon se persistir. Abaixo de 40 bpm é comum em tripulantes condicionados e só preocupa com tontura, cansaço ou dor no peito. Em EVA, acima de 140 bpm está associado à queda de desempenho.</p>
    <h3>Como medir</h3>
    <p>Em repouso, de preferência ao acordar e antes de cafeína ou exercício: conte o pulso por 30 segundos e multiplique por 2, ou use o wearable ou o ECG de bordo. Registre a atividade da leitura, porque os limiares de repouso não valem durante o exercício.</p>
  </section>;
}

export function BloodPressureContext() {
  const locale = useLocale();
  if (locale === 'en') return <section className="inspection-section" aria-label="Blood pressure context">
    <h3>Why monitor it</h3><p>Blood pressure reflects how the body maintains blood flow as gravity changes. On 3–6 month flights, 24-hour pressure falls by about 8–10 mmHg, alongside higher cardiac output and more dilated vessels.</p>
    <h3>Mission factors</h3><p>Fluid shifts and plasma-volume loss help explain lower in-flight pressure and fainting risk after landing. Stress, poor sleep, and heat can raise pressure. Terrestrial orthostatic-drop criteria do not apply in microgravity.</p>
    <h3>Review and response</h3><p>Categories follow the 2025 AHA/ACC guideline using the more severe component. A single reading does not diagnose hypertension; repeat on separate occasions. Above 180/120 mmHg, notify the flight surgeon immediately. Low pressure without symptoms may be a normal flight adaptation. Before landing, protocols may include fluid loading, salt tablets, and compression garments.</p>
    <h3>Measurement</h3><p>Use an oscillometric upper-arm cuff at heart level after 5 minutes of rest. Do not talk during measurement. Take two readings 1–2 minutes apart and record their average, time, and preceding activity.</p>
  </section>;
  return <section className="inspection-section" aria-label="Contexto da pressão arterial">
    <h3>Por que acompanhar</h3>
    <p>A pressão arterial mostra como o corpo mantém o fluxo de sangue quando a gravidade muda. Em voos de 3 a 6 meses, a pressão de 24 horas cai cerca de 8 a 10 mmHg, com o débito cardíaco maior e os vasos mais dilatados.</p>
    <h3>Fatores da missão</h3>
    <p>O deslocamento de líquidos e a perda de volume de plasma explicam a pressão mais baixa em voo e o risco de desmaio no pouso. Estresse, sono insuficiente e calor podem elevar a pressão. O critério terrestre de queda ortostática não se aplica em microgravidade.</p>
    <h3>Quando revisar e como agir</h3>
    <p>As categorias seguem a diretriz AHA/ACC 2025, pelo componente mais grave. Uma leitura isolada não define hipertensão: repita em ocasiões diferentes. Acima de 180/120 mmHg, informe o flight surgeon imediatamente. Pressão baixa sem sintomas pode ser adaptação normal ao voo. Antes do pouso, o protocolo inclui sobrecarga de líquidos com comprimidos de sal e roupas de compressão.</p>
    <h3>Como medir</h3>
    <p>Manguito oscilométrico no braço, na altura do coração, após 5 minutos de repouso, sem falar durante a medição. Faça duas leituras com 1 a 2 minutos de intervalo e registre a média, o horário e o que foi feito antes.</p>
  </section>;
}

export function GlucoseContext() {
  const locale = useLocale();
  if (locale === 'en') return <section className="inspection-section" aria-label="Blood glucose context">
    <h3>Why monitor it</h3><p>Blood glucose indicates energy availability. Hypoglycemia can impair attention and coordination, which matters during operational tasks. In astronauts, fasting glucose has been reported near 77 mg/dL in flight, similar to preflight.</p>
    <h3>Mission factors</h3><p>After 3–5 months on the ISS, insulin resistance increased in a small study (HOMA-IR rose from 0.70 to 1.10 in nine astronauts), though glucose alone does not show this. Inactivity, food, sleep, and stress also affect readings.</p>
    <h3>Review and response</h3><p>Below 70 mg/dL is hypoglycemia. If the crew member is conscious, ADA’s 15–15 rule advises 15 g of fast-acting carbohydrate and a retest in 15 minutes. Below 54 mg/dL, alert the crew and flight surgeon. Fasting 100–125 mg/dL is impaired; 126 mg/dL or higher requires confirmation. A fasting glucose and insulin pair is needed to calculate HOMA-IR.</p>
    <h3>Measurement</h3><p>Record whether the reading is fasting, post-meal, or continuous. A finger-stick meter provides a spot reading. Continuous glucose monitoring functioned in microgravity in the preliminary Suite Ride (Ax-4) study. Laboratory glucose is the diagnostic reference.</p>
  </section>;
  return <section className="inspection-section" aria-label="Contexto da glicemia">
    <h3>Por que acompanhar</h3>
    <p>A glicemia indica a disponibilidade de energia. Hipoglicemia compromete atenção e coordenação motora, o que é crítico em tarefas operacionais. Em astronautas, a glicemia de jejum fica perto de 77 mg/dL em voo, igual à de antes do voo.</p>
    <h3>Fatores da missão</h3>
    <p>Após 3 a 5 meses na ISS, a resistência à insulina aumenta (o índice HOMA-IR subiu de 0,70 para 1,10 num estudo com nove astronautas), mas a glicemia sozinha não mostra isso. Inatividade, alimentação, sono e estresse também influenciam a leitura.</p>
    <h3>Quando revisar e como agir</h3>
    <p>Abaixo de 70 mg/dL é hipoglicemia em qualquer contexto. Se o tripulante estiver consciente, a regra 15-15 da ADA orienta ingerir 15 g de carboidrato de ação rápida e medir de novo em 15 minutos. Abaixo de 54 mg/dL, avise a tripulação e o flight surgeon. Em jejum, 100 a 125 mg/dL é glicemia alterada e 126 ou mais exige confirmação. Fora do jejum, acima de 140 mg/dL é observação. Para acompanhar a resistência à insulina, combine glicemia e insulina de jejum no cálculo do HOMA-IR.</p>
    <h3>Como medir</h3>
    <p>Registre sempre o contexto: jejum, pós-refeição ou leitura contínua. O glicosímetro capilar serve para leituras pontuais. O monitor contínuo de glicose (CGM) funcionou em microgravidade no estudo Suite Ride (Ax-4, resultados preliminares) e conta como leitura casual. A glicemia laboratorial é a referência para diagnóstico.</p>
  </section>;
}

export function MoodContext() {
  const locale = useLocale();
  if (locale === 'en') return <section className="inspection-section" aria-label="Mood and well-being context">
    <h3>Why monitor it</h3><p>Prolonged isolation and confinement can increase anxiety and depression risk, affecting sleep, morale, and decisions. Mood has no universal normal range; changes from the person’s own baseline matter.</p>
    <h3>Mission factors</h3><p>Limited space, monotony, communication delays with Earth, irregular sleep, and heavy workload. NASA uses monthly cognitive testing and compares results with each astronaut’s preflight baseline.</p>
    <h3>Review and response</h3><p>A persistent decline from personal well-being baseline warrants attention, not diagnosis. Documented countermeasures include private behavioral-health consultations, family contact, privacy, windows, plants, and journaling. Any safety concern requires a human response under mission protocol.</p>
    <h3>Measurement</h3><p>Daily self-report on a 0–10 scale, preferably at the same time. This interface scale is simplified and not a validated psychometric instrument. Access to personal entries must follow mission medical privacy rules.</p>
  </section>;
  return <section className="inspection-section" aria-label="Contexto do humor e bem-estar">
    <h3>Por que acompanhar</h3>
    <p>Isolamento e confinamento prolongados aumentam o risco de ansiedade e depressão, que afetam sono, moral e tomada de decisão. O humor não tem faixa normal universal: o que importa é a mudança em relação ao padrão do próprio tripulante.</p>
    <h3>Fatores da missão</h3>
    <p>Espaço reduzido, monotonia, atraso de comunicação com a Terra, sono irregular e carga de trabalho alta. A NASA aplica um teste cognitivo mensal e compara cada resultado com a linha de base pré-voo do próprio astronauta.</p>
    <h3>Quando revisar e como agir</h3>
    <p>Uma queda persistente do bem-estar em relação ao padrão pessoal justifica atenção, não diagnóstico. As contramedidas documentadas incluem conversas psicológicas privadas com o profissional de saúde comportamental, contato com a família, privacidade, janelas, cultivo de plantas e manter um diário. Qualquer indício de risco à segurança exige resposta humana pelo protocolo da missão.</p>
    <h3>Como medir</h3>
    <p>Autorrelato diário na escala de 0 a 10, de preferência no mesmo horário. A escala é uma simplificação de interface, não um instrumento psicométrico validado. O registro é pessoal: o acesso a ele deve seguir as regras de privacidade médica da missão.</p>
  </section>;
}
