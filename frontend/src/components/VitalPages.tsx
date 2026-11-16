import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Locale } from '../i18n/messages';
import { BLOOD_GLUCOSE_BASELINE, BLOOD_GLUCOSE_SERIES, BLOOD_PRESSURE_SERIES, HEART_RATE_BASELINE, HEART_RATE_SERIES, MOOD_SERIES } from '../data/vitalSeries';
import type { SeriesLabel, VitalSeries } from '../data/vitalSeries';
import { DEMO_MOOD } from '../data/fixtures';
import { moodAssessInput, moodWeek, readCheckInScore } from '../data/checkIn';
import { DEFAULT_SCENARIO_ID, scenarioReadings, scenarioVitals } from '../data/scenarioVitals';
import { GLUCOSE_CONTEXT_LABELS, glucoseLogContext, glucoseLogReading, readGlucoseLog } from '../data/glucoseLog';
import type { VitalReading } from '../data/vitals';
import { VitalStatusPanel } from './VitalStatusPanel';
import { useMissionMode } from './missionMode';
import type { MissionMode } from './missionMode';
import type { LatestReading } from './VitalStatusPanel';
import { HealthHeader, TemperatureContext, TemperatureSleepStyleChart } from './SleepDashboard';
import type { SleepStyleChartConfig, TemperatureView } from './SleepDashboard';
import './sleep-dashboard.css';

type Text = { pt: string; en: string };
type HazardCard = { title: string; basis: string; text: string; track: string };
export type VitalPageConfig = {
  title: Text;
  series: VitalSeries;
  chart: SleepStyleChartConfig;
  aboutTitle: Text;
  about: Text;
  hazardsTitle: Text;
  hazards: { pt: HazardCard[]; en: HazardCard[] };
  sources: string;
  // Latest reading of the series, classified by the vitals layer on the page.
  latest: LatestReading;
  // Range opened first; scenarios open the week, where their readings are.
  initialView?: TemperatureView;
};
type PageProps = {
  onBack: () => void; onAtlas: () => void; onHighlights: () => void; onIndicators: () => void; onData: () => void;
  theme: 'dark' | 'light'; onToggleTheme: () => void; locale: Locale; onLocaleChange: (locale: Locale) => void;
};

const text = (locale: Locale, pt: string, en: string) => locale === 'en' ? en : pt;

// Communication latency of the selected mission, added to the "Distance from Earth" card (same values as the header telemetry).
const MISSION_LATENCY: Record<MissionMode, Text> = {
  ISS: { pt: 'Na ISS, a latência com a Terra é de cerca de 0,24 s (ida): o suporte médico em solo responde praticamente em tempo real.', en: 'On the ISS, latency to Earth is about 0.24 s one way: ground medical support responds almost in real time.' },
  'Lunar Base': { pt: 'Na base lunar, a latência é de cerca de 1,3 s (ida): a conversa com o solo funciona, com um pequeno atraso.', en: 'At a lunar base, latency is about 1.3 s one way: conversations with the ground work, with a short delay.' },
  'Mars Transit': { pt: 'Em trânsito a Marte, a latência chega a 3–22 min (ida): a tripulação precisa decidir sem resposta imediata da Terra.', en: 'In Mars transit, latency reaches 3–22 min one way: the crew must decide without an immediate answer from Earth.' },
};
const DISTANCE_TITLES = ['Distância da Terra', 'Distance from Earth'];

// Last value of the weekly series as the current reading; the earlier days are its history.
const lastOfWeek = (values: number[] = []) => values[values.length - 1];
const weekHistory = (values: number[] = [], context?: VitalReading['context']) => values.slice(0, -1).map(value => ({ value, context }));

type ScenarioProps = { scenarioId?: string };
const pt = (value: number) => String(value).replace('.', ',');
// Week of a demo scenario on a vital page. When the scenario has no readings, the last day (15/11) is left out.
function scenarioPage(base: VitalPageConfig, week: { values: number[]; secondary?: number[] }, latest: LatestReading, missing: boolean): VitalPageConfig {
  const trim = (values: number[]) => missing ? values.slice(0, -1) : values;
  const labels = base.series.labels['7d'] ?? [];
  return {
    ...base,
    initialView: '7d',
    series: {
      ...base.series,
      values: { ...base.series.values, '7d': trim(week.values) },
      ...(week.secondary ? { secondary: { ...base.series.secondary, '7d': trim(week.secondary) } } : {}),
      labels: { ...base.series.labels, '7d': missing ? labels.slice(0, -1) : labels },
    },
    latest: missing
      ? { ...latest, label: { pt: 'Sem leitura em 15/11 · fonte indisponível neste cenário', en: 'No reading on 15/11 · source unavailable in this scenario' }, reading: { value: null } }
      : latest,
  };
}

// Generic vital page with the same structure and CSS classes as the body temperature page.
export function VitalDashboard({ config, onBack, onAtlas, onHighlights, onIndicators, onData, theme, onToggleTheme, locale, onLocaleChange }: PageProps & { config: VitalPageConfig }) {
  const [view, setView] = useState<TemperatureView>(config.initialView ?? config.chart.views?.[0] ?? '24h');
  const tr = (value: Text) => text(locale, value.pt, value.en);
  const label = (value: SeriesLabel) => typeof value === 'string' ? value : tr(value);
  const mission = useMissionMode();
  const hazards = config.hazards[locale === 'en' ? 'en' : 'pt'].map(item => DISTANCE_TITLES.includes(item.title) ? { ...item, text: `${item.text} ${tr(MISSION_LATENCY[mission])}` } : item);
  return <div className="health-shell temperature-page" data-theme={theme}><HealthHeader activePage="sleep" onHighlights={onHighlights} onAtlas={onAtlas} onIndicators={onIndicators} onData={onData} theme={theme} onToggleTheme={onToggleTheme} locale={locale} onLocaleChange={onLocaleChange}/><main className="health-main sleep-main"><section className="sleep-heading health-panel"><div><button className="sleep-back" onClick={onBack}><ArrowLeft size={13}/> {text(locale, 'VOLTAR À VISÃO GERAL', 'BACK TO OVERVIEW')}</button><h1>{tr(config.title)}</h1></div></section>
  <TemperatureSleepStyleChart values={config.series.values[view] ?? []} secondaryValues={config.series.secondary?.[view]} view={view} labels={(config.series.labels[view] ?? []).map(label)} locale={locale} onViewChange={setView} config={config.chart}/>
  <VitalStatusPanel latest={config.latest} locale={locale}/>
  <section className="health-panel temperature-about"><div className="sleep-section-heading"><h2>{tr(config.aboutTitle)}</h2></div><p>{tr(config.about)}</p></section>
  <section className="health-panel temperature-hazards"><div className="sleep-section-heading"><h2>{tr(config.hazardsTitle)}</h2></div><div className="temperature-card-grid">{hazards.map(item => <TemperatureContext key={item.title} {...item}/>)}</div><p className="temperature-source">{text(locale, 'Fontes:', 'Sources:')} {config.sources} {text(locale, 'Conteúdo demonstrativo, não é orientação médica.', 'Demonstration content, not medical advice.')}</p></section>
  </main></div>;
}

const HEART_RATE_PAGE: VitalPageConfig = {
  title: { pt: 'Frequência cardíaca', en: 'Heart Rate' },
  series: HEART_RATE_SERIES,
  chart: {
    eyebrow: { pt: 'FREQUÊNCIA CARDÍACA', en: 'HEART RATE' },
    summaryNote: { pt: 'Série demonstrativa · frequência cardíaca sintética.', en: 'Demonstration series · synthetic heart rate.' },
    tabsLabel: { pt: 'Período da frequência cardíaca', en: 'Heart rate time range' },
    chartLabel: { pt: 'Gráfico de frequência cardíaca', en: 'Heart rate chart' },
    legend: { pt: 'Frequência cardíaca', en: 'Heart rate' },
    referenceLegend: { pt: `Baseline ${HEART_RATE_BASELINE} bpm · repouso 40–100 bpm`, en: `Baseline ${HEART_RATE_BASELINE} bpm · resting 40–100 bpm` },
    footerNote: { pt: 'Linhas apenas de referência. Limites de repouso não valem em exercício ou EVA.', en: 'Reference lines only. Resting limits do not apply during exercise or EVA.' },
    unit: 'bpm', peakSuffix: ' bpm', barSuffix: '', decimals: 0,
    baseline: { value: `${HEART_RATE_BASELINE} bpm`, note: { pt: 'repouso pessoal', en: 'personal resting rate' } },
    range: { value: '40–100', note: { pt: 'repouso', en: 'resting' } },
    unitNote: { pt: 'batimentos/min', en: 'beats/min' },
    axis: [160, 140, 120, 100, 80, 60, 40], axisDecimals: 0, axisSuffix: '', targetMark: 60, baselineValue: HEART_RATE_BASELINE,
    dayIndexes: [7, 12, 14], footerDates: { '24h': '16/11', '7d': '09/11–15/11' },
  },
  aboutTitle: { pt: 'Sobre a Frequência Cardíaca', en: 'About Heart Rate' },
  about: {
    pt: 'A frequência cardíaca resume a resposta do sistema cardiovascular ao esforço, ao calor e ao estresse. Na Terra, o repouso fica entre 60 e 100 bpm, e tripulantes condicionados costumam ficar na faixa dos 40. Em voos longos ela fica praticamente estável, então uma mudança persistente em relação ao padrão pessoal merece atenção. Em repouso, acima de 100 bpm é taquicardia pela referência terrestre.',
    en: 'Heart rate reflects the cardiovascular response to exertion, heat, and stress. On Earth, resting heart rate is 60 to 100 bpm, and conditioned crew often rest in the 40s. During long flights it is usually stable, so a persistent change from personal baseline merits attention. At rest, above 100 bpm meets the terrestrial tachycardia reference.',
  },
  hazardsTitle: { pt: 'Como o ambiente espacial afeta a frequência cardíaca', en: 'How the space environment affects heart rate' },
  hazards: {
    pt: [
      { title: 'Gravidade alterada', basis: 'Base: estudo na ISS, missões de 6 meses', text: 'Na ausência de peso, os líquidos do corpo se deslocam para a cabeça e os vasos se dilatam. Em missões longas na ISS, a frequência cardíaca de repouso ficou praticamente igual, enquanto a pressão de 24 h caiu. No retorno, o descondicionamento favorece a intolerância ortostática: tontura e FC subindo ao ficar de pé.', track: 'FC de repouso em relação ao baseline e FC ao ficar de pé após o pouso.' },
      { title: 'Isolamento e confinamento', basis: 'Base: saúde comportamental (OCHMO); relação com a FC vem de estudos terrestres', text: 'Isolamento, monotonia e carga de trabalho alta aumentam o estresse, e o estresse eleva a frequência cardíaca. Uma FC de repouso persistentemente acima do padrão pessoal pode refletir sono ruim, estresse ou desidratação, e não só uma alteração do coração.', track: 'FC de repouso junto aos registros de humor e sono.' },
      { title: 'Distância da Terra', basis: 'Base: planejamento de missão', text: 'Além da órbita baixa, a ajuda demora mais para chegar, e a tripulação precisa medir e interpretar os sinais vitais por conta própria. A FC de repouso é simples de medir: pulso por 30 segundos multiplicado por 2, wearable ou ECG de bordo. Os limiares de repouso só valem se a atividade da leitura estiver registrada.', track: 'Medição diária ao acordar, com a atividade registrada.' },
      { title: 'Ambiente fechado ou desafiador', basis: 'Base: NASA-STD-3001 Vol. 2, trajes espaciais', text: 'Na EVA, o traje combina esforço intenso e calor retido. Acima de 140 bpm em EVA está associado à queda de desempenho, e a orientação é reduzir o esforço e avisar a equipe. Calor da cabine e exercício também elevam a FC de forma temporária.', track: 'Picos de FC em EVA e exercício.' },
      { title: 'Radiação', basis: 'Base: NASA HRP, risco cardiovascular; evidência sobretudo de estudos em animais e populações terrestres', text: 'A radiação espacial é estudada como risco cardiovascular de longo prazo, principalmente em missões além da órbita baixa. Não se espera efeito imediato na frequência cardíaca de uma leitura, e uma mudança na FC não indica exposição.', track: 'Dose acumulada no atlas (dosímetro), avaliada separadamente da FC.' },
    ],
    en: [
      { title: 'Altered gravity', basis: 'Basis: ISS study, 6-month missions', text: 'In weightlessness, body fluids shift toward the head and blood vessels dilate. In long ISS missions, resting heart rate stayed about the same while 24-hour blood pressure fell. After return, deconditioning favors orthostatic intolerance: dizziness and heart rate rising on standing.', track: 'Resting heart rate compared with baseline, and heart rate on standing after landing.' },
      { title: 'Isolation and confinement', basis: 'Basis: OCHMO behavioral health; heart rate link from terrestrial studies', text: 'Isolation, monotony, and heavy workload increase stress, and stress raises heart rate. A resting heart rate persistently above personal pattern can reflect poor sleep, stress, or dehydration, not only a change in the heart.', track: 'Resting heart rate alongside mood and sleep entries.' },
      { title: 'Distance from Earth', basis: 'Basis: mission planning', text: 'Beyond low Earth orbit, help takes longer to arrive, so crews must measure and interpret vital signs on their own. Resting heart rate is simple to measure: pulse for 30 seconds times two, a wearable, or the onboard ECG. Resting thresholds only apply when the activity at the time of the reading is recorded.', track: 'Daily measurement on waking, with activity recorded.' },
      { title: 'Enclosed or challenging environment', basis: 'Basis: NASA-STD-3001 Vol. 2, spacesuits', text: 'During EVA, the suit combines hard exertion and retained heat. Above 140 bpm during EVA is associated with reduced performance, and the guidance is to reduce workload and tell the EVA team. Cabin heat and exercise also raise heart rate temporarily.', track: 'Heart rate peaks during EVA and exercise.' },
      { title: 'Radiation', basis: 'Basis: NASA HRP, cardiovascular risk; evidence mostly from animal and terrestrial population studies', text: 'Space radiation is studied as a long-term cardiovascular risk, mainly on missions beyond low Earth orbit. No immediate effect on a heart rate reading is expected, and a change in heart rate does not indicate exposure.', track: 'Accumulated dose in the atlas (dosimeter), assessed separately from heart rate.' },
    ],
  },
  sources: 'Norsk et al., J Physiol 2015; American Heart Association; NASA-STD-3001 Vol. 2; OCHMO-TB-016; NASA Human Research Program (space radiation risks).',
  latest: {
    vitalId: 'heart-rate', label: { pt: `${lastOfWeek(HEART_RATE_SERIES.values['7d'])} bpm · repouso ao acordar · 15/11`, en: `${lastOfWeek(HEART_RATE_SERIES.values['7d'])} bpm · resting, on waking · 15/11` },
    reading: { value: lastOfWeek(HEART_RATE_SERIES.values['7d']), context: { activity: 'rest' } },
    options: { baseline: HEART_RATE_BASELINE, history: weekHistory(HEART_RATE_SERIES.values['7d'], { activity: 'rest' }) },
  },
};

export function HeartRateDashboard({ scenarioId = DEFAULT_SCENARIO_ID, ...props }: PageProps & ScenarioProps) {
  const vitals = scenarioVitals(scenarioId);
  if (!vitals.vitalScenario && !vitals.missing) return <VitalDashboard {...props} config={HEART_RATE_PAGE}/>;
  const { week, context } = vitals.heartRate;
  const value = week[week.length - 1];
  const symptoms = context.symptomatic ? { pt: ' · com sintomas', en: ' · with symptoms' } : { pt: '', en: '' };
  return <VitalDashboard {...props} config={scenarioPage(HEART_RATE_PAGE, { values: week }, {
    vitalId: 'heart-rate', label: { pt: `${value} bpm · repouso${symptoms.pt} · 15/11`, en: `${value} bpm · resting${symptoms.en} · 15/11` },
    ...scenarioReadings(vitals).heartRate,
  }, vitals.missing)}/>;
}

const BLOOD_PRESSURE_PAGE: VitalPageConfig = {
  title: { pt: 'Pressão arterial', en: 'Blood Pressure' },
  series: BLOOD_PRESSURE_SERIES,
  chart: {
    eyebrow: { pt: 'PRESSÃO ARTERIAL', en: 'BLOOD PRESSURE' },
    summaryNote: { pt: 'Série demonstrativa · pressão sistólica e diastólica sintéticas.', en: 'Demonstration series · synthetic systolic and diastolic pressure.' },
    tabsLabel: { pt: 'Período da pressão arterial', en: 'Blood pressure time range' },
    chartLabel: { pt: 'Gráfico de pressão arterial', en: 'Blood pressure chart' },
    legend: { pt: 'Sistólica', en: 'Systolic' },
    secondaryLegend: { pt: 'Diastólica', en: 'Diastolic' },
    referenceLegend: { pt: 'Referência 120 mmHg · normal < 120/80', en: 'Reference 120 mmHg · normal < 120/80' },
    footerNote: { pt: 'Linhas apenas de referência. Vale a categoria mais alta entre as duas leituras.', en: 'Reference lines only. The higher category of the two readings applies.' },
    unit: 'mmHg', peakSuffix: ' mmHg', barSuffix: '', decimals: 0,
    baseline: { value: '112/72', note: { pt: 'pré-voo', en: 'pre-flight' } },
    range: { value: '< 120/80', note: { pt: 'normal', en: 'normal' } },
    unitNote: { pt: 'sist./diast.', en: 'sys./dia.' },
    axis: [160, 140, 120, 100, 80, 60, 40], axisDecimals: 0, axisSuffix: '', targetMark: 120,
    dayIndexes: [7, 12, 14], footerDates: { '24h': '16/11', '7d': '09/11–15/11' },
  },
  aboutTitle: { pt: 'Sobre a Pressão Arterial', en: 'About Blood Pressure' },
  about: {
    pt: 'A pressão arterial mostra como o corpo mantém o fluxo de sangue quando a gravidade muda. Em voos de 3 a 6 meses, a pressão de 24 horas cai cerca de 8 a 10 mmHg, com o débito cardíaco maior e os vasos mais dilatados. A referência clínica terrestre considera normal abaixo de 120/80 mmHg, e vale a categoria mais alta entre as duas leituras.',
    en: 'Blood pressure reflects how the body maintains blood flow as gravity changes. On 3–6 month flights, 24-hour pressure falls by about 8–10 mmHg, alongside higher cardiac output and more dilated vessels. By terrestrial clinical standards, below 120/80 mmHg is normal, and the higher category of the two readings applies.',
  },
  hazardsTitle: { pt: 'Como o ambiente espacial afeta a pressão arterial', en: 'How the space environment affects blood pressure' },
  hazards: {
    pt: [
      { title: 'Gravidade alterada', basis: 'Base: estudo na ISS, missões de 3 a 6 meses', text: 'Sem peso, os líquidos se deslocam para a cabeça, os vasos se dilatam e a pressão de 24 h cai cerca de 8 a 10 mmHg. A perda de volume de plasma ajuda a explicar o risco de desmaio no pouso. Os critérios terrestres de queda ortostática não valem em microgravidade.', track: 'Pressão de 24 h em relação ao pré-voo e sintomas ao ficar de pé após o pouso.' },
      { title: 'Isolamento e confinamento', basis: 'Base: referência clínica terrestre (AHA/ACC 2025)', text: 'Estresse, sono ruim e calor elevam a pressão de forma aguda. Uma leitura alta isolada não define hipertensão: a referência clínica pede leituras repetidas em dias diferentes antes de classificar.', track: 'Pressão junto aos registros de sono e humor.' },
      { title: 'Distância da Terra', basis: 'Base: planejamento de missão e referência clínica terrestre', text: 'Longe da Terra, a tripulação mede e interpreta a pressão por conta própria. Medir sentado, após 5 minutos de repouso, com o braço apoiado na altura do coração, e repetir a leitura reduz erros de técnica.', track: 'Técnica de medição e leituras repetidas no mesmo horário.' },
      { title: 'Ambiente fechado ou desafiador', basis: 'Base: estudo na ISS e regra do produto', text: 'Exercício e EVA elevam a pressão de forma temporária. Pressão baixa é esperada em voo e só merece escalonamento com sintomas como tontura ou desmaio, quando o flight surgeon deve ser informado.', track: 'Picos em exercício e pressão baixa acompanhada de sintomas.' },
      { title: 'Radiação', basis: 'Base: NASA HRP, risco cardiovascular; evidência sobretudo de estudos em animais e populações terrestres', text: 'A radiação espacial é estudada como risco de dano vascular de longo prazo, principalmente em missões além da órbita baixa. Não se espera efeito imediato na pressão de uma leitura, e uma pressão alterada não indica exposição.', track: 'Dose acumulada no atlas (dosímetro), avaliada separadamente da pressão.' },
    ],
    en: [
      { title: 'Altered gravity', basis: 'Basis: ISS study, 3–6 month missions', text: 'In weightlessness, fluids shift toward the head, vessels dilate, and 24-hour pressure falls by about 8–10 mmHg. Plasma-volume loss helps explain fainting risk at landing. Terrestrial orthostatic-drop criteria do not apply in microgravity.', track: '24-hour pressure compared with pre-flight, and symptoms on standing after landing.' },
      { title: 'Isolation and confinement', basis: 'Basis: terrestrial clinical reference (AHA/ACC 2025)', text: 'Stress, poor sleep, and heat raise pressure acutely. A single high reading does not define hypertension: the clinical reference asks for repeated readings on different days before classifying.', track: 'Pressure alongside sleep and mood entries.' },
      { title: 'Distance from Earth', basis: 'Basis: mission planning and terrestrial clinical reference', text: 'Far from Earth, crews measure and interpret pressure on their own. Measuring seated after 5 minutes of rest, with the arm supported at heart level, and repeating the reading reduces technique errors.', track: 'Measurement technique and repeated readings at the same time.' },
      { title: 'Enclosed or challenging environment', basis: 'Basis: ISS study and product rule', text: 'Exercise and EVA raise pressure temporarily. Low pressure is expected in flight and only warrants escalation with symptoms such as dizziness or fainting, when the flight surgeon should be told.', track: 'Peaks during exercise, and low pressure with symptoms.' },
      { title: 'Radiation', basis: 'Basis: NASA HRP, cardiovascular risk; evidence mostly from animal and terrestrial population studies', text: 'Space radiation is studied as a long-term risk of vascular damage, mainly on missions beyond low Earth orbit. No immediate effect on a blood pressure reading is expected, and an altered pressure does not indicate exposure.', track: 'Accumulated dose in the atlas (dosimeter), assessed separately from blood pressure.' },
    ],
  },
  sources: 'Norsk et al., J Physiol 2015; AHA/ACC High Blood Pressure Guideline 2025; NASA Human Research Program (space radiation risks).',
  latest: {
    vitalId: 'blood-pressure', label: { pt: `${lastOfWeek(BLOOD_PRESSURE_SERIES.values['7d'])}/${lastOfWeek(BLOOD_PRESSURE_SERIES.secondary?.['7d'])} mmHg · leitura matinal · 15/11`, en: `${lastOfWeek(BLOOD_PRESSURE_SERIES.values['7d'])}/${lastOfWeek(BLOOD_PRESSURE_SERIES.secondary?.['7d'])} mmHg · morning reading · 15/11` },
    reading: { value: lastOfWeek(BLOOD_PRESSURE_SERIES.values['7d']), secondary: lastOfWeek(BLOOD_PRESSURE_SERIES.secondary?.['7d']) },
  },
};

const BLOOD_GLUCOSE_PAGE: VitalPageConfig = {
  title: { pt: 'Glicemia', en: 'Blood Glucose' },
  series: BLOOD_GLUCOSE_SERIES,
  chart: {
    eyebrow: { pt: 'GLICEMIA', en: 'BLOOD GLUCOSE' },
    summaryNote: { pt: 'Série demonstrativa · glicemia capilar sintética.', en: 'Demonstration series · synthetic capillary glucose.' },
    tabsLabel: { pt: 'Período da glicemia', en: 'Blood glucose time range' },
    chartLabel: { pt: 'Gráfico de glicemia', en: 'Blood glucose chart' },
    legend: { pt: 'Glicemia', en: 'Blood glucose' },
    referenceLegend: { pt: '100 mg/dL · início da glicemia de jejum alterada (normal 70–99)', en: '100 mg/dL · impaired fasting threshold (normal 70–99)' },
    footerNote: { pt: 'As linhas de referência são marcos descritivos. A faixa depende do contexto: jejum ou pós-refeição.', en: 'Reference lines are descriptive landmarks. The range depends on context: fasting or post-meal.' },
    unit: 'mg/dL', peakSuffix: ' mg/dL', barSuffix: '', decimals: 0,
    baseline: { value: `${BLOOD_GLUCOSE_BASELINE} mg/dL`, note: { pt: 'jejum pessoal', en: 'personal fasting level' } },
    range: { value: '70–99', note: { pt: 'jejum', en: 'fasting' } },
    unitNote: { pt: 'capilar', en: 'fingerstick' },
    axis: [200, 175, 150, 125, 100, 75, 50], axisDecimals: 0, axisSuffix: '', targetMark: 100,
    dayIndexes: [0, 1, 2], fullDayLabels: true, footerDates: { '24h': '16/11', '7d': '09/11–15/11' },
  },
  aboutTitle: { pt: 'Sobre a Glicemia', en: 'About Blood Glucose' },
  about: {
    pt: 'A glicemia indica a disponibilidade de energia. Hipoglicemia compromete atenção e coordenação motora, o que é crítico em tarefas operacionais. Em astronautas, a glicemia de jejum fica perto de 77 mg/dL em voo, igual à de antes do voo. Toda leitura precisa do contexto: em jejum, o normal vai de 70 a 99 mg/dL; fora do jejum, até 140 mg/dL.',
    en: 'Blood glucose indicates energy availability. Hypoglycemia can impair attention and coordination, which matters during operational tasks. In astronauts, fasting glucose has been reported near 77 mg/dL in flight, similar to preflight. Every reading needs its context: when fasting, normal is 70–99 mg/dL; otherwise, up to 140 mg/dL.',
  },
  hazardsTitle: { pt: 'Como o ambiente espacial afeta a glicemia', en: 'How the space environment affects blood glucose' },
  hazards: {
    pt: [
      { title: 'Gravidade alterada', basis: 'Base: estudo na ISS, 9 astronautas', text: 'Após 3 a 5 meses na ISS, a resistência à insulina aumentou (o HOMA-IR subiu de 0,70 para 1,10), mesmo com a glicemia de jejum quase estável. A glicose sozinha não mostra essa mudança: é preciso dosar também a insulina.', track: 'Glicemia de jejum em relação ao baseline e insulina de jejum para o HOMA-IR.' },
      { title: 'Isolamento e confinamento', basis: 'Base: estudos terrestres; não demonstrado no espaço', text: 'Sono curto, estresse e inatividade pioram a regulação da glicose em estudos na Terra. Na missão, esses fatores aparecem juntos e podem pesar nas leituras, mas o efeito no espaço não foi medido isoladamente.', track: 'Glicemia junto aos registros de sono e humor.' },
      { title: 'Distância da Terra', basis: 'Base: planejamento de missão e estudo Suite Ride (Ax-4, preliminar)', text: 'Sem laboratório por perto, a tripulação mede com glicosímetro capilar ou monitor contínuo (CGM), que funcionou em microgravidade em resultados preliminares. Sem o contexto registrado, uma leitura entre 100 e 140 mg/dL não pode ser interpretada.', track: 'Contexto de cada leitura: jejum, pós-refeição ou contínua.' },
      { title: 'Ambiente fechado ou desafiador', basis: 'Base: ADA Standards of Care 2025', text: 'Esforço prolongado, como em EVA, consome glicose. Abaixo de 70 mg/dL, a regra 15-15 orienta ingerir 15 g de carboidrato de ação rápida e medir de novo em 15 minutos. Abaixo de 54 mg/dL, avise a tripulação e o flight surgeon.', track: 'Leitura antes de EVA e sintomas de hipoglicemia.' },
      { title: 'Radiação', basis: 'Base: análise do projeto', text: 'Não há efeito direto conhecido da radiação espacial sobre a glicemia de leituras de rotina. O app não relaciona dose e glicemia sem pares de dados alinhados da mesma pessoa e período.', track: 'Dose no atlas, avaliada separadamente; correlações só com pares válidos.' },
    ],
    en: [
      { title: 'Altered gravity', basis: 'Basis: ISS study, 9 astronauts', text: 'After 3–5 months on the ISS, insulin resistance increased (HOMA-IR rose from 0.70 to 1.10) while fasting glucose stayed nearly stable. Glucose alone does not show this change: insulin must be measured too.', track: 'Fasting glucose compared with baseline, and fasting insulin for HOMA-IR.' },
      { title: 'Isolation and confinement', basis: 'Basis: terrestrial studies; not shown in space', text: 'Short sleep, stress, and inactivity worsen glucose regulation in studies on Earth. During a mission these factors occur together and may weigh on readings, but the effect in space has not been measured on its own.', track: 'Glucose alongside sleep and mood entries.' },
      { title: 'Distance from Earth', basis: 'Basis: mission planning and the Suite Ride study (Ax-4, preliminary)', text: 'With no laboratory nearby, crews measure with a capillary meter or a continuous glucose monitor (CGM), which worked in microgravity in preliminary results. Without recorded context, a reading between 100 and 140 mg/dL cannot be interpreted.', track: 'Context of each reading: fasting, post-meal, or continuous.' },
      { title: 'Enclosed or challenging environment', basis: 'Basis: ADA Standards of Care 2025', text: 'Prolonged exertion, as in EVA, uses glucose. Below 70 mg/dL, the 15-15 rule is to take 15 g of fast-acting carbohydrate and recheck in 15 minutes. Below 54 mg/dL, alert the crew and the flight surgeon.', track: 'Reading before EVA and hypoglycemia symptoms.' },
      { title: 'Radiation', basis: 'Basis: project analysis', text: 'There is no known direct effect of space radiation on routine glucose readings. The app does not relate dose and glucose without aligned data pairs from the same person and period.', track: 'Dose in the atlas, assessed separately; correlations only with valid pairs.' },
    ],
  },
  sources: 'Hughson et al., Am J Physiol Heart Circ Physiol 2016; ADA Standards of Care 2025; Suite Ride (Ax-4, preliminary results).',
  latest: {
    vitalId: 'blood-glucose', label: { pt: `${lastOfWeek(BLOOD_GLUCOSE_SERIES.values['7d'])} mg/dL · jejum matinal · 15/11`, en: `${lastOfWeek(BLOOD_GLUCOSE_SERIES.values['7d'])} mg/dL · morning fasting · 15/11` },
    reading: { value: lastOfWeek(BLOOD_GLUCOSE_SERIES.values['7d']), context: { meal: 'fasting' } },
    options: { baseline: BLOOD_GLUCOSE_BASELINE, history: weekHistory(BLOOD_GLUCOSE_SERIES.values['7d'], { meal: 'fasting' }) },
  },
};

const MOOD_PAGE: VitalPageConfig = {
  title: { pt: 'Humor e bem-estar', en: 'Mood and Well-Being' },
  series: MOOD_SERIES,
  chart: {
    eyebrow: { pt: 'HUMOR E BEM-ESTAR', en: 'MOOD AND WELL-BEING' },
    summaryNote: { pt: 'Série demonstrativa · composto sintético do check-in matinal.', en: 'Demonstration series · synthetic morning check-in composite.' },
    tabsLabel: { pt: 'Período do humor', en: 'Mood time range' },
    chartLabel: { pt: 'Gráfico de humor e bem-estar', en: 'Mood and well-being chart' },
    legend: { pt: 'Composto do check-in', en: 'Check-in composite' },
    referenceLegend: { pt: 'Baseline pessoal · observação abaixo de 80%', en: 'Personal baseline · flagged below 80%' },
    footerNote: { pt: 'Escala simplificada, não é instrumento psicométrico validado.', en: 'Simplified scale, not a validated psychometric instrument.' },
    unit: '/5', peakSuffix: '/5', barSuffix: '', decimals: 1,
    baseline: { value: { pt: DEMO_MOOD.baseline.toLocaleString('pt-BR'), en: `${DEMO_MOOD.baseline}` }, note: { pt: 'padrão pessoal', en: 'personal pattern' } },
    range: { value: { pt: `≥ ${(DEMO_MOOD.baseline * .8).toFixed(1).replace('.', ',')}`, en: `≥ ${(DEMO_MOOD.baseline * .8).toFixed(1)}` }, note: { pt: 'limite de observação', en: 'observation threshold' } },
    unitNote: { pt: 'escala 1–5', en: '1–5 scale' },
    axis: [5, 4, 3, 2, 1], axisDecimals: 0, axisSuffix: '', targetMark: 4, baselineValue: DEMO_MOOD.baseline,
    views: ['7d'], dayIndexes: [], footerDates: { '24h': '', '7d': '09/11–15/11' },
  },
  aboutTitle: { pt: 'Sobre o Humor e o Bem-Estar', en: 'About Mood and Well-Being' },
  about: {
    pt: 'Isolamento e confinamento prolongados aumentam o risco de ansiedade e depressão, que afetam sono, moral e tomada de decisão. O humor não tem faixa normal universal: o que importa é a mudança em relação ao padrão do próprio tripulante. Aqui, o valor diário é o composto de 1 a 5 do check-in matinal (bem-estar, estresse, vigor e qualidade do sono).',
    en: 'Prolonged isolation and confinement can increase anxiety and depression risk, affecting sleep, morale, and decisions. Mood has no universal normal range; changes from the person’s own baseline matter. Here, the daily value is the 1–5 morning check-in composite (well-being, stress, vigor, and sleep quality).',
  },
  hazardsTitle: { pt: 'Como o ambiente espacial afeta o humor', en: 'How the space environment affects mood' },
  hazards: {
    pt: [
      { title: 'Gravidade alterada', basis: 'Base: OCHMO-TB-041 (sono)', text: 'Em voo, o sono médio fica perto de 6 h, abaixo da recomendação de 7 a 9 h, e o ciclo de luz não segue o dia terrestre. Como o check-in inclui a qualidade do sono, noites ruins puxam o composto para baixo.', track: 'Composto do check-in junto às horas de sono.' },
      { title: 'Isolamento e confinamento', basis: 'Base: OCHMO-TB-016 (saúde comportamental)', text: 'Isolamento e confinamento prolongados aumentam o risco de ansiedade e depressão. As contramedidas documentadas incluem conversas psicológicas privadas, contato com a família, privacidade, janelas, plantas e diário.', track: 'Queda persistente em relação ao padrão pessoal (3 check-ins abaixo de 80%).' },
      { title: 'Distância da Terra', basis: 'Base: OCHMO-TB-016 e planejamento de missão', text: 'O atraso de comunicação reduz o apoio em tempo real vindo da Terra, e a tripulação precisa notar mudanças por conta própria. Um registro curto e diário, no mesmo horário, torna a comparação com o padrão pessoal possível.', track: 'Check-in diário no mesmo horário.' },
      { title: 'Ambiente fechado ou desafiador', basis: 'Base: OCHMO-TB-016', text: 'Espaço reduzido, monotonia, ruído, temperatura da cabine e carga de trabalho alta pesam no bem-estar. Qualquer indício de risco à segurança exige resposta humana pelo protocolo da missão, não só um registro.', track: 'Fatores marcados no check-in, como carga de trabalho e ruído da cabine.' },
      { title: 'Radiação', basis: 'Base: NASA HRP, risco ao sistema nervoso central; evidência sobretudo de estudos em animais', text: 'A radiação é estudada como risco ao sistema nervoso central em missões longas, com possíveis efeitos sobre cognição e comportamento. Não há efeito conhecido sobre o humor do dia a dia, e o check-in não mede exposição.', track: 'Dose acumulada no atlas, avaliada separadamente do check-in.' },
    ],
    en: [
      { title: 'Altered gravity', basis: 'Basis: OCHMO-TB-041 (sleep)', text: 'In flight, average sleep is close to 6 h, below the recommended 7 to 9 h, and the light cycle does not follow the Earth day. Because the check-in includes sleep quality, poor nights pull the composite down.', track: 'Check-in composite alongside sleep hours.' },
      { title: 'Isolation and confinement', basis: 'Basis: OCHMO-TB-016 (behavioral health)', text: 'Prolonged isolation and confinement increase anxiety and depression risk. Documented countermeasures include private psychological conferences, family contact, privacy, windows, plants, and journaling.', track: 'Persistent decline from personal pattern (3 check-ins below 80%).' },
      { title: 'Distance from Earth', basis: 'Basis: OCHMO-TB-016 and mission planning', text: 'Communication delay reduces real-time support from Earth, so crews must notice changes on their own. A short daily entry at the same time makes comparison with the personal pattern possible.', track: 'Daily check-in at the same time.' },
      { title: 'Enclosed or challenging environment', basis: 'Basis: OCHMO-TB-016', text: 'Limited space, monotony, noise, cabin temperature, and heavy workload weigh on well-being. Any sign of a safety risk requires a human response under mission protocol, not just a log entry.', track: 'Factors marked in the check-in, such as workload and cabin noise.' },
      { title: 'Radiation', basis: 'Basis: NASA HRP, central nervous system risk; evidence mostly from animal studies', text: 'Radiation is studied as a central nervous system risk on long missions, with possible effects on cognition and behavior. There is no known effect on day-to-day mood, and the check-in does not measure exposure.', track: 'Accumulated dose in the atlas, assessed separately from the check-in.' },
    ],
  },
  sources: 'OCHMO-TB-016 Behavioral Health and Performance; OCHMO-TB-041 Sleep; NASA Human Research Program (space radiation risks); Analytica Pulse indicator analysis.',
  latest: {
    vitalId: 'mood', label: { pt: `${String(lastOfWeek(MOOD_SERIES.values['7d'])).replace('.', ',')} / 5 · check-in matinal · 15/11`, en: `${lastOfWeek(MOOD_SERIES.values['7d'])} / 5 · morning check-in · 15/11` },
    reading: { value: lastOfWeek(MOOD_SERIES.values['7d']) },
    options: { baseline: DEMO_MOOD.baseline, history: weekHistory(MOOD_SERIES.values['7d']) },
  },
};

export function BloodPressureDashboard({ scenarioId = DEFAULT_SCENARIO_ID, ...props }: PageProps & ScenarioProps) {
  const vitals = scenarioVitals(scenarioId);
  if (!vitals.vitalScenario && !vitals.missing) return <VitalDashboard {...props} config={BLOOD_PRESSURE_PAGE}/>;
  const { systolic, diastolic, context } = vitals.bloodPressure;
  const [sys, dia] = [systolic[systolic.length - 1], diastolic[diastolic.length - 1]];
  const symptoms = context.symptomatic ? { pt: ' · com sintomas', en: ' · with symptoms' } : { pt: '', en: '' };
  return <VitalDashboard {...props} config={scenarioPage(BLOOD_PRESSURE_PAGE, { values: systolic, secondary: diastolic }, {
    vitalId: 'blood-pressure', label: { pt: `${sys}/${dia} mmHg · leitura matinal${symptoms.pt} · 15/11`, en: `${sys}/${dia} mmHg · morning reading${symptoms.en} · 15/11` },
    ...scenarioReadings(vitals).bloodPressure,
  }, vitals.missing)}/>;
}

export function BloodGlucoseDashboard({ scenarioId = DEFAULT_SCENARIO_ID, ...props }: PageProps & ScenarioProps) {
  // A result logged from the Highlights modal is the latest reading, as on the Highlights card,
  // except in scenarios that set their own readings.
  const [log] = useState(readGlucoseLog);
  const vitals = scenarioVitals(scenarioId);
  if (vitals.vitalScenario || vitals.missing) {
    const { week, source } = vitals.glucose;
    const value = week[week.length - 1];
    const how = source === 'cgm' ? { pt: 'CGM', en: 'CGM' } : { pt: 'jejum matinal', en: 'morning fasting' };
    return <VitalDashboard {...props} config={scenarioPage(BLOOD_GLUCOSE_PAGE, { values: week }, {
      vitalId: 'blood-glucose', label: { pt: `${value} mg/dL · ${how.pt} · 15/11`, en: `${value} mg/dL · ${how.en} · 15/11` },
      ...scenarioReadings(vitals).glucose,
    }, vitals.missing)}/>;
  }
  if (!log) return <VitalDashboard {...props} config={BLOOD_GLUCOSE_PAGE}/>;
  const context = GLUCOSE_CONTEXT_LABELS[glucoseLogContext(log)].short;
  const value = Math.round(log.value);
  const time = log.loggedAt.slice(0, 5);
  const latest = {
    ...BLOOD_GLUCOSE_PAGE.latest,
    label: { pt: `${value} mg/dL · ${context.pt} · registro manual ${time} UTC`, en: `${value} mg/dL · ${context.en} · manual log ${time} UTC` },
    reading: glucoseLogReading(log),
  };
  return <VitalDashboard {...props} config={{ ...BLOOD_GLUCOSE_PAGE, latest }}/>;
}

export function MoodDashboard({ scenarioId = DEFAULT_SCENARIO_ID, ...props }: PageProps & ScenarioProps) {
  // Today's check-in replaces the demo value for 15/11 in the chart and the classification,
  // except in scenarios that set their own readings.
  const [score] = useState(readCheckInScore);
  const vitals = scenarioVitals(scenarioId);
  if (vitals.vitalScenario || vitals.missing) {
    const week = vitals.mood.week;
    const value = week[week.length - 1];
    return <VitalDashboard {...props} config={scenarioPage(MOOD_PAGE, { values: week }, {
      ...MOOD_PAGE.latest, ...scenarioReadings(vitals).mood,
      label: { pt: `${pt(value)} / 5 · check-in · 15/11`, en: `${value} / 5 · check-in · 15/11` },
    }, vitals.missing)}/>;
  }
  if (score === null) return <VitalDashboard {...props} config={MOOD_PAGE}/>;
  const week = moodWeek(score);
  const latest = {
    ...MOOD_PAGE.latest,
    ...moodAssessInput(week),
    label: { pt: `${String(score).replace('.', ',')} / 5 · check-in de hoje · 15/11`, en: `${score} / 5 · today’s check-in · 15/11` },
  };
  return <VitalDashboard {...props} config={{ ...MOOD_PAGE, series: { ...MOOD_PAGE.series, values: { '7d': week } }, latest }}/>;
}
