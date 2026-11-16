import { INDICATORS, SOURCE_URLS } from './catalog';
import { normalizeDonki } from './adapters/donki';
import { normalizeRad } from './adapters/rad';
import { normalizeOsdr } from './adapters/osdr';
import { normalizeTemperature } from './adapters/temperature';
import { normalizeVital } from './adapters/vitals';
import { normalizeRecord } from './adapters/common';
import { environmentalScore, integrateDose, letSummary } from './formulas';
import { FORMULA_VERSION } from './types';
import type { DonkiEvent } from './adapters/donki';
import type { RadSample } from './adapters/rad';
import type { BiologicalSample } from './adapters/osdr';
import type { MissionScenario, SignalState, TimelineEvent, TimelinePoint } from './types';

export const DEMO_TIMESTAMP = '2026-11-05T14:00:00.000Z';
export const DEMO_MISSION_ID = 'demo-ares-01';
const at = (hoursAgo: number) => new Date(Date.parse(DEMO_TIMESTAMP) - hoursAgo * 3_600_000).toISOString();
const round = (value: number, decimals = 2) => Math.round(value * 10 ** decimals) / 10 ** decimals;
// Demo personal pattern for the 1–5 morning check-in composite (V04), shared with the check-in modal.
export const DEMO_MOOD = { baseline: 4.2, history: [4.0, 4.3] };
export const DEMO_NOTICE = 'Dados sintéticos para demonstração. Nenhuma medição é de uma pessoa, missão ou evento NASA real.';
interface ScenarioConfig {
  id: string;
  title: string;
  description: string;
  state: SignalState;
  count: number;
  high?: boolean;
  linked?: boolean;
  notification?: boolean;
  dose?: 'stable' | 'rising' | 'missing' | 'critical';
  highLet?: boolean;
  delayedBiology?: boolean;
  invalid?: boolean;
  vitals?: 'hypoglycemia' | 'sleep-debt';
  action: string;
}
const definitions: ScenarioConfig[] = [
  { id: 'routine', title: 'Rotina estável', description: 'Baseline estável, dosimetria local e evidência longitudinal.', state: 'normal', count: 0, action: 'Manter a rotina de observação e confirmar a qualidade das próximas coletas.' },
  { id: 'sep-moderate', title: 'Atividade solar moderada', description: 'Três registros SEP e contexto flare/CME, sem aumento persistente de dose.', state: 'observation', count: 3, linked: true, action: 'Observar a tendência ambiental e confirmar exposição pelo dosímetro.' },
  { id: 'high-energy', title: 'Alta energia · dose ausente', description: 'Canal ≥100 MeV no cenário, com dosimetria indisponível.', state: 'attention', count: 1, high: true, linked: true, dose: 'missing', action: 'Confirmar por dosímetro. Alta energia sozinha não permite estimar a dose.' },
  { id: 'dose-trend', title: 'Dose acima do baseline', description: 'Aumento persistente em quatro amostras; contexto ambiental separado.', state: 'attention', count: 2, linked: true, dose: 'rising', action: 'Verificar leitura, detector e contexto operacional; consultar o protocolo da missão.' },
  { id: 'high-let', title: 'Mesma dose · LET diferente', description: 'Taxa de dose semelhante à rotina, mas distribuição LET com cauda maior.', state: 'observation', count: 0, highLet: true, action: 'Examinar a qualidade da radiação e confirmar o espectro; LET isolado não define criticidade.' },
  { id: 'delayed-biology', title: 'Resposta biológica tardia', description: 'Coleta 24h após o evento sintético, com baseline e confundidores visíveis.', state: 'observation', count: 1, delayedBiology: true, action: 'Revisar a coleta e o baseline individual com os fatores de confusão da missão.' },
  { id: 'unpaired', title: 'Correlação indisponível', description: 'Sem pares reais alinhados entre dosimetria e biomarcadores.', state: 'no-data', count: 0, action: 'Obter pares da mesma missão e ensaio; documentar alinhamento, baseline e dados ausentes.' },
  { id: 'data-gap', title: 'Fonte atrasada / inválida', description: 'DONKI atrasado, dosímetro inválido e coleta ausente. Sem extrapolar lacunas.', state: 'no-data', count: 2, invalid: true, action: 'Restabelecer a fonte e verificar integridade; dados ausentes não significam exposição nula.' },
  { id: 'hypoglycemia', title: 'Hipoglicemia em tripulante', description: 'CGM em 48 mg/dL com taquicardia e pressão baixa sintomáticas; ambiente solar estável.', state: 'critical', count: 0, vitals: 'hypoglycemia', action: 'Aplicar a regra 15-15 se o tripulante estiver consciente, acionar a tripulação e informar o flight surgeon. Repetir a glicemia em 15 minutos.' },
  { id: 'sleep-debt', title: 'Déficit de sono e bem-estar', description: 'Sete noites abaixo de 6 h, bem-estar abaixo do padrão pessoal e FC de repouso acima da linha de base.', state: 'attention', count: 0, vitals: 'sleep-debt', action: 'Pedir ao flight surgeon a revisão da escala de sono e considerar uma conversa psicológica privada. Cada sinal é avaliado isoladamente; não há correlação calculada.' },
  { id: 'critical', title: 'Protocolo · cenário crítico', description: 'Score ambiental crítico e dosimetria persistentemente acima do baseline na simulação.', state: 'critical', count: 5, high: true, linked: true, notification: true, dose: 'critical', highLet: true, action: 'Priorizar o protocolo aprovado da missão, confirmar dosimetria e comunicar o controle da missão. Nenhuma prescrição é gerada pelo app.' },
];

function buildScenario(config: ScenarioConfig): MissionScenario {
  const context = { missionId: DEMO_MISSION_ID, timestamp: DEMO_TIMESTAMP, synthetic: true };
  const sepEvents: DonkiEvent[] = Array.from({ length: config.count }, (_, index) => ({
    sepID: `DEMO-SEP-${index + 1}`,
    eventTime: config.delayedBiology ? at(30) : config.invalid ? at(20 - index * 1.5) : at(10 - index * 1.5),
    instruments: [{ displayName: 'GOES · instrumento representado na fixture' }],
    channel: config.high ? '>=100 MeV' : '>10 MeV',
    linkedEvents: config.linked ? [{ activityID: 'DEMO-FLR-01' }, { activityID: 'DEMO-CME-01' }] : [],
    notifications: config.notification ? ['DEMO-NOTIFICATION-01'] : [],
    link: SOURCE_URLS.DONKI,
  }));
  const centers = [3, 8, 20, 60, 120, 200];
  const counts = config.highLet ? [120, 250, 350, 180, 70, 30] : [380, 360, 180, 60, 15, 5];
  const spectrum = letSummary(centers, counts)!;
  const samples: RadSample[] = Array.from({ length: 25 }, (_, index) => {
    const mod = [0, 0.06, -0.04, 0.08, -0.02][index % 5];
    const trend = index >= 21 && (config.dose === 'rising' || config.dose === 'critical');
    const dose = trend ? 8.4 + (index - 20) * (config.dose === 'critical' ? 5.6 : 1.8) : 8.4 + mod;
    const gap = config.dose === 'missing' || (config.invalid && index >= 22);
    return {
      timestamp: at(48 - index * 2),
      Dose_B_uGy_h: gap ? null : round(dose),
      Dose_E_uGy_h: gap ? null : round(dose * 0.47),
      LET_Energy_Centers: gap ? null : centers,
      LET_Counts: gap ? null : counts,
      detector: 'Dosímetro habitat · fixture no esquema RAD',
    };
  });
  if (config.invalid) samples[24].Dose_B_uGy_h = 'INVALID_PACKET';
  const records = {
    ...normalizeDonki(sepEvents, { ...context, ...(config.invalid ? { quality: 'delayed' as const, timestamp: at(12) } : {}) }),
    ...normalizeRad(samples, { ...context, ...(config.invalid ? { quality: 'invalid' as const } : {}) }, { channelsValidated: false, baselineSamples: [8.2, 8.4, 8.3, 8.4, 8.6], maxGapHours: 3 }),
  };
  const bioValues: [string, number, number, string][] = [
    ['O01', config.delayedBiology ? 0.18 : 0.12, 0.12, 'focos/célula'],
    ['O02', config.delayedBiology ? 2.8 : 2.4, 2.4, 'pg/mL'],
    ['O03', 14.4, 14.5, 'g/dL'], ['O04', 64, 63, 'bpm'],
    ['O05', 1650, 1700, 'mL/24h'], ['O06', config.vitals === 'sleep-debt' ? 5.6 : 7.2, 7.5, 'h'], ['O07', 54.2, 54.5, 'kg'],
  ];
  const bioSamples: BiologicalSample[] = config.invalid || config.id === 'unpaired' ? [] : bioValues.map(([indicatorId, value, baseline, unit]) => ({
    indicatorId, value, baseline, unit, collectionDate: at(config.delayedBiology ? 6 : 18),
    biologicalDelay: config.delayedBiology ? 'Coleta 24h após o SEP sintético; latência causal não estabelecida' : 'Não caracterizado; coleta de rotina',
    context: 'Ares I · participante simulado P01 · habitat · dia demonstrativo 42',
    uncertainty: 'Dados sintéticos; variabilidade analítica não estimada',
    // Previous six nights, so the sleep-debt scenario reaches a week below 6 h.
    ...(indicatorId === 'O06' && config.vitals === 'sleep-debt' ? { history: [5.8, 5.5, 5.9, 5.7, 5.4, 5.8] } : {}),
  }));
  Object.assign(records, normalizeOsdr(bioSamples, context));
  // Demo day 42 at rest: the nominal limit is about 37.67 °C, so 37.4 °C stays within the reference.
  // Matches the last reading of the body temperature page series (23:00).
  records.T01 = normalizeTemperature(config.invalid ? null : 36.8, '°C', context, { activity: 'rest', missionDay: 42 });
  // Vital signs: normal readings by default, absent when sources fail, altered only in the two vital scenarios.
  const rest = { activity: 'rest' as const, missionDay: 42 };
  const hypo = config.vitals === 'hypoglycemia';
  const debt = config.vitals === 'sleep-debt';
  const vital = (value: number) => (config.invalid ? null : value);
  records.V01 = normalizeVital('heart-rate', { value: vital(hypo ? 104 : debt ? 78 : 64), unit: 'bpm', measurement: { ...rest, symptomatic: hypo } }, context, {
    baseline: 63, history: debt ? [{ value: 77, context: rest }, { value: 79, context: rest }] : [],
  });
  records.V02 = normalizeVital('blood-pressure', { value: vital(hypo ? 92 : 112), secondary: hypo ? 58 : 72, unit: 'mmHg', measurement: { symptomatic: hypo } }, context);
  records.V03 = normalizeVital('blood-glucose', { value: vital(hypo ? 48 : 82), unit: 'mg/dL', measurement: { meal: hypo ? 'random' : 'fasting' } }, context, {
    extra: { detector: hypo ? 'CGM · leitura contínua simulada' : 'Glicosímetro capilar · jejum' },
  });
  // Sleep debt: three check-ins below 80% of the baseline (3.36) make a persistent decline.
  records.V04 = normalizeVital('mood', { value: vital(debt ? 3.1 : 4.1), unit: '1–5' }, context, {
    baseline: DEMO_MOOD.baseline, history: (debt ? [3.2, 3.0] : DEMO_MOOD.history).map(value => ({ value })),
  });
  for (const id of ['C01', 'C02', 'C03']) records[id] = normalizeRecord(id, null, context, {
    sampleSize: 0, baseline: null, uncertainty: 'Não estimável sem pares observacionais válidos',
    note: 'Pearson / Spearman não calculáveis: n = 0 pares reais alinhados; baseline, atraso e confundidores precisam ser tratados. Correlação não implica causalidade.',
  });
  for (const record of Object.values(records)) {
    record.synthetic = true;
    record.formulaVersion = FORMULA_VERSION;
    if (record.source === 'RAD' && record.value !== null && record.id !== 'R06') record.uncertainty = '±12% ilustrativos; não calibração real';
  }
  const timeline: TimelinePoint[] = samples.map((sample, index) => {
    const time = Date.parse(sample.timestamp);
    const recent = sepEvents.filter((event) => Date.parse(event.eventTime) <= time && Date.parse(event.eventTime) > time - 86_400_000);
    const env = environmentalScore(recent.length, recent.some((event) => event.channel.includes('100')), recent.some((event) => event.linkedEvents?.length), recent.some((event) => event.notifications?.length));
    const integral = integrateDose(samples.slice(0, index + 1).map((point) => ({ timestamp: point.timestamp, value: typeof point.Dose_B_uGy_h === 'number' ? point.Dose_B_uGy_h : null })));
    const hasDose = typeof sample.Dose_B_uGy_h === 'number';
    return {
      timestamp: sample.timestamp,
      time: new Date(time).toLocaleTimeString('pt-BR', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' }),
      dose: hasDose ? sample.Dose_B_uGy_h as number : null,
      doseE: typeof sample.Dose_E_uGy_h === 'number' ? sample.Dose_E_uGy_h : null,
      let: hasDose ? round(spectrum.mean) : null,
      score: config.invalid && index > 18 ? null : env.score,
      accumulated: hasDose ? (index === 0 ? 0 : integral.dose === null ? null : round(integral.dose)) : null,
    };
  });
  const events: TimelineEvent[] = sepEvents.map((event) => ({
    id: event.sepID, timestamp: event.eventTime, label: 'Registro SEP', type: 'sep', source: 'DONKI',
    detail: `${event.sepID} · canal ${event.channel} · fixture sintética, não evento NASA real`,
    indicatorId: 'D01', channel: event.channel, instrument: event.instruments[0].displayName,
    sourceUrl: event.link, relatedEvents: event.linkedEvents?.map((related) => related.activityID),
  }));
  if (config.linked) events.push(
    { id: 'DEMO-FLR-01', timestamp: at(12), label: 'Flare relacionado', type: 'flare', source: 'DONKI', detail: 'Cadeia de contexto sintética; não determina exposição.', indicatorId: 'D04', sourceUrl: SOURCE_URLS.DONKI },
    { id: 'DEMO-CME-01', timestamp: at(11), label: 'CME relacionado', type: 'cme', source: 'DONKI', detail: 'Cadeia de contexto sintética; não determina exposição.', indicatorId: 'D04', sourceUrl: SOURCE_URLS.DONKI },
  );
  if (bioSamples.length) events.push({ id: 'DEMO-COLLECTION-01', timestamp: bioSamples[0].collectionDate, label: 'Coleta de biomarcadores', type: 'collection', source: 'OSDR', detail: bioSamples[0].biologicalDelay ?? 'Coleta de rotina', indicatorId: 'O01', sourceUrl: SOURCE_URLS.OSDR });
  events.push(
    { id: 'DEMO-EXERCISE-01', timestamp: at(20), label: 'Exercício', type: 'exercise', source: 'mission', detail: 'Atividade física sintética · fator de confusão registrado; efeito não estimado.' },
    { id: 'DEMO-SHIELDING-01', timestamp: at(24), label: 'Habitat / blindagem', type: 'shielding', source: 'mission', detail: 'Contexto operacional demonstrativo; fator de proteção não calculado.' },
    { id: 'DEMO-EVA-01', timestamp: at(38), label: 'Registro de EVA', type: 'eva', source: 'mission', detail: 'Atividade sintética. Dosímetro permanece no habitat; não há dose atribuível à EVA.' },
  );
  return {
    id: config.id, title: config.title, description: config.description, state: config.state,
    missionId: DEMO_MISSION_ID, missionName: 'Ares I', environment: 'Habitat marciano · Sol 042', timestamp: DEMO_TIMESTAMP,
    records, timeline, events: events.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)),
    notice: DEMO_NOTICE, action: config.action, synthetic: true,
  };
}
export const SCENARIOS: MissionScenario[] = definitions.map(buildScenario);
export function getScenario(id: string): MissionScenario { return SCENARIOS.find((scenario) => scenario.id === id) ?? SCENARIOS[1]; }

/** All schema IDs are represented even when a formula or observation is unavailable. */
export const CATALOG_COVERAGE = INDICATORS.map((indicator) => ({ id: indicator.id, availableInAllScenarios: SCENARIOS.every((scenario) => indicator.id in scenario.records) }));
