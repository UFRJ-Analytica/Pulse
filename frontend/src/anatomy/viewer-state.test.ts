import { describe, expect, it } from 'vitest';
import { initialAtlasState, packAnatomy, structureVisible, toggleMember } from './viewer-state';
import { anatomyNodes } from './catalog';

describe('atlas geometry interaction model', () => {
  it('packs a stress fixture without projected overlap at full separation', () => {
    const items = Array.from({ length: 80 }, (_, index) => ({ id: String(index), width: .02 + (index % 7) * .04, height: .03 + (index % 13) * .05 }));
    const layout = packAnatomy(items, .55);
    expect(layout.cells.size).toBe(80);
    const cells = [...layout.cells.values()];
    cells.forEach((a, index) => cells.slice(index + 1).forEach((b) => {
      const overlapX = Math.abs(a.x - b.x) < (a.width + b.width) / 2 - 1e-9;
      const overlapY = Math.abs(a.y - b.y) < (a.height + b.height) / 2 - 1e-9;
      expect(overlapX && overlapY).toBe(false);
    }));
  });
  it('separates all 46 real HRA group bounds without overlap in the frontal layout', () => {
    const meshes = anatomyNodes.filter(node => node.kind === 'mesh' && node.bounds);
    expect(meshes).toHaveLength(46);
    for (const aspect of [.55, 1, 1.8]) {
      const { cells } = packAnatomy(meshes.map(node => ({ id: node.id, width: node.bounds![1][0] - node.bounds![0][0], height: node.bounds![1][1] - node.bounds![0][1] })), aspect);
      const boxes = [...cells.values()];
      boxes.forEach((a, i) => boxes.slice(i + 1).forEach(b => {
        expect(Math.abs(a.x - b.x) < (a.width + b.width) / 2 - 1e-9 && Math.abs(a.y - b.y) < (a.height + b.height) / 2 - 1e-9).toBe(false);
      }));
    }
  });
  it('respects per-structure and system visibility, including isolation', () => {
    expect(structureVisible('kidney', 'urinary', initialAtlasState, null)).toBe(true);
    expect(structureVisible('kidney', 'urinary', { ...initialAtlasState, hidden: ['kidney'] }, 'kidney')).toBe(false);
    expect(structureVisible('kidney', 'urinary', { ...initialAtlasState, hiddenSystems: ['urinary'] }, 'kidney')).toBe(false);
    expect(structureVisible('kidney', 'urinary', { ...initialAtlasState, isolate: true }, 'heart')).toBe(false);
    expect(structureVisible('kidney', 'urinary', { ...initialAtlasState, isolate: true }, 'kidney')).toBe(true);
  });
  it('toggles visibility without mutating history snapshots', () => {
    const before = ['a']; const after = toggleMember(before, 'b');
    expect(before).toEqual(['a']); expect(after).toEqual(['a', 'b']);
    expect(toggleMember(after, 'a')).toEqual(['b']);
  });
});
