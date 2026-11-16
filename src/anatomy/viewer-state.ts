export type AtlasMaterial = 'anatomical' | 'porcelain' | 'wireframe' | 'transparent' | 'highlight';
export type AtlasCamera = 'front' | 'back' | 'side' | 'top' | 'bottom';
export type ClipAxis = 'none' | 'axial' | 'sagittal' | 'coronal';
export interface AtlasViewState {
  hidden: string[];
  hiddenSystems: string[];
  isolate: boolean;
  explode: number;
  material: AtlasMaterial;
  camera: AtlasCamera;
  clip: ClipAxis;
  clipPosition: number;
  clipReverse: boolean;
  labels: boolean;
  rotate: boolean;
  cameraRevision: number;
}
export const initialAtlasState: AtlasViewState = {
  hidden: [], hiddenSystems: [], isolate: false, explode: 0,
  material: 'anatomical', camera: 'front', clip: 'none', clipPosition: 0.5,
  clipReverse: false, labels: true, rotate: false, cameraRevision: 0,
};
export interface LayoutItem { id: string; width: number; height: number }
export interface LayoutCell { x: number; y: number; width: number; height: number }
/** Shelf packing gives every displayed source structure a non-overlapping cell at 100%. */
export function packAnatomy(items: LayoutItem[], aspect = 1) {
  const cards = items.map((item) => ({ ...item, width: Math.max(.045, item.width) + .055, height: Math.max(.045, item.height) + .055 }));
  const area = cards.reduce((sum, item) => sum + item.width * item.height, 0);
  const target = Math.max(.3, ...cards.map((item) => item.width), Math.sqrt(area * Math.max(.4, Math.min(2, aspect))) * 1.1);
  cards.sort((a, b) => b.height - a.height || a.id.localeCompare(b.id));
  const cells = new Map<string, LayoutCell>();
  let x = 0, y = 0, rowHeight = 0, width = 0;
  for (const item of cards) {
    if (x > 0 && x + item.width > target) { x = 0; y += rowHeight; rowHeight = 0; }
    cells.set(item.id, { x: x + item.width / 2, y: -y - item.height / 2, width: item.width, height: item.height });
    x += item.width; width = Math.max(width, x); rowHeight = Math.max(rowHeight, item.height);
  }
  const height = y + rowHeight;
  cells.forEach((cell) => { cell.x -= width / 2; cell.y += height / 2; });
  return { cells, width, height };
}
export function structureVisible(id: string, system: string, state: AtlasViewState, selectedId: string | null) {
  if (state.hidden.includes(id) || state.hiddenSystems.includes(system)) return false;
  return !state.isolate || id === selectedId;
}
export function toggleMember(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}
