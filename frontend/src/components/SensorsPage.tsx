import { Radio } from 'lucide-react';
import type { Locale } from '../i18n/messages';
import { HealthHeader } from './SleepDashboard';
import './sleep-dashboard.css';

type Text = { pt: string; en: string };
type Sensor = { id: string; name: Text; measures: Text; signal: Text; open: () => void };
type Props = {
  onAtlas: () => void; onHighlights: () => void; onIndicators: () => void; onData: () => void;
  onExamLogs: () => void; onActivityHistory: () => void;
  onSleep: () => void; onBodyTemperature: () => void; onHeartRate: () => void; onBloodPressure: () => void; onBloodGlucose: () => void;
  theme: 'dark' | 'light'; onToggleTheme: () => void; locale: Locale; onLocaleChange: (locale: Locale) => void;
};

const text = (locale: Locale, pt: string, en: string) => locale === 'en' ? en : pt;

// Sensors the app assumes for each signal. None is connected in the demo: every value is synthetic.
export function SensorsPage({ onAtlas, onHighlights, onIndicators, onData, onExamLogs, onActivityHistory, onSleep, onBodyTemperature, onHeartRate, onBloodPressure, onBloodGlucose, theme, onToggleTheme, locale, onLocaleChange }: Props) {
  const tr = (value: Text) => text(locale, value.pt, value.en);
  const sensors: Sensor[] = [
    { id: 'actigraphy', name: { pt: 'Actígrafo de pulso', en: 'Wrist actigraph' }, measures: { pt: 'Movimento e luz, para estimar a duração do sono.', en: 'Movement and light, to estimate sleep duration.' }, signal: { pt: 'SONO TOTAL · O06', en: 'TOTAL SLEEP · O06' }, open: onSleep },
    { id: 'heat-flux', name: { pt: 'Sensor de fluxo de calor', en: 'Heat-flux sensor' }, measures: { pt: 'Estimativa da temperatura central em repouso e no exercício.', en: 'Core temperature estimate at rest and during exercise.' }, signal: { pt: 'TEMPERATURA CORPORAL · T01', en: 'BODY TEMPERATURE · T01' }, open: onBodyTemperature },
    { id: 'heart-rate', name: { pt: 'Wearable de frequência cardíaca / ECG de bordo', en: 'Heart rate wearable / onboard ECG' }, measures: { pt: 'Frequência cardíaca em repouso, no exercício e em EVA.', en: 'Heart rate at rest, during exercise, and during EVA.' }, signal: { pt: 'FREQUÊNCIA CARDÍACA · V01', en: 'HEART RATE · V01' }, open: onHeartRate },
    { id: 'blood-pressure', name: { pt: 'Medidor de pressão automático', en: 'Automatic blood pressure monitor' }, measures: { pt: 'Pressão sistólica e diastólica.', en: 'Systolic and diastolic pressure.' }, signal: { pt: 'PRESSÃO ARTERIAL · V02', en: 'BLOOD PRESSURE · V02' }, open: onBloodPressure },
    { id: 'glucose', name: { pt: 'Glicosímetro capilar e monitor contínuo (CGM)', en: 'Fingerstick meter and continuous glucose monitor (CGM)' }, measures: { pt: 'Glicemia pontual e contínua, com o contexto da leitura.', en: 'Spot and continuous glucose, with the reading context.' }, signal: { pt: 'GLICEMIA · V03', en: 'BLOOD GLUCOSE · V03' }, open: onBloodGlucose },
    { id: 'dosimeter', name: { pt: 'Dosímetro', en: 'Dosimeter' }, measures: { pt: 'Taxa de dose e LET no ponto do detector, não por órgão.', en: 'Dose rate and LET at the detector, not per organ.' }, signal: { pt: 'RADIAÇÃO · R01–R09', en: 'RADIATION · R01–R09' }, open: onAtlas },
  ];
  return <div className="health-shell" data-theme={theme}><HealthHeader activePage="sensors" onHighlights={onHighlights} onAtlas={onAtlas} onIndicators={onIndicators} onData={onData} onExamLogs={onExamLogs} onActivityHistory={onActivityHistory} theme={theme} onToggleTheme={onToggleTheme} locale={locale} onLocaleChange={onLocaleChange} /><main className="health-main"><section className="activity-history-view">
    <div className="activity-history-heading"><div><small>{text(locale, 'SENSORES // STATUS DE CONEXÃO', 'SENSORS // CONNECTION STATUS')}</small><h1>{text(locale, 'Wearables e sensores', 'Wearables & Sensors')}</h1><p>{text(locale, 'Sensores que o app pressupõe para cada sinal. Nenhum está conectado nesta demonstração: todos os valores exibidos são sintéticos.', 'Sensors the app assumes for each signal. None is connected in this demo: every value shown is synthetic.')}</p></div><span className="activity-history-count">0/{sensors.length} {text(locale, 'conectados', 'connected')}</span></div>
    <div className="activity-history-list">{sensors.map(sensor => <article key={sensor.id} className="activity-history-item pending"><div className="activity-history-status"><Radio size={16}/></div><div className="activity-history-content"><div className="activity-history-meta"><small>{tr(sensor.signal)}</small></div><h2>{tr(sensor.name)}</h2><p>{tr(sensor.measures)}</p></div><span className="activity-history-badge">{text(locale, 'Não conectado · dados sintéticos', 'Not connected · synthetic data')}</span><button type="button" className="health-button" onClick={sensor.open} aria-label={`${text(locale, 'Abrir sinal', 'Open signal')}: ${tr(sensor.name)}`}>{text(locale, 'Abrir sinal', 'Open signal')}</button></article>)}</div>
  </section></main></div>;
}
