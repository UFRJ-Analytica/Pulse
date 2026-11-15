import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { anatomyNodes, anatomySystems } from '../anatomy/catalog';
import { packAnatomy, structureVisible, type AtlasViewState } from '../anatomy/viewer-state';
import { temperatureColor } from '../data/adapters/temperature';
import { useLocale, tx } from '../i18n/locale-context';

export interface AtlasCommand { kind: 'zoomIn' | 'zoomOut' | 'focus' | 'export' | 'left' | 'right' | 'up' | 'down' | 'panLeft' | 'panRight' | 'panUp' | 'panDown'; revision: number }
interface Props {
  state: AtlasViewState;
  selectedId: string | null;
  focusSystem?: string | null;
  globalExposure?: boolean;
  temperature?: number | null;
  command: AtlasCommand | null;
  onSelect: (id: string) => void;
  onLoaded: (count: number) => void;
  onError: (message: string) => void;
}
interface PartMesh { mesh: THREE.Mesh; original: THREE.Vector3; material: THREE.MeshStandardMaterial; nodeId: string; system: string; color: THREE.Color; skin: boolean }
const meshNodes = anatomyNodes.filter((node) => node.kind === 'mesh');
const normalizedSystem = (value: string) => value.toLowerCase();

/** Three owns the render loop. Frames are drawn only when controls, lighting or state change. */
export function AnatomyScene(props: Props) {
  const locale = useLocale();
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const hostRef = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    hostRef.current?.querySelectorAll<HTMLButtonElement>('.atlas-structure-label').forEach((label) => {
      const node = meshNodes.find((item) => item.id === label.dataset.atlasId);
      if (!node) return;
      const name = locale === 'en' ? node.sourceLabel ?? node.name : node.name;
      label.textContent = name;
      label.setAttribute('aria-label', `${tx(locale, 'Selecionar', 'Select')} ${name}`);
    });
    const canvas = hostRef.current?.querySelector('canvas');
    canvas?.setAttribute('aria-label', tx(locale, 'Atlas anatômico 3D. Arraste para girar, use a roda para zoom e clique em uma estrutura para selecionar.', '3D anatomy atlas. Drag to rotate, use the wheel to zoom, and click a structure to select it.'));
  }, [locale]);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false, frame = 0, dirty = true, loaded = false;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }); }
    catch { latest.current.onError(tx(localeRef.current, 'O renderizador 3D não está disponível neste dispositivo. Use a lista de estruturas para explorar a anatomia.', 'The 3D renderer is unavailable on this device. Use the structure list to explore the anatomy.')); return; }
    renderer.setClearColor(0x0e1e2b, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.localClippingEnabled = true;
    const canvas = renderer.domElement;
    canvas.setAttribute('aria-label', tx(localeRef.current, 'Atlas anatômico 3D. Arraste para girar, use a roda para zoom e clique em uma estrutura para selecionar.', '3D anatomy atlas. Drag to rotate, use the wheel to zoom, and click a structure to select it.'));
    canvas.setAttribute('role', 'img');
    host.appendChild(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, .005, 80);
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, .88, 0); camera.position.set(0, .92, 3.8);
    controls.enableDamping = true; controls.dampingFactor = .075;
    controls.minDistance = .08; controls.maxDistance = 20;
    controls.autoRotateSpeed = .45;
    controls.addEventListener('change', () => { dirty = true; });
    scene.add(new THREE.HemisphereLight(0xdcefff, 0x48617b, 2.1));
    const key = new THREE.DirectionalLight(0xffeadd, 3.5); key.position.set(-2, 3, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x65d9ed, 2.5); rim.position.set(2, 1, -3); scene.add(rim);
    const fill = new THREE.DirectionalLight(0xb5c7ff, 1.1); fill.position.set(-3, .5, -1); scene.add(fill);
    const grid = new THREE.GridHelper(3.5, 30, 0x80b2cc, 0x54849d);
    const gridMaterial = grid.material as THREE.Material;
    gridMaterial.transparent = true; gridMaterial.opacity = .12; grid.position.y = -.008; scene.add(grid);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x71b6c7, transparent: true, opacity: .24, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(.48, .483, 96), ringMaterial); ring.rotation.x = -Math.PI / 2; ring.position.y = -.005; scene.add(ring);
    const haloMaterial = new THREE.MeshBasicMaterial({ color: 0x67c7d6, transparent: true, opacity: .18, side: THREE.DoubleSide, depthWrite: false });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1, .002, 6, 120), haloMaterial); halo.scale.set(.62, 1, 1); halo.position.set(0, .88, -.04); halo.visible = false; scene.add(halo);
    const parts: PartMesh[] = [];
    const groupBounds = new Map<string, THREE.Box3>();
    const groupCenters = new Map<string, THREE.Vector3>();
    const labels = new Map<string, HTMLButtonElement>();
    const baseBox = new THREE.Box3();
    const pointer = new THREE.Vector2(), raycaster = new THREE.Raycaster();
    let lastState: AtlasViewState | null = null, lastSelected: string | null | undefined;
    let lastFocus: string | null | undefined, lastExposure: boolean | undefined, lastTemperature: number | null | undefined, lastCommand = -1, extent = 0;
    let layout = packAnatomy([], 1);
    let targetPosition: THREE.Vector3 | null = null, targetLook: THREE.Vector3 | null = null;
    let lastTime = performance.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const direction = (view: AtlasViewState['camera']) => view === 'back' ? new THREE.Vector3(0, .015, -1) : view === 'side' ? new THREE.Vector3(1, .015, 0) : view === 'top' ? new THREE.Vector3(0, 1, .001) : view === 'bottom' ? new THREE.Vector3(0, -1, .001) : new THREE.Vector3(0, .015, 1);
    const frameBox = (box: THREE.Box3, smooth = true) => {
      if (box.isEmpty()) return;
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const margin = host.clientWidth < 500 ? 1.22 : 1.14;
      const usableHeight = Math.max(.48, 1 - 130 / Math.max(360, host.clientHeight));
      const distance = Math.max(.12, Math.max(size.y / usableHeight, size.x / (camera.aspect * .85), size.z) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * margin);
      const view = latest.current.state.camera;
      const next = center.clone().addScaledVector(direction(view), distance);
      if (smooth && !reducedMotion) { targetPosition = next; targetLook = center; }
      else { camera.position.copy(next); controls.target.copy(center); targetPosition = targetLook = null; controls.update(); }
      dirty = true;
    };
    const visibleBounds = () => {
      const box = new THREE.Box3();
      for (const [id, bounds] of groupBounds) {
        const node = meshNodes.find((item) => item.id === id);
        if (node && structureVisible(id, node.system, latest.current.state, latest.current.selectedId)) box.union(bounds);
      }
      return box;
    };
    const focusSelection = () => {
      const id = latest.current.selectedId;
      const bounds = id ? groupBounds.get(id)?.clone() : undefined;
      if (bounds) {
        const center = groupCenters.get(id!);
        const cell = layout.cells.get(id!);
        if (center && cell) bounds.translate(new THREE.Vector3(cell.x - center.x, cell.y + .88 - center.y, -center.z).multiplyScalar(extent));
        const size = bounds.getSize(new THREE.Vector3());
        bounds.expandByScalar(Math.max(.055, size.length() * .16));
        frameBox(bounds);
      }
    };
    const resize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      renderer.setSize(host.clientWidth, host.clientHeight);
      camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix();
      if (loaded && !latest.current.state.isolate && !latest.current.selectedId) frameBox(baseBox, false);
      dirty = true;
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const clipped = (point: THREE.Vector3) => parts[0]?.material.clippingPlanes?.some((plane) => plane.distanceToPoint(point) < 0) ?? false;
    const findHit = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const solids = parts.filter((part) => part.mesh.visible && !part.skin);
      const solidHit = raycaster.intersectObjects(solids.map((part) => part.mesh), false).find((hit) => !clipped(hit.point));
      return solidHit ?? raycaster.intersectObjects(parts.filter((part) => part.mesh.visible && part.skin).map((part) => part.mesh), false).find((hit) => !clipped(hit.point));
    };
    let pointerDown: { x: number; y: number; id: number } | null = null;
    const hover = document.createElement('div'); hover.className = 'atlas-hover'; hover.hidden = true; hover.setAttribute('role', 'tooltip'); host.appendChild(hover);
    const onDown = (event: PointerEvent) => { pointerDown = { x: event.clientX, y: event.clientY, id: event.pointerId }; targetPosition = targetLook = null; hover.hidden = true; };
    const onMove = (event: PointerEvent) => {
      if (event.buttons || event.pointerType === 'touch') { hover.hidden = true; return; }
      const hit = findHit(event); const id = hit?.object.userData.atlasId as string | undefined;
      const node = meshNodes.find((item) => item.id === id); hover.hidden = !node;
      canvas.style.cursor = node ? 'pointer' : 'grab';
      if (node) {
        const rect = host.getBoundingClientRect(); const label = localeRef.current === 'en' ? node.sourceLabel ?? node.name : node.name; hover.textContent = `${label} · ${tx(localeRef.current, 'selecionar', 'select')}`;
        hover.style.left = `${Math.max(8, Math.min(event.clientX - rect.left + 14, host.clientWidth - 240))}px`;
        hover.style.top = `${Math.max(85, Math.min(event.clientY - rect.top + 14, host.clientHeight - 90))}px`;
      }
    };
    const onUp = (event: PointerEvent) => {
      const start = pointerDown; pointerDown = null;
      if (!start || start.id !== event.pointerId || Math.hypot(start.x - event.clientX, start.y - event.clientY) > 6) return;
      const hit = findHit(event);
      if (hit?.object.userData.atlasId) latest.current.onSelect(String(hit.object.userData.atlasId));
    };
    const onLeave = () => { hover.hidden = true; pointerDown = null; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointerleave', onLeave);
    const contextLost = (event: Event) => { event.preventDefault(); latest.current.onError(tx(localeRef.current, 'O dispositivo pausou a sessão 3D. A lista anatômica continua disponível; recarregue para retomar o canvas.', 'The device paused the 3D session. The anatomy list is still available; reload to restore the canvas.')); };
    canvas.addEventListener('webglcontextlost', contextLost);
    const loadingManager = new THREE.LoadingManager();
    const loader = new GLTFLoader(loadingManager);
    loader.load('/anatomy/hra-male.glb', (gltf) => {
      if (disposed) { gltf.scene.traverse((object) => { if (object instanceof THREE.Mesh) object.geometry.dispose(); }); return; }
      const originalBox = new THREE.Box3().setFromObject(gltf.scene);
      const size = originalBox.getSize(new THREE.Vector3()); const center = originalBox.getCenter(new THREE.Vector3());
      const scale = 1.75 / size.y;
      gltf.scene.scale.multiplyScalar(scale); gltf.scene.position.set(-center.x * scale, -originalBox.min.y * scale, -center.z * scale);
      scene.add(gltf.scene); gltf.scene.updateMatrixWorld(true);
      const meshes: THREE.Mesh[] = [];
      gltf.scene.traverse((object) => { if (object instanceof THREE.Mesh) meshes.push(object); });
      for (const mesh of meshes) {
        const node = meshNodes.find((item) => item.meshNames.includes(mesh.name));
        if (!node) { mesh.visible = false; continue; }
        scene.attach(mesh);
        const sourceMaterial = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        const sourceColor = sourceMaterial instanceof THREE.MeshStandardMaterial ? sourceMaterial.color : new THREE.Color(node.color || '#c49f91');
        const system = normalizedSystem(node.system);
        const skin = system.includes('integument') || system === 'skin' || /skin|surface|pele/i.test(node.name);
        const palette = anatomySystems.find((item) => item.id === node.system)?.color;
        const color = new THREE.Color(node.color || palette || sourceColor);
        const material = new THREE.MeshStandardMaterial({ color, roughness: .62, metalness: .04, side: THREE.DoubleSide });
        mesh.material = material;
        if (sourceMaterial instanceof THREE.Material) sourceMaterial.dispose();
        mesh.userData.atlasId = node.id;
        mesh.geometry.computeBoundingBox(); mesh.geometry.computeBoundingSphere();
        const bounds = new THREE.Box3().setFromObject(mesh);
        const group = groupBounds.get(node.id) || new THREE.Box3(); group.union(bounds); groupBounds.set(node.id, group);
        baseBox.union(bounds);
        parts.push({ mesh, original: mesh.position.clone(), material, nodeId: node.id, system: node.system, color, skin });
      }
      scene.remove(gltf.scene);
      for (const [id, bounds] of groupBounds) {
        groupCenters.set(id, bounds.getCenter(new THREE.Vector3()));
        const node = meshNodes.find((item) => item.id === id)!;
        const label = document.createElement('button'); label.className = 'atlas-structure-label'; label.hidden = true;
        label.dataset.atlasId = id;
        label.textContent = localeRef.current === 'en' ? node.sourceLabel ?? node.name : node.name; label.setAttribute('aria-label', `${tx(localeRef.current, 'Selecionar', 'Select')} ${localeRef.current === 'en' ? node.sourceLabel ?? node.name : node.name}`);
        label.addEventListener('click', () => latest.current.onSelect(id)); host.appendChild(label); labels.set(id, label);
      }
      if (!parts.length) { latest.current.onError(tx(localeRef.current, 'As malhas não correspondem ao catálogo anatômico. Consulte Sobre os dados.', 'The meshes do not match the anatomy catalog. See About the data.')); return; }
      loaded = true; latest.current.onLoaded(groupBounds.size); lastState = null;
      frameBox(baseBox, false);
    }, undefined, () => { if (!disposed) latest.current.onError(tx(localeRef.current, 'Não foi possível carregar as malhas locais do HRA. Recarregue a página ou explore a lista anatômica.', 'Could not load local HRA meshes. Reload the page or explore the anatomy list.')); });
    const labelPoint = new THREE.Vector3();
    const updateLabels = () => {
      const current = latest.current;
      for (const label of labels.values()) label.hidden = true;
      if (!current.state.labels || !loaded) return;
      let ids = current.selectedId ? [current.selectedId] : meshNodes.filter((node) => /brain|cérebro|heart|coração|kidney|rim|lung|pulm/i.test(`${node.name} ${node.sourceLabel ?? ''}`)).slice(0, 3).map((node) => node.id);
      ids = ids.slice(0, 3);
      const occupied: { left: number; top: number; width: number; height: number }[] = [];
      ids.forEach((id, index) => {
        const label = labels.get(id), center = groupCenters.get(id), cell = layout.cells.get(id);
        const node = meshNodes.find((item) => item.id === id);
        if (!label || !center || !node || !structureVisible(id, node.system, current.state, current.selectedId)) return;
        labelPoint.copy(center);
        if (cell) labelPoint.lerp(new THREE.Vector3(cell.x, cell.y + .88, 0), extent);
        if (clipped(labelPoint)) return;
        labelPoint.project(camera);
        if (labelPoint.z < -1 || labelPoint.z > 1) return;
        const left = Math.max(18, Math.min(host.clientWidth - 180, (labelPoint.x + 1) * host.clientWidth / 2 + (index % 2 ? -165 : 30)));
        const top = Math.max(110, Math.min(host.clientHeight - 140, (1 - labelPoint.y) * host.clientHeight / 2));
        const box = { left, top, width: 155, height: 31 };
        if (occupied.some((item) => box.left < item.left + item.width && box.left + box.width > item.left && box.top < item.top + item.height && box.top + box.height > item.top)) return;
        occupied.push(box); label.style.left = `${left}px`; label.style.top = `${top}px`; label.hidden = false;
        label.classList.toggle('is-selected', id === current.selectedId);
      });
    };
    const animate = (time: number) => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const dt = Math.min(.05, (time - lastTime) / 1000); lastTime = time;
      const current = latest.current, state = current.state;
      const changed = lastState !== state || lastSelected !== current.selectedId || lastFocus !== current.focusSystem || lastExposure !== current.globalExposure || lastTemperature !== current.temperature;
      const moving = Math.abs(extent - state.explode) > .0001;
      if (moving) { extent = reducedMotion ? state.explode : THREE.MathUtils.damp(extent, state.explode, 7, dt); dirty = true; }
      if (loaded && (changed || moving)) {
        if (changed) {
          layout = packAnatomy([...groupBounds].filter(([id]) => {
            const node = meshNodes.find((item) => item.id === id)!;
            return structureVisible(id, node.system, state, current.selectedId);
          }).map(([id, box]) => { const size = box.getSize(new THREE.Vector3()); return { id, width: size.x, height: size.y }; }), camera.aspect);
        }
        const clipNormal = state.clip === 'sagittal' ? new THREE.Vector3(1, 0, 0) : state.clip === 'coronal' ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
        const axis = state.clip === 'sagittal' ? 'x' : state.clip === 'coronal' ? 'z' : 'y';
        const clipValue = THREE.MathUtils.lerp(baseBox.min[axis], baseBox.max[axis], state.clipPosition);
        const plane = new THREE.Plane(clipNormal.multiplyScalar(state.clipReverse ? -1 : 1), -clipValue * (state.clipReverse ? -1 : 1));
        for (const part of parts) {
          const { mesh, material, nodeId, system, skin } = part;
          const selected = nodeId === current.selectedId;
          const focused = Boolean(current.focusSystem && (system === current.focusSystem || current.focusSystem.split(',').includes(system)));
          mesh.visible = structureVisible(nodeId, system, state, current.selectedId);
          const center = groupCenters.get(nodeId)!; const cell = layout.cells.get(nodeId);
          mesh.position.copy(part.original);
          if (cell) mesh.position.addScaledVector(new THREE.Vector3(cell.x - center.x, cell.y + .88 - center.y, -center.z), extent);
          material.color.copy(state.material === 'porcelain' ? new THREE.Color('#d9e0e0') : part.color);
          if (current.temperature != null) material.color.set(temperatureColor(current.temperature));
          material.emissive.set(selected ? '#1a6774' : focused ? '#174051' : '#000000');
          material.emissiveIntensity = selected ? .5 : .25;
          material.wireframe = state.material === 'wireframe';
          material.opacity = skin && !selected ? .075 : state.material === 'transparent' && !selected ? .18 : state.material === 'highlight' && !selected && !focused ? .13 : 1;
          material.transparent = material.opacity < 1; material.depthWrite = !material.transparent;
          material.clippingPlanes = state.clip === 'none' ? [] : [plane];
          mesh.renderOrder = skin ? 2 : 0;
          material.needsUpdate = changed;
        }
        if (changed) {
          const cameraChanged = lastState?.camera !== state.camera || lastState?.cameraRevision !== state.cameraRevision;
          if (current.selectedId !== lastSelected && current.selectedId && groupBounds.has(current.selectedId)) focusSelection();
          else if (current.focusSystem !== lastFocus && current.focusSystem) {
            const bounds = new THREE.Box3();
            meshNodes.filter((node) => current.focusSystem?.split(',').includes(node.system)).forEach((node) => { const box = groupBounds.get(node.id); if (box) bounds.union(box); });
            if (!bounds.isEmpty()) frameBox(bounds.expandByScalar(.1));
          } else if (cameraChanged || (lastState?.isolate && !state.isolate) || (lastSelected && !current.selectedId) || (lastFocus && !current.focusSystem) || current.selectedId === 'body') frameBox(baseBox);
          if (state.isolate && current.selectedId) focusSelection();
        }
        if (moving && state.explode > .2 && !state.isolate) {
          const expanded = new THREE.Box3(new THREE.Vector3(-layout.width / 2, .88 - layout.height / 2, -.02), new THREE.Vector3(layout.width / 2, .88 + layout.height / 2, .02));
          frameBox(expanded, false);
        } else if (moving && state.explode === 0 && extent < .001) frameBox(visibleBounds());
        lastState = state; lastSelected = current.selectedId; lastFocus = current.focusSystem; lastExposure = current.globalExposure; lastTemperature = current.temperature; dirty = true;
      }
      const command = current.command;
      if (command && command.revision !== lastCommand) {
        if (command.kind === 'focus') focusSelection();
        else if (command.kind === 'export') {
          renderer.render(scene, camera);
          const anchor = document.createElement('a'); anchor.download = 'pulse-health-atlas-hra.png'; anchor.href = canvas.toDataURL('image/png'); anchor.click();
        } else if (command.kind === 'zoomIn' || command.kind === 'zoomOut') {
          targetPosition = targetLook = null;
          camera.position.sub(controls.target).multiplyScalar(command.kind === 'zoomIn' ? .8 : 1.25).add(controls.target);
        } else if (command.kind.startsWith('pan')) {
          targetPosition = targetLook = null;
          const distance = camera.position.distanceTo(controls.target) * .05;
          const shift = new THREE.Vector3(command.kind === 'panLeft' ? -distance : command.kind === 'panRight' ? distance : 0, command.kind === 'panUp' ? distance : command.kind === 'panDown' ? -distance : 0, 0).applyQuaternion(camera.quaternion);
          camera.position.add(shift); controls.target.add(shift);
        } else {
          targetPosition = targetLook = null;
          const offset = camera.position.clone().sub(controls.target), spherical = new THREE.Spherical().setFromVector3(offset);
          if (command.kind === 'left') spherical.theta -= .16;
          if (command.kind === 'right') spherical.theta += .16;
          if (command.kind === 'up') spherical.phi = Math.max(.05, spherical.phi - .12);
          if (command.kind === 'down') spherical.phi = Math.min(Math.PI - .05, spherical.phi + .12);
          camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
        }
        lastCommand = command.revision; dirty = true;
      }
      if (targetPosition && targetLook) {
        const step = 1 - Math.exp(-6 * dt);
        camera.position.lerp(targetPosition, step); controls.target.lerp(targetLook, step);
        if (camera.position.distanceTo(targetPosition) < .001 && controls.target.distanceTo(targetLook) < .001) { camera.position.copy(targetPosition); controls.target.copy(targetLook); targetPosition = targetLook = null; }
        dirty = true;
      }
      halo.visible = Boolean(current.globalExposure && !state.isolate && extent < .3);
      grid.visible = ring.visible = !state.isolate && extent < .2;
      controls.autoRotate = state.rotate && !reducedMotion && !targetPosition;
      controls.update();
      if (controls.autoRotate) dirty = true;
      if (dirty) {
        renderer.render(scene, camera); updateLabels();
        dirty = false;
      }
    };
    frame = requestAnimationFrame(animate);
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('webglcontextlost', contextLost);
      labels.forEach((label) => label.remove()); hover.remove();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose(); (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
        }
      });
      renderer.dispose(); canvas.remove();
    };
  }, []);
  return <div className="atlas-canvas" ref={hostRef} />;
}
