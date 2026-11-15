import type { Locale } from '../i18n/messages';
import { finiteNumber, median } from './formulas';
import type { SignalState } from './types';

export type LocalizedText = Record<Locale, string>;
export type VitalId = 'heart-rate' | 'blood-pressure' | 'core-temperature' | 'blood-glucose' | 'sleep-hours' | 'mood';
export type Escalation = 'none' | 'crew' | 'flight-surgeon';
export type EvidenceKind = 'nasa' | 'peer-reviewed' | 'terrestrial-clinical' | 'aerospace-regulator' | 'project-analysis';

export interface EvidenceSource {
  title: string;
  url?: string;
  kind: EvidenceKind;
  // Context in which the value was defined, when it differs from its use in the app.
  context?: LocalizedText;
}

const t = (en: string, pt: string): LocalizedText => ({ en, 'pt-BR': pt });

export const VITAL_SOURCES = {
  'project-analysis': {
    title: 'Analytica Pulse: Análise de Indicadores (project document)', kind: 'project-analysis',
    context: t('Team review of the challenge indicators.', 'Revisão da equipe sobre os indicadores do desafio.'),
  },
  'aha-acc-2025': {
    title: '2025 AHA/ACC Guideline for the Prevention, Detection, Evaluation and Management of High Blood Pressure in Adults. Hypertension.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40811516/', kind: 'terrestrial-clinical',
  },
  'aha-heart-rate': {
    title: 'American Heart Association: All about heart rate',
    url: 'https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse', kind: 'terrestrial-clinical',
  },
  'ada-2025-hypoglycemia': {
    title: 'ADA. Glycemic Goals and Hypoglycemia: Standards of Care in Diabetes 2025. Diabetes Care.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39651981/', kind: 'terrestrial-clinical',
  },
  'ada-2025-diagnosis': {
    title: 'ADA. Diagnosis and Classification of Diabetes: Standards of Care in Diabetes 2025. Diabetes Care.',
    url: 'https://doi.org/10.2337/dc25-S002', kind: 'terrestrial-clinical',
  },
  'ada-2025-hospital': {
    title: 'ADA. Diabetes Care in the Hospital: Standards of Care in Diabetes 2025. Diabetes Care.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/11635037', kind: 'terrestrial-clinical',
  },
  'ada-hypoglycemia-guide': {
    title: 'ADA: Hypoglycemia (professional guide, 15-15 rule)',
    url: 'https://professional.diabetes.org/sites/dpro/files/2025-05/hypoglycemia-hcp-5-27-25.pdf', kind: 'terrestrial-clinical',
  },
  'faa-itdm': {
    title: 'FAA: Insulin-Treated Diabetes Mellitus, CGM Option (Airman Information)',
    url: 'https://www.faa.gov/ame_guide/media/ITDM-Airman_Information.pdf', kind: 'aerospace-regulator',
    context: t('Pilots with insulin-treated diabetes, not healthy astronauts.', 'Pilotos com diabetes tratado com insulina, não astronautas saudáveis.'),
  },
  'hughson-2016': {
    title: 'Hughson et al. (2016). Inflight insulin resistance resulting from 6-mo spaceflight. Am J Physiol Heart Circ Physiol.',
    url: 'https://journals.physiology.org/doi/full/10.1152/ajpheart.00802.2015', kind: 'peer-reviewed',
    context: t('Nine astronauts, 6 months on the ISS.', 'Nove astronautas, 6 meses na ISS.'),
  },
  'jap-2020-arterial': {
    title: 'Arterial structure and function during and after long-duration spaceflight. J Appl Physiol.',
    url: 'https://journals.physiology.org/doi/full/10.1152/japplphysiol.00550.2019', kind: 'peer-reviewed',
  },
  'norsk-2015': {
    title: 'Norsk et al. (2015). Fluid shifts, vasodilatation and ambulatory blood pressure reduction during long duration spaceflight. J Physiol.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/4324706/', kind: 'peer-reviewed',
    context: t('Eight male astronauts, 3 to 6 months on the ISS.', 'Oito astronautas homens, de 3 a 6 meses na ISS.'),
  },
  'stahn-2017': {
    title: 'Stahn et al. (2017). Increased core body temperature in astronauts during long-duration space missions. Sci Rep.',
    url: 'https://www.nature.com/articles/s41598-017-15560-w', kind: 'peer-reviewed',
  },
  'pisacane-2007': {
    title: 'Pisacane et al. (2007). Use of Thermoregulatory Models to Enhance Space Shuttle and Space Station Operations. NASA.',
    url: 'https://ntrs.nasa.gov/api/citations/20070022493/downloads/20070022493.pdf', kind: 'nasa',
  },
  'nasa-std-3001-v2-suits': {
    title: 'NASA-STD-3001 Volume 2, Chapter 11: Spacesuits',
    url: 'https://www.nasa.gov/reference/11-0-spacesuits-vol-2/', kind: 'nasa',
    context: t('Defined for suited EVA.', 'Definido para EVA com traje.'),
  },
  'ochmo-tb-027-water': {
    title: 'OCHMO-TB-027 Water: Human Consumption',
    url: 'https://www.nasa.gov/wp-content/uploads/2023/03/water-technical-brief-ochmo.pdf', kind: 'nasa',
  },
  'nasa-risk-cardiovascular': {
    title: 'NASA HRP: Risk of Cardiovascular Adaptations',
    url: 'https://www.nasa.gov/reference/risk-of-cardiovascular-adaptations/', kind: 'nasa',
  },
  'ochmo-tb-041-sleep': {
    title: 'OCHMO-TB-041 Sleep Accommodations',
    url: 'https://www.nasa.gov/sites/default/files/atoms/files/sleep_accomodations_technical_brief_ochmo.pdf', kind: 'nasa',
  },
  'ochmo-tb-016-behavioral': {
    title: 'OCHMO-TB-016 Behavioral Health and Performance',
    url: 'https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-016-behavioral-health.pdf', kind: 'nasa',
  },
} satisfies Record<string, EvidenceSource>;

export type VitalSourceId = keyof typeof VITAL_SOURCES;

// Catalog indicator for each vital. Temperature and sleep reuse the existing T01 and O06.
export const VITAL_INDICATOR_IDS: Record<VitalId, string> = {
  'heart-rate': 'V01', 'blood-pressure': 'V02', 'core-temperature': 'T01',
  'blood-glucose': 'V03', 'sleep-hours': 'O06', mood: 'V04',
};

export interface MeasurementContext {
  activity?: 'rest' | 'exercise' | 'eva';
  // CGM and casual readings are 'random'.
  meal?: 'fasting' | 'post-meal' | 'random';
  missionDay?: number;
  // Self-reported symptoms such as dizziness, chest pain, confusion or fainting.
  symptomatic?: boolean;
}

export interface VitalReading {
  value: unknown;
  // Diastolic pressure when the vital is blood-pressure; ignored otherwise.
  secondary?: unknown;
  context?: MeasurementContext;
}

export type FindingState = Exclude<SignalState, 'normal' | 'no-data'>;

export interface VitalFinding {
  state: FindingState;
  label: LocalizedText;
  action: LocalizedText;
  recheck?: LocalizedText;
  escalation: Escalation;
  sources: VitalSourceId[];
}

export type UnavailableReason = 'missing' | 'invalid' | 'insufficient-context';

export interface VitalAssessment {
  vitalId: VitalId;
  state: SignalState;
  findings: VitalFinding[];
  escalation: Escalation;
  recheck?: LocalizedText;
  reason?: UnavailableReason;
  sources: VitalSourceId[];
}

export interface AssessOptions {
  // Previous readings in chronological order, without the current one.
  history?: VitalReading[];
  // Personal baseline: a single value or baseline samples (median is used).
  baseline?: number | number[] | null;
}

export interface VitalReference {
  unit: string;
  reference: LocalizedText;
  sources: VitalSourceId[];
}

export const VITAL_REFERENCES: Record<VitalId, VitalReference> = {
  'heart-rate': {
    unit: 'bpm',
    reference: t('Resting 60–100 bpm on Earth; fit astronauts often rest in the 40s. Heart rate stays roughly unchanged in long-duration flight.', 'Repouso de 60 a 100 bpm na Terra; astronautas condicionados costumam ficar na faixa dos 40. A FC fica praticamente estável em voos longos.'),
    sources: ['aha-heart-rate', 'project-analysis', 'norsk-2015'],
  },
  'blood-pressure': {
    unit: 'mmHg',
    reference: t('Normal below 120/80 mmHg (terrestrial reference). In long-duration flight, 24-hour pressure drops by about 8–10 mmHg.', 'Normal abaixo de 120/80 mmHg (referência terrestre). Em voo longo, a pressão de 24 h cai cerca de 8 a 10 mmHg.'),
    sources: ['aha-acc-2025', 'norsk-2015'],
  },
  'core-temperature': {
    unit: '°C',
    reference: t('Nominal 36.0–37.5 °C at rest on Earth. On the ISS, resting temperature rises by about 1 °C over 2.5 months; values up to 37.8 °C are then expected.', 'Nominal de 36,0 a 37,5 °C em repouso na Terra. Na ISS, a temperatura de repouso sobe cerca de 1 °C ao longo de 2,5 meses; depois disso, valores até 37,8 °C são esperados.'),
    sources: ['project-analysis', 'stahn-2017'],
  },
  'blood-glucose': {
    unit: 'mg/dL',
    reference: t('Fasting 70–99 mg/dL and below 140 mg/dL outside fasting (terrestrial reference). Fasting glucose measured on the ISS: about 77 ± 9 mg/dL, unchanged from preflight.', 'Jejum de 70 a 99 mg/dL e abaixo de 140 mg/dL fora do jejum (referência terrestre). Glicemia de jejum medida na ISS: cerca de 77 ± 9 mg/dL, igual à de antes do voo.'),
    sources: ['ada-2025-diagnosis', 'ada-2025-hospital', 'ada-2025-hypoglycemia', 'hughson-2016'],
  },
  'sleep-hours': {
    unit: 'h',
    reference: t('7–9 h per night recommended for adults. In-flight average is about 6 h.', 'Recomendação de 7 a 9 h por noite para adultos. A média em voo é de cerca de 6 h.'),
    sources: ['ochmo-tb-041-sleep'],
  },
  mood: {
    unit: '1–5',
    reference: t('Morning check-in composite from 1 to 5 (well-being, stress, vigor and sleep quality). No universal normal range: compared only with the crew member’s own pattern.', 'Composto do check-in matinal de 1 a 5 (bem-estar, estresse, vigor e qualidade do sono). Não há faixa normal universal: a comparação é só com o padrão do próprio tripulante.'),
    sources: ['project-analysis', 'ochmo-tb-016-behavioral'],
  },
};

// Product criterion reused from R09 for every baseline rule: a 20% deviation sustained for 3 consecutive readings.
// No spaceflight source defines a numeric deviation for these vitals; this is not a clinical limit.
const PERSISTENCE = 3;
const BASELINE_PERCENT = 20;
// OCHMO-TB-041: seven nights of 6 h of sleep impair performance like 24–36 h awake.
const SLEEP_DEBT_NIGHTS = 7;
// Stahn 2017: resting core temperature rises by about 1 °C, gradually over 2.5 months on the ISS.
const SPACE_FEVER_DAYS = 75;

const LIMITS: Record<VitalId, [number, number]> = {
  'heart-rate': [20, 250], 'blood-pressure': [50, 260], 'core-temperature': [25, 45],
  'blood-glucose': [10, 600], 'sleep-hours': [0, 24], mood: [1, 5],
};
const DIASTOLIC_LIMITS: [number, number] = [30, 160];
const SEVERITY: Record<SignalState, number> = { 'no-data': -1, normal: 0, observation: 1, attention: 2, critical: 3 };
const ESCALATION_ORDER: Escalation[] = ['none', 'crew', 'flight-surgeon'];

function inRange(value: number | null, [min, max]: [number, number]): value is number {
  return value !== null && value >= min && value <= max;
}
function baselineValue(baseline: AssessOptions['baseline']): number | null {
  if (Array.isArray(baseline)) return median(baseline);
  return finiteNumber(baseline);
}
function persistent(values: (number | null)[], test: (value: number) => boolean, minimum = PERSISTENCE): boolean {
  let count = 0;
  for (let index = values.length - 1; index >= 0; index--) {
    const value = values[index];
    if (value === null || !test(value)) break;
    count++;
  }
  return count >= minimum;
}
function unavailable(vitalId: VitalId, reason: UnavailableReason): VitalAssessment {
  return { vitalId, state: 'no-data', findings: [], escalation: 'none', reason, sources: [] };
}

const recheckRest = t('Repeat after 5 minutes of rest.', 'Repita após 5 minutos de repouso.');
const recheck15 = t('Repeat in 15 minutes.', 'Repita em 15 minutos.');

function heartRate(value: number, context: MeasurementContext, series: (number | null)[], baseline: number | null): VitalFinding[] | null {
  if (!context.activity) return null;
  const findings: VitalFinding[] = [];
  if (context.activity === 'eva' && value > 140) findings.push({
    state: 'attention', label: t('Above 140 bpm during EVA', 'Acima de 140 bpm em EVA'),
    action: t('Reduce workload and report to the EVA team.', 'Reduza o esforço e informe a equipe da EVA.'),
    escalation: 'crew', sources: ['nasa-std-3001-v2-suits'],
  });
  if (context.activity !== 'rest') return findings;
  if (value > 100) findings.push({
    state: 'attention', label: t('Resting tachycardia (terrestrial reference)', 'Taquicardia em repouso (referência terrestre)'),
    action: t('Check for symptoms and report to the flight surgeon if it persists.', 'Verifique sintomas e informe o flight surgeon se persistir.'),
    recheck: recheckRest, escalation: 'flight-surgeon', sources: ['aha-heart-rate'],
  });
  if (value < 40) findings.push(context.symptomatic ? {
    state: 'attention', label: t('Below 40 bpm at rest, with symptoms', 'Abaixo de 40 bpm em repouso, com sintomas'),
    action: t('Stop activity, tell a crewmate and report to the flight surgeon.', 'Interrompa a atividade, avise um colega e informe o flight surgeon.'),
    recheck: recheckRest, escalation: 'flight-surgeon', sources: ['project-analysis', 'aha-heart-rate'],
  } : {
    state: 'observation', label: t('Below 40 bpm at rest', 'Abaixo de 40 bpm em repouso'),
    action: t('Common in fit crew members. Report if there is dizziness, fatigue or chest pain.', 'Comum em tripulantes condicionados. Informe se houver tontura, cansaço ou dor no peito.'),
    recheck: recheckRest, escalation: 'none', sources: ['project-analysis', 'aha-heart-rate'],
  });
  if (baseline !== null && persistent(series, v => v > baseline * (1 + BASELINE_PERCENT / 100))) findings.push({
    state: 'observation', label: t('Resting heart rate persistently above personal baseline', 'FC de repouso persistentemente acima da linha de base pessoal'),
    action: t('Review sleep, hydration and workload. Heart rate is expected to stay stable in flight.', 'Revise sono, hidratação e carga de trabalho. Em voo, a FC tende a ficar estável.'),
    escalation: 'none', sources: ['norsk-2015'],
  });
  return findings;
}

function bloodPressure(systolic: number, diastolic: number, context: MeasurementContext): VitalFinding[] {
  const findings: VitalFinding[] = [];
  const sources: VitalSourceId[] = ['aha-acc-2025'];
  if (systolic > 180 || diastolic > 120) findings.push({
    state: 'critical', label: t('Severe hypertension', 'Hipertensão grave'),
    action: t('Report to the flight surgeon now, especially with chest pain, shortness of breath, vision changes or neurological symptoms.', 'Informe o flight surgeon agora, principalmente se houver dor no peito, falta de ar, alteração visual ou sintomas neurológicos.'),
    recheck: recheckRest, escalation: 'flight-surgeon', sources,
  });
  else if (systolic >= 140 || diastolic >= 90) findings.push({
    state: 'attention', label: t('Stage 2 hypertension range', 'Faixa de hipertensão estágio 2'),
    action: t('Confirm with repeated readings and report to the flight surgeon.', 'Confirme com leituras repetidas e informe o flight surgeon.'),
    recheck: recheckRest, escalation: 'flight-surgeon', sources,
  });
  else if (systolic >= 130 || diastolic >= 80) findings.push({
    state: 'attention', label: t('Stage 1 hypertension range', 'Faixa de hipertensão estágio 1'),
    action: t('A single reading does not define hypertension. Repeat on different occasions.', 'Uma leitura isolada não define hipertensão. Repita em ocasiões diferentes.'),
    recheck: recheckRest, escalation: 'none', sources,
  });
  else if (systolic >= 120) findings.push({
    state: 'observation', label: t('Elevated blood pressure', 'Pressão elevada'),
    action: t('Track the trend in the next readings.', 'Acompanhe a tendência nas próximas leituras.'),
    escalation: 'none', sources,
  });
  // In flight, pressure runs about 10 mmHg lower without symptoms, so low values only escalate with symptoms.
  if (systolic < 90 || diastolic < 60) findings.push(context.symptomatic ? {
    state: 'attention', label: t('Low blood pressure with symptoms', 'Pressão baixa com sintomas'),
    action: t('Stop activity, tell a crewmate and report to the flight surgeon. Before landing, the protocol includes fluid loading with salt tablets and compression garments.', 'Interrompa a atividade, avise um colega e informe o flight surgeon. Antes do pouso, o protocolo inclui sobrecarga de líquidos com comprimidos de sal e roupas de compressão.'),
    recheck: recheckRest, escalation: 'flight-surgeon', sources: ['norsk-2015', 'nasa-risk-cardiovascular', 'ochmo-tb-027-water'],
  } : {
    state: 'observation', label: t('Low blood pressure', 'Pressão baixa'),
    action: t('Without symptoms this may reflect normal in-flight adaptation. Report dizziness, fainting or blurred vision.', 'Sem sintomas, pode refletir a adaptação normal ao voo. Informe tontura, desmaio ou visão turva.'),
    recheck: recheckRest, escalation: 'none', sources: ['project-analysis', 'norsk-2015'],
  });
  return findings;
}

function coreTemperature(value: number, context: MeasurementContext, baseline: number | null): VitalFinding[] | null {
  if (!context.activity) return null;
  const findings: VitalFinding[] = [];
  const sources: VitalSourceId[] = ['project-analysis', 'pisacane-2007'];
  if (value < 33 || value > 40) findings.push({
    state: 'critical', label: t('Life-threatening core temperature', 'Temperatura central com risco de vida'),
    action: context.activity === 'exercise'
      ? t('Stop exercise, start cooling and report to the flight surgeon now.', 'Interrompa o exercício, inicie o resfriamento e informe o flight surgeon agora.')
      : t('Report to the flight surgeon now and start the thermal protocol.', 'Informe o flight surgeon agora e inicie o protocolo térmico.'),
    recheck: recheck15, escalation: 'flight-surgeon', sources: ['stahn-2017'],
  });
  if (context.activity === 'exercise') {
    if (value >= 38.5 && value <= 40) findings.push({
      state: 'attention', label: t('38.5 °C or more during exercise', '38,5 °C ou mais no exercício'),
      action: t('Reduce exercise intensity and improve ventilation and hydration. In space, temperature rises faster during exercise than on Earth.', 'Reduza a intensidade do exercício e melhore a ventilação e a hidratação. No espaço, a temperatura sobe mais rápido no exercício do que na Terra.'),
      escalation: 'none', sources: [...sources, 'stahn-2017'],
    });
    return findings;
  }
  // The nominal resting limit rises linearly from 37.5 to 37.8 °C over the first 75 days (Stahn 2017).
  const day = Math.max(0, Math.min(context.missionDay ?? 0, SPACE_FEVER_DAYS));
  const nominalMax = 37.5 + 0.3 * (day / SPACE_FEVER_DAYS);
  if (value >= 39.3 && value <= 40) findings.push({
    state: 'critical', label: t('Thermal emergency range', 'Faixa de emergência térmica'),
    action: t('Report to the flight surgeon now and start cooling.', 'Informe o flight surgeon agora e inicie o resfriamento.'),
    recheck: recheck15, escalation: 'flight-surgeon', sources,
  });
  else if (value >= 38.3 && value < 39.3) findings.push({
    state: 'critical', label: t('Impaired dexterity and judgment range', 'Faixa de queda de destreza e julgamento'),
    action: t('Avoid critical tasks and report to the flight surgeon.', 'Evite tarefas críticas e informe o flight surgeon.'),
    recheck: recheck15, escalation: 'flight-surgeon', sources,
  });
  else if (value > nominalMax && value < 38.3) findings.push({
    state: 'attention', label: t('Above the nominal range', 'Acima da faixa nominal'),
    action: t('Check for fever symptoms, hydration and cabin temperature.', 'Verifique sintomas de febre, hidratação e temperatura da cabine.'),
    recheck: recheck15, escalation: context.symptomatic ? 'flight-surgeon' : 'crew', sources: [...sources, 'stahn-2017'],
  });
  if (value >= 33 && value < 36) findings.push({
    state: 'observation', label: t('Below the nominal range', 'Abaixo da faixa nominal'),
    action: t('Check sensor placement and cabin temperature.', 'Verifique o posicionamento do sensor e a temperatura da cabine.'),
    recheck: recheck15, escalation: 'none', sources,
  });
  if (baseline !== null && value - baseline >= 0.6) findings.push({
    state: context.activity === 'eva' ? 'attention' : 'observation', label: t('0.6 °C or more above personal baseline', '0,6 °C ou mais acima da linha de base pessoal'),
    action: t('A core temperature rise of about 0.6 °C is linked to impaired performance.', 'Um aumento de cerca de 0,6 °C na temperatura central está associado à queda de desempenho.'),
    escalation: context.activity === 'eva' ? 'crew' : 'none', sources: ['nasa-std-3001-v2-suits'],
  });
  return findings;
}

function bloodGlucose(value: number, context: MeasurementContext, series: (number | null)[], baseline: number | null): VitalFinding[] | null {
  const hypoSources: VitalSourceId[] = ['ada-2025-hypoglycemia', 'ada-hypoglycemia-guide', 'faa-itdm'];
  const selfTreat = t('If conscious, take 15 g of fast-acting carbohydrate (ADA 15-15 rule).', 'Se estiver consciente, ingira 15 g de carboidrato de ação rápida (regra 15-15 da ADA).');
  // Hypoglycemia is classified regardless of meal context.
  if (value < 54) return [{
    state: 'critical', label: t('Level 2 hypoglycemia', 'Hipoglicemia nível 2'),
    action: t(`${selfTreat.en} Alert the crew and the flight surgeon. If confused or unable to swallow, the crew must assist.`, `${selfTreat['pt-BR']} Avise a tripulação e o flight surgeon. Se houver confusão ou dificuldade para engolir, a tripulação deve assistir.`),
    recheck: recheck15, escalation: 'flight-surgeon', sources: hypoSources,
  }];
  if (value < 70) return [{
    state: 'attention', label: t('Level 1 hypoglycemia', 'Hipoglicemia nível 1'),
    action: t(`${selfTreat.en} Tell a crewmate.`, `${selfTreat['pt-BR']} Avise um colega da tripulação.`),
    recheck: recheck15, escalation: 'crew', sources: hypoSources,
  }];
  const findings: VitalFinding[] = [];
  const high: VitalFinding = {
    state: 'attention', label: t('200 mg/dL or more', '200 mg/dL ou mais'),
    action: t('Report to the flight surgeon, especially with thirst, frequent urination or fatigue.', 'Informe o flight surgeon, principalmente se houver sede, urina frequente ou cansaço.'),
    recheck: t('Repeat with a fasting test the next morning.', 'Repita em jejum na manhã seguinte.'), escalation: 'flight-surgeon', sources: ['ada-2025-diagnosis'],
  };
  const aboveExpected: VitalFinding = {
    state: 'observation', label: t('Above 140 mg/dL', 'Acima de 140 mg/dL'),
    action: t('Above the expected range outside fasting. Record what was eaten and confirm with a fasting reading.', 'Acima do esperado fora do jejum. Registre a refeição e confirme com uma medição em jejum.'),
    recheck: t('Repeat with a fasting test the next morning.', 'Repita em jejum na manhã seguinte.'), escalation: 'none', sources: ['ada-2025-hospital', 'ada-2025-diagnosis'],
  };
  if (context.meal !== 'fasting') {
    if (value >= 200) return [high];
    if (value > 140) return [aboveExpected];
    // Without meal context, 100–140 mg/dL may be normal (after a meal) or impaired (fasting).
    if (!context.meal && value >= 100) return null;
    return findings;
  }
  if (value >= 126) findings.push({
    state: 'attention', label: t('Fasting glucose in the diabetes diagnostic range', 'Glicemia de jejum na faixa diagnóstica de diabetes'),
    action: t('Needs confirmation by repeated testing. Report to the flight surgeon.', 'Precisa de confirmação com novo exame. Informe o flight surgeon.'),
    recheck: t('Repeat a fasting test on another day.', 'Repita em jejum em outro dia.'), escalation: 'flight-surgeon', sources: ['ada-2025-diagnosis'],
  });
  else if (value >= 100) findings.push({
    state: 'observation', label: t('Impaired fasting glucose', 'Glicemia de jejum alterada'),
    action: t('Track the trend. Astronaut fasting glucose usually stays near 77 mg/dL in flight.', 'Acompanhe a tendência. A glicemia de jejum de astronautas costuma ficar perto de 77 mg/dL em voo.'),
    recheck: t('Repeat a fasting test on another day.', 'Repita em jejum em outro dia.'), escalation: 'none', sources: ['ada-2025-diagnosis', 'hughson-2016'],
  });
  if (baseline !== null && persistent(series, v => v > baseline * (1 + BASELINE_PERCENT / 100))) findings.push({
    state: 'observation', label: t('Fasting glucose persistently above personal baseline', 'Glicemia de jejum persistentemente acima da linha de base pessoal'),
    action: t('Fasting glucose can rise over a long mission. Insulin resistance does not show in glucose alone: consider an insulin test to compute HOMA-IR.', 'A glicemia de jejum pode subir ao longo de uma missão longa. A resistência à insulina não aparece só na glicose: considere dosar insulina para calcular o HOMA-IR.'),
    escalation: 'none', sources: ['jap-2020-arterial', 'hughson-2016'],
  });
  return findings;
}

function sleepHours(value: number, series: (number | null)[]): VitalFinding[] {
  const sources: VitalSourceId[] = ['ochmo-tb-041-sleep'];
  if (value < 5) return [{
    state: 'attention', label: t('Less than 5 h of sleep', 'Menos de 5 h de sono'),
    action: t('Avoid critical tasks and ask the flight surgeon to review the schedule.', 'Evite tarefas críticas e peça ao flight surgeon a revisão da escala.'),
    escalation: 'flight-surgeon', sources: ['project-analysis', ...sources],
  }];
  if (persistent(series, v => v < 6, SLEEP_DEBT_NIGHTS)) return [{
    state: 'attention', label: t('Less than 6 h for a week', 'Menos de 6 h por uma semana'),
    action: t('A week at 6 h per night impairs performance like 24–36 h awake. Ask the flight surgeon to review the schedule.', 'Uma semana dormindo 6 h por noite prejudica o desempenho como 24 a 36 h acordado. Peça ao flight surgeon a revisão da escala.'),
    escalation: 'flight-surgeon', sources,
  }];
  if (value < 7) return [{
    state: 'observation', label: t('Below the recommended 7 h', 'Abaixo das 7 h recomendadas'),
    action: t('Protect the sleep period and dim lights before sleeping. Sleep debt builds up over consecutive short nights.', 'Proteja o período de sono e reduza a luz antes de dormir. O déficit se acumula em noites curtas seguidas.'),
    escalation: 'none', sources,
  }];
  return [];
}

function mood(series: (number | null)[], baseline: number | null): VitalFinding[] | null {
  if (baseline === null || baseline <= 0) return null;
  if (!persistent(series, v => v < baseline * (1 - BASELINE_PERCENT / 100))) return [];
  return [{
    state: 'observation', label: t('Well-being persistently below personal pattern', 'Bem-estar persistentemente abaixo do padrão pessoal'),
    action: t('Consider a private psychological conference and review sleep and workload. This is not a diagnosis.', 'Considere uma conversa psicológica privada e revise sono e carga de trabalho. Isto não é um diagnóstico.'),
    escalation: 'none', sources: ['project-analysis', 'ochmo-tb-016-behavioral'],
  }];
}

export function assessVital(vitalId: VitalId, reading: VitalReading, options: AssessOptions = {}): VitalAssessment {
  if (reading.value === null || reading.value === undefined) return unavailable(vitalId, 'missing');
  const value = finiteNumber(reading.value);
  if (!inRange(value, LIMITS[vitalId])) return unavailable(vitalId, 'invalid');
  const context = reading.context ?? {};
  const baseline = baselineValue(options.baseline);
  // Only comparable previous readings enter the persistence check.
  const seriesWhere = (comparable: (previous: VitalReading) => boolean = () => true) =>
    [...(options.history ?? []).filter(comparable).map(previous => finiteNumber(previous.value)), value];

  let findings: VitalFinding[] | null;
  switch (vitalId) {
    case 'heart-rate': findings = heartRate(value, context, seriesWhere(previous => previous.context?.activity === 'rest'), baseline); break;
    case 'blood-pressure': {
      const diastolic = finiteNumber(reading.secondary);
      if (!inRange(diastolic, DIASTOLIC_LIMITS) || diastolic >= value) return unavailable(vitalId, 'invalid');
      findings = bloodPressure(value, diastolic, context);
      break;
    }
    case 'core-temperature': findings = coreTemperature(value, context, baseline); break;
    case 'blood-glucose': findings = bloodGlucose(value, context, seriesWhere(previous => previous.context?.meal === 'fasting'), baseline); break;
    case 'sleep-hours': findings = sleepHours(value, seriesWhere()); break;
    case 'mood': findings = mood(seriesWhere(), baseline); break;
  }
  if (findings === null) return unavailable(vitalId, 'insufficient-context');

  // The most severe finding sets the state, escalation and recheck.
  const sorted = [...findings].sort((a, b) => SEVERITY[b.state] - SEVERITY[a.state]);
  const escalation = sorted.reduce<Escalation>((highest, finding) => ESCALATION_ORDER.indexOf(finding.escalation) > ESCALATION_ORDER.indexOf(highest) ? finding.escalation : highest, 'none');
  return {
    vitalId, state: sorted[0]?.state ?? 'normal', findings: sorted, escalation,
    recheck: sorted.find(finding => finding.recheck)?.recheck,
    sources: [...new Set(sorted.flatMap(finding => finding.sources))],
  };
}
