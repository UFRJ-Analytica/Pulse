import { useEffect } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// WebGL geometry is validated separately with the real local GLB. Here we test
// React interactions with the renderer boundary replaced by a loaded scene.
vi.mock('./components/AnatomyScene', () => ({
  AnatomyScene: ({ onLoaded }: { onLoaded: (count: number) => void }) => {
    useEffect(() => { onLoaded(46); }, [onLoaded]);
    return <div aria-label="Cena WebGL substituída no teste de interação" />;
  },
}));
vi.mock('recharts', async (importOriginal) => {
  const original = await importOriginal<typeof import('recharts')>();
  return { ...original, ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div style={{ width: 800, height: 150 }}>{children}</div> };
});
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
beforeEach(() => { window.history.replaceState({}, '', '/pt-br/mission-atlas'); });
afterEach(() => { cleanup(); });
const inspector = () => screen.getByRole('complementary', { name: 'Inspeção' });

describe('mission workflows', () => {
  it('mantém o tema escolhido entre as telas de saúde e na calibração', async () => {
    localStorage.removeItem('pulse-health-theme');
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
    await user.click(screen.getByRole('button', { name: 'Ativar tema claro' }));
    expect(localStorage.getItem('pulse-health-theme')).toBe('light');
    expect(document.querySelector('.health-shell')).toHaveAttribute('data-theme', 'light');
    await user.click(screen.getByRole('button', { name: /Sono total/ }));
    expect(document.querySelector('.health-shell')).toHaveAttribute('data-theme', 'light');
    await user.click(screen.getByRole('button', { name: /Calibrar Actiwatch/ }));
    expect(screen.getByRole('dialog', { name: 'CALIBRAR ACTIWATCH' })).toHaveClass('calibration-light');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Cancelar/ }));
    await user.click(screen.getByRole('button', { name: 'Ativar tema escuro' }));
    expect(document.querySelector('.health-shell')).toHaveAttribute('data-theme', 'dark');
    localStorage.removeItem('pulse-health-theme');
  });
  it('navigates highlights, explores sleep and opens the simulated calibration', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
    expect(screen.getByRole('heading', { name: 'Telemetria principal' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Sono total/ }));
    expect(screen.getByRole('heading', { name: /Horas de sono/, level: 1 })).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Dom, sol 139/ }));
    expect(screen.getByRole('status').textContent).toContain('Sol 139');
    await user.click(screen.getByRole('button', { name: 'Sol (dia)' }));
    expect(screen.queryByRole('button', { name: /Dom, sol 139/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Calibrar Actiwatch/ }));
    const dialog = screen.getByRole('dialog', { name: 'CALIBRAR ACTIWATCH' });
    expect(within(dialog).getByText(/SEM DISPOSITIVO CONECTADO/)).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Dominante' }));
    expect(within(dialog).getByRole('button', { name: 'Dominante' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(dialog).getByRole('button', { name: /Simular calibração/ }));
    expect(within(dialog).getByRole('button', { name: /Simulando/ })).toBeDisabled();
    await user.click(within(dialog).getByRole('button', { name: /Cancelar/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the heart rate page from its highlights card and switches the time range', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
    await user.click(screen.getByRole('button', { name: /Frequência cardíaca/ }));
    expect(window.location.pathname).toBe('/pt-br/highlights/biomarkers/heart-rate');
    expect(screen.getByRole('heading', { name: 'Frequência cardíaca', level: 1 })).toBeVisible();
    expect(document.title).toBe('Frequência cardíaca | Pulse Health');
    expect(screen.getByText(/Baseline 63 bpm · repouso 40–100 bpm/)).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Como o ambiente espacial afeta a frequência cardíaca' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Radiação' })).toBeVisible();
    await user.click(screen.getByRole('tab', { name: '7d' }));
    expect(screen.getByRole('tab', { name: '7d' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('09/11')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /VOLTAR À VISÃO GERAL/ }));
    expect(screen.getByRole('heading', { name: 'Telemetria principal' })).toBeVisible();
  });

  it('classifies the latest reading on each vital page with the vitals layer', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
    await user.click(screen.getByRole('button', { name: /Frequência cardíaca/ }));
    const panel = screen.getByRole('region', { name: 'Classificação da última leitura' });
    expect(within(panel).getByText('64 bpm · repouso ao acordar · 15/11')).toBeVisible();
    expect(within(panel).getByText('Normal')).toBeVisible();
    expect(within(panel).getByText('Não é necessário escalar')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /VOLTAR À VISÃO GERAL/ }));
    await user.click(screen.getByRole('button', { name: /Prontidão e humor/ }));
    expect(within(screen.getByRole('region', { name: 'Classificação da última leitura' })).getByText('4,1 / 5 · check-in matinal · 15/11')).toBeVisible();
  });

  it('classifies the latest sleep and temperature readings on their pages', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
    expect(screen.getByRole('button', { name: /Temperatura corporal/ }).textContent).toContain('36,80');
    await user.click(screen.getByRole('button', { name: /Sono total/ }));
    const sleepPanel = screen.getByRole('region', { name: 'Classificação da última leitura' });
    expect(within(sleepPanel).getByText('7,2 h · noite do Sol 142')).toBeVisible();
    expect(within(sleepPanel).getByText('Normal')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /VOLTAR À VISÃO GERAL/ }));
    await user.click(screen.getByRole('button', { name: /Temperatura corporal/ }));
    expect(within(screen.getByRole('region', { name: 'Classificação da última leitura' })).getByText('36,80 °C · repouso · 23:00')).toBeVisible();
  });

  it('shows systolic and diastolic bars on the blood pressure page', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
    await user.click(screen.getByRole('button', { name: /Pressão arterial/ }));
    expect(window.location.pathname).toBe('/pt-br/highlights/biomarkers/blood-pressure');
    expect(screen.getByRole('heading', { name: 'Pressão arterial', level: 1 })).toBeVisible();
    expect(screen.getByText('Diastólica')).toBeVisible();
    expect(screen.getByText('122/79')).toBeVisible();
    await user.click(screen.getByRole('tab', { name: '7d' }));
    expect(screen.getByText('114/74')).toBeVisible();
  });

  it('labels each glucose reading with its meal context', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
    await user.click(screen.getByRole('button', { name: /Glicemia/ }));
    expect(screen.getByRole('heading', { name: 'Glicemia', level: 1 })).toBeVisible();
    expect(screen.getByText('14:00 · 2 h pós-refeição')).toBeVisible();
    expect(screen.getByText(/100 mg\/dL · início da glicemia de jejum alterada/)).toBeVisible();
  });

  it('shows the mood page with only the weekly check-in view', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
    await user.click(screen.getByRole('button', { name: /Prontidão e humor/ }));
    expect(screen.getByRole('heading', { name: 'Humor e bem-estar', level: 1 })).toBeVisible();
    expect(screen.queryByRole('tab', { name: '24h' })).not.toBeInTheDocument();
    expect(screen.getByText('≥ 3,4')).toBeVisible();
    expect(screen.getByText('15/11')).toBeVisible();
  });

  it('saves the glucose context and shows the logged classification in highlights and exam logs', async () => {
    const user = userEvent.setup(); render(<App />);
    try {
      await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
      await user.click(screen.getByRole('button', { name: 'Registrar resultado do exame' }));
      const dialog = screen.getByRole('dialog', { name: /GLICEMIA CAPILAR/ });
      await user.type(within(dialog).getByLabelText('Valor de glicemia'), '62');
      await user.click(within(dialog).getByRole('button', { name: /Post-Meal/ }));
      await user.click(within(dialog).getByRole('button', { name: /Salvar e atualizar/ }));
      const card = await screen.findByRole('button', { name: /Glicemia.*Registrado/ }, { timeout: 2000 });
      expect(card.textContent).toContain('62');
      expect(card.textContent).toContain('pós-refeição');
      expect(card.textContent).toContain('Hipoglicemia nível 1');
      await user.click(screen.getByRole('menuitem', { name: 'Registros de exames' }));
      expect(screen.getByRole('heading', { name: 'Glicemia pós-refeição' })).toBeVisible();
      expect(screen.getByText('Hipoglicemia nível 1')).toBeVisible();
      await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
      await user.click(screen.getByRole('button', { name: /Glicemia.*Registrado/ }));
      const panel = screen.getByRole('region', { name: 'Classificação da última leitura' });
      expect(within(panel).getByText(/62 mg\/dL · pós-refeição · registro manual/)).toBeVisible();
      expect(within(panel).getByText('Atenção')).toBeVisible();
    } finally {
      localStorage.removeItem('pulse-health-glucose-result');
    }
  });

  it('shows the same demo values in the highlights cards and the correlation alert', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
    expect(screen.getByRole('button', { name: /Sono total/ }).textContent).toContain('7,2');
    expect(screen.getByRole('button', { name: /Glicemia/ }).textContent).toContain('82');
    await user.click(screen.getByRole('button', { name: 'Ver evidências e limites' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('82 mg/dL')).toBeVisible();
    expect(within(dialog).getByText('7,2 h')).toBeVisible();
  });

  it('keeps the selected mission across pages', async () => {
    const user = userEvent.setup(); render(<App />);
    try {
      await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
      await user.click(screen.getByRole('tab', { name: /Base Lunar/ }));
      expect(screen.getByText(/Gravidade: 0,16g/)).toBeVisible();
      await user.click(screen.getByRole('button', { name: /Frequência cardíaca/ }));
      expect(screen.getByRole('tab', { name: /Base Lunar/ })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText(/Gravidade: 0,16g/)).toBeVisible();
    } finally {
      await user.click(screen.getByRole('tab', { name: /ISS/ }));
    }
  });

  it('opens the simulated response workflow from the header on any page', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
    await user.click(screen.getByRole('button', { name: /Pressão arterial/ }));
    await user.click(screen.getByRole('button', { name: /FLUXO DE RESPOSTA · DEMO/ }));
    const dialog = screen.getByRole('dialog', { name: /FLUXO DE RESPOSTA · ALERTA DEMONSTRATIVO/ });
    expect(within(dialog).getByText(/Nenhum alerta foi transmitido/)).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('lists the assumed sensors as not connected and opens their signals', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
    await user.click(screen.getByRole('menuitem', { name: 'Wearables e sensores' }));
    expect(window.location.pathname).toBe('/pt-br/sensors');
    expect(screen.getByRole('heading', { name: 'Wearables e sensores', level: 1 })).toBeVisible();
    expect(screen.getAllByText('Não conectado · dados sintéticos')).toHaveLength(6);
    await user.click(screen.getByRole('button', { name: /Abrir sinal: Glicosímetro/ }));
    expect(screen.getByRole('heading', { name: 'Glicemia', level: 1 })).toBeVisible();
  });

  it('saves the check-in score and shows it in highlights, activity history and the mood page', async () => {
    const user = userEvent.setup(); render(<App />);
    try {
      await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
      await user.click(screen.getByRole('button', { name: 'Iniciar check-in' }));
      const dialog = screen.getByRole('dialog', { name: 'CHECK-IN MATINAL' });
      const groups = within(dialog).getAllByRole('group');
      await user.click(within(groups[0]).getByRole('button', { name: '2' }));
      await user.click(within(groups[1]).getByRole('button', { name: '8' }));
      await user.click(within(groups[2]).getByRole('button', { name: '2' }));
      await user.click(within(groups[3]).getByRole('button', { name: 'Não restaurador' }));
      await user.click(within(dialog).getByRole('button', { name: 'Concluir check-in' }));
      expect(screen.getByRole('button', { name: /Prontidão e humor.*Registrado/ }).textContent).toContain('1,6');
      await user.click(screen.getByRole('menuitem', { name: 'Histórico de atividades' }));
      expect(screen.getByText('Score composto 1,6 / 5,0')).toBeVisible();
      await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
      await user.click(screen.getByRole('button', { name: /Prontidão e humor/ }));
      expect(within(screen.getByRole('region', { name: 'Classificação da última leitura' })).getByText('1,6 / 5 · check-in de hoje · 15/11')).toBeVisible();
    } finally {
      for (const key of ['pulse-health-readiness-score', 'pulse-health-readiness-completed', 'pulse-health-readiness-completed-at']) localStorage.removeItem(key);
    }
  });

  it('classifies a logged glucose result with the vitals layer and its meal context', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Visão geral' }));
    await user.click(screen.getByRole('button', { name: 'Registrar resultado do exame' }));
    const dialog = screen.getByRole('dialog', { name: /REGISTRAR RESULTADO/ });
    const input = within(dialog).getByLabelText('Valor de glicemia');
    const save = within(dialog).getByRole('button', { name: /Salvar e atualizar/ });
    expect(save).toBeDisabled();
    await user.type(input, '62');
    expect(within(dialog).getByText('Hipoglicemia nível 1')).toBeVisible();
    expect(within(dialog).getByText(/regra 15-15/)).toBeVisible();
    await user.clear(input); await user.type(input, '128');
    expect(within(dialog).getByText('Glicemia de jejum na faixa diagnóstica de diabetes')).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: /Post-Meal/ }));
    expect(within(dialog).getByText('Normal')).toBeVisible();
    await user.clear(input); await user.type(input, '900');
    expect(save).toBeDisabled();
  });
  it('shows the temperature context and illustrative atlas only when selected', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('button', { name: 'T01 Temperatura corporal central' }));
    expect(within(inspector()).getByText('37,4')).toBeVisible();
    expect(within(inspector()).getByText(/não há série temporal de temperatura/i)).toBeVisible();
    expect(screen.getByText(/Cor uniforme ilustrativa/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'D06 Score ambiental SEP' }));
    expect(screen.queryByText(/Cor uniforme ilustrativa/)).not.toBeInTheDocument();
  });
  it('exposes a source, units and synthetic nature before any interaction', () => {
    render(<App />);
    const score = screen.getByRole('button', { name: 'D06 Score ambiental SEP' });
    expect(within(score).getByText('44')).toBeVisible();
    expect(within(score).getByText('/100')).toBeVisible();
    expect(within(score).getByText('DONKI')).toBeVisible();
    expect(within(score).getByText('05/11, 14:00 UTC')).toBeVisible();
    expect(within(score).getByText(/sem calibração probabilística/)).toBeVisible();
    expect(screen.getByText('DADOS SINTÉTICOS')).toBeVisible();
  });
  it('keeps high-energy detection separate from missing measured dose', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.selectOptions(screen.getByLabelText('Cenário de demonstração'), 'high-energy');
    await user.click(screen.getByRole('button', { name: 'R01 Dose B' }));
    expect(within(inspector()).getByRole('heading', { name: 'Dose B' })).toBeVisible();
    expect(within(inspector()).getAllByText('Sem dado').length).toBeGreaterThan(0);
    expect(within(inspector()).getByText('—')).toBeVisible();
    expect(within(inspector()).getByText(/Alta energia sozinha não permite estimar a dose/)).toBeVisible();
  });
  it('opens the glucose reading with its classification in the hypoglycemia scenario', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.selectOptions(screen.getByLabelText('Cenário de demonstração'), 'hypoglycemia');
    expect(within(inspector()).getByRole('heading', { name: 'Glicemia' })).toBeVisible();
    expect(within(inspector()).getByText('48')).toBeVisible();
    expect(within(inspector()).getByText('Crítico', { exact: true })).toBeVisible();
    expect(within(inspector()).getByText(/Hipoglicemia nível 2/)).toBeVisible();
    expect(within(inspector()).getByText('Informar o flight surgeon')).toBeVisible();
    expect(within(inspector()).getByText('Repita em 15 minutos.')).toBeVisible();
    expect(within(inspector()).getByRole('link', { name: /Glycemic Goals and Hypoglycemia/ })).toHaveAttribute('href', expect.stringContaining('pubmed'));
    expect(within(inspector()).getByText(/regra 15-15 da ADA orienta/)).toBeVisible();
  });
  it('explains that mood is only compared with the personal pattern', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.selectOptions(screen.getByLabelText('Cenário de demonstração'), 'sleep-debt');
    await user.click(screen.getByRole('button', { name: 'Todos os sinais' }));
    await user.click(screen.getByRole('button', { name: 'V04 Humor e bem-estar' }));
    expect(within(inspector()).getByText(/Bem-estar persistentemente abaixo do padrão pessoal/)).toBeVisible();
    expect(within(inspector()).getByText(/não um instrumento psicométrico validado/)).toBeVisible();
  });
  it('renders critical scenario with protocol, units and visible uncertainty', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.selectOptions(screen.getByLabelText('Cenário de demonstração'), 'critical');
    expect(within(inspector()).getByText('100')).toBeVisible();
    expect(within(inspector()).getByText('Crítico', { exact: true })).toBeVisible();
    expect(within(inspector()).getByText(/Priorizar o protocolo aprovado/)).toBeVisible();
    expect(within(inspector()).getByText('Pesos demonstrativos; sem calibração probabilística')).toBeVisible();
  });
  it('exposes all 30 indicators and blocks unvalidated total dose', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Todos os biomarcadores' }));
    expect(document.querySelectorAll('.catalog-grid .indicator-card')).toHaveLength(30);
    await user.type(screen.getByLabelText('Filtrar indicadores'), 'R03');
    expect(document.querySelectorAll('.catalog-grid .indicator-card')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'R03 Dose física total' }));
    expect(within(inspector()).getByText('—')).toBeVisible();
    expect(within(inspector()).getByText(/B \+ E bloqueada|Canais B\/E não validados|complementaridade/i)).toBeVisible();
  });
  it('connects a real HRA identifier search to hierarchy and provenance', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.type(screen.getByLabelText('Buscar estrutura ou indicador'), 'UBERON:0000948');
    const results = screen.getByRole('region', { name: 'Resultados da busca' });
    await user.click(within(results).getByRole('button', { name: /Coração/ }));
    expect(within(inspector()).getByRole('heading', { name: 'Coração' })).toBeVisible();
    expect(within(inspector()).getByText('CC BY 4.0')).toBeVisible();
    expect(within(inspector()).getByText('UBERON:0000948')).toBeVisible();
    expect(within(inspector()).getByText('Geometria real de referência')).toBeVisible();
  });
  it('isolates, hides, undoes and restores actual visibility state', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.type(screen.getByLabelText('Buscar estrutura ou indicador'), 'Coração');
    await user.click(within(screen.getByRole('region', { name: 'Resultados da busca' })).getByRole('button', { name: /Coração/ }));
    await user.click(screen.getByRole('button', { name: 'Isolar Coração' }));
    expect(screen.getByText('1 estruturas visíveis')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Ocultar estrutura selecionada Coração' }));
    expect(screen.getByText('45 estruturas visíveis')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Desfazer alteração do atlas' }));
    expect(screen.getByText('1 estruturas visíveis')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Restaurar atlas' }));
    expect(screen.getByText('46 estruturas visíveis')).toBeVisible();
  });
  it('leaves isolation when a global indicator is selected', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.type(screen.getByLabelText('Buscar estrutura ou indicador'), 'Coração');
    await user.click(within(screen.getByRole('region', { name: 'Resultados da busca' })).getByRole('button', { name: /Coração/ }));
    await user.click(screen.getByRole('button', { name: 'Isolar Coração' }));
    await user.click(screen.getByRole('button', { name: 'R01 Dose B' }));
    expect(screen.getByText('46 estruturas visíveis')).toBeVisible();
    expect(screen.getByText('Exposição medida no ponto do dosímetro; não é dose específica do órgão.')).toBeVisible();
  });
  it('changes clipping and allows undo without discarding the selected structure', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('button', { name: 'Cortes de visualização' }));
    await user.selectOptions(screen.getByLabelText('Plano de corte'), 'axial');
    expect(screen.getByLabelText('Posição do corte')).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Desfazer alteração do atlas' }));
    expect(screen.getByLabelText('Plano de corte')).toHaveValue('none');
    expect(screen.getByText(/Não são tomografia/)).toBeVisible();
  });
  it('offers a textual time-aligned series and changes the temporal window', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('button', { name: 'Ver tabela da linha do tempo' }));
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(14);
    await user.selectOptions(screen.getByLabelText('Janela temporal'), '48');
    expect(within(table).getAllByRole('row')).toHaveLength(26);
    await user.click(screen.getByRole('button', { name: 'Coleta de biomarcadores, 20:00 UTC' }));
    expect(within(inspector()).getByRole('heading', { name: 'Dano de DNA' })).toBeVisible();
    expect(within(inspector()).getByText('Baseline individual')).toBeVisible();
  });
  it('completes the five-step narrative without inventing a correlation', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('button', { name: 'Exploração guiada' }));
    for (let i = 0; i < 4; i++) await user.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(within(inspector()).getByText('Correlação não implica causalidade')).toBeVisible();
    expect(within(inspector()).getByText(/n = 0 pares válidos/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(screen.queryByText('EXPLORAÇÃO GUIADA')).not.toBeInTheDocument();
  });
  it('discloses source licensing and limitations in a dismissible dialog', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('menuitem', { name: 'Sobre os dados' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('link', { name: 'Creative Commons Attribution 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
    expect(within(dialog).getByText(/Não há estômago ou malhas celulares/)).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Fechar diálogo' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
