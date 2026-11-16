import type { IndicatorRecord } from '../data/types';
import { useLocale } from '../i18n/locale';

export function SleepContext({ record }: { record: IndicatorRecord }) {
  const locale = useLocale();
  const duration = typeof record.value === 'number' ? record.value : null;
  const baseline = typeof record.baseline === 'number' ? record.baseline : null;
  const delta = duration !== null && baseline !== null ? duration - baseline : null;
  if (locale === 'en') return <section className="inspection-section" aria-label="Sleep hours context">
    <h3>Sleep hours · context</h3><p>Sleep duration, time awake, post-wake inertia, and circadian phase all influence performance. A single duration measure does not capture them all.</p>
    <dl className="metadata-list"><div><dt>Astronaut reference</dt><dd>8 h per night</dd></div><div><dt>Individual baseline</dt><dd>{baseline === null ? 'Unavailable' : `${baseline.toLocaleString('en-US')} h`}</dd></div><div><dt>Difference from baseline</dt><dd>{delta === null ? 'Cannot be calculated' : `${delta > 0 ? '+' : ''}${delta.toLocaleString('en-US', { maximumFractionDigits: 2 })} h`}</dd></div></dl>
    <p>Cited studies report average sleep of about 6–6.5 h in flight. This demo flags observation below 7 h and increased attention after a week below 6 h or one night below 5 h (NASA OCHMO-TB-041 and project analysis). These references are not diagnoses.</p>
    <h3>Mission factors</h3><p>Isolation, confinement, distance from Earth, and cabin noise, light, and temperature can affect sleep and routines. Evidence for a direct microgravity effect is limited; the cited report does not attribute sleep loss to radiation.</p>
    <h3>Review and response</h3><p>Consider personal history, time awake, and critical shifts with the responsible team. The source discusses more than 16 h awake and post-wake inertia, but this demo does not collect those measures. Protecting rest periods and recovery time are operational options to discuss with the flight surgeon.</p>
    <h3>Measurement</h3><p>NASA studies combined wrist actigraphy and sleep diaries. Actigraphy estimates duration from movement; it does not identify sleep stages. This value is simulated and self-reported, with no wearable integration.</p>
    <p className="tiny">References: NASA HRP report (2016); Sleep-Short and Sleep-Long experiments; AASM guidance cited in the project indicator analysis. Mission teams must assess operational guidance.</p>
  </section>;
  return <section className="inspection-section" aria-label="Contexto das horas de sono">
    <h3>Horas de sono · contexto</h3>
    <p>A duração, o tempo acordado, a inércia após despertar e a fase circadiana influenciam o desempenho. Uma única medida de duração não avalia todos esses fatores.</p>
    <dl className="metadata-list">
      <div><dt>Referência para astronautas</dt><dd>8 h por noite</dd></div>
      <div><dt>Baseline individual</dt><dd>{baseline === null ? 'Não disponível' : `${baseline.toLocaleString('pt-BR')} h`}</dd></div>
      <div><dt>Diferença do baseline</dt><dd>{delta === null ? 'Não calculável' : `${delta > 0 ? '+' : ''}${delta.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} h`}</dd></div>
    </dl>
    <p>Os estudos citados relatam médias de aproximadamente 6 a 6,5 h em voo. O estado indica observação abaixo de 7 h e atenção após uma semana abaixo de 6 h ou numa noite abaixo de 5 h (NASA OCHMO-TB-041 e análise do projeto). A referência não é um diagnóstico.</p>
    <h3>Fatores da missão</h3>
    <p>Isolamento e confinamento podem afetar sono e ritmos; distância da Terra e condições da cabine, como ruído, luz e temperatura, também são contextos relevantes. A evidência para microgravidade é limitada e o relatório não cobre radiação como causa de perda de sono.</p>
    <h3>Quando revisar e como agir</h3>
    <p>Considere histórico individual, horas acordado e turnos críticos com a equipe responsável. A fonte discute mais de 16 h acordado e inércia após despertar, mas esses dados não estão disponíveis nesta demonstração. Proteção da escala de descanso e tempo de recuperação são medidas operacionais a discutir com o médico de voo.</p>
    <h3>Como medir</h3>
    <p>Os estudos da NASA combinaram actigrafia no pulso e diário de sono. O dispositivo estima duração por movimento; não identifica estágios de sono. A leitura exibida aqui é autorreferida e simulada, sem integração com wearable.</p>
    <p className="tiny">Referências: relatório NASA HRP de 2016; experimentos Sleep-Short e Sleep-Long; diretrizes AASM citadas na análise de indicadores do projeto. As orientações dependem de avaliação da missão.</p>
  </section>;
}
