import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Box, Camera, Check, ChevronRight, Download, Eye, EyeOff, Focus, Layers3, Maximize, Minus, Pause, Play, Plus, RotateCcw, ScanLine, Search, SlidersHorizontal, Undo2, X } from 'lucide-react';
import { anatomyNodes, anatomySystems } from '../anatomy/catalog';
import { initialAtlasState, structureVisible, toggleMember, type AtlasCamera, type AtlasMaterial, type AtlasViewState, type ClipAxis } from '../anatomy/viewer-state';
import { AnatomyScene, type AtlasCommand } from './AnatomyScene';
import { useLocale, tx } from '../i18n/locale-context';
import { localizeState } from '../data/localization';
import './atlas.css';

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
  focusSystem?: string | null;
  globalExposure?: boolean;
  temperature?: number | null;
  guidedStep?: number;
  className?: string;
}
type Panel = 'layers' | 'camera' | 'material' | 'clipping' | null;
const cameraOptions: { id: AtlasCamera; label: string; en: string }[] = [{ id: 'front', label: 'Frontal', en: 'Anterior' }, { id: 'back', label: 'Posterior', en: 'Posterior' }, { id: 'side', label: 'Lateral', en: 'Lateral' }, { id: 'top', label: 'Superior', en: 'Superior' }, { id: 'bottom', label: 'Inferior', en: 'Inferior' }];
const materialOptions: { id: AtlasMaterial; label: string; hint: string; en: string; hintEn: string }[] = [{ id: 'anatomical', label: 'Anatômico', hint: 'Cores por estrutura', en: 'Anatomical', hintEn: 'Colors by structure' }, { id: 'porcelain', label: 'Porcelana', hint: 'Leitura da morfologia', en: 'Porcelain', hintEn: 'Morphology view' }, { id: 'wireframe', label: 'Wireframe', hint: 'Triângulos da malha', en: 'Wireframe', hintEn: 'Mesh triangles' }, { id: 'transparent', label: 'Transparente', hint: 'Revela camadas internas', en: 'Transparent', hintEn: 'Reveal inner layers' }, { id: 'highlight', label: 'Destaque', hint: 'Foco na seleção', en: 'Highlight', hintEn: 'Focus on selection' }];
const meshNodes = anatomyNodes.filter((node) => node.kind === 'mesh');
const systemLabelsEn: Record<string, string> = { integumentary: 'Integumentary system', skeletal: 'Skeletal system', muscular: 'Muscular system', nervous: 'Nervous system', cardiovascular: 'Cardiovascular system', respiratory: 'Respiratory system', digestive: 'Digestive system', urinary: 'Urinary system', lymphatic: 'Lymphatic system', reproductive: 'Reproductive system' };

export function AtlasViewer({ selectedId, onSelect, focusSystem, globalExposure = false, temperature = null, guidedStep, className = '' }: Props) {
  const locale = useLocale();
  const english = locale === 'en';
  const rootRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<AtlasViewState>(initialAtlasState);
  const [history, setHistory] = useState<AtlasViewState[]>([]);
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState('');
  const [command, setCommand] = useState<AtlasCommand | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [assemblePlaying, setAssemblePlaying] = useState(false);
  const selected = meshNodes.find((node) => node.id === selectedId);
  const selectedSystem = anatomySystems.find((system) => system.id === selected?.system);
  const visibleCount = meshNodes.filter((node) => structureVisible(node.id, node.system, state, selectedId)).length;
  const change = (patch: Partial<AtlasViewState>) => {
    setHistory((items) => [...items.slice(-29), state]);
    setState((current) => ({ ...current, ...patch }));
  };
  const act = (kind: AtlasCommand['kind']) => setCommand((current) => ({ kind, revision: (current?.revision ?? 0) + 1 }));
  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setState(previous); setHistory((items) => items.slice(0, -1)); setFeedback(tx(locale, 'Última ação desfeita.', 'Last action undone.'));
  };
  const reset = () => { setAssemblePlaying(false); change({ ...initialAtlasState, cameraRevision: state.cameraRevision + 1 }); setPanel(null); setFeedback(tx(locale, 'Visão frontal restaurada. Todas as estruturas estão visíveis.', 'Front view restored. All structures are visible.')); };
  useEffect(() => {
    if (!assemblePlaying) return;
    const timer = window.setInterval(() => setState(current => ({ ...current, isolate: false, explode: current.explode > .5 ? 0 : 1 })), 3600);
    return () => window.clearInterval(timer);
  }, [assemblePlaying]);
  useEffect(() => {
    if (!selectedId) {
      setState((current) => ({ ...current, isolate: false, ...(focusSystem ? { hiddenSystems: current.hiddenSystems.filter((id) => !focusSystem.split(',').includes(id)) } : {}) }));
      return;
    }
    const node = meshNodes.find((item) => item.id === selectedId);
    if (!node) return;
    setState((current) => ({ ...current, hidden: current.hidden.filter((id) => id !== selectedId), hiddenSystems: current.hiddenSystems.filter((id) => id !== node.system) }));
  }, [selectedId, focusSystem]);
  useEffect(() => {
    if (guidedStep === undefined) return;
    setState((current) => ({ ...current, isolate: false, explode: 0, hidden: [], hiddenSystems: [], material: guidedStep === 3 ? 'highlight' : 'anatomical' }));
  }, [guidedStep]);
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLButtonElement) return;
    const map: Record<string, AtlasCommand['kind']> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'zoomIn', '=': 'zoomIn', '-': 'zoomOut' };
    if (event.altKey && event.key.startsWith('Arrow')) { const pan: Record<string, AtlasCommand['kind']> = { ArrowLeft: 'panLeft', ArrowRight: 'panRight', ArrowUp: 'panUp', ArrowDown: 'panDown' }; event.preventDefault(); act(pan[event.key]); return; }
    if (map[event.key]) { event.preventDefault(); act(map[event.key]); }
    if (event.key === 'Home') { event.preventDefault(); reset(); }
    if (event.key === 'Escape') setPanel(null);
    if (event.key.toLowerCase() === 'i' && selected) { event.preventDefault(); change({ isolate: !state.isolate }); }
    if (event.key.toLowerCase() === 'h' && selected) { event.preventDefault(); change({ hidden: toggleMember(state.hidden, selected.id), isolate: false }); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(); }
  };
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await rootRef.current?.requestFullscreen();
    } catch { setFeedback(tx(locale, 'Tela cheia indisponível neste navegador. A exploração permanece ativa.', 'Fullscreen is unavailable in this browser. Exploration remains active.')); }
  };
  const openPanel = (next: Panel) => setPanel((current) => current === next ? null : next);
  const matching = meshNodes.filter((node) => `${node.name} ${node.sourceLabel ?? ''} ${node.id} ${node.conceptId ?? ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
  return (
    <div ref={rootRef} className={`atlas-viewer ${className}`} tabIndex={0} onKeyDown={keyboard} aria-label={tx(locale, 'Explorador anatômico. Setas giram, mais e menos aproximam, Home restaura, I isola e H oculta a seleção.', 'Anatomy explorer. Arrow keys rotate, plus and minus zoom, Home restores, I isolates, and H hides the selection.')}>
      <AnatomyScene state={state} selectedId={selectedId} focusSystem={focusSystem} globalExposure={globalExposure} temperature={temperature} command={command} onSelect={onSelect} onLoaded={setLoadedCount} onError={setError} />
      {temperature !== null && <div className="temperature-atlas-note" role="status"><strong>{tx(locale, 'Temperatura central', 'Core temperature')} · {temperature.toLocaleString(english ? 'en-US' : 'pt-BR')} °C</strong><span>{tx(locale, 'Cor uniforme ilustrativa · não é mapa térmico por órgão', 'Uniform illustrative color · not an organ-level heat map')}</span><span>{tx(locale, 'Escala visual: 35 °C — 40 °C · dados simulados', 'Visual scale: 35 °C — 40 °C · simulated data')}</span></div>}
      <div className="atlas-topline">
        <div><span className="atlas-eyebrow">{tx(locale, 'ATLAS ANATÔMICO', 'ANATOMY ATLAS')}</span><div className="atlas-breadcrumb"><button onClick={reset}>{tx(locale, 'Corpo humano', 'Human body')}</button>{selectedSystem && <><ChevronRight size={11} /><button onClick={() => { change({ isolate: false, hidden: [], hiddenSystems: anatomySystems.filter((system) => system.id !== selected?.system).map((system) => system.id) }); }}>{english ? systemLabelsEn[selectedSystem.id] : selectedSystem.name}</button></>}{selected && <><ChevronRight size={11} /><span>{english ? selected.sourceLabel ?? selected.name : selected.name}</span></>}</div></div>
        <span className="atlas-source-chip"><span /> HRA · 3D</span>
      </div>
      <div className="atlas-view-label"><span className="atlas-view-dot" />{state.isolate ? tx(locale, 'ESTRUTURA ISOLADA', 'ISOLATED STRUCTURE') : state.explode > .1 ? tx(locale, 'EXPLORAÇÃO DE ESTRUTURAS', 'STRUCTURE EXPLORATION') : (cameraOptions.find((view) => view.id === state.camera)?.[english ? 'en' : 'label'] ?? '').toUpperCase()}<span>{tx(locale, 'REFERÊNCIA ANATÔMICA', 'ANATOMICAL REFERENCE')}</span></div>
      <div className="atlas-orientation" aria-hidden="true"><span className="atlas-axis-y">S</span><span className="atlas-axis-x">{english ? 'R' : 'D'}</span><span className="atlas-axis-z">A</span><i /></div>
      <div className="atlas-toolbar" role="toolbar" aria-label={tx(locale, 'Ferramentas do atlas', 'Atlas tools')}>
        <button aria-label={tx(locale, 'Camadas e estruturas', 'Layers and structures')} title={tx(locale, 'Camadas e estruturas', 'Layers and structures')} aria-expanded={panel === 'layers'} className={panel === 'layers' ? 'is-active' : ''} onClick={() => openPanel('layers')}><Layers3 size={17} /></button>
        <button aria-label={tx(locale, 'Presets de câmera', 'Camera presets')} title={tx(locale, 'Presets de câmera', 'Camera presets')} aria-expanded={panel === 'camera'} className={panel === 'camera' ? 'is-active' : ''} onClick={() => openPanel('camera')}><Camera size={17} /></button>
        <button aria-label={tx(locale, 'Materiais e aparência', 'Materials and appearance')} title={tx(locale, 'Materiais e aparência', 'Materials and appearance')} aria-expanded={panel === 'material'} className={panel === 'material' ? 'is-active' : ''} onClick={() => openPanel('material')}><SlidersHorizontal size={17} /></button>
        <button aria-label={tx(locale, 'Cortes de visualização', 'Clipping planes')} title={tx(locale, 'Cortes de visualização', 'Clipping planes')} aria-expanded={panel === 'clipping'} className={panel === 'clipping' || state.clip !== 'none' ? 'is-active' : ''} onClick={() => openPanel('clipping')}><ScanLine size={17} /></button>
        <span />
        <button aria-label={tx(locale, 'Aproximar', 'Zoom in')} title={tx(locale, 'Aproximar (+)', 'Zoom in (+)')} onClick={() => act('zoomIn')}><Plus size={18} /></button>
        <button aria-label={tx(locale, 'Afastar', 'Zoom out')} title={tx(locale, 'Afastar (−)', 'Zoom out (−)')} onClick={() => act('zoomOut')}><Minus size={18} /></button>
        <button aria-label={tx(locale, 'Enquadrar estrutura selecionada', 'Frame selected structure')} title={tx(locale, 'Enquadrar seleção', 'Frame selection')} disabled={!selected} onClick={() => act('focus')}><Focus size={17} /></button>
        <span />
        <button aria-label={tx(locale, 'Desfazer alteração do atlas', 'Undo atlas change')} title={tx(locale, 'Desfazer', 'Undo')} disabled={!history.length} onClick={undo}><Undo2 size={17} /></button>
        <button aria-label={tx(locale, 'Restaurar atlas', 'Reset atlas')} title={tx(locale, 'Restaurar atlas (Home)', 'Reset atlas (Home)')} onClick={reset}><RotateCcw size={16} /></button>
        <button aria-label={tx(locale, 'Abrir atlas em tela cheia', 'Open atlas fullscreen')} title={tx(locale, 'Tela cheia', 'Fullscreen')} onClick={() => void fullscreen()}><Maximize size={16} /></button>
        <button aria-label={tx(locale, 'Exportar atlas como PNG', 'Export atlas as PNG')} title={tx(locale, 'Exportar PNG', 'Export PNG')} disabled={!loadedCount} onClick={() => { act('export'); setFeedback(tx(locale, 'Imagem PNG exportada. Fonte: Human Reference Atlas v1.5, CC BY 4.0.', 'PNG image exported. Source: Human Reference Atlas v1.5, CC BY 4.0.')); }}><Download size={17} /></button>
      </div>
      {panel && <div className="atlas-popover" aria-label={panel === 'layers' ? tx(locale, 'Camadas anatômicas', 'Anatomical layers') : panel === 'camera' ? tx(locale, 'Controle de câmera', 'Camera controls') : panel === 'material' ? tx(locale, 'Aparência', 'Appearance') : tx(locale, 'Cortes de visualização', 'Clipping planes')}>
        <div className="atlas-popover-heading"><strong>{panel === 'layers' ? tx(locale, 'Camadas anatômicas', 'Anatomical layers') : panel === 'camera' ? tx(locale, 'Controle de câmera', 'Camera controls') : panel === 'material' ? tx(locale, 'Aparência do atlas', 'Atlas appearance') : tx(locale, 'Cortes de visualização', 'Clipping planes')}</strong><button aria-label={tx(locale, 'Fechar controles', 'Close controls')} onClick={() => setPanel(null)}><X size={16} /></button></div>
        {panel === 'layers' && <>
          <label className="atlas-search"><Search size={14} /><input aria-label={tx(locale, 'Buscar estrutura anatômica', 'Search anatomical structure')} placeholder={tx(locale, 'Nome ou identificador…', 'Name or identifier…')} value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="atlas-quick-layers"><button onClick={() => change({ hiddenSystems: ['integumentary', 'skeletal', 'muscular'], hidden: [], isolate: false })}>{tx(locale, 'Somente órgãos', 'Organs only')}</button><button disabled title={tx(locale, 'Nenhuma geometria celular está disponível neste conjunto HRA', 'No cell geometry is available in this HRA dataset')}>{tx(locale, 'Tecidos / células · sem malha', 'Tissues / cells · no mesh')}</button></div>
          <div className="atlas-layers-list">
            {anatomySystems.map((system) => {
              const children = matching.filter((node) => node.system === system.id);
              if (query && !children.length) return null;
              return <details key={system.id} open={query ? true : undefined}>
                <summary><span className="atlas-system-swatch" style={{ background: system.color }} /><span>{english ? systemLabelsEn[system.id] : system.name}</span><small>{children.length}</small><input type="checkbox" aria-label={`${tx(locale, 'Mostrar sistema', 'Show system')} ${english ? systemLabelsEn[system.id] : system.name}`} checked={!state.hiddenSystems.includes(system.id)} onClick={(event) => event.stopPropagation()} onChange={() => change({ hiddenSystems: toggleMember(state.hiddenSystems, system.id) })} /></summary>
                {children.length ? children.map((node) => <div className={`atlas-tree-row ${selectedId === node.id ? 'is-selected' : ''}`} key={node.id}><button onClick={() => onSelect(node.id)} title={english ? node.sourceLabel ?? node.name : node.name}><span>{english ? (node.sourceLabel ?? node.name) : node.name}</span><small>{tx(locale, 'Estrutura anatômica · malha 3D', 'Anatomical structure · 3D mesh')}</small></button><button aria-label={`${state.hidden.includes(node.id) ? tx(locale, 'Mostrar', 'Show') : tx(locale, 'Ocultar', 'Hide')} ${english ? (node.sourceLabel ?? node.name) : node.name}`} aria-pressed={!state.hidden.includes(node.id)} onClick={() => change({ hidden: toggleMember(state.hidden, node.id) })}>{state.hidden.includes(node.id) ? <EyeOff size={13} /> : <Eye size={13} />}</button></div>) : <p className="atlas-muted">{tx(locale, 'Sem malha disponível nesta referência.', 'No mesh is available in this reference.')}</p>}
              </details>;
            })}
            {!matching.length && <p className="atlas-muted">{tx(locale, 'Nenhuma estrutura encontrada.', 'No structures found.')}</p>}
          </div>
          <p className="atlas-muted">{tx(locale, 'Hierarquia: corpo → sistema → órgão/estrutura. Não há camada celular neste conjunto. Esqueleto e músculos têm cobertura parcial.', 'Hierarchy: body → system → organ/structure. This dataset has no cellular layer. Skeletal and muscular coverage is partial.')}</p>
          <button className="atlas-text-action" onClick={() => change({ hidden: [], hiddenSystems: [], isolate: false })}><RotateCcw size={13} /> {tx(locale, 'Restaurar todas as estruturas', 'Show all structures')}</button>
        </>}
        {panel === 'camera' && <>
          <p className="atlas-muted">{tx(locale, 'Arraste para girar. Botão direito ou Alt + setas para deslocar. Roda ou pinça para aproximar.', 'Drag to rotate. Right-click or Alt + arrow keys to pan. Scroll or pinch to zoom.')}</p>
          <div className="atlas-camera-options">{cameraOptions.map((view) => <button key={view.id} className={state.camera === view.id ? 'is-active' : ''} onClick={() => change({ camera: view.id, cameraRevision: state.cameraRevision + 1 })}>{view[english ? 'en' : 'label']}</button>)}<button disabled={!selected} onClick={() => act('focus')}>{tx(locale, 'Foco anatômico', 'Anatomical focus')}</button></div>
          <div className="atlas-orbit-buttons"><button aria-label="Girar para esquerda" onClick={() => act('left')}><ArrowLeft size={17} /></button><button aria-label="Girar para cima" onClick={() => act('up')}><ArrowUp size={17} /></button><button aria-label="Girar para baixo" onClick={() => act('down')}><ArrowDown size={17} /></button><button aria-label="Girar para direita" onClick={() => act('right')}><ArrowRight size={17} /></button></div>
          <label className="atlas-switch"><span>{tx(locale, 'Rotação de apresentação', 'Auto-rotation')}</span><input type="checkbox" checked={state.rotate} onChange={() => change({ rotate: !state.rotate })} /></label>
          <p className="atlas-muted">{tx(locale, 'Escala de exibição normalizada: 1,75 unidade de altura. Não utilizar para medir pacientes.', 'Normalized display scale: 1.75 height units. Do not use to measure patients.')}</p>
        </>}
        {panel === 'material' && <>
          <div className="atlas-material-options">{materialOptions.map((material) => <button key={material.id} className={state.material === material.id ? 'is-active' : ''} onClick={() => change({ material: material.id })}><span><strong>{english ? material.en : material.label}</strong><small>{english ? material.hintEn : material.hint}</small></span>{state.material === material.id && <Check size={15} />}</button>)}</div>
          <label className="atlas-switch"><span>{tx(locale, 'Rótulos anatômicos', 'Anatomical labels')}</span><input type="checkbox" checked={state.labels} onChange={() => change({ labels: !state.labels })} /></label>
          <label className="atlas-switch"><span>{tx(locale, 'Animação montar / separar', 'Assemble / disassemble animation')}</span><input type="checkbox" checked={assemblePlaying} onChange={() => { setAssemblePlaying(!assemblePlaying); if (!assemblePlaying) change({ explode: 1, isolate: false }); }} /></label>
          <label className="atlas-field">{tx(locale, 'Separação das estruturas', 'Structure separation')} <span>{Math.round(state.explode * 100)}%</span><input aria-label={tx(locale, 'Animação montar/desmontar', 'Assemble/disassemble animation')} type="range" min="0" max="1" step="0.01" value={state.explode} onChange={event => { setAssemblePlaying(false); change({ explode: Number(event.target.value), isolate: false }); }} /></label>
          <p className="atlas-muted">{tx(locale, 'Cores identificam estruturas. Não representam dose, dano ou diagnóstico.', 'Colors identify structures. They do not represent dose, damage, or diagnosis.')}</p>
        </>}
        {panel === 'clipping' && <>
          <p className="atlas-cut-warning">{tx(locale, 'Cortes abertos de visualização. Não são tomografia nem imagem médica.', 'Visual clipping only. These are not tomography or medical images.')}</p>
          <label className="atlas-field">{tx(locale, 'Plano', 'Plane')}<select aria-label={tx(locale, 'Plano de corte', 'Clipping plane')} value={state.clip} onChange={(event) => change({ clip: event.target.value as ClipAxis })}><option value="none">{tx(locale, 'Sem corte', 'None')}</option><option value="axial">{tx(locale, 'Axial · horizontal', 'Axial · horizontal')}</option><option value="sagittal">{tx(locale, 'Sagital · esquerda/direita', 'Sagittal · left/right')}</option><option value="coronal">{tx(locale, 'Coronal · frente/trás', 'Coronal · front/back')}</option></select></label>
          <label className="atlas-field">{tx(locale, 'Posição', 'Position')} <span>{Math.round(state.clipPosition * 100)}%</span><input aria-label={tx(locale, 'Posição do corte', 'Clipping position')} type="range" min="0" max="1" step="0.01" disabled={state.clip === 'none'} value={state.clipPosition} onChange={(event) => change({ clipPosition: Number(event.target.value) })} /></label>
          <label className="atlas-switch"><span>{tx(locale, 'Inverter sentido', 'Reverse direction')}</span><input type="checkbox" checked={state.clipReverse} onChange={() => change({ clipReverse: !state.clipReverse })} disabled={state.clip === 'none'} /></label>
        </>}
      </div>}
      {!loadedCount && !error && <div className="atlas-loading" role="status"><span /><strong>{tx(locale, 'Preparando o atlas humano', 'Preparing the human atlas')}</strong><small>{tx(locale, 'Carregando geometrias reais do HRA…', 'Loading real HRA geometries…')}</small></div>}
      {error && <div className="atlas-error" role="status"><Box size={28} /><strong>{tx(locale, 'Atlas em modo de lista', 'Atlas list view')}</strong><p>{localizeState(error, locale)}</p><button onClick={() => setPanel('layers')}>{tx(locale, 'Explorar estruturas', 'Explore structures')}</button></div>}
      {selected && <div className="atlas-selected-actions"><span>{english ? (selected.sourceLabel ?? selected.name) : selected.name}</span><button aria-label={`${tx(locale, 'Isolar', 'Isolate')} ${selected.name}`} aria-pressed={state.isolate} onClick={() => change({ isolate: !state.isolate, explode: 0 })}><Focus size={13} />{state.isolate ? tx(locale, 'Ver corpo', 'View body') : tx(locale, 'Isolar', 'Isolate')}</button><button aria-label={`${tx(locale, 'Ocultar estrutura selecionada', 'Hide selected structure')} ${selected.name}`} onClick={() => change({ hidden: toggleMember(state.hidden, selected.id), isolate: false })}><EyeOff size={13} /></button></div>}
      <div className="atlas-bottom-controls">
        <div className="atlas-mode-switch" aria-label={tx(locale, 'Modo de exploração', 'Exploration mode')}><button className={!state.isolate && state.explode === 0 && state.material !== 'transparent' ? 'is-active' : ''} onClick={() => change({ isolate: false, explode: 0, material: 'anatomical', cameraRevision: state.cameraRevision + 1 })}><Box size={14} /> {tx(locale, 'Montado', 'Assembled')}</button><button disabled={!selected} className={state.isolate ? 'is-active' : ''} onClick={() => change({ isolate: true, explode: 0 })}>{tx(locale, 'Isolado', 'Isolated')}</button><button className={state.material === 'transparent' ? 'is-active' : ''} onClick={() => change({ material: state.material === 'transparent' ? 'anatomical' : 'transparent' })}>{tx(locale, 'Transparente', 'Transparent')}</button><button className={state.explode > 0 ? 'is-active' : ''} onClick={() => change({ isolate: false, explode: state.explode ? 0 : 1 })}>{tx(locale, 'Explodido', 'Exploded')}</button></div>
        {state.explode > 0 && <label className="atlas-explode-slider"><span>{tx(locale, 'Montado', 'Assembled')}</span><input aria-label={tx(locale, 'Separação das estruturas', 'Structure separation')} type="range" min="0" max="1" step="0.01" value={state.explode} onChange={(event) => change({ explode: Number(event.target.value) })} /><span>{Math.round(state.explode * 100)}%</span></label>}
        {globalExposure && <p className="atlas-exposure-note">{tx(locale, 'Exposição medida no ponto do dosímetro; não é dose específica do órgão.', 'Exposure measured at the dosimeter; it is not an organ-specific dose.')}</p>}
      </div>
      <div className="atlas-footer"><span><i />{loadedCount ? `${visibleCount} ${tx(locale, 'estruturas visíveis', 'structures visible')}` : tx(locale, 'Geometrias locais', 'Local geometries')}<span className="atlas-footer-source"> · Human Reference Atlas</span></span><button aria-label={state.rotate ? tx(locale, 'Pausar rotação automática', 'Pause auto-rotation') : tx(locale, 'Ativar rotação automática', 'Enable auto-rotation')} aria-pressed={state.rotate} onClick={() => change({ rotate: !state.rotate })}>{state.rotate ? <Pause size={12} /> : <Play size={12} />}<span>{state.rotate ? tx(locale, 'Pausar', 'Pause') : tx(locale, 'Girar', 'Rotate')}</span></button></div>
      <span className="atlas-sr-only" role="status" aria-live="polite">{feedback || (selected ? `${english ? (selected.sourceLabel ?? selected.name) : selected.name} ${tx(locale, 'selecionado.', 'selected.')} ${visibleCount} ${tx(locale, 'estruturas visíveis.', 'structures visible.')}` : `${visibleCount} ${tx(locale, 'estruturas visíveis.', 'structures visible.')}`)}</span>
    </div>
  );
}
