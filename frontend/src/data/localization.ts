import type { Locale } from '../i18n/messages';
import type { IndicatorDefinition, IndicatorRecord, MissionScenario } from './types';

type IndicatorCopy = Pick<IndicatorDefinition, 'title' | 'shortTitle' | 'summary' | 'technical' | 'limitation'>;

const indicatorCopy: Record<string, IndicatorCopy> = {
  D01: { title: 'SEP events', shortTitle: 'SEP events', summary: 'Solar energetic particle records in the selected time window.', technical: 'Shows instrument, original channel, UTC timestamp, and related event chain. Records from different instruments may describe the same episode.', limitation: 'Record count, not independent storms, and never a dose measurement.' },
  D02: { title: 'SEP in the last 24 h', shortTitle: 'SEP · 24 h', summary: 'Rolling frequency of SEP records over the last 24 hours.', technical: 'Counts timestamps in (now − 24 h, now]; contributes to the demonstration environmental score.', limitation: 'Environmental frequency does not quantify human exposure.' },
  D03: { title: 'High-energy channel', shortTitle: 'High energy', summary: 'Identifies a channel at or above 100 MeV.', technical: 'Preserves the original channel text, including ≥100 MeV, >=100 MeV, >100 MeV, and 100+ MeV.', limitation: 'High energy is not dose. Confirm exposure with a dosimeter.' },
  D04: { title: 'Related flare / CME', shortTitle: 'Flare / CME', summary: 'Links SEP records to flare and coronal mass ejection records.', technical: 'Times document the context chain; they do not measure intensity in the body.', limitation: 'No direct anatomical localization. Environmental association does not prove exposure.' },
  D05: { title: 'Notifications', shortTitle: 'Notifications', summary: 'Operational messages associated with the space-weather episode.', technical: 'A notification contributes to the demonstration score; it does not represent dose.', limitation: 'Operational signal, not a clinical or dose classification.' },
  D06: { title: 'SEP environmental score', shortTitle: 'Environmental risk', summary: 'Heuristic environmental risk score that combines solar context to guide confirmation.', technical: 'Demonstration weights, not defined or validated by NASA: frequency up to 40 points (8 per record/24 h), high energy 25, flare/CME 20, and notifications 15. Low 0–24; moderate 25–49; high 50–74; critical 75–100.', limitation: 'Not dose or diagnosis. Mission teams must validate the weights and thresholds.' },
  R01: { title: 'Dose B', shortTitle: 'Dose · channel B', summary: 'Dose rate in channel B, kept separate from channel E.', technical: 'Dose_B_uGy_h field. Detector, quality, and timestamp accompany each value. Demonstration uncertainty is not a real instrument calibration.', limitation: 'Measured at the dosimeter location; not an organ-specific dose. Real RAD measures the rover’s local environment on Mars; these mission data are synthetic.' },
  R02: { title: 'Dose E', shortTitle: 'Dose · channel E', summary: 'Dose rate in channel E, with no automatic summation.', technical: 'Dose_E_uGy_h field. Channel complementarity must be validated against instrument documentation.', limitation: 'Measured at the dosimeter location; not an organ-specific dose. Real RAD measures the rover’s local environment on Mars; these mission data are synthetic.' },
  R03: { title: 'Total physical dose', shortTitle: 'Total dose', summary: 'Exploratory sum available only after channel validation.', technical: 'The adapter blocks the result unless complementary, synchronized, non-overlapping channels are confirmed.', limitation: 'Not calculated in this demonstration: channels B and E are not validated for summation.' },
  R04: { title: 'Average weighted LET', shortTitle: 'Average LET', summary: 'Energy deposited per distance traveled by particles.', technical: 'Mean of LET bin centers weighted by counts. High LET may imply greater damage per unit dose, depending on context.', limitation: 'Does not localize damage to an organ and does not determine clinical risk on its own.' },
  R05: { title: 'High-LET fraction', shortTitle: 'High LET', summary: 'Percentage of the distribution above 100 keV/µm LET.', technical: 'The internal fraction is 0–1; the interface displays 100 × fraction. The threshold is strictly greater than 100 keV/µm.', limitation: 'A high-LET tail alone never triggers a critical state.' },
  R06: { title: 'Q(LET) factor', shortTitle: 'Q factor', summary: 'Provisional approximation of radiobiological quality.', technical: 'Calculates Q for each bin and weights by counts. Q is provisional and requires validation against the mission radiobiology standard.', limitation: 'Count weighting is exploratory; it does not replace calibration, spectrum, or geometry.' },
  R07: { title: 'Equivalent-dose proxy', shortTitle: 'Equivalent dose · proxy', summary: 'Exploratory estimate of dose multiplied by quality.', technical: 'The calculation is released only after total dose channel validation; it remains a proxy.', limitation: 'Not an official sievert or clinical dose. Unavailable without validated channels, calibration, shielding, spectrum, and organ.' },
  R08: { title: 'Accumulated dose', shortTitle: 'Accumulated B · 48 h', summary: 'Integrates channel B rate over the available mission window.', technical: 'This demonstration integrates channel B over 48 h using a left-rectangle method. It does not extrapolate earlier mission time or bridge gaps. Demonstrated phase: habitat.', limitation: 'Measured at the dosimeter location; not organ-specific. Does not represent accumulated dose since mission start.' },
  R09: { title: 'Dose trend', shortTitle: 'Trend', summary: 'Compares channel B rate with the individual baseline median.', technical: 'The attention state requires at least three consecutive samples above +20% of baseline. This demonstration threshold is not clinical.', limitation: 'A single point does not trigger an alert. A zero, missing, or invalid baseline blocks the calculation.' },
  O01: { title: 'DNA damage', shortTitle: 'DNA damage', summary: 'Tracks delayed response markers such as γH2AX.', technical: 'Catalog: H2AX, telomeres, chromosomes, mutations, and oxidative stress. The fixture demonstrates γH2AX only; other assays are absent. No compatible cell mesh is available in this experience.', limitation: 'Longitudinal evidence, not clinical telemetry. Microgravity, duration, exercise, nutrition, sleep, and hydration are confounders. Anatomical association does not demonstrate causality.' },
  O02: { title: 'Inflammation / immunity', shortTitle: 'Inflammation', summary: 'Compares an IL-6 sample with the individual baseline.', technical: 'Catalog: cytokines, IL-6, CRP, leukocytes, lymphocytes, and NK cells. The fixture uses IL-6; other assays are absent.', limitation: 'Longitudinal evidence, not clinical telemetry. Microgravity, duration, exercise, nutrition, sleep, and hydration are confounders. Anatomical association does not demonstrate causality.' },
  O03: { title: 'Hematology', shortTitle: 'Hematology', summary: 'Tracks hemoglobin in longitudinal samples.', technical: 'Catalog: hemoglobin, hematocrit, erythrocytes, platelets, and leukocytes. The fixture uses hemoglobin; other components are absent.', limitation: 'Longitudinal evidence, not clinical telemetry. Microgravity, duration, exercise, nutrition, sleep, and hydration are confounders. Anatomical association does not demonstrate causality.' },
  O04: { title: 'Cardiovascular', shortTitle: 'Cardiovascular', summary: 'Provides context for the collected resting heart rate.', technical: 'Catalog: HR, BP, ECG, cardiac markers, and endothelium. The fixture uses a spot HR sample, with no continuous telemetry or other tests.', limitation: 'Longitudinal evidence, not clinical telemetry. Microgravity, duration, exercise, nutrition, sleep, and hydration are confounders. Anatomical association does not demonstrate causality.' },
  O05: { title: 'Renal / urinary', shortTitle: 'Renal / urinary', summary: 'Tracks one 24-hour urine volume collection.', technical: 'Catalog: urine, hydration, and renal function. The fixture uses urine volume; it does not estimate renal function from this indicator.', limitation: 'Longitudinal evidence, not clinical telemetry. Microgravity, duration, exercise, nutrition, sleep, and hydration are confounders. Anatomical association does not demonstrate causality.' },
  O06: { title: 'Sleep hours', shortTitle: 'Sleep', summary: 'Tracks sleep duration and its variation from the individual baseline.', technical: 'The demonstration uses self-reported duration, not wearable telemetry. Actigraphy combined with a sleep diary can estimate duration; it does not identify sleep stages.', limitation: 'Ranges are based on the 7–9 h recommendation and effects of one week at 6 h/night (NASA OCHMO-TB-041), not validated in-flight clinical limits. One duration value does not establish sleep quality, diagnosis, or performance.' },
  O07: { title: 'Musculoskeletal', shortTitle: 'Muscle & bone', summary: 'Tracks lean mass compared with the individual baseline.', technical: 'Catalog: muscle mass, strength, bone density, calcium, and vitamin D. The fixture demonstrates lean mass; it does not infer bone density or other measures.', limitation: 'Longitudinal evidence, not clinical telemetry. Microgravity, duration, exercise, nutrition, sleep, and hydration are confounders. Anatomical association does not demonstrate causality.' },
  T01: { title: 'Core body temperature', shortTitle: 'Core temperature', summary: 'Tracks an estimate of core temperature and its rest or exercise context.', technical: 'The demonstration represents one isolated reading. Stahn et al. used heat-flux sensors during rest and exercise assessments on long-duration missions.', limitation: 'Synthetic data; no device connected. One reading does not establish organ temperature, cause, diagnosis, or validated operational risk.' },
  V01: { title: 'Heart rate', shortTitle: 'Heart rate', summary: 'Tracks heart rate at rest, during exercise, or EVA.', technical: 'Classification depends on activity: resting thresholds do not apply during exercise, and above 140 bpm is flagged only during EVA. Persistent deviation from personal baseline is observed. In long-duration flight, HR remains largely stable.', limitation: 'Resting references are Earth-based. Bradycardia is common in conditioned crew and escalates only with symptoms.' },
  V02: { title: 'Blood pressure', shortTitle: 'Blood pressure', summary: 'Classifies systolic and diastolic pressure by the more severe component.', technical: 'Categories follow the 2025 AHA/ACC guideline. Low blood pressure is assessed separately and escalates only with symptoms; 24-hour pressure drops about 8–10 mmHg in long-duration flight.', limitation: 'One reading does not define hypertension. Categories are Earth-based clinical references, not NASA operational limits.' },
  V03: { title: 'Blood glucose', shortTitle: 'Blood glucose', summary: 'Classifies glucose by context: fasting, post-meal, or casual (CGM).', technical: 'Hypoglycemia (ADA levels 1 and 2) is classified in any context. Fasting 100–125 mg/dL is impaired fasting glucose; 126 or higher requires confirmation. Outside fasting, above 140 is observation and 200 or higher is attention.', limitation: 'Insulin resistance observed in flight is not captured by glucose alone. Values from 100 to 140 mg/dL without context are not interpreted.' },
  V04: { title: 'Mood and well-being', shortTitle: 'Mood', summary: 'Compares self-reported well-being with the crew member’s own pattern.', technical: 'Self-report scale from 0 to 10. Classification is relative to personal baseline: a persistent decrease triggers observation, never diagnosis.', limitation: 'Not a validated psychometric instrument. Without a baseline, the reading is not interpreted.' },
  C01: { title: 'Dose × DNA damage', shortTitle: 'Dose × DNA', summary: 'Correlation does not imply causality.', technical: 'Pearson/Spearman require aligned pairs from the same mission or experiment, alignable timestamps, individual baseline, missing-data handling, biological delay, and confounders. Show n and uncertainty when calculable.', limitation: 'Not calculable: no aligned real observational pairs. Fixtures do not support scientific correlation.' },
  C02: { title: 'Dose × inflammation', shortTitle: 'Dose × inflammation', summary: 'Correlation does not imply causality.', technical: 'Pearson/Spearman require aligned pairs from the same mission or experiment, alignable timestamps, individual baseline, missing-data handling, biological delay, and confounders. Show n and uncertainty when calculable.', limitation: 'Not calculable: no aligned real observational pairs. Fixtures do not support scientific correlation.' },
  C03: { title: 'High LET × hematology', shortTitle: 'LET × hematology', summary: 'Correlation does not imply causality.', technical: 'Pearson/Spearman require aligned pairs from the same mission or experiment, alignable timestamps, individual baseline, missing-data handling, biological delay, and confounders. Show n and uncertainty when calculable.', limitation: 'Not calculable: no aligned real observational pairs. Fixtures do not support scientific correlation.' },
};

const scenarioCopy: Record<string, { title: string; description: string; action: string }> = {
  routine: { title: 'Stable routine', description: 'Stable baseline, local dosimetry, and longitudinal evidence.', action: 'Maintain routine observation and confirm the quality of upcoming collections.' },
  'sep-moderate': { title: 'Moderate solar activity', description: 'Three SEP records and flare/CME context, with no persistent dose increase.', action: 'Observe the environmental trend and confirm exposure with the dosimeter.' },
  'high-energy': { title: 'High energy · dose missing', description: 'A ≥100 MeV channel is present in the scenario; dosimetry is unavailable.', action: 'Confirm with a dosimeter. High energy alone cannot estimate dose.' },
  'dose-trend': { title: 'Dose above baseline', description: 'Persistent increase across four samples; environmental context shown separately.', action: 'Check the reading, detector, and operational context; consult the mission protocol.' },
  'high-let': { title: 'Same dose · different LET', description: 'Dose rate similar to routine, with a larger tail in the LET distribution.', action: 'Review radiation quality and confirm the spectrum; LET alone does not establish severity.' },
  'delayed-biology': { title: 'Delayed biological response', description: 'Collection 24 h after the synthetic event, with baseline and confounders visible.', action: 'Review the collection and individual baseline alongside mission confounders.' },
  unpaired: { title: 'Correlation unavailable', description: 'No real aligned pairs between dosimetry and biomarkers.', action: 'Obtain pairs from the same mission and assay; document alignment, baseline, and missing data.' },
  'data-gap': { title: 'Source delayed / invalid', description: 'DONKI delayed, dosimeter invalid, and collection missing. Gaps are not extrapolated.', action: 'Restore the source and check integrity; missing data do not mean zero exposure.' },
  hypoglycemia: { title: 'Crew member hypoglycemia', description: 'CGM at 48 mg/dL with symptomatic tachycardia and low blood pressure; stable solar environment.', action: 'Apply the 15-15 rule if the crew member is conscious, alert the crew, and notify the flight surgeon. Recheck glucose in 15 minutes.' },
  'sleep-debt': { title: 'Sleep deficit and well-being', description: 'Seven nights below 6 h, well-being below personal baseline, and resting HR above baseline.', action: 'Ask the flight surgeon to review the sleep schedule and consider a private behavioral-health consultation. Each signal is assessed separately; no correlation is calculated.' },
  critical: { title: 'Protocol · critical scenario', description: 'Critical environmental score and persistently above-baseline dosimetry in the simulation.', action: 'Prioritize the approved mission protocol, confirm dosimetry, and notify mission control. The app generates no prescriptions.' },
};

const scenarioText: Record<string, Record<string, string>> = {
  'Registro SEP': { en: 'SEP record' }, 'Flare relacionado': { en: 'Related flare' }, 'CME relacionado': { en: 'Related CME' },
  'Coleta de biomarcadores': { en: 'Biomarker collection' }, Exercício: { en: 'Exercise' },
  'Habitat / blindagem': { en: 'Habitat / shielding' }, 'Registro de EVA': { en: 'EVA record' },
  'Coleta 24h após o SEP sintético; latência causal não estabelecida': { en: 'Collection 24 h after the synthetic SEP; causal latency is not established' },
  'Não caracterizado; coleta de rotina': { en: 'Not characterized; routine collection' },
  'Ares I · participante simulado P01 · habitat · dia demonstrativo 42': { en: 'Ares I · simulated participant P01 · habitat · demonstration day 42' },
  'Dados sintéticos; variabilidade analítica não estimada': { en: 'Synthetic data; analytical variability not estimated' },
  'Não estimável sem pares observacionais válidos': { en: 'Cannot be estimated without valid observational pairs' },
  'Pearson / Spearman não calculáveis: n = 0 pares reais alinhados; baseline, atraso e confundidores precisam ser tratados. Correlação não implica causalidade.': { en: 'Pearson / Spearman not calculable: n = 0 aligned real pairs; baseline, delay, and confounders require handling. Correlation does not imply causality.' },
  '±12% ilustrativos; não calibração real': { en: '±12% illustrative; not a real calibration' },
  '±12% de demonstração; não calibração real': { en: '±12% demonstration value; not a real calibration' },
  '±12% ilustrativos; não é calibração real': { en: '±12% illustrative; not a real calibration' },
  'Dosímetro habitat · fixture no esquema RAD': { en: 'Habitat dosimeter · RAD schema fixture' },
  'CGM · leitura contínua simulada': { en: 'CGM · simulated continuous reading' }, 'Glicosímetro capilar · jejum': { en: 'Capillary glucose meter · fasting' },
  'Coleta de rotina': { en: 'Routine collection' },
  microgravidade: { en: 'microgravity' }, duração: { en: 'duration' }, exercício: { en: 'exercise' },
  nutrição: { en: 'nutrition' }, sono: { en: 'sleep' }, hidratação: { en: 'hydration' },
};

function localizeRecord(record: IndicatorRecord): IndicatorRecord {
  const map = (value: string | undefined) => value ? scenarioText[value]?.en ?? value : value;
  return {
    ...record,
    note: map(record.note), detector: map(record.detector), context: map(record.context),
    uncertainty: typeof record.uncertainty === 'string' ? map(record.uncertainty) : record.uncertainty,
    biologicalDelay: map(record.biologicalDelay),
    confounders: record.confounders?.map((value) => scenarioText[value]?.en ?? value),
  };
}

export function localizeScenario(scenario: MissionScenario, locale: Locale): MissionScenario {
  if (locale !== 'en') return scenario;
  const copy = scenarioCopy[scenario.id];
  return {
    ...scenario,
    ...copy,
    missionName: 'Ares I', environment: 'Mars habitat · Sol 042', notice: 'Synthetic data for demonstration. No measurement represents a real person, mission, or NASA event.',
    records: Object.fromEntries(Object.entries(scenario.records).map(([id, record]) => [id, localizeRecord(record)])),
    events: scenario.events.map((event) => ({
      ...event,
      label: scenarioText[event.label]?.en ?? event.label,
      detail: event.detail
        .replace('fixture sintética, não evento NASA real', 'synthetic fixture, not a real NASA event')
        .replace('Cadeia de contexto sintética; não determina exposição.', 'Synthetic context chain; does not determine exposure.')
        .replace('Atividade física sintética · fator de confusão registrado; efeito não estimado.', 'Synthetic physical activity · confounder recorded; effect not estimated.')
        .replace('Contexto operacional demonstrativo; fator de proteção não calculado.', 'Demonstration operational context; shielding factor not calculated.')
        .replace('Atividade sintética. Dosímetro permanece no habitat; não há dose atribuível à EVA.', 'Synthetic activity. Dosimeter remains in the habitat; no dose is attributed to the EVA.'),
    })),
  };
}

export function localizeIndicator(definition: IndicatorDefinition, locale: Locale): IndicatorDefinition {
  return locale === 'en' ? { ...definition, ...indicatorCopy[definition.id] } : definition;
}

export function localizeSource(source: string, locale: Locale): string {
  if (locale !== 'en') return source;
  return ({ wearable: 'Wearable', manual: 'Manual entry', integrated: 'Integrated analysis' } as Record<string, string>)[source] ?? source;
}

export function localizeUnit(id: string, unit: string | null | undefined, locale: Locale): string | null | undefined {
  if (!unit || locale !== 'en') return unit;
  const labels: Record<string, string> = {
    D01: 'records', D02: 'events/24 h', D03: 'channels', D04: 'links', D05: 'notifications',
    R06: 'dimensionless', R07: 'proxy µSv/h', R09: '% of baseline', O01: 'foci/cell',
  };
  return labels[id] ?? unit;
}

export function localizeState(state: string, locale: Locale): string {
  if (locale !== 'en') return state;
  const map: Record<string, string> = {
    'Medido · simulação': 'Measured · simulated', Estimado: 'Estimated', 'Proxy exploratório': 'Exploratory proxy',
    'Sem dado': 'No data', Inválido: 'Invalid', Normal: 'Normal', Observação: 'Observation', Atenção: 'Attention',
    Crítico: 'Critical', 'Fonte atrasada': 'Source delayed', 'Parcial': 'Partial', 'Atrasado': 'Delayed',
    'Válido no cenário': 'Valid in scenario', 'Não disponível': 'Unavailable',
    'Atlas masculino de referência, com cobertura anatômica parcial. Geometria agrupada e simplificada para navegação; sem malha celular, sem dosimetria por órgão.': 'Male reference atlas with partial anatomical coverage. Geometry is grouped and simplified for navigation; no cellular meshes or organ-level dosimetry.',
    'Referência masculina HRA; não é um modelo individual.': 'Male HRA reference; not an individual model.',
    'Superfície corporal masculina de referência.': 'Male reference body surface.',
    'Cobertura parcial: pelve, coluna vertebral e joelhos; não representa um esqueleto completo.': 'Partial coverage: pelvis, spine, and knees; this is not a complete skeleton.',
    'Cobertura parcial: músculos dos olhos, joelhos e laringe.': 'Partial coverage: muscles of the eyes, knees, and larynx.',
    'Encéfalo, medula espinal e nervos dos olhos.': 'Brain, spinal cord, and nerves of the eyes.',
    'Coração e vasos presentes no objeto de referência.': 'Heart and vessels present in the reference object.',
    'Pulmões, laringe e árvore traqueobrônquica.': 'Lungs, larynx, and tracheobronchial tree.',
    'Fígado, pâncreas, vias biliares, intestinos e estruturas disponíveis. Estômago ausente nesta seleção HRA.': 'Liver, pancreas, bile ducts, intestines, and available structures. The stomach is absent from this HRA selection.',
    'Rins, ureteres, bexiga e uretra.': 'Kidneys, ureters, bladder, and urethra.',
    'Baço, timo e linfonodo de referência. Linfonodo não representa localização individual medida.': 'Spleen, thymus, and reference lymph node. The lymph node is not a measured individual location.',
    'Próstata e ductos genitais masculinos disponíveis.': 'Prostate and available male genital ducts.',
    'Malha de referência; não é a anatomia individual da tripulação.': 'Reference mesh; not an individual crew member’s anatomy.',
    'O renderizador 3D não está disponível neste dispositivo. Use a lista de estruturas para explorar a anatomia.': 'The 3D renderer is unavailable on this device. Use the structure list to explore the anatomy.',
    'O dispositivo pausou a sessão 3D. A lista anatômica continua disponível; recarregue para retomar o canvas.': 'The device paused the 3D session. The anatomy list is still available; reload to restore the canvas.',
    'As malhas não correspondem ao catálogo anatômico. Consulte Sobre os dados.': 'The meshes do not match the anatomy catalog. See About the data.',
    'Não foi possível carregar as malhas locais do HRA. Recarregue a página ou explore a lista anatômica.': 'Could not load local HRA meshes. Reload the page or explore the anatomy list.',
  };
  return map[state] ?? state;
}
