// @vitest-environment node
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { anatomyNodes, anatomySystems, anatomySource, anatomyBreadcrumbs, searchAnatomy } from './catalog';

type Accessor = { bufferView: number; byteOffset?: number; componentType: number; count: number; type: string; min?: number[]; max?: number[] };
type BufferView = { byteOffset?: number; byteLength: number; byteStride?: number };
type Primitive = { attributes: { POSITION: number; NORMAL: number }; indices: number };
type Glb = { buffers: { byteLength: number }[]; bufferViews: BufferView[]; accessors: Accessor[]; meshes: { name: string; primitives: Primitive[] }[]; nodes: { name: string; mesh?: number }[] };
const bytes = readFileSync(new URL('../../public/anatomy/hra-male.glb', import.meta.url));
const jsonLength = bytes.readUInt32LE(12);
const gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString()) as Glb;
const binaryStart = 28 + jsonLength;
const binary = bytes.subarray(binaryStart);
const manifest = JSON.parse(readFileSync(new URL('../../public/anatomy/manifest.json', import.meta.url), 'utf8')) as {
  outputSHA256: string; sourceMeshCount: number; representedSourceMeshCount: number; finalTriangles: number; unassigned: string[];
  groups: { id: string; sourceStructures: { node: string; parent: string | null }[] }[];
};
const meshes = anatomyNodes.filter(node => node.kind === 'mesh');
function values(index: number): number[] {
  const a = gltf.accessors[index];
  const v = gltf.bufferViews[a.bufferView];
  const components = a.type === 'VEC3' ? 3 : 1;
  const width = a.componentType === 5123 ? 2 : 4;
  const offset = (v.byteOffset ?? 0) + (a.byteOffset ?? 0);
  const stride = v.byteStride ?? components * width;
  if (offset + (a.count - 1) * stride + components * width > binary.length) throw new Error('Accessor outside binary buffer');
  const result: number[] = [];
  for (let n = 0; n < a.count; n++) for (let axis = 0; axis < components; axis++) {
    const p = offset + n * stride + axis * width;
    result.push(a.componentType === 5126 ? binary.readFloatLE(p) : a.componentType === 5125 ? binary.readUInt32LE(p) : binary.readUInt16LE(p));
  }
  return result;
}

describe('anatomia HRA distribuída', () => {
  it('preserva uma origem explícita e a integridade do arquivo', () => {
    expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
    expect(bytes.readUInt32LE(4)).toBe(2);
    expect(bytes.readUInt32LE(8)).toBe(bytes.length);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(manifest.outputSHA256);
    expect(anatomySource.license).toBe('CC BY 4.0');
    expect(manifest.sourceMeshCount).toBe(849);
    expect(manifest.representedSourceMeshCount).toBe(849);
    expect(manifest.unassigned).toEqual([]);
    expect(meshes).toHaveLength(46);
    expect(gltf.meshes).toHaveLength(46);
    expect(gltf.buffers).toHaveLength(1);
  });

  it('não omite, repete ou inventa estruturas de origem', () => {
    const sourceNames = manifest.groups.flatMap(group => group.sourceStructures.map(node => node.node));
    expect(sourceNames).toHaveLength(849);
    expect(new Set(sourceNames).size).toBe(849);
    for (const mesh of meshes) {
      expect(gltf.nodes.filter(node => mesh.meshNames.includes(node.name))).toHaveLength(mesh.meshNames.length);
      expect(manifest.groups.find(group => group.id === mesh.id)?.sourceStructures).toHaveLength(mesh.sourceStructureCount!);
    }
  });

  it('valida todos os buffers, normais, índices e limites geométricos', () => {
    let triangles = 0;
    for (const mesh of gltf.meshes) for (const primitive of mesh.primitives) {
      const positions = values(primitive.attributes.POSITION);
      const normals = values(primitive.attributes.NORMAL);
      const indices = values(primitive.indices);
      expect(positions.length).toBeGreaterThan(0);
      expect(positions.length).toBe(normals.length);
      expect(indices.length % 3).toBe(0);
      expect(positions.every(Number.isFinite)).toBe(true);
      expect(normals.every(Number.isFinite)).toBe(true);
      expect(indices.every(index => Number.isInteger(index) && index >= 0 && index < positions.length / 3)).toBe(true);
      const catalog = meshes.find(node => node.meshNames.includes(mesh.name))!;
      expect(catalog).toBeDefined();
      for (let i = 0; i < positions.length; i++) {
        if (positions[i] < catalog.bounds![0][i % 3] - 1e-6 || positions[i] > catalog.bounds![1][i % 3] + 1e-6) throw new Error(`Bounds inválidos: ${catalog.id}`);
      }
      triangles += indices.length / 3;
    }
    expect(triangles).toBe(456876);
    expect(triangles).toBe(manifest.finalTriangles);
  });

  it('mantém hierarquia sem ciclos, IDs únicos e busca por nome/identificador', () => {
    expect(new Set(anatomyNodes.map(node => node.id)).size).toBe(anatomyNodes.length);
    for (const node of anatomyNodes) {
      if (node.parentId) expect(anatomyNodes.some(parent => parent.id === node.parentId)).toBe(true);
      const path = anatomyBreadcrumbs(node.id);
      expect(path[0].id).toBe('body');
      expect(path.at(-1)?.id).toBe(node.id);
      expect(new Set(path.map(part => part.id)).size).toBe(path.length);
      if (node.kind === 'mesh') expect(anatomySystems.some(system => system.id === node.system)).toBe(true);
    }
    expect(searchAnatomy('coracao').some(node => node.id === 'heart')).toBe(true);
    expect(searchAnatomy('UBERON:0000948').some(node => node.id === 'heart')).toBe(true);
    expect(searchAnatomy('VH_M_left_kidney').some(node => node.id === 'left-kidney')).toBe(true);
    expect(searchAnatomy('')).toEqual([]);
  });
});
