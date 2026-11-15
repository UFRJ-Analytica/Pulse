import type { VitalAssessment } from './vitals';

export type DataStatus = 'measured' | 'estimated' | 'proxy' | 'missing' | 'invalid';
export type SignalState = 'normal' | 'observation' | 'attention' | 'critical' | 'no-data';
export type IndicatorSource = 'DONKI' | 'RAD' | 'OSDR' | 'integrated' | 'wearable' | 'manual';
export type IndicatorGroup = 'environment' | 'exposure' | 'radiobiology' | 'biology' | 'correlation';
export type Quality = 'valid' | 'delayed' | 'partial' | 'invalid';

export interface IndicatorRecord {
  id: string;
  value: number | string | null;
  unit: string | null;
  status: DataStatus;
  source: IndicatorSource;
  timestamp: string | null;
  timezone: string | null;
  missionId: string | null;
  uncertainty?: number | string | null;
  baseline?: number | string | null;
  formulaVersion?: string | null;
  quality?: Quality;
  state: SignalState;
  synthetic: boolean;
  note?: string;
  detector?: string;
  channel?: string;
  collectionDate?: string;
  biologicalDelay?: string;
  confounders?: string[];
  context?: string;
  sourceUrl?: string;
  components?: { label: string; value: number }[];
  persistence?: number;
  delta?: number | null;
  sampleSize?: number;
  // Classification of a vital sign, with findings, actions and sources (data/vitals.ts).
  vital?: VitalAssessment;
}

export interface IndicatorDefinition {
  id: string;
  title: string;
  shortTitle: string;
  group: IndicatorGroup;
  source: IndicatorSource;
  unit: string;
  priority: number;
  summary: string;
  technical: string;
  limitation: string;
  formula?: string;
  anatomySystem?: string;
  sourceUrl: string;
}

export interface TimelinePoint {
  timestamp: string;
  time: string;
  dose: number | null;
  doseE: number | null;
  let: number | null;
  score: number | null;
  accumulated: number | null;
}
export interface TimelineEvent {
  id: string;
  timestamp: string;
  label: string;
  type: 'sep' | 'flare' | 'cme' | 'collection' | 'eva' | 'exercise' | 'shielding';
  source: IndicatorSource | 'mission';
  detail: string;
  indicatorId?: string;
  channel?: string;
  instrument?: string;
  sourceUrl?: string;
  relatedEvents?: string[];
}
export interface MissionScenario {
  id: string;
  title: string;
  description: string;
  state: SignalState;
  missionId: string;
  missionName: string;
  environment: string;
  timestamp: string;
  records: Record<string, IndicatorRecord>;
  timeline: TimelinePoint[];
  events: TimelineEvent[];
  notice: string;
  action: string;
  synthetic: true;
}
export const DATA_STATUS_LABELS: Record<DataStatus, string> = {
  measured: 'Medido · simulação', estimated: 'Estimado', proxy: 'Proxy exploratório', missing: 'Sem dado', invalid: 'Inválido',
};
export const STATE_LABELS: Record<SignalState, string> = {
  normal: 'Normal', observation: 'Observação', attention: 'Atenção', critical: 'Crítico', 'no-data': 'Sem dado',
};
export const FORMULA_VERSION = 'pulse-exploratory-v1';
export const THRESHOLD_VERSION = 'pulse-demo-thresholds-v1';
