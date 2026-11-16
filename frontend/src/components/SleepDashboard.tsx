import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ArrowLeft, BookOpen, Check, ChevronRight, CircleHelp, ClipboardList, Clock3, Cpu, Droplets, HeartPulse, ListFilter, Lock, Menu, Moon, MoreVertical, Orbit, Radio, ShieldCheck, SlidersHorizontal, Sparkles, Sun, Thermometer, Wind, X } from 'lucide-react';
import { Modal } from './Modal';
import { AtlasViewer } from './AtlasViewer';
import type { Locale } from '../i18n/messages';
import { useLocation, useNavigate } from 'react-router';
import { useLocale } from '../i18n/locale';
import { localeToPath } from '../i18n/messages';
import { MISSION_MODES, setMissionMode, useMissionMode } from './missionMode';
import type { MissionMode } from './missionMode';
import { assessVital } from '../data/vitals';
import { DEMO_MOOD } from '../data/fixtures';
import { VitalStatusPanel } from './VitalStatusPanel';
import { clearCheckInScore, moodAssessInput, moodWeek, readCheckInScore, saveCheckInScore } from '../data/checkIn';
import { GLUCOSE_CONTEXT_LABELS, GLUCOSE_LOG_KEY, GLUCOSE_MEAL, assessGlucoseLog, glucoseLogContext, glucoseLogLabel, readGlucoseLog } from '../data/glucoseLog';
import type { GlucoseEntryContext, GlucoseLog } from '../data/glucoseLog';
import { BLOOD_GLUCOSE_LATEST, BLOOD_PRESSURE_LATEST, HEART_RATE_LATEST, MOOD_LATEST } from '../data/vitalSeries';
import { SCENARIOS } from '../data/fixtures';
import { localizeScenario } from '../data/localization';
import { DEFAULT_SCENARIO_ID, scenarioReadings, scenarioVitals } from '../data/scenarioVitals';
import type { SignalState } from '../data/types';
import type { VitalAssessment } from '../data/vitals';
import './sleep-dashboard.css';

type Props = {
  onAtlas: () => void;
  onHighlights: () => void;
  onIndicators: () => void;
  onData: () => void;
  onExamLogs?: () => void;
  onActivityHistory?: () => void;
  activePage?: 'highlights' | 'sleep' | 'catalog' | 'atlas' | 'history' | 'exams' | 'sensors';
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
};
type SleepDay = { day: string; sol: number; deep: number; rem: number; light: number };
export type { MissionMode } from './missionMode';
const missionModes = MISSION_MODES;
const missionTelemetry: Record<MissionMode, string[]> = {
  ISS: ['Gravidade: ~0g', 'Latência da Terra: 0,24 s (ida)', 'Cabine: 101,3 kPa'],
  'Lunar Base': ['Gravidade: 0,16g', 'Latência da Terra: 1,3 s (ida)', 'Cabine: 56,5 kPa'],
  'Mars Transit': ['Gravidade: ~0g', 'Latência da Terra: 3–22 min (ida)', 'Dose GCR: ~1,8 mSv/dia'],
};
const missionTelemetryEn: Record<MissionMode, string[]> = {
  ISS: ['Gravity: ~0g', 'Earth latency: 0.24s one-way', 'Cabin: 101.3 kPa'],
  'Lunar Base': ['Gravity: 0.16g', 'Earth latency: 1.3s one-way', 'Cabin: 56.5 kPa'],
  'Mars Transit': ['Gravity: ~0g', 'Earth latency: 3–22 min one-way', 'GCR dose: ~1.8 mSv/day'],
};
const demoWeek: SleepDay[] = [
  { day: 'Qui', sol: 136, deep: 1.3, rem: 1.2, light: 3.9 },
  { day: 'Sex', sol: 137, deep: 1.1, rem: 1, light: 3.7 },
  { day: 'Sáb', sol: 138, deep: 1.4, rem: 1.5, light: 4.2 },
  { day: 'Dom', sol: 139, deep: .8, rem: .8, light: 3.3 },
  { day: 'Seg', sol: 140, deep: 1.2, rem: 1.4, light: 3.9 },
  { day: 'Ter', sol: 141, deep: 1.1, rem: 1.4, light: 3.7 },
  { day: 'Qua', sol: 142, deep: 1.2, rem: 1.5, light: 4.5 },
];
const total = (d: SleepDay) => d.deep + d.rem + d.light;
// Sleep week of a scenario: the demo stages scaled to the scenario's nightly totals (sleep debt), or the demo week.
function sleepWeekFor(scenarioId: string): SleepDay[] {
  const nights = scenarioVitals(scenarioId).sleepNights;
  if (!nights) return demoWeek;
  return demoWeek.map((day, index) => {
    const factor = nights[index] / total(day);
    return { ...day, deep: day.deep * factor, rem: day.rem * factor, light: day.light * factor };
  });
}
// Last night of the week (Sol 142), shared by the Highlights sleep card, the correlation alert and the sleep page.
const latestSleepFor = (scenarioId: string) => { const week = sleepWeekFor(scenarioId); return total(week[week.length - 1]); };
const h = (n: number, locale: Locale = 'pt-BR') => n.toLocaleString(locale === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const text = (locale: Locale, pt: string, en: string) => locale === 'en' ? en : pt;
const utcTime = () => new Date().toISOString().slice(11, 19);
const normalizeExamTime = (value: string) => {
  const twelveHour = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (twelveHour) {
    let hours = Number(twelveHour[1]) % 12;
    if (twelveHour[4].toUpperCase() === 'PM') hours += 12;
    return `${hours.toString().padStart(2, '0')}:${twelveHour[2]}:${twelveHour[3] ?? '00'}`;
  }
  const twentyFourHour = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (twentyFourHour) return `${twentyFourHour[1].padStart(2, '0')}:${twentyFourHour[2]}:${twentyFourHour[3] ?? '00'}`;
  return value;
};

export function HealthHeader({ onAtlas, onHighlights, onIndicators, onData, onExamLogs = onIndicators, onActivityHistory = () => {}, activePage, theme, onToggleTheme, locale, onLocaleChange }: Props & { onActivityHistory?: () => void }) {
  const english = locale === 'en';
  const missionMode = useMissionMode();
  const navigate = useNavigate();
  const { search } = useLocation();
  // The header badge opens the simulated response workflow from any page.
  const [responseFlow, setResponseFlow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(() => {
    // On narrow screens the menu overlays the page, so it starts closed.
    if (window.matchMedia?.('(max-width: 700px)').matches) return false;
    try { return localStorage.getItem('pulse-health-sidebar') !== 'closed'; } catch { return true; }
  });
  useEffect(() => {
    // The narrow-screen default must not overwrite the desktop preference.
    if (window.matchMedia?.('(max-width: 700px)').matches) return;
    try { localStorage.setItem('pulse-health-sidebar', menuOpen ? 'open' : 'closed'); } catch { /* Keep the preference for this mounted page. */ }
  }, [menuOpen]);
  return <header className="health-header"><div className="health-brand"><div className="health-menu-wrap"><button className="health-menu-toggle" type="button" aria-label={english ? (menuOpen ? 'Collapse sidebar' : 'Open sidebar') : (menuOpen ? 'Recolher barra lateral' : 'Abrir barra lateral')} aria-expanded={menuOpen} aria-controls="health-main-menu" onClick={() => setMenuOpen(open => !open)}><Menu size={18} /></button><div className={`health-floating-menu ${menuOpen ? 'is-open' : 'is-closed'}`} id="health-main-menu" role="menu"><button role="menuitem" className={activePage === 'highlights' ? 'selected' : ''} onClick={onHighlights}><Activity size={15}/><span>{english ? 'Overview' : 'Visão geral'}</span></button><button role="menuitem" className={activePage === 'catalog' ? 'selected' : ''} onClick={onIndicators}><ListFilter size={15}/><span>{english ? 'All Biomarkers' : 'Todos os biomarcadores'}</span></button><button role="menuitem" className={activePage === 'atlas' ? 'selected' : ''} onClick={onAtlas}><Orbit size={15}/><span>{english ? 'Mission Atlas' : 'Atlas da missão'}</span></button><button role="menuitem" className={activePage === 'history' ? 'selected' : ''} onClick={onActivityHistory}><Activity size={15}/><span>{english ? 'Activity History' : 'Histórico de atividades'}</span></button><button role="menuitem" className={activePage === 'exams' ? 'selected' : ''} onClick={onExamLogs}><ClipboardList size={15}/><span>{english ? 'Exam Logs' : 'Registros de exames'}</span></button><button role="menuitem" className={activePage === 'sensors' ? 'selected' : ''} onClick={() => navigate(`/${localeToPath(locale)}/sensors${search}`)}><Radio size={15}/><span>{english ? 'Wearables & Sensors' : 'Wearables e sensores'}</span></button><button role="menuitem" onClick={onData}><BookOpen size={15}/><span>{english ? 'About the data' : 'Sobre os dados'}</span></button></div></div><div className="health-legacy-brand"><span className="health-legacy-mark"><Activity size={20} strokeWidth={1.7} /></span><div className="health-legacy-name"><span>pulse<b>health</b></span><div className="health-telemetry">{(english ? missionTelemetryEn : missionTelemetry)[missionMode].map((item, index) => <span key={item} className={index === (english ? missionTelemetryEn : missionTelemetry)[missionMode].length - 1 ? 'muted' : undefined}>{index > 0 && <b>•</b>} {item}</span>)}</div></div></div></div><span className="health-header-divider"/><div className="mission-mode-selector" role="tablist" aria-label={english ? 'Mission mode' : 'Modo da missão'}>{missionModes.map(mode => <button key={mode} type="button" role="tab" aria-selected={missionMode === mode} className={missionMode === mode ? 'active' : ''} onClick={() => setMissionMode(mode)}><i className={`mission-mode-dot ${mode.toLowerCase().replace(' ', '-')}`} />{english ? mode : mode === 'Lunar Base' ? 'Base Lunar' : mode === 'Mars Transit' ? 'Trânsito a Marte' : 'ISS'}</button>)}</div><div className="health-header-right"><span className="health-connection" title={english ? 'No sensors or live telemetry are connected' : 'Nenhum sensor ou telemetria em tempo real está conectado'}><i /> {english ? 'DEMO · NO LIVE SENSORS' : 'DEMO · SEM SENSORES AO VIVO'}</span><span className="health-astronaut"><b>DEMO</b><span>{english ? 'Crew profile' : 'Perfil da tripulação'}<small>{english ? 'SYNTHETIC' : 'SINTÉTICO'}</small></span></span><button type="button" className="emergency-button" aria-haspopup="dialog" onClick={() => setResponseFlow(true)}><AlertTriangle size={14}/><span>{english ? 'RESPONSE FLOW · DEMO ONLY' : 'FLUXO DE RESPOSTA · DEMO'}</span></button><button className="theme-toggle" onClick={onToggleTheme} aria-label={theme === 'dark' ? (english ? 'Enable light theme' : 'Ativar tema claro') : (english ? 'Enable dark theme' : 'Ativar tema escuro')}>{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />} <span>{theme === 'dark' ? (english ? 'Light' : 'Claro') : (english ? 'Dark' : 'Escuro')}</span></button><button aria-label={english ? 'Change language to Portuguese (Brazil)' : 'Mudar idioma para English'} onClick={() => onLocaleChange(english ? 'pt-BR' : 'en')}>{english ? 'EN' : 'PT-BR'}</button></div>{responseFlow && <HealthAlertModal alert="critical" locale={locale} theme={theme} onClose={() => setResponseFlow(false)} onIndicators={() => { setResponseFlow(false); onIndicators(); }} onSleep={() => setResponseFlow(false)} onData={() => { setResponseFlow(false); onData(); }} />}</header>;
}

function HighlightCard({ icon, name, value, unit, detail, context, status, statusTone = 'nominal', children, onClick }: { icon: React.ReactNode; name: string; value: string; unit: string; detail: string; context: string; status: string; statusTone?: 'nominal' | 'warning' | 'info'; children?: React.ReactNode; onClick?: () => void }) {
  const content = <><div className="hl-card-top"><span className="hl-icon" aria-hidden="true">{icon}</span><span>{name}</span><small className={`hl-status ${statusTone}`}>{status}</small></div><div className="hl-reading"><strong>{value}</strong><span>{unit}</span></div><p>{detail}</p><small className="hl-card-context">{context}</small>{children}</>;
  return onClick ? <button type="button" className="hl-card hl-card-button" onClick={onClick}>{content}</button> : <div className="hl-card">{content}</div>;
}

const STATE_LABELS: Record<SignalState, { pt: string; en: string }> = {
  normal: { pt: 'Normal', en: 'Normal' }, observation: { pt: 'Observação', en: 'Observation' }, attention: { pt: 'Atenção', en: 'Attention' },
  critical: { pt: 'Crítico', en: 'Critical' }, 'no-data': { pt: 'Sem dado', en: 'No data' },
};
type ScenarioReading = { reading: { value: unknown; secondary?: unknown; context?: Parameters<typeof assessVital>[1]['context'] }; options?: Parameters<typeof assessVital>[2] };
// Highlights card of a demo scenario: value and state from the same classification as the vital pages.
function ScenarioCard({ icon, name, input, vitalId, unit, decimals = 0, scenarioTitle, locale, onClick }: { icon: React.ReactNode; name: string; input: ScenarioReading; vitalId: Parameters<typeof assessVital>[0]; unit: string; decimals?: number; scenarioTitle: string; locale: Locale; onClick?: () => void }) {
  const assessment: VitalAssessment = assessVital(vitalId, input.reading, input.options);
  const value = typeof input.reading.value === 'number'
    ? `${input.reading.value.toLocaleString(locale === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${typeof input.reading.secondary === 'number' ? `/${input.reading.secondary}` : ''}`
    : '—';
  const finding = assessment.findings[0];
  const detail = assessment.reason === 'missing' ? text(locale, 'Leitura indisponível neste cenário.', 'Reading unavailable in this scenario.') : finding ? `${finding.label[locale]}.` : text(locale, 'Dentro da referência.', 'Within reference.');
  return <HighlightCard icon={icon} status={text(locale, STATE_LABELS[assessment.state].pt, STATE_LABELS[assessment.state].en)} statusTone={assessment.state === 'normal' ? 'info' : 'warning'} name={name} value={value} unit={typeof input.reading.value === 'number' ? unit : ''} detail={detail} context={`${text(locale, 'Cenário', 'Scenario')}: ${scenarioTitle}`} onClick={onClick}/>;
}

function FastingGlucoseInstructionsModal({ onClose, onLogResult, locale }: { onClose: () => void; onLogResult: () => void; locale: Locale }) {
  const english = locale === 'en';
  return <Modal title={english ? 'EXAM - FASTING CAPILLARY BLOOD GLUCOSE' : 'EXAME - GLICEMIA CAPILAR EM JEJUM'} onClose={onClose} className="glucose-instructions-modal">
    <div className="glucose-instructions">
      <p className="glucose-instructions-subtitle">{english ? 'Self-administered fingertip blood test using the onboard microfluidic analyzer (Zero-G biohazard containment active).' : 'Teste sanguíneo autoadministrado na ponta do dedo usando o analisador microfluídico de bordo (contenção de risco biológico Zero-G ativa).'}</p>
      <section><h3>{english ? 'STEP-BY-STEP COLLECTION (HOW TO MEASURE)' : 'COLETA PASSO A PASSO (COMO MEDIR)'}</h3><ol>
        <li><strong>{english ? 'Verify Fasting:' : 'Verifique o jejum:'}</strong> {english ? 'Confirm at least 8 hours without food or caloric drinks (water only).' : 'Confirme pelo menos 8 horas sem alimentos ou bebidas calóricas (somente água).'}</li>
        <li><strong>{english ? 'Prepare Analyzer & Chip:' : 'Prepare o analisador e o chip:'}</strong> {english ? 'Power on the onboard reader and remove a sterile disposable microfluidic chip from its sealed pouch.' : 'Ligue o leitor de bordo e retire um chip microfluídico estéril descartável do envelope selado.'}</li>
        <li><strong>{english ? 'Sanitize & Warm:' : 'Higienize e aqueça:'}</strong> {english ? 'Swab your non-dominant fingertip with an alcohol wipe and let it dry completely. Warm the finger for 15–30 seconds to aid capillary flow in microgravity.' : 'Higienize a ponta do dedo não dominante com álcool e deixe secar completamente. Aqueça o dedo por 15–30 segundos para auxiliar o fluxo capilar em microgravidade.'}</li>
        <li><strong>{english ? 'Draw & Load Drop:' : 'Colete e carregue a gota:'}</strong> {english ? 'Lance the side of your fingertip. Gently touch the blood drop to the chip’s intake port; capillary action draws the sample into the sealed chamber.' : 'Puncione a lateral da ponta do dedo. Encoste suavemente a gota de sangue na entrada do chip; a capilaridade puxará a amostra para a câmara selada.'}</li>
        <li><strong>{english ? 'Analyze & Dispose:' : 'Analise e descarte:'}</strong> {english ? 'Insert the chip into the reader (results appear in ~3 minutes). Log the value in mg/dL and immediately seal the lancet and chip in the biohazard sharps container.' : 'Insira o chip no leitor (o resultado aparece em cerca de 3 minutos). Registre o valor em mg/dL e sele imediatamente a lanceta e o chip no coletor de perfurocortantes.'}</li>
      </ol></section>
      <section className="glucose-safety"><h3>{english ? 'SAFETY NOTE' : 'NOTA DE SEGURANÇA'}</h3><p><strong>Zero-G:</strong> {english ? 'Never squeeze the finger excessively or let blood droplets float free; bodily fluids pose a cabin biohazard and contamination risk in microgravity.' : 'Nunca esprema o dedo excessivamente nem permita que gotas de sangue flutuem; fluidos corporais oferecem risco biológico e de contaminação na cabine em microgravidade.'}</p></section>
      <section><h3>{english ? 'REFERENCE RANGES (WHOLE BLOOD)' : 'FAIXAS DE REFERÊNCIA (SANGUE TOTAL)'}</h3><ul className="glucose-ranges"><li className="normal"><strong className="glucose-range-badge">Normal</strong> <span>{english ? '70 – 99 mg/dL fasting · up to 140 mg/dL outside fasting' : '70 – 99 mg/dL em jejum · até 140 mg/dL fora do jejum'}</span></li><li className="elevated"><strong className="glucose-range-badge">{english ? 'Above reference' : 'Acima da referência'}</strong> <span>{english ? 'Fasting 100 – 125 mg/dL (track) · 126+ (confirm, flight surgeon) · outside fasting 141 – 199 mg/dL (recheck fasting) · 200+ (flight surgeon)' : 'Jejum 100 – 125 mg/dL (acompanhar) · 126+ (confirmar, flight surgeon) · fora do jejum 141 – 199 mg/dL (repetir em jejum) · 200+ (flight surgeon)'}</span></li><li className="critical"><strong className="glucose-range-badge">{english ? 'Hypoglycemia' : 'Hipoglicemia'}</strong> <span>{english ? '54 – 69 mg/dL level 1 (15-15 rule, tell a crewmate) · < 54 mg/dL level 2 (alert crew and flight surgeon)' : '54 – 69 mg/dL nível 1 (regra 15-15, avise um colega) · < 54 mg/dL nível 2 (avise a tripulação e o flight surgeon)'}</span></li></ul></section>
      <p className="glucose-sources">{english ? 'Sources: procedure — NASA Spinoff, Extraterrestrial Medical Diagnostics (2026) • ranges — ADA Standards of Care 2025; Hughson et al. 2016' : 'Fontes: procedimento — NASA Spinoff, Extraterrestrial Medical Diagnostics (2026) • faixas — ADA Standards of Care 2025; Hughson et al. 2016'}</p>
      <div className="glucose-instructions-actions"><button className="health-button" type="button" onClick={onClose}>{english ? 'Close Instructions' : 'Fechar instruções'}</button><button className="health-button primary" type="button" onClick={onLogResult}>{english ? 'Log Exam Result' : 'Registrar resultado do exame'}</button></div>
    </div>
  </Modal>;
}

type GlucoseUnit = 'mg/dL' | 'mmol/L';
type GlucoseEntryMethod = 'manual' | 'reader';
type GlucoseEntryClassification = 'normal' | 'elevated' | 'critical';
const GLUCOSE_BADGE: Record<string, GlucoseEntryClassification> = { normal: 'normal', observation: 'elevated', attention: 'elevated', critical: 'critical' };

function LogGlucoseResultModal({ onClose, onSave, locale }: { onClose: () => void; onSave: (valueMgDl: number, notes: string[], context: GlucoseEntryContext) => void; locale: Locale }) {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<GlucoseUnit>('mg/dL');
  const [context, setContext] = useState<GlucoseEntryContext>('fasting');
  const [method, setMethod] = useState<GlucoseEntryMethod>('manual');
  const [notes, setNotes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const numericValue = Number(value);
  const valueMgDl = unit === 'mg/dL' ? numericValue : numericValue * 18.0182;
  // Same classification as the V03 indicator, using the selected meal context.
  const assessment = value !== '' && Number.isFinite(valueMgDl) ? assessVital('blood-glucose', { value: valueMgDl, context: { meal: GLUCOSE_MEAL[context] } }) : null;
  const classification = assessment ? GLUCOSE_BADGE[assessment.state] ?? null : null;
  const finding = assessment?.findings[0];
  const classificationLabel = finding ? finding.label[locale] : text(locale, 'Normal', 'Normal');
  useEffect(() => {
    if (!saving || !classification) return;
    const timeout = window.setTimeout(() => onSave(valueMgDl, notes, context), 850);
    return () => window.clearTimeout(timeout);
  }, [saving, classification, notes, onSave, valueMgDl, context]);
  return <Modal title={text(locale, 'REGISTRAR RESULTADO · GLICEMIA CAPILAR', 'LOG EXAM RESULT · CAPILLARY BLOOD GLUCOSE')} onClose={onClose} className="glucose-result-modal">
    <div className={`glucose-result-body ${saving ? 'glucose-result-saving' : ''}`}>
      {saving && <div className="glucose-result-save-success" role="status" aria-live="polite"><Check size={22}/><strong>{text(locale, 'Resultado salvo', 'Result saved')}</strong><span>{text(locale, 'Atualizando a telemetria…', 'Updating telemetry…')}</span></div>}
      <section className="glucose-result-section"><h3>{text(locale, 'ENTRADA DO RESULTADO & UNIDADE', 'RESULT ENTRY & UNIT')}</h3>
        <div className="glucose-result-input-row"><label className="glucose-result-input-label"><span>{text(locale, 'Valor medido', 'Measured value')}</span><input type="number" min="0" step="any" inputMode="decimal" value={value} onChange={event => setValue(event.target.value)} aria-label={text(locale, 'Valor de glicemia', 'Glucose value')} /></label>
          <div className="glucose-unit-toggle" role="group" aria-label={text(locale, 'Unidade', 'Unit')}>{(['mg/dL', 'mmol/L'] as GlucoseUnit[]).map(option => <button key={option} type="button" className={unit === option ? 'active' : ''} onClick={() => setUnit(option)}>{option}</button>)}</div>
          <div className={`glucose-live-badge ${classification ?? 'empty'}`} aria-live="polite"><small>{text(locale, 'CLASSIFICAÇÃO AO VIVO', 'LIVE CLASSIFICATION')}</small><strong>{classification ? classificationLabel : text(locale, 'Aguardando valor', 'Enter a value')}</strong></div>
        </div>
        <p className="glucose-conversion-preview">{classification ? `${valueMgDl.toFixed(1)} mg/dL · ${(valueMgDl / 18.0182).toFixed(1)} mmol/L` : assessment ? text(locale, 'Valor fora da faixa medível (10–600 mg/dL).', 'Value outside the measurable range (10–600 mg/dL).') : text(locale, 'Digite um valor para visualizar a conversão.', 'Enter a value to preview the conversion.')}</p>
        {finding && <p className="glucose-conversion-preview" role="status">{finding.action[locale]}</p>}
      </section>
      <section className="glucose-result-section"><h3>{text(locale, 'CONTEXTO DA COLETA & MÉTODO DE ENTRADA', 'COLLECTION CONTEXT & ENTRY METHOD')}</h3>
        <div className="glucose-entry-tabs" role="tablist"><button type="button" role="tab" aria-selected={method === 'manual'} className={method === 'manual' ? 'active' : ''} onClick={() => setMethod('manual')}>{text(locale, 'Entrada manual', 'Manual Entry')}</button><button type="button" role="tab" aria-selected={method === 'reader'} className={method === 'reader' ? 'active' : ''} onClick={() => setMethod('reader')}>{text(locale, 'Sincronização 1DROP / Foto do chip', '1DROP Reader Sync / Chip Photo')}</button></div>
        {method === 'reader' && <div className="glucose-reader-panel"><p>{text(locale, 'Simulação de leitura direta do analisador microfluídico ou envio de uma foto do visor.', 'Simulates a direct microfluidic reader sync or display photo upload.')}</p><label className="glucose-upload-button">{text(locale, 'Selecionar foto do chip', 'Select chip photo')}<input type="file" accept="image/*" /></label></div>}
        <div className="glucose-context-label">{text(locale, 'Estado metabólico', 'Metabolic state')}</div><div className="glucose-choice-group" role="group" aria-label={text(locale, 'Estado metabólico', 'Metabolic state')}>{([
          ['fasting', 'Fasting (≥ 8h)'], ['post-meal', 'Post-Meal (2h)'], ['pre-eva', 'Pre-EVA Check'],
        ] as [GlucoseEntryContext, string][]).map(([option, label]) => <button key={option} type="button" aria-pressed={context === option} className={context === option ? 'active' : ''} onClick={() => setContext(option)}>{label}</button>)}</div>
      </section>
      <section className="glucose-result-section"><h3>{text(locale, 'NOTAS RÁPIDAS (OPCIONAL)', 'QUICK NOTES (OPTIONAL)')}</h3><div className="glucose-choice-group glucose-note-chips" role="group" aria-label={text(locale, 'Notas rápidas', 'Quick notes')}>{([
        ['hydrated', text(locale, 'Hidratado', 'Hydrated')], ['poor-sleep', text(locale, 'Sono ruim', 'Poor Sleep')], ['post-ared', 'Post-ARED'], ['mild-fatigue', text(locale, 'Fadiga leve', 'Mild Fatigue')],
      ] as [string, string][]).map(([option, label]) => <button key={option} type="button" aria-pressed={notes.includes(option)} className={notes.includes(option) ? 'active' : ''} onClick={() => setNotes(current => current.includes(option) ? current.filter(selected => selected !== option) : [...current, option])}>{label}</button>)}</div></section>
      <div className="glucose-result-actions"><button className="health-button" type="button" disabled={saving} onClick={onClose}>{text(locale, 'Cancelar', 'Cancel')}</button><button className="health-button primary" type="button" disabled={!classification || saving} onClick={() => classification && setSaving(true)}>{saving ? text(locale, 'Salvando…', 'Saving…') : text(locale, 'Salvar e atualizar telemetria', 'Save and update telemetry')}</button></div>
    </div>
  </Modal>;
}

type ReadinessSleepQuality = 'rested' | 'light' | 'unrefreshed';

function MorningCheckInModal({ onClose, onComplete, locale }: { onClose: () => void; onComplete: (score: number) => void; locale: Locale }) {
  const [wellBeing, setWellBeing] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [vigor, setVigor] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<ReadinessSleepQuality | null>(null);
  const [factors, setFactors] = useState<string[]>([]);
  const answered = wellBeing !== null && stress !== null && vigor !== null && sleepQuality !== null;
  const sleepScore = sleepQuality === 'rested' ? 10 : sleepQuality === 'light' ? 5 : 0;
  const composite = answered ? 1 + ((wellBeing! + (10 - stress!) + vigor! + sleepScore) / 4) * .4 : null;
  // V04 rule: only a decline below 80% of the personal baseline for 3 check-ins becomes an observation.
  const moodAssessment = composite === null ? null : assessVital('mood', { value: composite }, { baseline: DEMO_MOOD.baseline, history: DEMO_MOOD.history.map(value => ({ value })) });
  const moodFinding = moodAssessment?.findings[0];
  const belowPattern = composite !== null && composite < DEMO_MOOD.baseline * .8;
  const fatigueDrift = Boolean(moodFinding) || belowPattern;
  const previewText = moodFinding ? moodFinding.action[locale]
    : belowPattern ? text(locale, 'Abaixo do seu padrão pessoal hoje. Se persistir por 3 check-ins seguidos, vira observação. Considere cadenciar tarefas de alto foco.', 'Below your personal pattern today. If it persists for 3 check-ins in a row, it becomes an observation. Consider pacing high-focus tasks.')
    : text(locale, 'Dentro do seu padrão pessoal.', 'Within your personal pattern.');
  const scoreLabel = composite === null ? '—' : composite.toFixed(1);
  const factorsList: [string, string][] = [
    ['smooth-routine', text(locale, 'Rotina tranquila', 'Smooth Routine')],
    ['high-workload', text(locale, 'Alta carga de trabalho', 'High Workload')],
    ['sleep-disruption', text(locale, 'Sono interrompido', 'Sleep Disruption')],
    ['cabin-noise', text(locale, 'Ruído / temperatura da cabine', 'Cabin Noise / Temp')],
    ['missing-home', text(locale, 'Saudade de casa', 'Missing Home')],
  ];
  const ratingButtons = (value: number | null, setValue: (next: number) => void) => <div className="readiness-scale" role="group">{Array.from({ length: 11 }, (_, index) => <button key={index} type="button" aria-pressed={value === index} className={value === index ? 'active' : ''} onClick={() => setValue(index)}>{index}</button>)}</div>;
  return <Modal title={text(locale, 'CHECK-IN MATINAL', 'DAILY MORNING CHECK-IN')} onClose={onClose} className="readiness-modal">
    <div className="readiness-modal-body">
      <div className="readiness-modal-heading"><div><small>{text(locale, 'PRONTIDÃO DIÁRIA // PULSO CIRCADIANO', 'DAILY READINESS // CIRCADIAN PULSE CHECK')}</small><h2>{text(locale, 'Check-in matinal', 'Daily Morning Check-In')}</h2></div><span className="readiness-privacy"><Lock size={13}/>{text(locale, 'Somente baseline privado • ~15 s', 'Private Baseline Tracking Only • ~15 sec')}</span></div>
      <section className="readiness-question"><h3>Q1 · {text(locale, 'Bem-estar emocional', 'Emotional Well-Being')}</h3><p>{text(locale, 'Como você avaliaria seu bem-estar emocional geral agora?', 'How would you rate your overall emotional well-being right now?')}</p>{ratingButtons(wellBeing, setWellBeing)}<div className="readiness-anchors"><span>0: {text(locale, 'Muito baixo / esgotado', 'Very low / drained')}</span><span>5: {text(locale, 'Estável / neutro', 'Steady / neutral')}</span><span>10: {text(locale, 'Positivo / centrado', 'Positive / grounded')}</span></div></section>
      <section className="readiness-question"><h3>Q2 · {text(locale, 'Estresse percebido', 'Perceived Stress')}</h3><p>{text(locale, 'Quanto de tensão mental ou estresse você carrega hoje?', 'How much mental tension or stress are you carrying today?')}</p>{ratingButtons(stress, setStress)}<div className="readiness-anchors"><span>0: {text(locale, 'Completamente calmo', 'Completely calm')}</span><span>5: {text(locale, 'Pressão moderada', 'Moderate pressure')}</span><span>10: {text(locale, 'Sobrecarregado', 'Overwhelmed')}</span></div></section>
      <section className="readiness-question"><h3>Q3 · {text(locale, 'Vigor da missão', 'Mission Vigor')}</h3><p>{text(locale, 'Quão energizado e pronto você se sente para as tarefas da missão hoje?', 'How energized and ready do you feel for today’s mission tasks?')}</p>{ratingButtons(vigor, setVigor)}<div className="readiness-anchors"><span>0: {text(locale, 'Exausto', 'Exhausted')}</span><span>5: {text(locale, 'Funcional', 'Functional')}</span><span>10: {text(locale, 'Vigor máximo', 'Peak vigor')}</span></div></section>
      <section className="readiness-question"><h3>Q4 · {text(locale, 'Qualidade subjetiva do sono', 'Subjective Sleep Quality')}</h3><p>{text(locale, 'Independentemente das horas monitoradas, quão restaurador foi seu sono?', 'Regardless of the hours tracked, how restorative did your sleep feel?')}</p><div className="readiness-pill-group" role="group">{([
        ['rested', text(locale, 'Descansado', 'Rested')], ['light', text(locale, 'Leve / fragmentado', 'Light / Fragmented')], ['unrefreshed', text(locale, 'Não restaurador', 'Unrefreshed')],
      ] as [ReadinessSleepQuality, string][]).map(([option, label]) => <button key={option} type="button" aria-pressed={sleepQuality === option} className={sleepQuality === option ? 'active' : ''} onClick={() => setSleepQuality(option)}>{label}</button>)}</div></section>
      <section className="readiness-question"><h3>Q5 · {text(locale, 'Contexto opcional', 'Optional Context')}</h3><p>{text(locale, 'Algum fator principal influenciando como você se sente hoje?', 'Any primary factor influencing how you feel today?')} <span>({text(locale, 'Opcional', 'Optional')})</span></p><div className="readiness-context-chips" role="group">{factorsList.map(([option, label]) => <button key={option} type="button" aria-pressed={factors.includes(option)} className={factors.includes(option) ? 'active' : ''} onClick={() => setFactors(current => current.includes(option) ? current.filter(item => item !== option) : [...current, option])}>{label}</button>)}</div></section>
      <div className={`readiness-preview ${fatigueDrift ? 'warning' : 'nominal'}`}><div><small>{text(locale, 'COMPOSITE SCORE', 'COMPOSITE SCORE')}</small><strong>{scoreLabel}<span> / 5.0</span></strong></div><p>{previewText}</p></div>
      <div className="readiness-actions"><button className="health-button" type="button" onClick={onClose}>{text(locale, 'Cancelar', 'Cancel')}</button><button className="health-button primary" type="button" disabled={!answered} onClick={() => composite !== null && onComplete(composite)}>{text(locale, 'Concluir check-in', 'Complete Check-In')}</button></div>
    </div>
  </Modal>;
}

export function ExamLogs({ onAtlas, onHighlights, onIndicators, onData, onActivityHistory, theme, onToggleTheme, locale, onLocaleChange }: Props) {
  const [exam, setExam] = useState<GlucoseLog | null>(readGlucoseLog);
  const [openMenu, setOpenMenu] = useState(false);
  const english = locale === 'en';
  const undoExam = () => {
    setExam(null);
    setOpenMenu(false);
    try { localStorage.removeItem(GLUCOSE_LOG_KEY); } catch { /* Keep the visible log state updated. */ }
  };
  const noteLabels = (note: string) => ({ hydrated: text(locale, 'Hidratado', 'Hydrated'), 'poor-sleep': text(locale, 'Sono ruim', 'Poor Sleep'), 'post-ared': 'Post-ARED', 'mild-fatigue': text(locale, 'Fadiga leve', 'Mild Fatigue') }[note] ?? note);
  return <div className="health-shell" data-theme={theme}><HealthHeader activePage="exams" onHighlights={onHighlights} onAtlas={onAtlas} onIndicators={onIndicators} onData={onData} onExamLogs={() => {}} onActivityHistory={onActivityHistory} theme={theme} onToggleTheme={onToggleTheme} locale={locale} onLocaleChange={onLocaleChange} /><main className="health-main"><section className="activity-history-view"><div className="activity-history-heading"><div><small>{english ? 'BIOMETRIC RECORDS // EXAM LOG' : 'REGISTROS BIOMÉTRICOS // EXAMES'}</small><h1>{english ? 'Exam Logs' : 'Registros de exames'}</h1><p>{english ? 'Review recorded laboratory results and their collection details.' : 'Revise resultados laboratoriais registrados e seus detalhes de coleta.'}</p></div><span className="activity-history-count">{exam ? '1' : '0'} {english ? (exam ? 'entry' : 'entries') : (exam ? 'registro' : 'registros')}</span></div>{exam ? <div className="activity-history-list"><article className="activity-history-item completed"><div className="activity-history-status"><Check size={16}/></div><div className="activity-history-content"><div className="activity-history-meta"><small>{text(locale, GLUCOSE_CONTEXT_LABELS[glucoseLogContext(exam)].title.pt, GLUCOSE_CONTEXT_LABELS[glucoseLogContext(exam)].title.en).toUpperCase()}</small><small>2026-11-15 · {normalizeExamTime(exam.loggedAt)}</small></div><h2>{text(locale, GLUCOSE_CONTEXT_LABELS[glucoseLogContext(exam)].title.pt, GLUCOSE_CONTEXT_LABELS[glucoseLogContext(exam)].title.en)}</h2><p>{exam.value.toFixed(1)} mg/dL · {english ? 'Manual entry' : 'Entrada manual'} · <strong>{glucoseLogLabel(exam, locale)}</strong></p>{exam.notes && exam.notes.length > 0 && <div className="exam-log-notes">{exam.notes.map(note => <span key={note}>{noteLabels(note)}</span>)}</div>}</div><span className="activity-history-badge done">{english ? 'Recorded' : 'Registrado'}</span><div className="activity-history-menu"><button type="button" className="activity-history-menu-button" aria-label={english ? 'More options' : 'Mais opções'} aria-expanded={openMenu} onClick={() => setOpenMenu(open => !open)}><MoreVertical size={17}/></button>{openMenu && <div className="activity-history-menu-popover"><button type="button" onClick={undoExam}>{english ? 'Undo exam' : 'Desfazer exame'}</button></div>}</div></article></div> : <div className="activity-history-empty"><p>{english ? 'No exam results recorded yet.' : 'Nenhum resultado de exame registrado ainda.'}</p></div>}</section></main></div>;
}

export function ActivityHistory({ onAtlas, onHighlights, onIndicators, onData, onExamLogs, theme, onToggleTheme, locale, onLocaleChange }: Props) {
  const [hydrationCompleted, setHydrationCompleted] = useState(() => {
    try { return localStorage.getItem('pulse-health-hydration-completed') === 'true'; } catch { return false; }
  });
  const [readinessCompleted, setReadinessCompleted] = useState(() => {
    try { return localStorage.getItem('pulse-health-readiness-completed') === 'true'; } catch { return true; }
  });
  // Check-ins completed before the score was saved show the former demo score.
  const [checkInScore] = useState(readCheckInScore);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const english = locale === 'en';
  const activities = [
    ...(hydrationCompleted ? [{ id: 'hydration', title: text(locale, 'Protocolo de hidratação', 'Hydration Protocol'), category: text(locale, 'HIDRATAÇÃO', 'HYDRATION'), detail: text(locale, 'Solução eletrolítica consumida', 'Electrolyte solution consumed'), completionTime: '13:20:00', missionDate: '2026-11-15 · 13:20:00', completed: true }] : []),
    ...(readinessCompleted ? [{ id: 'readiness', title: text(locale, 'Check-in matinal', 'Daily Morning Check-In'), category: text(locale, 'PRONTIDÃO DIÁRIA', 'DAILY READINESS'), detail: `${text(locale, 'Score composto', 'Composite score')} ${(checkInScore ?? 4.2).toLocaleString(english ? 'en-US' : 'pt-BR', { minimumFractionDigits: 1 })} / ${english ? '5.0' : '5,0'}`, completionTime: '08:14:00', missionDate: '2026-11-15 · 08:14:00', completed: true }] : []),
    { id: 'ared', title: text(locale, 'Contramedida de resistência ARED', 'ARED Resistance Countermeasure'), category: text(locale, 'ROTINA', 'ROUTINE'), detail: text(locale, 'Ciclo de agachamento e levantamento terra com arnês · 45 min', 'Squat & deadlift harness cycle · 45 min'), completionTime: '06:30:00', missionDate: '2026-11-15 · 06:30:00', completed: true },
    { id: 'post-eva', title: text(locale, 'Verificação de mobilidade pós-EVA', 'Post-EVA Mobility Check'), category: text(locale, 'RECUPERAÇÃO', 'RECOVERY'), detail: text(locale, 'Janela de recuperação não registrada', 'Recovery window was not recorded'), completionTime: undefined, missionDate: '2026-11-15', completed: false },
  ];
  const undoActivity = (id: string) => {
    if (id === 'hydration') {
      setHydrationCompleted(false);
      try { localStorage.removeItem('pulse-health-hydration-completed'); } catch { /* Keep the visible history state updated. */ }
    } else if (id === 'readiness') {
      setReadinessCompleted(false);
      try {
        localStorage.removeItem('pulse-health-readiness-completed');
        localStorage.removeItem('pulse-health-readiness-completed-at');
      } catch { /* Keep the visible history state updated. */ }
      clearCheckInScore();
    }
    setOpenMenu(null);
  };
  return <div className="health-shell" data-theme={theme}><HealthHeader activePage="history" onHighlights={onHighlights} onAtlas={onAtlas} onIndicators={onIndicators} onData={onData} onExamLogs={onExamLogs} onActivityHistory={() => {}} theme={theme} onToggleTheme={onToggleTheme} locale={locale} onLocaleChange={onLocaleChange} /><main className="health-main"><section className="activity-history-view"><div className="activity-history-heading"><div><small>{english ? 'MISSION ACTIVITY // AUDIT TRAIL' : 'ATIVIDADE DA MISSÃO // HISTÓRICO'}</small><h1>{english ? 'Activity History' : 'Histórico de atividades'}</h1><p>{english ? 'Review activities that were completed or missed during their required mission windows.' : 'Revise atividades concluídas ou não realizadas durante suas janelas necessárias da missão.'}</p></div><span className="activity-history-count">{activities.length} {english ? 'entries' : 'registros'}</span></div><div className="activity-history-list">{activities.map(activity => <article key={activity.id} className={`activity-history-item ${activity.completed ? 'completed' : 'pending'}`}><div className="activity-history-status">{activity.completed ? <Check size={16}/> : <Clock3 size={16}/>}</div><div className="activity-history-content"><div className="activity-history-meta"><small>{activity.category}</small><small>{activity.missionDate}</small></div><h2>{activity.title}</h2><p>{activity.detail}</p></div><span className={`activity-history-badge ${activity.completed ? 'done' : ''}`}>{activity.completed ? text(locale, 'Concluído', 'Completed') : text(locale, 'Não concluído', 'Not completed')}</span><div className="activity-history-menu"><button type="button" className="activity-history-menu-button" aria-label={text(locale, 'Mais opções', 'More options')} aria-expanded={openMenu === activity.id} onClick={() => setOpenMenu(openMenu === activity.id ? null : activity.id)}><MoreVertical size={17}/></button>{openMenu === activity.id && <div className="activity-history-menu-popover"><button type="button" disabled={!['hydration', 'readiness'].includes(activity.id)} onClick={() => undoActivity(activity.id)}>{text(locale, 'Desfazer atividade', 'Undo activity')}</button></div>}</div></article>)}</div></section></main></div>;
}

export function HealthHighlights({ scenarioId = DEFAULT_SCENARIO_ID, onScenarioChange, onSleep, onBodyTemperature, onHeartRate, onBloodPressure, onBloodGlucose, onMood, onAtlas, onHighlights, onIndicators, onData, onExamLogs, onActivityHistory, theme, onToggleTheme, locale, onLocaleChange }: Props & { onSleep: () => void; onBodyTemperature: () => void; onHeartRate?: () => void; onBloodPressure?: () => void; onBloodGlucose?: () => void; onMood?: () => void; onExamLogs?: () => void; onActivityHistory?: () => void; scenarioId?: string; onScenarioChange?: (id: string) => void }) {
  const english = locale === 'en';
  const missionMode = useMissionMode();
  const latestSleep = latestSleepFor(scenarioId);
  // Vital scenarios (and missing sources) replace the cards with the scenario readings, as on the pages and the inspector.
  const vitals = scenarioVitals(scenarioId);
  const scenarioCards = vitals.vitalScenario || vitals.missing;
  const readings = scenarioReadings(vitals);
  // The correlation alert repeats the glucose and sleep values shown on the cards.
  const alertGlucose = scenarioCards && typeof readings.glucose.reading.value === 'number' ? readings.glucose.reading.value : BLOOD_GLUCOSE_LATEST;
  const scenarioTitle = localizeScenario(SCENARIOS.find(item => item.id === scenarioId) ?? SCENARIOS[0], locale).title;
  const missionLabel = missionMode === 'Lunar Base' ? text(locale, 'Base lunar', 'Lunar Base') : missionMode === 'Mars Transit' ? text(locale, 'Trânsito a Marte', 'Mars Transit') : 'ISS';
  const [activeAlert, setActiveAlert] = useState<'critical' | 'correlation' | null>(null);
  const [glucoseInstructions, setGlucoseInstructions] = useState(false);
  const [glucoseResult, setGlucoseResult] = useState(false);
  const [glucoseLog, setGlucoseLog] = useState<GlucoseLog | null>(readGlucoseLog);
  const glucoseLogged = glucoseLog !== null;
  const [readinessCheckIn, setReadinessCheckIn] = useState(false);
  const [checkInScore, setCheckInScore] = useState<number | null>(readCheckInScore);
  const moodInput = moodAssessInput(moodWeek(checkInScore));
  const moodState = assessVital('mood', moodInput.reading, moodInput.options).state;
  const [readinessCompletedAt, setReadinessCompletedAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem('pulse-health-readiness-completed') === 'true'
        ? localStorage.getItem('pulse-health-readiness-completed-at')
        : null;
    } catch { return null; }
  });
  const [readinessCompleting, setReadinessCompleting] = useState(false);
  const [hydrationCompleted, setHydrationCompleted] = useState(() => {
    try { return localStorage.getItem('pulse-health-hydration-completed') === 'true'; } catch { return false; }
  });
  const [hydrationCompleting, setHydrationCompleting] = useState(false);
  useEffect(() => {
    if (!hydrationCompleting) return;
    const timeout = window.setTimeout(() => setHydrationCompleted(true), 280);
    return () => window.clearTimeout(timeout);
  }, [hydrationCompleting]);
  useEffect(() => {
    if (!readinessCompleting) return;
    const timeout = window.setTimeout(() => setReadinessCompleting(false), 280);
    return () => window.clearTimeout(timeout);
  }, [readinessCompleting]);
  return <div className="health-shell" data-theme={theme}><HealthHeader activePage="highlights" onHighlights={onHighlights} onAtlas={onAtlas} onIndicators={onIndicators} onData={onData} onExamLogs={onExamLogs} onActivityHistory={onActivityHistory} theme={theme} onToggleTheme={onToggleTheme} locale={locale} onLocaleChange={onLocaleChange} /><main className="health-main">
    <section className="hl-story" aria-label={text(locale, 'Como interpretar esta visão', 'How to read this overview')}><div className="hl-story-heading"><small>{text(locale, 'JORNADA DA EVIDÊNCIA', 'EVIDENCE JOURNEY')}</small><h1>{text(locale, 'Do ambiente à resposta biológica', 'From environment to biological response')}</h1><p>{text(locale, 'O PulseHealth organiza camadas de contexto para exploração; não estabelece causa nem produz diagnóstico.', 'PulseHealth organizes contextual layers for exploration; it does not establish causality or provide a diagnosis.')}</p><label className="hl-scenario-select"><span>{text(locale, 'CENÁRIO DE DEMONSTRAÇÃO', 'DEMO SCENARIO')}</span><select aria-label={text(locale, 'Cenário de demonstração', 'Demonstration scenario')} value={scenarioId} onChange={event => onScenarioChange?.(event.target.value)}>{SCENARIOS.map(item => <option key={item.id} value={item.id}>{localizeScenario(item, locale).title}</option>)}</select></label></div><div className="hl-story-steps"><article><span>01</span><div><strong>{text(locale, 'Ambiente', 'Environment')}</strong><p>{text(locale, 'Missão selecionada: ', 'Selected mission: ')}{missionLabel}. {text(locale, 'Contexto da missão, não uma medição de exposição.', 'Mission context, not an exposure measurement.')}</p></div></article><article><span>02</span><div><strong>{text(locale, 'Exposição', 'Exposure')}</strong><p>{text(locale, 'Sinais ambientais e dosimetria aparecem com fonte, período e qualidade quando disponíveis.', 'Environmental signals and dosimetry are shown with source, period, and quality when available.')}</p></div></article><article><span>03</span><div><strong>{text(locale, 'Resposta biológica', 'Biological response')}</strong><p>{text(locale, 'Biomarcadores descrevem observações; dados ausentes e relações não calculadas ficam explícitos.', 'Biomarkers describe observations; missing data and uncalculated relationships are made explicit.')}</p></div></article></div></section>
    <div className="highlights-layout"><aside className="scanner-card"><div className="scanner-title">{text(locale, 'REFERÊNCIA ANATÔMICA · NÃO É MAPA DE CALOR', 'ANATOMICAL REFERENCE · NOT A HEAT MAP')}</div><div className="scanner-inner"><AtlasViewer className="atlas-preview" selectedId={null} onSelect={() => {}} /></div><p className="hl-atlas-note">{text(locale, 'O atlas mostra estruturas anatômicas de referência. Cores e posição não representam localização de dose ou temperatura por órgão.', 'The atlas shows reference anatomy. Colors and position do not represent organ-level dose or temperature.')}</p><button className="health-button" onClick={onAtlas}>⛶ &nbsp; {text(locale, 'Abrir atlas detalhado', 'Open detailed atlas')}</button></aside>
    <div className="highlights-content"><div className="telemetry-heading"><h2>{text(locale, 'Telemetria principal', 'Core Telemetry')}</h2><button className="health-button" onClick={onIndicators}>{english ? 'View all biomarkers' : 'Ver todos os biomarcadores'} <ChevronRight size={14}/></button></div><section className="highlights-metrics" aria-label={text(locale, 'Indicadores de exemplo', 'Example indicators')}>
      {scenarioCards ? <>
        <ScenarioCard icon={<HeartPulse size={16}/>} name={text(locale, 'Frequência cardíaca', 'Heart rate')} input={readings.heartRate} vitalId="heart-rate" unit={text(locale, 'bpm · repouso', 'bpm · resting')} scenarioTitle={scenarioTitle} locale={locale} onClick={onHeartRate}/>
        <ScenarioCard icon={<Droplets size={16}/>} name={text(locale, 'Glicemia', 'Blood glucose')} input={readings.glucose} vitalId="blood-glucose" unit={vitals.glucose.source === 'cgm' ? 'mg/dL · CGM' : text(locale, 'mg/dL · jejum', 'mg/dL · fasting')} scenarioTitle={scenarioTitle} locale={locale} onClick={onBloodGlucose}/>
        <ScenarioCard icon={<Moon size={16}/>} name={text(locale, 'Sono total', 'Total sleep')} input={readings.sleep ?? { reading: { value: vitals.missing ? null : latestSleep }, options: { history: sleepWeekFor(scenarioId).slice(0, -1).map(day => ({ value: total(day) })) } }} vitalId="sleep-hours" unit={text(locale, 'h · Sol 142', 'h · Sol 142')} decimals={1} scenarioTitle={scenarioTitle} locale={locale} onClick={onSleep}/>
        <ScenarioCard icon={<HeartPulse size={16}/>} name={text(locale, 'Pressão arterial', 'Blood pressure')} input={readings.bloodPressure} vitalId="blood-pressure" unit="mmHg" scenarioTitle={scenarioTitle} locale={locale} onClick={onBloodPressure}/>
        <ScenarioCard icon={<Thermometer size={16}/>} name={text(locale, 'Temperatura corporal', 'Body temperature')} input={{ reading: { value: vitals.missing ? null : latestTemperature, context: { activity: 'rest', missionDay: 42 } }, options: { baseline: 36.9 } }} vitalId="core-temperature" unit="°C" decimals={2} scenarioTitle={scenarioTitle} locale={locale} onClick={onBodyTemperature}/>
        <ScenarioCard icon={<Sparkles size={16}/>} name={text(locale, 'Prontidão e humor', 'Readiness & mood')} input={readings.mood} vitalId="mood" unit="/ 5 · check-in" decimals={1} scenarioTitle={scenarioTitle} locale={locale} onClick={onMood}/>
      </> : <>
      <HighlightCard icon={<HeartPulse size={16}/>} status={text(locale, 'Dado simulado', 'Simulated value')} statusTone="info" name={text(locale, 'Frequência cardíaca', 'Heart rate')} value={String(HEART_RATE_LATEST)} unit={text(locale, 'bpm · repouso', 'bpm · resting')} detail={text(locale, 'Repouso ao acordar · série de demonstração.', 'Resting, on waking · demonstration series.')} context={text(locale, 'Série sintética · sem wearable conectado', 'Synthetic series · no wearable connected')} onClick={onHeartRate}/>
      {glucoseLog
        // The last logged result replaces the demo series value, with its own context and classification.
        ? <HighlightCard icon={<Droplets size={16}/>} status={text(locale, 'Registrado', 'Logged')} statusTone={assessGlucoseLog(glucoseLog).state === 'normal' ? 'info' : 'warning'} name={text(locale, 'Glicemia', 'Blood glucose')} value={String(Math.round(glucoseLog.value))} unit={`mg/dL · ${text(locale, GLUCOSE_CONTEXT_LABELS[glucoseLogContext(glucoseLog)].short.pt, GLUCOSE_CONTEXT_LABELS[glucoseLogContext(glucoseLog)].short.en)}`} detail={`${glucoseLogLabel(glucoseLog, locale)} · ${text(locale, 'último registro', 'latest log')}.`} context={text(locale, 'Entrada manual · ver Registros de exames', 'Manual entry · see Exam Logs')} onClick={onBloodGlucose}/>
        : <HighlightCard icon={<Droplets size={16}/>} status={text(locale, 'Dado simulado', 'Simulated value')} statusTone="info" name={text(locale, 'Glicemia', 'Blood glucose')} value={String(BLOOD_GLUCOSE_LATEST)} unit={text(locale, 'mg/dL · jejum', 'mg/dL · fasting')} detail={text(locale, 'Jejum matinal · série de demonstração.', 'Morning fasting · demonstration series.')} context={text(locale, 'Série sintética · sem exame ou sensor conectado', 'Synthetic series · no exam or sensor connected')} onClick={onBloodGlucose}/>}
      <HighlightCard icon={<Moon size={16}/>} status={text(locale, 'Dado simulado', 'Simulated value')} statusTone="info" name={text(locale, 'Sono total', 'Total sleep')} value={h(latestSleep, locale)} unit={text(locale, 'h · meta 8 h', 'h · 8 h target')} detail={text(locale, 'Duração total · Sol 142 · série de demonstração.', 'Total duration · Sol 142 · demonstration series.')} context={text(locale, 'Não indica estágio REM; consulte a série de sono.', 'Does not indicate REM stage; see the sleep series.')} onClick={onSleep}/>
      <HighlightCard icon={<HeartPulse size={16}/>} status={text(locale, 'Dado simulado', 'Simulated value')} statusTone="info" name={text(locale, 'Pressão arterial', 'Blood pressure')} value={`${BLOOD_PRESSURE_LATEST.systolic}/${BLOOD_PRESSURE_LATEST.diastolic}`} unit="mmHg" detail={text(locale, 'Leitura matinal · série de demonstração.', 'Morning reading · demonstration series.')} context={text(locale, 'Série sintética · sem exame ou sensor conectado', 'Synthetic series · no exam or sensor connected')} onClick={onBloodPressure}/>
      <HighlightCard icon={<Thermometer size={16}/>} status={text(locale, 'Dado simulado', 'Simulated value')} statusTone="info" name={text(locale, 'Temperatura corporal', 'Body temperature')} value={formatTemperature(latestTemperature, locale)} unit="°C" detail={text(locale, 'Última leitura · série de 24 h.', 'Latest reading · 24-hour series.')} context={text(locale, 'Série sintética · sem sensor conectado', 'Synthetic series · no sensor connected')} onClick={onBodyTemperature}/>
      {checkInScore !== null
        // Today's check-in replaces the demo value and is classified against the personal pattern.
        ? <HighlightCard icon={<Sparkles size={16}/>} status={text(locale, 'Registrado', 'Logged')} statusTone={moodState === 'normal' ? 'info' : 'warning'} name={text(locale, 'Prontidão e humor', 'Readiness & mood')} value={checkInScore.toLocaleString(english ? 'en-US' : 'pt-BR', { minimumFractionDigits: 1 })} unit={text(locale, '/ 5 · check-in', '/ 5 · check-in')} detail={text(locale, 'Check-in de hoje · comparado ao padrão pessoal.', 'Today’s check-in · compared with personal pattern.')} context={text(locale, 'Autorrelato · ver Histórico de atividades', 'Self-report · see Activity History')} onClick={onMood}/>
        : <HighlightCard icon={<Sparkles size={16}/>} status={text(locale, 'Dado simulado', 'Simulated value')} statusTone="info" name={text(locale, 'Prontidão e humor', 'Readiness & mood')} value={MOOD_LATEST.toLocaleString(english ? 'en-US' : 'pt-BR', { minimumFractionDigits: 1 })} unit={text(locale, '/ 5 · check-in', '/ 5 · check-in')} detail={text(locale, 'Composto do check-in matinal · série de demonstração.', 'Morning check-in composite · demonstration series.')} context={text(locale, 'Série sintética · comparada só ao padrão pessoal', 'Synthetic series · compared only with personal pattern')} onClick={onMood}/>}
      </>}
    </section>
    <h2>{text(locale, 'Plano de atividade demonstrativo', 'Demonstration activity plan')}</h2><p className="hl-section-note">{text(locale, 'Ações simuladas nesta interface; nenhuma instrução é enviada à tripulação ou a sistemas da missão.', 'Actions are simulated in this interface; no instruction is sent to crew or mission systems.')}</p><div className="hl-plan">{(!readinessCompletedAt || readinessCompleting) && <article className={readinessCompleting ? 'hydration-completing' : ''}><small><span>{text(locale, 'PRONTIDÃO DIÁRIA', 'DAILY READINESS')}</span></small><h3>{text(locale, 'Check-in matinal', 'Daily Morning Check-In')}</h3><p>{text(locale, 'Registre sua prontidão psicológica e o ritmo circadiano antes das tarefas de voo.', 'Brief self-report of psychological readiness and circadian rhythm before flight tasks.')}</p><button className="health-button accent" type="button" disabled={readinessCompleting} onClick={() => setReadinessCheckIn(true)}>{text(locale, 'Iniciar check-in', 'Start Check-In')}</button></article>}{!glucoseLogged && <article><small><span>{text(locale, 'EXAME DE LABORATÓRIO', 'LAB EXAM')}</span><button className="plan-instructions" type="button" onClick={() => setGlucoseInstructions(true)}><CircleHelp size={11} aria-hidden="true" />{text(locale, 'Ler instruções', 'Read instructions')}</button></small><h3>{text(locale, 'Registrar glicemia em jejum', 'Log Fasting Blood Glucose')}</h3><p>{text(locale, 'Registre a leitura capilar para acompanhar o estresse metabólico.', 'Fingerstick reading on the onboard analyzer to track metabolic stress.')}</p><button className="health-button accent" type="button" onClick={() => setGlucoseResult(true)}>{text(locale, 'Registrar resultado do exame', 'Log Exam Result')}</button></article>}{!hydrationCompleted && <article className={hydrationCompleting ? 'hydration-completing' : ''}><small>{text(locale, 'HIDRATAÇÃO', 'HYDRATION')}</small><h3>{text(locale, 'Protocolo de hidratação', 'Hydration Protocol')}</h3><p>{text(locale, 'Consuma 750 ml de solução eletrolítica (pacote B-2) antes da despressurização do airlock.', 'Drink 750 ml of electrolyte solution (Pack B-2) before airlock depressurization.')}</p><button className="health-button accent" type="button" disabled={hydrationCompleting} onClick={() => { setHydrationCompleting(true); try { localStorage.setItem('pulse-health-hydration-completed', 'true'); } catch { /* Keep completion in this session. */ } }}>{text(locale, 'Marcar como concluído', 'Mark as Done')}</button></article>}</div>
    <h2>{text(locale, 'Alertas', 'Alerts')}</h2><div className="hl-alerts">
      {/* The independent emergency example is hidden while a scenario shows its own readings. */}
      {!scenarioCards && <article className="hl-alert hl-alert-critical"><div className="hl-alert-heading"><span className="hl-alert-icon"><AlertTriangle size={17}/></span><strong>{text(locale, 'CENÁRIO DE EMERGÊNCIA SIMULADO · SEM CONEXÃO OPERACIONAL', 'SIMULATED EMERGENCY SCENARIO · NO OPERATIONAL CONNECTION')}</strong><span className="hl-alert-status">{text(locale, 'DEMO · CRÍTICO', 'DEMO · CRITICAL')}</span></div><p>{text(locale, 'Exemplo independente do perfil selecionado: glicemia 48 mg/dL e pressão arterial 82/50 mmHg. Ilustra como um evento de alta prioridade poderia ser apresentado; não é telemetria real nem diagnóstico.', 'Independent example, not the selected crew profile: glucose 48 mg/dL and blood pressure 82/50 mmHg. It illustrates how a high-priority event could be presented; it is not live telemetry or a diagnosis.')}</p><div className="hl-alert-footer"><span>● {text(locale, 'Nenhum alerta foi enviado · nenhuma equipe foi notificada', 'No alert was transmitted · no team was notified')}</span><button className="health-button" type="button" onClick={() => setActiveAlert('critical')}>{text(locale, 'Ver fluxo de resposta simulado', 'View simulated response flow')}</button></div></article>}
      <article className="hl-alert hl-alert-warning"><div className="hl-alert-heading"><span className="hl-alert-icon"><AlertTriangle size={17}/></span><strong>{text(locale, 'CORRELAÇÃO INDISPONÍVEL · EVIDÊNCIA INSUFICIENTE', 'CORRELATION UNAVAILABLE · INSUFFICIENT EVIDENCE')}</strong><span className="hl-alert-status">{text(locale, 'SEM ESTIMATIVA', 'NOT ESTIMATED')}</span></div><p>{text(locale, `Não há pares de glicemia, sono e exposição da mesma pessoa e período para estimar uma relação válida. Os valores ilustrativos (${alertGlucose} mg/dL e ${h(latestSleep, locale)} h) não representam associação calculada.`, `There are no glucose, sleep, and exposure observations paired for the same person and period to estimate a valid relationship. The illustrative values (${alertGlucose} mg/dL and ${h(latestSleep, locale)} h) are not a calculated association.`)}</p><div className="hl-alert-footer"><span className="hl-alert-validation">◉ {text(locale, 'Cenário sintético · sem inferência causal ou validação clínica', 'Synthetic scenario · no causal inference or clinical validation')}</span><button className="health-button" type="button" onClick={() => setActiveAlert('correlation')}>{text(locale, 'Ver evidências e limites', 'Review evidence and limits')}</button></div></article>
    </div>
    <h2>{text(locale, 'Agenda de exemplo', 'Example schedule')}</h2><p className="hl-section-note">{text(locale, 'Horários ilustrativos; nenhum exercício ou contato médico foi agendado.', 'Illustrative times; no exercise or medical contact has been scheduled.')}</p><div className="hl-schedule"><article><div className="hl-schedule-meta"><small>{text(locale, 'DEMO · ROTINA', 'DEMO · ROUTINE')}</small><span>2026-11-16 · 09:00</span></div><h3>{text(locale, 'Exemplo: exercício de resistência', 'Example: resistance exercise')}</h3><p>{text(locale, 'Atividade ilustrativa de 45 min. Não é prescrição nem plano real de exercício.', 'Illustrative 45-minute activity. This is not a prescription or a real exercise plan.')}</p></article><article><div className="hl-schedule-meta"><small>{text(locale, 'DEMO · CONTATO', 'DEMO · CONTACT')}</small><span>2026-11-16 · 14:30</span></div><h3>{text(locale, 'Exemplo: revisão médica em solo', 'Example: ground medical review')}</h3><p>{text(locale, 'Janela ilustrativa de comunicação; nenhum contato ou consulta foi iniciado.', 'Illustrative communication window; no contact or consultation was initiated.')}</p></article></div>
    </div></div></main>{glucoseInstructions && <FastingGlucoseInstructionsModal locale={locale} onClose={() => setGlucoseInstructions(false)} onLogResult={() => { setGlucoseInstructions(false); setGlucoseResult(true); }} />}{glucoseResult && <LogGlucoseResultModal locale={locale} onClose={() => setGlucoseResult(false)} onSave={(value, notes, context) => { const log: GlucoseLog = { value, loggedAt: utcTime(), notes, context }; setGlucoseLog(log); try { localStorage.setItem(GLUCOSE_LOG_KEY, JSON.stringify(log)); } catch { /* Keep the completion visible in this session. */ } setGlucoseResult(false); }} />}{readinessCheckIn && <MorningCheckInModal locale={locale} onClose={() => setReadinessCheckIn(false)} onComplete={score => { const completedAt = new Date().toLocaleTimeString(locale === 'en' ? 'en-US' : 'pt-BR', { hour: '2-digit', minute: '2-digit' }); const rounded = Math.round(score * 10) / 10; setCheckInScore(rounded); saveCheckInScore(rounded); setReadinessCompletedAt(completedAt); setReadinessCompleting(true); try { localStorage.setItem('pulse-health-readiness-completed', 'true'); localStorage.setItem('pulse-health-readiness-completed-at', completedAt); } catch { /* Keep completion in this session. */ } setReadinessCheckIn(false); }} />}{activeAlert && <HealthAlertModal alert={activeAlert} locale={locale} theme={theme} sleepHours={latestSleep} glucose={alertGlucose} onClose={() => setActiveAlert(null)} onIndicators={() => { setActiveAlert(null); onIndicators(); }} onSleep={() => { setActiveAlert(null); onSleep(); }} onData={() => { setActiveAlert(null); onData(); }} />}</div>;
}

function HealthAlertModal({ alert, locale, theme, onClose, onIndicators, onSleep, onData, sleepHours = latestSleepFor(DEFAULT_SCENARIO_ID), glucose = BLOOD_GLUCOSE_LATEST }: { alert: 'critical' | 'correlation'; locale: Locale; theme: 'dark' | 'light'; onClose: () => void; onIndicators: () => void; onSleep: () => void; onData: () => void; sleepHours?: number; glucose?: number }) {
  const critical = alert === 'critical';
  const title = critical
    ? text(locale, 'FLUXO DE RESPOSTA · ALERTA DEMONSTRATIVO', 'RESPONSE WORKFLOW · DEMONSTRATION ALERT')
    : text(locale, 'REVISÃO DE INDICADORES · CONTEXTO E EVIDÊNCIA', 'CROSS-METRIC REVIEW · CONTEXT AND EVIDENCE');
  return <Modal title={title} onClose={onClose} className={`health-alert-modal ${theme === 'light' ? 'health-alert-light' : ''}`}>
    <div className={`health-alert-detail ${critical ? 'critical' : 'correlation'}`}>
      <div className="health-alert-demo"><AlertTriangle size={15}/><span>{text(locale, 'CENÁRIO SINTÉTICO · NÃO É TELEMETRIA EM TEMPO REAL', 'SYNTHETIC SCENARIO · NOT LIVE TELEMETRY')}</span></div>
      {critical ? <>
        <p className="health-alert-lead">{text(locale, 'Este cenário sintético é independente do perfil selecionado. Ele demonstra como dois sinais poderiam ser encaminhados para revisão humana; não representa uma ocorrência real.', 'This synthetic scenario is separate from the selected profile. It demonstrates how two signals could be routed for human review; it is not a real event.')}</p>
        <div className="health-alert-values"><div><small>{text(locale, 'GLICEMIA · EXEMPLO', 'GLUCOSE · DEMO VALUE')}</small><strong>48 mg/dL</strong></div><div><small>{text(locale, 'PRESSÃO ARTERIAL · EXEMPLO', 'BLOOD PRESSURE · DEMO VALUE')}</small><strong>82/50 mmHg</strong></div></div>
        <section><h3>{text(locale, 'Fluxo de revisão sugerido', 'Suggested review workflow')}</h3><ol>
          <li>{text(locale, 'Confirme a qualidade, o horário e o contexto de cada leitura conforme o procedimento aprovado da missão.', 'Confirm each reading’s quality, timestamp, and context under the approved mission procedure.')}</li>
          <li>{text(locale, 'Uma pessoa qualificada avalia os sintomas e a segurança imediata da tripulação.', 'A qualified person assesses symptoms and the crew member’s immediate safety.')}</li>
          <li>{text(locale, 'Encaminhe a revisão ao profissional médico da missão pelos canais oficiais e siga o protocolo vigente.', 'Refer the review to the mission medical professional through official channels and follow the current protocol.')}</li>
          <li>{text(locale, 'Registre a decisão e as observações seguintes de acordo com as regras de privacidade e documentação da missão.', 'Record the decision and follow-up observations according to mission privacy and documentation rules.')}</li>
        </ol></section>
        <p className="health-alert-caveat">{text(locale, 'Nenhum alerta foi transmitido e nenhuma equipe foi notificada. O protótipo não verifica sintomas, não prescreve conduta e não substitui o protocolo médico da missão.', 'No alert was transmitted and no team was notified. This prototype does not assess symptoms, prescribe care, or replace the mission medical protocol.')}</p>
        <div className="health-alert-actions"><button className="health-button" onClick={onClose}>{text(locale, 'Fechar', 'Close')}</button><button className="health-button accent" onClick={onIndicators}>{text(locale, 'Abrir indicadores', 'Open indicators')} <ChevronRight size={14}/></button></div>
      </> : <>
        <p className="health-alert-lead">{text(locale, 'O cartão apresenta valores ilustrativos para mostrar como sinais diferentes podem ser revisados lado a lado.', 'This card shows illustrative values to demonstrate how different signals can be reviewed side by side.')}</p>
        <div className="health-alert-values"><div><small>{text(locale, 'GLICEMIA · EXEMPLO', 'GLUCOSE · DEMO VALUE')}</small><strong>{glucose} mg/dL</strong></div><div><small>{text(locale, 'SONO TOTAL · EXEMPLO', 'TOTAL SLEEP · DEMO VALUE')}</small><strong>{h(sleepHours, locale)} h</strong><span>{text(locale, 'referência exibida: 8 h', 'displayed reference: 8 h')}</span></div></div>
        <section><h3>{text(locale, 'O que os dados permitem concluir', 'What these data support')}</h3><ul>
          <li>{text(locale, 'Os valores pertencem a uma demonstração; não são medições sincronizadas da mesma pessoa ou missão.', 'The values are from a demo; they are not synchronized measurements from the same person or mission.')}</li>
          <li>{text(locale, 'Não há pares observacionais alinhados nem contexto suficiente para calcular uma correlação.', 'There are no aligned observational pairs or enough context to calculate a correlation.')}</li>
          <li>{text(locale, 'A aplicação não infere alteração de cortisol, efeito metabólico da microgravidade ou causalidade.', 'The app does not infer cortisol changes, metabolic effects of microgravity, or causality.')}</li>
        </ul></section>
        <section><h3>{text(locale, 'Próximos passos de análise', 'Next analysis steps')}</h3><p>{text(locale, 'Revise a série de sono e sua referência. Para uma análise integrada, seriam necessários dados da mesma missão com baseline individual, timestamps compatíveis, método de coleta e tratamento explícito de ausências e fatores de confusão.', 'Review the sleep series and its reference. Integrated analysis would require data from the same mission, with an individual baseline, compatible timestamps, collection method, and explicit handling of missing values and confounders.')}</p></section>
        <p className="health-alert-caveat">{text(locale, 'As referências científicas podem contextualizar os indicadores, mas não validam esta combinação demonstrativa nem um alerta clínico.', 'Scientific references may provide context for individual indicators; they do not validate this demo pairing or a clinical alert.')}</p>
        <div className="health-alert-actions"><button className="health-button" onClick={onData}>{text(locale, 'Sobre os dados', 'About the data')}</button><button className="health-button accent" onClick={onSleep}>{text(locale, 'Revisar horas de sono', 'Review sleep hours')} <ChevronRight size={14}/></button></div>
      </>}
    </div>
  </Modal>;
}

function CalibrationModal({ onClose, theme, locale }: { onClose: () => void; theme: 'dark' | 'light'; locale: Locale }) {
  const [wrist, setWrist] = useState<'non-dominant' | 'dominant'>('non-dominant');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    if (remaining === null || remaining <= 0) return;
    const timer = window.setTimeout(() => { if (remaining === 1) { setRemaining(null); setComplete(true); } else setRemaining(remaining - 1); }, 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);
  const en = locale === 'en';
  return <Modal title={en ? 'CALIBRATE ACTIWATCH' : 'CALIBRAR ACTIWATCH'} onClose={onClose} className={`calibration-modal ${theme === 'light' ? 'calibration-light' : ''}`}><div className="calibration-body"><div className="calibration-subtitle">{text(locale, 'SIMULAÇÃO DE CONFIGURAÇÃO // SEM DISPOSITIVO CONECTADO', 'SETUP SIMULATION // NO DEVICE CONNECTED')}</div><div className="calibration-intro"><strong><Activity size={14}/> {text(locale, 'ACTIGRAFIA DE PULSO', 'WRIST ACTIGRAPHY')}</strong><p>{text(locale, 'O sensor registra movimento para estimar períodos de repouso e atividade. O procedimento abaixo é uma demonstração da interface.', 'The sensor records movement to estimate rest and activity periods. This procedure demonstrates the interface only.')}</p></div><section><h3>{text(locale, 'ETAPA 1 · POSICIONAMENTO', 'STEP 1 · PLACEMENT')}</h3><p>{text(locale, 'Consulte o protocolo da missão e as instruções do fabricante para posicionar e ajustar o dispositivo.', 'Follow the mission protocol and manufacturer instructions to position and adjust the device.')}</p><div className="calibration-choice"><span>{text(locale, 'Pulso:', 'Wrist:')}</span><button aria-pressed={wrist === 'non-dominant'} onClick={() => setWrist('non-dominant')}>{text(locale, 'Não dominante', 'Non-dominant')}</button><button aria-pressed={wrist === 'dominant'} onClick={() => setWrist('dominant')}>{text(locale, 'Dominante', 'Dominant')}</button></div></section><section><h3>{text(locale, 'ETAPA 2 · PREPARAÇÃO', 'STEP 2 · PREPARATION')} <span>{complete ? text(locale, 'DEMONSTRAÇÃO CONCLUÍDA', 'DEMO COMPLETE') : remaining !== null ? `${text(locale, 'AGUARDE', 'WAIT')} ${remaining}s` : text(locale, 'AGUARDANDO', 'WAITING')}</span></h3><p>{text(locale, 'Inicie a contagem para visualizar o fluxo de calibração. Nenhum comando será enviado a um sensor.', 'Start the countdown to preview the calibration flow. No command will be sent to a sensor.')}</p><div className="calibration-stats"><div><small>{text(locale, 'LUZ AMBIENTE', 'AMBIENT LIGHT')}</small><strong>—</strong><span>{text(locale, 'Sem sensor', 'No sensor')}</span></div><div><small>{text(locale, 'MOVIMENTO', 'MOVEMENT')}</small><strong>—</strong><span>{text(locale, 'Sem sensor', 'No sensor')}</span></div></div><div className="calibration-sync">{text(locale, 'DIÁRIO DE SONO', 'SLEEP DIARY')} <strong>{text(locale, 'Sem sincronização', 'Not synced')}</strong></div></section><div className="calibration-actions"><button className="health-button" onClick={onClose}>{text(locale, 'Cancelar / fechar', 'Cancel / close')}</button><button className="health-button primary" disabled={remaining !== null} onClick={() => { setComplete(false); setRemaining(5); }}>{remaining !== null ? `${text(locale, 'Simulando', 'Simulating')} (${remaining}s)` : complete ? text(locale, 'Simular novamente', 'Simulate again') : `▶ ${text(locale, 'Simular calibração (5s)', 'Simulate calibration (5s)')}`}</button></div><p className="calibration-footnote">{text(locale, 'Nenhuma calibração real, leitura ou transferência de dados é realizada.', 'No real calibration, reading, or data transfer is performed.')}</p></div></Modal>;
}

export function SleepDashboard({ scenarioId = DEFAULT_SCENARIO_ID, onBack, onAtlas, onHighlights, onIndicators, onData, theme, onToggleTheme, locale, onLocaleChange }: Props & { onBack: () => void; scenarioId?: string }) {
  const week = sleepWeekFor(scenarioId);
  const latestSleep = total(week[week.length - 1]);
  const sleepMissing = scenarioVitals(scenarioId).missing;
  const [period, setPeriod] = useState<'week' | 'day'>('week');
  const [selected, setSelected] = useState<SleepDay | null>(null);
  const [calibration, setCalibration] = useState(false);
  const data = period === 'week' ? week : week.slice(-1);
  const average = data.reduce((sum, day) => sum + total(day), 0) / data.length;
  const dayLabel = (day: SleepDay) => text(locale, day.day, ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'][day.sol - 136] ?? day.day);
  return <div className="health-shell" data-theme={theme}><HealthHeader activePage="sleep" onHighlights={onHighlights} onAtlas={onAtlas} onIndicators={onIndicators} onData={onData} theme={theme} onToggleTheme={onToggleTheme} locale={locale} onLocaleChange={onLocaleChange}/><main className="health-main sleep-main"><section className="sleep-heading health-panel"><div><button className="sleep-back" onClick={onBack}><ArrowLeft size={13}/> {locale === 'en' ? 'BACK TO OVERVIEW' : 'VOLTAR À VISÃO GERAL'}</button><h1>{text(locale, 'Horas de sono', 'Sleep Hours')} <span className="health-chip green">● {locale === 'en' ? 'SIMULATED DATA' : 'DADOS SIMULADOS'}</span></h1></div></section>
  <section className="sleep-dashboard health-panel"><div className="sleep-tabs" role="group" aria-label={text(locale, 'Período do sono', 'Sleep period')}><button className={period === 'day' ? 'active' : ''} aria-pressed={period === 'day'} onClick={() => { setPeriod('day'); setSelected(null); }}>{text(locale, 'Sol (dia)', 'Sol (day)')}</button><button className={period === 'week' ? 'active' : ''} aria-pressed={period === 'week'} onClick={() => { setPeriod('week'); setSelected(null); }}>{text(locale, 'Semana (Sol 136–142)', 'Week (Sol 136–142)')}</button><span>{text(locale, 'Histórico adicional indisponível', 'Additional history unavailable')}</span><small>● {text(locale, 'REFERÊNCIA: 8,0 h / NOITE', 'REFERENCE: 8.0 h / NIGHT')}</small></div>
  <div className="sleep-summary"><div><div className="sleep-eyebrow">■ {text(locale, 'MÉDIA DE SONO', 'AVERAGE SLEEP')} ({period === 'week' ? 'SOL 136 – 142' : 'SOL 142'})</div><div className="sleep-total"><strong>{h(average, locale)}</strong><span>{text(locale, 'h / sol', 'h / sol')}</span></div><div className="sleep-reference">{text(locale, 'Diferença da referência de 8 h:', 'Difference from the 8 h reference:')} {h(average - 8, locale)} h</div><p>{text(locale, 'Série de demonstração · não corresponde a uma medição de tripulante.', 'Demonstration series · not a crew member measurement.')}</p></div><div className="sleep-stats"><div><small>{text(locale, 'SONO PROFUNDO', 'DEEP SLEEP')}</small><strong>{h(data.reduce((sum, d) => sum + d.deep, 0) / data.length, locale)}h</strong><span>{text(locale, 'exemplo', 'example')}</span></div><div><small>REM</small><strong>{h(data.reduce((sum, d) => sum + d.rem, 0) / data.length, locale)}h</strong><span>{text(locale, 'exemplo', 'example')}</span></div><div><small>{text(locale, 'EFICIÊNCIA', 'EFFICIENCY')}</small><strong>—</strong><span>{text(locale, 'sem coleta', 'not collected')}</span></div><div><small>{text(locale, 'LATÊNCIA', 'LATENCY')}</small><strong>—</strong><span>{text(locale, 'sem coleta', 'not collected')}</span></div></div></div>
  <div className="sleep-chart" aria-label={text(locale, 'Gráfico de duração diária do sono', 'Daily sleep duration chart')}><div className="sleep-chart-legend"><span><i className="light"/> {text(locale, 'Sono leve', 'Light sleep')}</span><span><i className="deep"/> {text(locale, 'Sono profundo', 'Deep sleep')}</span><span><i className="rem"/> REM</span><span className="legend-target">╌╌ {text(locale, 'Referência (8 h)', 'Reference (8 h)')}</span></div><div className="sleep-chart-body"><div className="sleep-axis">{[10,8,6,4,2,0].map(n => <span key={n}>{locale === 'en' ? `${n}.0h` : `${n},0h`}</span>)}</div><div className="sleep-plot"><div className="sleep-grid">{[10,8,6,4,2,0].map(n => <div key={n} className={n === 8 ? 'target' : ''}>{n === 8 && <span>{text(locale, 'REFERÊNCIA', 'REFERENCE')} · 8h</span>}</div>)}</div><div className="sleep-bars">{data.map(d => <button key={d.sol} className="sleep-bar-group" onClick={() => setSelected(d)} aria-label={`${dayLabel(d)}, sol ${d.sol}: ${h(total(d), locale)} ${text(locale, 'horas', 'hours')}`} aria-pressed={selected?.sol === d.sol}><span className="sleep-bar-value">{h(total(d), locale)}h</span><span className="sleep-bar-stack" style={{ height: `${total(d) * 10}%` }}><i className="deep" style={{ height: `${d.deep / total(d) * 100}%` }}/><i className="light" style={{ height: `${d.light / total(d) * 100}%` }}/><i className="rem" style={{ height: `${d.rem / total(d) * 100}%` }}/></span><span className="sleep-bar-label">{dayLabel(d)}<small>Sol {d.sol}</small></span></button>)}</div></div></div>{selected && <div className="sleep-chart-selected" role="status">Sol {selected.sol} · {text(locale, 'Total', 'Total')} {h(total(selected), locale)} h · {text(locale, 'Leve', 'Light')} {h(selected.light, locale)} h · {text(locale, 'Profundo', 'Deep')} {h(selected.deep, locale)} h · REM {h(selected.rem, locale)} h <button onClick={() => setSelected(null)} aria-label={text(locale, 'Fechar detalhes do dia', 'Close day details')}><X size={12}/></button></div>}</div>
  <div className="sleep-chart-footer"><span><CircleHelp size={13}/> {text(locale, 'Dados sintéticos. Estágios são ilustrativos e não são inferidos por actigrafia isolada.', 'Synthetic data. Sleep stages are illustrative and cannot be inferred from actigraphy alone.')}</span><strong>{text(locale, 'REFERÊNCIA SEMANAL:', 'WEEKLY REFERENCE:')} {h(average - 8, locale)} h / {text(locale, 'NOITE', 'NIGHT')}</strong></div></section>
  <VitalStatusPanel locale={locale} latest={{
    vitalId: 'sleep-hours',
    label: sleepMissing ? { pt: 'Sem leitura do Sol 142 · fonte indisponível neste cenário', en: 'No reading for Sol 142 · source unavailable in this scenario' } : { pt: `${h(latestSleep, 'pt-BR')} h · noite do Sol 142`, en: `${h(latestSleep, 'en')} h · night of Sol 142` },
    reading: { value: sleepMissing ? null : latestSleep }, options: { history: week.slice(0, -1).map(day => ({ value: total(day) })) },
  }}/>
  <section className="health-panel sleep-about"><div className="sleep-section-heading"><h2>{text(locale, 'Sobre as Horas de Sono', 'About Sleep Hours')}</h2></div><p>{text(locale, 'O sono contribui para atenção, recuperação e desempenho durante a missão. Estudos usam actigrafia junto ao diário de sono para estimar sua duração e acompanhar mudanças em relação à linha de base individual.', 'Sleep supports attention, recovery, and mission performance. Studies combine actigraphy with sleep diaries to estimate duration and track changes against an individual baseline.')}</p><div className="sleep-source"><span><ShieldCheck size={13}/> {text(locale, 'Fonte:', 'Source:')} NASA HRP · Sleep Loss (2016), {text(locale, 'conforme análise de indicadores do projeto.', 'as cited in the project indicator review.')}</span></div></section>
  <section className="health-panel sleep-hazards"><div className="sleep-section-heading"><div><h2>{text(locale, 'Como o ambiente espacial afeta o sono', 'How the space environment affects sleep')}</h2><p>{text(locale, 'O contexto da missão ajuda a interpretar mudanças no descanso.', 'Mission context helps interpret changes in rest.')}</p></div></div><div className="hazard-grid"><Hazard icon={<Cpu size={17}/>} title={text(locale, 'Isolamento e confinamento', 'Isolation and confinement')} text={text(locale, 'Em missões análogas de longa duração, as tripulações dormiram menos e os ritmos de sono e vigília se dessincronizaram.', 'In long-duration analog missions, crews slept less and their sleep–wake rhythms drifted apart.')} note={text(locale, 'Duração do sono e regularidade do horário de dormir', 'Sleep duration and bedtime consistency')}/><Hazard icon={<Wind size={17}/>} title={text(locale, 'Ambiente fechado ou desafiador', 'Enclosed or challenging environment')} text={text(locale, 'Ruído, alarmes, cabines compartilhadas, iluminação fraca e desconforto térmico foram relatados como fatores que atrapalham o sono.', 'Noise, alarms, shared sleeping quarters, dim lighting, and temperature discomfort have been reported as sleep disruptors.')} note={text(locale, 'Luz, ruído, temperatura e conforto', 'Light, noise, temperature, and comfort')}/><Hazard icon={<Clock3 size={17}/>} title={text(locale, 'Distância da Terra', 'Distance from Earth')} text={text(locale, 'Em Marte, o dia é cerca de 40 minutos mais longo e a luz do Sol tem cerca de metade da intensidade, o que dificulta manter o relógio biológico estável.', 'On Mars, a day is about 40 minutes longer and sunlight about half as bright, which makes it harder to keep a steady body clock.')} note={text(locale, 'Horário do sono e exposição à luz', 'Sleep timing and light exposure')}/><Hazard icon={<Activity size={17}/>} title={text(locale, 'Microgravidade', 'Microgravity')} text={text(locale, 'A ausência de peso é apontada como fonte de desconforto no sono, mas o relatório encontrou pouca evidência de efeito direto.', 'Weightlessness is suggested as a source of sleep discomfort, but the report found limited evidence of a direct effect.')} note={text(locale, 'Conforto do sono', 'Sleep comfort')}/></div><p className="sleep-hazard-source">{text(locale, 'Fonte:', 'Source:')} NASA HRP · {text(locale, 'evidência sobre sono, ritmo circadiano e carga de trabalho (2016).', 'evidence on sleep, circadian rhythm, and workload (2016).')}</p></section>
  <section className="health-panel sleep-recommendation"><div className="hl-icon"><ShieldCheck size={19}/></div><div><small>{text(locale, 'REVISÃO COM A EQUIPE DA MISSÃO', 'REVIEW WITH THE MISSION TEAM')}</small><p>{text(locale, 'Considere o histórico individual e o contexto antes de interpretar os resultados de sono.', 'Consider individual history and context before interpreting sleep results.')}</p></div><button className="health-button accent" onClick={() => setCalibration(true)}><SlidersHorizontal size={14}/> {text(locale, 'Calibrar Actiwatch', 'Calibrate Actiwatch')}</button></section>
  </main>{calibration && <CalibrationModal theme={theme} locale={locale} onClose={() => setCalibration(false)}/>}</div>;
}
function Hazard({ icon, title, text, note }: { icon: React.ReactNode; title: string; text: string; note: string }) { const locale = useLocale(); return <article className="hazard-card"><div><span className="hl-icon">{icon}</span><h3>{title}</h3></div><p>{text}</p><footer><small>{locale === 'en' ? 'WHAT TO TRACK' : 'O QUE ACOMPANHAR'}</small><strong>{note}</strong></footer></article>; }

export type TemperatureView = '24h' | '7d';
const temperatureSeries: Record<TemperatureView, number[]> = {
  '24h': [36.82, 36.76, 36.72, 36.68, 36.65, 36.7, 36.84, 37.02, 37.18, 37.28, 37.36, 37.42, 37.48, 37.44, 37.38, 37.32, 37.26, 37.18, 37.1, 37.02, 36.94, 36.88, 36.84, 36.8],
  '7d': [36.92, 37.02, 36.98, 37.12, 37.08, 37.2, 37.16],
};

// Last reading of the 24 h demo series (23:00), shown on the Highlights card and classified on the page.
const latestTemperature = temperatureSeries['24h'][temperatureSeries['24h'].length - 1];
const formatTemperature = (value: number, locale: Locale) => value.toLocaleString(locale === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function BodyTemperatureDashboard({ scenarioId = DEFAULT_SCENARIO_ID, onBack, onAtlas, onHighlights, onIndicators, onData, theme, onToggleTheme, locale, onLocaleChange }: Props & { onBack: () => void; scenarioId?: string }) {
  const temperatureMissing = scenarioVitals(scenarioId).missing;
  const [view, setView] = useState<TemperatureView>('24h');
  const english = locale === 'en';
  const values = temperatureSeries[view];
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 1000},${((41 - value) / 6) * 500}`).join(' ');
  const labels = view === '24h' ? ['07:00', '12:00', '14:00'] : ['09/11', '10/11', '11/11', '12/11', '13/11', '14/11', '15/11'];
  const temperatureHazards = english ? [
    { title: 'Altered gravity', basis: 'Basis: ISS study, 11 astronauts', text: 'In weightlessness, heat moves away from the body less easily and sweat evaporates more slowly. On the ISS, resting core temperature rose about 1 °C over about 2.5 months and rose faster during exercise.', track: 'Resting drift from baseline and exercise peaks.' },
    { title: 'Isolation and confinement', basis: 'Basis: stress studies; not yet shown in space', text: 'In stress research, new or long-lasting stress can raise core temperature (up to about 2 °C in some studies). Whether this contributes in space is proposed, not measured.', track: 'Temperature alongside mood and sleep entries.' },
    { title: 'Distance from Earth', basis: 'Basis: mission planning and a pilot study', text: 'Beyond low Earth orbit, help takes longer to arrive, so crews must check vital signs on their own. In a pilot study with guided steps, people with first-aid training measured temperature in about a minute on the first try and faster on the second.', track: 'Self-check routine and sensor placement.' },
    { title: 'Enclosed or challenging environment', basis: 'Basis: ISS and spacesuit studies', text: 'Cabin air is held at roughly 18 to 27 °C with limited airflow, and spacesuits trap body heat. In a simulated lunar spacewalk with a cooling garment, core temperature climbed from about 37.1–37.3 °C to 38.0–38.1 °C.', track: 'EVA and exercise heat peaks, and cabin temperature changes.' },
  ] : [
    { title: 'Gravidade alterada', basis: 'Base: estudo na ISS, 11 astronautas', text: 'Na ausência de peso, o calor se dissipa com menos facilidade e o suor evapora mais lentamente. Na ISS, a temperatura central em repouso subiu cerca de 1 °C em aproximadamente 2,5 meses e aumentou mais rapidamente durante o exercício.', track: 'Variação em repouso em relação ao baseline e picos durante exercício.' },
    { title: 'Isolamento e confinamento', basis: 'Base: estudos de estresse; ainda não demonstrado no espaço', text: 'Pesquisas sobre estresse indicam que situações novas ou prolongadas podem elevar a temperatura central (até cerca de 2 °C em alguns estudos). A contribuição desse efeito no espaço é uma hipótese, não uma medição.', track: 'Temperatura junto aos registros de humor e sono.' },
    { title: 'Distância da Terra', basis: 'Base: planejamento de missão e estudo piloto', text: 'Além da órbita baixa, a ajuda demora mais para chegar, então a tripulação precisa verificar os sinais vitais por conta própria. Em estudo piloto com instruções guiadas, pessoas treinadas em primeiros socorros mediram a temperatura em cerca de um minuto na primeira tentativa e mais rápido na segunda.', track: 'Rotina de autoavaliação e posicionamento do sensor.' },
    { title: 'Ambiente fechado ou desafiador', basis: 'Base: estudos na ISS e com trajes espaciais', text: 'O ar da cabine é mantido entre aproximadamente 18 e 27 °C, com fluxo limitado, e os trajes retêm o calor corporal. Em uma caminhada lunar simulada com roupa de resfriamento, a temperatura central subiu de cerca de 37,1–37,3 °C para 38,0–38,1 °C.', track: 'Picos de calor em EVA e exercício e mudanças na temperatura da cabine.' },
  ];
  const markerIndexes = labels.map((_, index) => Math.round(index * (values.length - 1) / (labels.length - 1)));
  return <div className="health-shell temperature-page" data-theme={theme}><HealthHeader activePage="sleep" onHighlights={onHighlights} onAtlas={onAtlas} onIndicators={onIndicators} onData={onData} theme={theme} onToggleTheme={onToggleTheme} locale={locale} onLocaleChange={onLocaleChange}/><main className="health-main sleep-main"><section className="sleep-heading health-panel"><div><button className="sleep-back" onClick={onBack}><ArrowLeft size={13}/> {english ? 'BACK TO OVERVIEW' : 'VOLTAR À VISÃO GERAL'}</button><h1>{english ? 'Body Temperature' : 'Temperatura corporal'}</h1></div></section>
  <TemperatureSleepStyleChart values={values} view={view} labels={labels} locale={locale} onViewChange={setView}/>
  <VitalStatusPanel locale={locale} latest={{
    vitalId: 'core-temperature', label: temperatureMissing ? { pt: 'Sem leitura · fonte indisponível neste cenário', en: 'No reading · source unavailable in this scenario' } : { pt: `${formatTemperature(latestTemperature, 'pt-BR')} °C · repouso · 23:00`, en: `${formatTemperature(latestTemperature, 'en')} °C · resting · 23:00` },
    // Mission day 42 matches the fixtures; the resting nominal limit rises over the first 75 days.
    reading: { value: temperatureMissing ? null : latestTemperature, context: { activity: 'rest', missionDay: 42 } }, options: { baseline: 36.9 },
  }}/>
  <section className="health-panel temperature-chart-panel"><div className="temperature-chart-heading"><div><span className="sleep-eyebrow">{english ? 'CORE TELEMETRY' : 'TELEMETRIA CENTRAL'}</span><h2>{english ? 'Simulated core temperature' : 'Temperatura central simulada'}</h2></div><div className="temperature-view-tabs" role="tablist" aria-label={english ? 'Temperature time range' : 'Período da temperatura'}>{(['24h', '7d'] as TemperatureView[]).map(option => <button key={option} type="button" role="tab" aria-selected={view === option} className={view === option ? 'active' : ''} onClick={() => setView(option)}>{option}</button>)}</div><strong>{values[values.length - 1]?.toLocaleString(english ? 'en-US' : 'pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} °C</strong></div><div className="temperature-chart-wrap"><svg className="temperature-chart" viewBox="0 0 1000 500" preserveAspectRatio="none" role="img" aria-label={english ? 'Simulated core temperature chart' : 'Gráfico de temperatura central simulada'}><rect x="0" y="0" width="1000" height="500" fill="transparent"/><rect x="0" y={((41 - 37.2) / 6) * 500} width="1000" height={((37.2 - 36.1) / 6) * 500} className="temperature-typical-band"/>{[35, 36, 37, 38, 39, 40, 41].map(mark => <line key={mark} x1="0" x2="1000" y1={((41 - mark) / 6) * 500} y2={((41 - mark) / 6) * 500} className={mark === 35 || mark === 38 || mark === 40 ? 'temperature-reference-line' : 'temperature-axis-line'}/>)}<line x1="0" x2="1000" y1={((41 - 36.9) / 6) * 500} y2={((41 - 36.9) / 6) * 500} className="temperature-baseline"/><polyline points={points} className="temperature-data-line"/>{markerIndexes.map((index, marker) => { const x = (index / (values.length - 1)) * 1000; const y = ((41 - values[index]) / 6) * 500; return <circle key={labels[marker]} cx={x} cy={y} r="6" className="temperature-marker-dot"/>; })}</svg><div className="temperature-reference-labels">{[35, 36, 37, 38, 39, 40, 41].map(mark => <span key={mark} style={{ top: `${((41 - mark) / 6) * 100}%` }}>{mark.toFixed(1)} °C</span>)}</div>{markerIndexes.map((index, marker) => <span key={labels[marker]} className="temperature-marker-value" style={{ left: `${(index / (values.length - 1)) * 100}%`, top: `${((41 - values[index]) / 6) * 100}%` }}>{values[index].toLocaleString(english ? 'en-US' : 'pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} °C</span>)}<div className="temperature-event exercise" style={{ left: '42%' }}>▲ <span>{text(locale, 'Exercício', 'Exercise')}</span></div><div className="temperature-event eva" style={{ left: '68%' }}>▲ <span>EVA</span></div></div><div className="temperature-axis">{labels.map(label => <span key={label} className="temperature-axis-mark"><b>{label}</b></span>)}</div><div className="temperature-chart-meta">UTC</div></section>
  <section className="health-panel temperature-about"><div className="sleep-section-heading"><h2>{english ? 'About Body Temperature' : 'Sobre a Temperatura Corporal'}</h2></div><p>{english ? "Core body temperature is the temperature of the body's deep tissues. It sits at about 37 °C and is held within a narrow range by the hypothalamus, with small swings over the 24-hour rhythm [Stahn 2017]. In healthy adults the typical range is 36.1 to 37.2 °C. Hard exercise can temporarily raise it to about 40 °C, and a core temperature below 35 °C is called hypothermia." : 'A temperatura corporal central é a temperatura dos tecidos profundos do corpo. Ela fica perto de 37 °C e é mantida em uma faixa estreita pelo hipotálamo, com pequenas oscilações no ritmo de 24 horas [Stahn 2017]. Em adultos saudáveis, a faixa típica vai de 36,1 a 37,2 °C. Exercício intenso pode elevá-la temporariamente a cerca de 40 °C, e uma temperatura central abaixo de 35 °C é chamada de hipotermia.'}</p></section>
  <section className="health-panel temperature-hazards"><div className="sleep-section-heading"><h2>{text(locale, 'Como o ambiente espacial afeta a temperatura corporal', 'How the space environment affects body temperature')}</h2></div><div className="temperature-card-grid">{temperatureHazards.map(item => <TemperatureContext key={item.title} {...item}/>)}</div><p className="temperature-source">{text(locale, 'Fontes:', 'Sources:')} Stahn et al., Scientific Reports 2017; NASA NTRS 20220009966; NASA-STD-3001 {text(locale, 'material de treinamento', 'training material')}; Huerta et al., Aerosp Med Hum Perform 2024. {text(locale, 'Conteúdo demonstrativo, não é orientação médica.', 'Demonstration content, not medical advice.')}</p></section>
  </main></div>;
}

export function TemperatureContext({ title, basis, text: description, track }: { title: string; basis: string; text: string; track: string }) { const locale = useLocale(); return <article className="temperature-context-card"><div><h3>{title}</h3><small>{basis}</small></div><p>{description}</p><footer><small>{text(locale, 'O QUE ACOMPANHAR', 'WHAT TO TRACK')}</small><strong>{track}</strong></footer></article>; }

type ChartText = { pt: string; en: string };
// Everything vital-specific in the summary chart; the defaults reproduce the body temperature page.
export type SleepStyleChartConfig = {
  eyebrow: ChartText; summaryNote: ChartText; tabsLabel: ChartText; chartLabel: ChartText; legend: ChartText; referenceLegend: ChartText; footerNote: ChartText;
  unit: string; peakSuffix: string; barSuffix: string; decimals: number;
  baseline: { value: string | ChartText; note: ChartText }; range: { value: string | ChartText; note: ChartText }; unitNote: ChartText;
  // Without targetLabel, the line is explained only by the reference legend (avoids clashing with bar values).
  axis: number[]; axisDecimals: number; axisSuffix: string; targetMark: number; targetLabel?: ChartText;
  // When set, the baseline line is drawn at this exact value instead of on the targetMark grid line.
  baselineValue?: number;
  // Optional second bar per point (e.g. diastolic pressure) with its own legend entry.
  secondaryLegend?: ChartText;
  // Time ranges offered; a single range hides the tabs. Defaults to 24h and 7d.
  views?: TemperatureView[];
  // Keep the whole 24h label (e.g. "07:00 · fasting") instead of the part after the first space.
  fullDayLabels?: boolean;
  dayIndexes: number[]; footerDates: Record<TemperatureView, string>;
};
const TEMPERATURE_CHART: SleepStyleChartConfig = {
  eyebrow: { pt: 'TEMPERATURA CENTRAL', en: 'CORE TEMPERATURE' },
  summaryNote: { pt: 'Série demonstrativa · temperatura central sintética.', en: 'Demonstration series · synthetic core temperature.' },
  tabsLabel: { pt: 'Período da temperatura', en: 'Temperature time range' },
  chartLabel: { pt: 'Gráfico de temperatura corporal', en: 'Body temperature chart' },
  legend: { pt: 'Temperatura central', en: 'Core temperature' },
  referenceLegend: { pt: 'Faixa de referência (36,1–37,2 °C)', en: 'Reference range (36.1–37.2 °C)' },
  footerNote: { pt: 'As linhas de referência são marcos descritivos, não níveis de gravidade.', en: 'Reference lines are descriptive landmarks, not severity scores.' },
  unit: '°C', peakSuffix: '°C', barSuffix: '°', decimals: 2,
  baseline: { value: '36.9°C', note: { pt: 'pré-voo', en: 'pre-flight' } },
  range: { value: '36.1–37.2', note: { pt: 'típica', en: 'typical' } },
  unitNote: { pt: 'absoluta', en: 'absolute' },
  axis: [41, 40, 39, 38, 37, 36, 35], axisDecimals: 1, axisSuffix: '°C', targetMark: 37, targetLabel: { pt: 'BASELINE · 36,9 °C', en: 'BASELINE · 36.9°C' },
  dayIndexes: [7, 12, 14], footerDates: { '24h': '16/11', '7d': '09/11–15/11' },
};

export function TemperatureSleepStyleChart({ values, secondaryValues, view, labels, locale, onViewChange, config = TEMPERATURE_CHART }: { values: number[]; secondaryValues?: number[]; view: TemperatureView; labels: string[]; locale: Locale; onViewChange: (view: TemperatureView) => void; config?: SleepStyleChartConfig }) {
  const tr = (value: ChartText) => text(locale, value.pt, value.en);
  const stat = (value: string | ChartText) => typeof value === 'string' ? value : tr(value);
  const axis = config.axis;
  const axisMin = Math.min(...axis);
  const axisMax = Math.max(...axis);
  const axisSpan = axisMax - axisMin;
  const gridTarget = config.baselineValue === undefined ? config.targetMark : null;
  const peak = Math.max(...values);
  const chartIndexes = view === '24h' ? config.dayIndexes : values.map((_, index) => index);
  const chartValues = chartIndexes.map(index => values[index]);
  const chartLabels = chartIndexes.map((index, chartPosition) => {
    const label = labels[view === '24h' ? chartPosition : index % labels.length];
    return view === '24h' && !config.fullDayLabels ? label.slice(label.indexOf(' ') + 1) : label;
  });
  const views = config.views ?? ['24h', '7d'];
  const paired = secondaryValues !== undefined;
  const barHeight = (value: number) => ((value - axisMin) / axisSpan) * 100;
  const formatValue = (value: number) => value.toLocaleString(locale === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: config.decimals, maximumFractionDigits: config.decimals });
  return <section className="sleep-dashboard health-panel temperature-sleep-chart"><div className="sleep-summary"><div><div className="sleep-eyebrow">■ {tr(config.eyebrow)}</div><div className="sleep-total"><strong>{formatValue(peak)}</strong><span>{config.unit}</span></div><p>{tr(config.summaryNote)}</p></div><div className="temperature-summary-controls">{views.length > 1 && <div className="temperature-view-tabs" role="tablist" aria-label={tr(config.tabsLabel)}>{views.map(option => <button key={option} type="button" role="tab" aria-selected={view === option} className={view === option ? 'active' : ''} onClick={() => onViewChange(option)}>{option}</button>)}</div>}<div className="sleep-stats"><div><small>{text(locale, 'BASELINE', 'BASELINE')}</small><strong>{stat(config.baseline.value)}</strong><span>{tr(config.baseline.note)}</span></div><div><small>{text(locale, 'FAIXA', 'RANGE')}</small><strong>{stat(config.range.value)}</strong><span>{tr(config.range.note)}</span></div><div><small>{text(locale, 'PICO', 'PEAK')}</small><strong>{formatValue(peak)}{config.peakSuffix}</strong><span>{text(locale, 'máximo da série', 'series maximum')}</span></div><div><small>{text(locale, 'UNIDADE', 'UNIT')}</small><strong>{config.unit}</strong><span>{tr(config.unitNote)}</span></div></div></div></div><div className="sleep-chart" aria-label={tr(config.chartLabel)}>{/* Text alternative for screen readers with the plotted values. */}<table className="sr-only"><caption>{tr(config.chartLabel)}</caption><thead><tr><th scope="col">{text(locale, 'Período', 'Period')}</th><th scope="col">{tr(config.legend)} ({config.unit})</th>{paired && config.secondaryLegend && <th scope="col">{tr(config.secondaryLegend)} ({config.unit})</th>}</tr></thead><tbody>{chartValues.map((value, index) => <tr key={`${chartLabels[index]}-${chartIndexes[index]}`}><th scope="row">{chartLabels[index]}</th><td>{formatValue(value)}</td>{paired && <td>{formatValue(secondaryValues[chartIndexes[index]])}</td>}</tr>)}</tbody></table><div className="sleep-chart-legend"><span><i className={paired ? 'temperature-bar legend-swatch' : 'temperature-bar'}/> {tr(config.legend)}</span>{paired && config.secondaryLegend && <span><i className="temperature-bar legend-swatch secondary"/> {tr(config.secondaryLegend)}</span>}<span className="temperature-legend-reference">╌╌ {tr(config.referenceLegend)}</span></div><div className="sleep-chart-body"><div className="sleep-axis">{axis.map(value => <span key={value}>{value.toFixed(config.axisDecimals)}{config.axisSuffix}</span>)}</div><div className="sleep-plot"><div className="sleep-grid">{axis.map(value => <div key={value} className={value === gridTarget ? 'target' : ''}>{value === gridTarget && config.targetLabel && <span>{tr(config.targetLabel)}</span>}</div>)}{config.baselineValue !== undefined && <div className="target" style={{ position: 'absolute', left: 0, right: 0, top: `${((axisMax - config.baselineValue) / axisSpan) * 100}%` }}>{config.targetLabel && <span>{tr(config.targetLabel)}</span>}</div>}</div><div className="temperature-bars">{chartValues.map((value, index) => <div className="temperature-bar-group" key={`${chartLabels[index]}-${chartIndexes[index]}`}><span className="temperature-bar-value">{formatValue(value)}{paired ? `/${formatValue(secondaryValues[chartIndexes[index]])}` : ''}{config.barSuffix}</span>{paired
      // The pair takes the height of the taller (primary) bar; the secondary bar is drawn relative to it.
      ? <span className="temperature-bar-pair" style={{ height: `${barHeight(value)}%` }}><span className="temperature-bar"/><span className="temperature-bar secondary" style={{ height: `${(barHeight(secondaryValues[chartIndexes[index]]) / barHeight(value)) * 100}%` }}/></span>
      : <span className="temperature-bar" style={{ height: `${barHeight(value)}%` }}/>}<span className="temperature-bar-label">{chartLabels[index]}</span></div>)}</div></div></div><div className="sleep-chart-footer"><span>ⓘ {tr(config.footerNote)}</span><strong>UTC · {config.footerDates[view]}</strong></div></div></section>;
}
