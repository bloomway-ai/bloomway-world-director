/**
 * Live viewport of the new 3D Director Studio: renders `world3dContent` with the free navigation camera (or along
 * the planned shots), adaptive quality, context-loss handling. One WebGL renderer per workspace; disposed on close.
 */
import * as THREE from 'three';
import type { PrevisPlan } from '@core/previsPlanCore.ts';
import { buildWorld3dContent, buildWorld3dFigure, type World3dContent, type World3dLive, type World3dPickInfo, type World3dSource } from './world3dContent';
import { DS3D_PRIMARY } from './v2Palette';
import { createWorld3dNavigator } from './world3dNavigator';
import { classifyWorldRefChange, worldRefFromSource, type WorldRefreshKind } from '../worldRefRefresh';

export interface World3dMetrics {
  fps: number;
  tier: number;
  contextLost: number;
}

export type World3dCameraMode = 'free' | 'shot';
/** `auto` lowers resolution / shadows when the frame rate drops; the other two are fixed. */
export type World3dQuality = 'saver' | 'auto' | 'high';

/** Clicks this close (px) to a character / the camera pick it even when the ray misses. */
const PICK_NEAR_PX = 18;
/** A click this close to the camera body picks the body, not its aim frame. */
const AIM_BODY_PX = 6;
/** Distance of the frustum's far frame from the camera (matches the gizmo in world3dContent). */
const AIM_FRAME_M = 3.2;

/** Duration of the shrink-out before a world object is deleted. */
export const WORLD3D_SHRINK_MS = 360;

/** Duration of the world growing in from the centre. */
export const WORLD3D_GROW_MS = 3200;

export interface World3dScene {
  setPlan(plan: PrevisPlan | null): void;
  /** Plan or world-only source; `grow` animates the world in from the centre; `keepView` keeps the camera. */
  setSource(
    source: World3dSource | null,
    opts?: { grow?: boolean; keepView?: boolean; refresh?: WorldRefreshKind | 'auto' },
  ): void;
  /** True while the world is still growing in. */
  isGrowing(): boolean;
  /** What is under a viewport point (client px); streets report the clicked point. */
  pick(clientX: number, clientY: number): World3dPickInfo | null;
  /** Highlight a picked object (green box / ring), or clear it. */
  setSelection(sel: World3dPickInfo | null): void;
  /** Where to pin the selection tag (px inside the viewport), or null when off screen. */
  selectionAnchor(): { x: number; y: number } | null;
  /** Ground point under a viewport point, in stage coordinates of the current plan (world coordinates without one). */
  groundPoint(clientX: number, clientY: number): { world: { x: number; y: number }; stage: { x: number; y: number } } | null;
  /** Live preview of a character / camera being dragged or turned (null to end). */
  setLive(live: World3dLive | null): void;
  /** True when the point is on the selected camera's far frame (dragging it aims the camera). */
  isOnAimHandle(clientX: number, clientY: number): boolean;
  /** Yaw / pitch (degrees) that point a camera at `from` towards the viewport point, keeping its frame distance. */
  aimTowards(clientX: number, clientY: number, from: { x: number; y: number; h: number; yaw: number; pitch: number }): { yaw: number; pitch: number } | null;
  /** Motion between keys: smooth curves (default) or straight lines; rebuilds the content in place. */
  setSmoothMotion(on: boolean): void;
  /** See-through character that follows the pointer while placing one (`hex` colour), or null to remove it. */
  setGhost(hex: string | null): void;
  /** Move the placing ghost to the ground under the point (null hides it until the next move). */
  moveGhost(clientX: number | null, clientY?: number): void;
  /** Play the grow-in backwards on one world object (building / street object / landmark); resolves when done. */
  shrinkOut(sel: World3dPickInfo): Promise<void>;
  /** The free camera in stage coordinates (degrees; yaw 0 = +y) and its vertical field of view. */
  freeCameraPose(): { x: number; y: number; h: number; yaw: number; pitch: number; fov: number } | null;
  /** Keyboard movement of the free camera on / off (character recording uses the keys). */
  setNavKeysEnabled(enabled: boolean): void;
  /** Stop drawing frames (e.g. while a video is rendered offscreen) and resume. */
  setPaused(paused: boolean): void;
  setTime(t: number): void;
  setCameraMode(mode: World3dCameraMode): void;
  /** Render the planned camera's shot into this element's box (it sits over the viewport), or nothing. */
  setViewfinder(el: HTMLElement | null): void;
  /** Navigation walking speed (m/s). */
  setMoveSpeed(mps: number): void;
  setLookSensitivity(mult: number): void;
  setQuality(q: World3dQuality): void;
  /** PNG of the current viewport frame. */
  screenshot(): Promise<Blob | null>;
  /** Put the free camera back on the stage corner. */
  resetView(): void;
  setOverlaysVisible(visible: boolean): void;
  /** Show / hide the planned camera (body and frustum) among the overlays (hidden while recording). */
  setPlannedCameraVisible(visible: boolean): void;
  /** Move the free camera by how far a character moved (stage points), keeping its direction (follow while recording). */
  followStageMove(from: { x: number; y: number }, to: { x: number; y: number }): void;
  /** Step the free camera back along its view (after a take recorded from it, the planned camera sits right there). */
  stepBack(m: number): void;
  metrics(): World3dMetrics;
  dispose(): void;
}

const TIERS = [
  { shadow: 4096, ratio: 2 },
  { shadow: 2048, ratio: 1.5 },
  { shadow: 1024, ratio: 1 },
];

export function createWorld3dScene(host: HTMLElement): World3dScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.outline = 'none';
  // Touch gestures are handled by the navigator (no browser pan / zoom on the canvas).
  renderer.domElement.style.touchAction = 'none';
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.tabIndex = 0;
  host.appendChild(renderer.domElement);

  let source: World3dSource | null = null;
  const shrinks: Array<{ obj: THREE.Object3D; rise: boolean; from: THREE.Vector3; start: number; done: () => void }> = [];
  let content: World3dContent | null = null;
  let growFrom = 0;
  let paused = false;
  let selection: World3dPickInfo | null = null;
  let marker: THREE.Object3D | null = null;
  let markerTop = new THREE.Vector3();
  /** Moving selections (characters, camera): the marker follows this object. */
  let follow: { target: THREE.Object3D; offset: THREE.Vector3; top: THREE.Vector3 } | null = null;
  const raycaster = new THREE.Raycaster();
  let ghost: THREE.Group | null = null;
  let smoothMotion = true;
  /** Aim frame of the selected camera under a viewport point (not when the camera body itself is there). */
  const aimHandleHit = (clientX: number, clientY: number): boolean => {
    const handle = content?.aimHandle;
    if (!content || !handle || mode !== 'free' || selection?.kind !== 'camera') return false;
    const r = renderer.domElement.getBoundingClientRect();
    const body = content.cameraGizmo;
    if (body) {
      const p = body.position.clone().project(camera);
      if (Math.hypot(r.left + ((p.x + 1) / 2) * r.width - clientX, r.top + ((1 - p.y) / 2) * r.height - clientY) <= AIM_BODY_PX) return false;
    }
    raycaster.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
    const aim = raycaster.intersectObject(handle, false)[0];
    if (!aim) return false;
    const hitBody = body ? raycaster.intersectObject(body, true)[0] : undefined;
    return !hitBody || aim.distance < hitBody.distance;
  };
  const findPickable = (o: THREE.Object3D | null): THREE.Object3D | null => {
    for (let n = o; n; n = n.parent) if (n.userData?.pick) return n;
    return null;
  };
  const clearMarker = () => {
    follow = null;
    if (!marker) return;
    marker.parent?.remove(marker);
    marker.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      (m.material as THREE.Material | undefined)?.dispose?.();
    });
    marker = null;
  };
  const buildMarker = () => {
    clearMarker();
    content?.setAimActive(selection?.kind === 'camera');
    if (!content || !selection) return;
    const sel = selection;
    const lime = new THREE.Color(DS3D_PRIMARY);
    if (sel.kind === 'street') {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.1, 1.45, 40),
        new THREE.MeshBasicMaterial({ color: lime, transparent: true, opacity: 0.9, depthTest: false, side: THREE.DoubleSide }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(sel.x, 0.25, -sel.y);
      ring.renderOrder = 20;
      marker = ring;
      markerTop = new THREE.Vector3(sel.x, 2, -sel.y);
      content.scene.add(ring);
      return;
    }
    let target: THREE.Object3D | null = null;
    content.scene.traverse((o) => {
      const p = o.userData?.pick as World3dPickInfo | undefined;
      if (!target && p && p.kind === sel.kind && p.id === sel.id) target = o;
    });
    if (!target) return;
    const box = new THREE.Box3().setFromObject(target).expandByScalar(0.15);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const g = new THREE.Group();
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x, size.y, size.z)),
      new THREE.LineBasicMaterial({ color: lime, depthTest: false, transparent: true, opacity: 0.95 }),
    );
    const fill = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      new THREE.MeshBasicMaterial({ color: lime, transparent: true, opacity: 0.14, depthWrite: false }),
    );
    edges.renderOrder = 20;
    g.add(fill, edges);
    g.position.copy(center);
    marker = g;
    markerTop = new THREE.Vector3(center.x, box.max.y + 0.6, center.z);
    content.scene.add(g);
    if (sel.kind === 'character' || sel.kind === 'camera') {
      const base = (target as THREE.Object3D).position.clone();
      follow = { target, offset: center.clone().sub(base), top: markerTop.clone().sub(base) };
    }
  };
  let time = 0;
  let mode: World3dCameraMode = 'free';
  let overlaysVisible = true;
  let plannedCameraVisible = true;
  const overlayShown = (o: THREE.Object3D) => overlaysVisible && mode === 'free' && (plannedCameraVisible || !o.userData.plannedCamera);
  let contextLost = 0;
  let lost = false;

  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 3000);
  const nav = createWorld3dNavigator(camera, renderer.domElement, {
    blocked: (p) => content?.blocked(p) ?? false,
    groundAt: (x) => content?.groundAt(x) ?? 0,
  });
  const shotCamera = new THREE.PerspectiveCamera(40, 16 / 9, 0.05, 3000);

  const rebuild = () => {
    clearMarker();
    content?.dispose();
    content = source ? buildWorld3dContent(source, { smooth: smoothMotion }) : null;
    if (content) {
      content.overlays.forEach((o) => (o.visible = overlayShown(o)));
      content.sun.shadow.mapSize.set(TIERS[tier].shadow, TIERS[tier].shadow);
      content.pose(time);
      content.setAimActive(selection?.kind === 'camera');
      if (ghost) content.scene.add(ghost);
    }
    // Nothing to show (a new world is starting): the last frame of the previous one must not stay on screen.
    renderer.domElement.style.visibility = content ? '' : 'hidden';
  };

  const onLost = (e: Event) => {
    e.preventDefault();
    contextLost++;
    lost = true;
  };
  const onRestored = () => {
    lost = false;
    rebuild();
  };
  renderer.domElement.addEventListener('webglcontextlost', onLost);
  renderer.domElement.addEventListener('webglcontextrestored', onRestored);

  const resetView = () => {
    if (!content) return;
    const plan = content.plan;
    if (plan && plan.set?.kind === 'indoor' && plan.set.world) {
      // Inside a building: stand by the entrance, looking toward the back of the room.
      camera.position.copy(content.stageToWorld(plan.stage.width / 2 - 0.7, -plan.stage.depth / 2 + 0.7, 2.2));
      camera.lookAt(content.stageToWorld(-plan.stage.width * 0.15, plan.stage.depth * 0.35, 0.9));
    } else if (plan && plan.stage.width < 14) {
      // Narrow (styled) street: the stage spans both shop rows; look down the street from above its centre line.
      camera.position.copy(content.stageToWorld(0, -plan.stage.depth * 0.8, 8));
      camera.lookAt(content.stageToWorld(0, plan.stage.depth * 0.15, 0.5));
    } else if (plan) {
      const w = Math.max(plan.stage.width, plan.stage.depth);
      camera.position.copy(content.stageToWorld(plan.stage.width * 0.95, -plan.stage.depth * 0.7, w * 0.5));
      camera.lookAt(content.stageToWorld(-plan.stage.width * 0.15, 0, 1));
    } else {
      // World on its own: high three-quarter overview of the centre, raised and pulled back over tall towers.
      const s = Math.max(...content.extentM);
      const lift = Math.min(3, Math.max(1, (content.maxHeightM * 0.75) / (s * 0.36))) * content.overviewScale;
      camera.position.set(s * 0.42 * lift, s * 0.36 * lift, s * 0.3 * lift);
      camera.lookAt(-s * 0.05, 0, -s * 0.04);
    }
    nav.syncFromCamera();
  };

  // Sizing + adaptive quality ------------------------------------------------------------
  let tier = 0;
  let quality: World3dQuality = 'auto';
  const fit = () => {
    const r = host.getBoundingClientRect();
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    if (w < 2 || h < 2) return;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = `${w}px`;
    renderer.domElement.style.height = `${h}px`;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    shotCamera.aspect = camera.aspect;
  };
  const applyTier = (i: number) => {
    tier = Math.max(0, Math.min(TIERS.length - 1, i));
    const q = TIERS[tier];
    const sun = content?.sun;
    if (sun && sun.shadow.mapSize.x !== q.shadow) {
      sun.shadow.mapSize.set(q.shadow, q.shadow);
      sun.shadow.map?.dispose();
      (sun.shadow as unknown as { map: THREE.WebGLRenderTarget | null }).map = null;
    }
    renderer.setPixelRatio(Math.min(q.ratio, window.devicePixelRatio || 1));
    fit();
  };
  const ro = new ResizeObserver(fit);
  ro.observe(host);
  applyTier(0);

  const frameTimes: number[] = [];
  let fps = 60;
  let last = performance.now();
  let lastTierCheck = last;
  let raf = 0;
  let viewfinder: HTMLElement | null = null;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (lost || !content || paused) return;
    frameTimes.push(dt);
    if (frameTimes.length > 60) frameTimes.shift();
    fps = frameTimes.length / frameTimes.reduce((a, b) => a + b, 0);
    if (now - lastTierCheck > 2000 && frameTimes.length >= 60) {
      if (quality === 'auto' && fps < 30 && tier < TIERS.length - 1) applyTier(tier + 1);
      lastTierCheck = now;
    }
    if (growFrom) {
      const p = Math.min(1, (now - growFrom) / WORLD3D_GROW_MS);
      content.grow(p);
      if (p >= 1) growFrom = 0;
    }
    for (let i = shrinks.length - 1; i >= 0; i--) {
      const a = shrinks[i];
      const k = Math.min(1, (now - a.start) / WORLD3D_SHRINK_MS);
      const e = 1 - k * k * k;
      if (a.rise) a.obj.scale.set(a.from.x, Math.max(0.02, a.from.y * e), a.from.z);
      else a.obj.scale.copy(a.from).multiplyScalar(Math.max(0.001, e));
      if (k >= 1) {
        a.obj.visible = false;
        shrinks.splice(i, 1);
        a.done();
      }
    }
    if (follow && marker) {
      marker.position.copy(follow.target.position).add(follow.offset);
      markerTop.copy(follow.target.position).add(follow.top);
    }
    if (mode === 'shot') {
      shotCamera.aspect = camera.aspect;
      content.aimShotCamera(shotCamera, time);
      content.animate(now / 1000, shotCamera.position);
      renderer.render(content.scene, shotCamera);
    } else {
      nav.update(dt);
      content.animate(now / 1000, camera.position);
      renderer.render(content.scene, camera);
      const b = viewfinder && content.plan && content.plan.camera.keys.length > 0 ? viewfinder.getBoundingClientRect() : null;
      if (b && b.width > 1 && b.height > 1) {
        const r = host.getBoundingClientRect();
        const v = { width: Math.round(b.width), height: Math.round(b.height) };
        const x = Math.round(b.left - r.left);
        const y = Math.round(r.bottom - b.bottom);
        shotCamera.aspect = v.width / Math.max(1, v.height);
        content.aimShotCamera(shotCamera, time);
        const shown = content.overlays.map((o) => o.visible);
        content.overlays.forEach((o) => (o.visible = false));
        renderer.setScissorTest(true);
        renderer.setViewport(x, y, v.width, v.height);
        renderer.setScissor(x, y, v.width, v.height);
        renderer.render(content.scene, shotCamera);
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, r.width, r.height);
        content.overlays.forEach((o, i) => (o.visible = shown[i]));
      }
    }
  };
  raf = requestAnimationFrame(loop);

  return {
    setPlan(next) {
      this.setSource(next);
    },
    setSource(next, opts) {
      const prevKind = source ? ('stage' in source ? 'plan' : 'world') : null;
      const nextKind = next ? ('stage' in next ? 'plan' : 'world') : null;
      const prevRef = worldRefFromSource(source);
      const nextRef = worldRefFromSource(next);
      const autoKind = classifyWorldRefChange(prevRef, nextRef);
      const refresh: WorldRefreshKind =
        opts?.refresh && opts.refresh !== 'auto' ? opts.refresh : source && next && content ? autoKind : 'geometry';

      if (content && next && refresh === 'atmosphere') {
        source = next;
        content.applyAtmosphere(nextRef ?? undefined);
        if ('stage' in next) content.plan = next;
        content.pose(time);
        growFrom = 0;
        return;
      }
      if (content && next && refresh === 'none') {
        source = next;
        if ('stage' in next) content.plan = next;
        content.pose(time);
        return;
      }

      source = next;
      rebuild();
      growFrom = 0;
      // Nothing to draw: wipe the last frame (the drawing buffer is preserved for screenshots).
      if (!content) renderer.clear();
      if (content && opts?.grow) {
        content.grow(0);
        growFrom = performance.now();
      }
      if (nextKind && nextKind !== prevKind && !opts?.keepView) resetView();
    },
    isGrowing: () => growFrom !== 0,
    pick(clientX, clientY) {
      if (!content || mode !== 'free') return null;
      if (aimHandleHit(clientX, clientY)) return { kind: 'camera', id: 'camera', sub: 'aim', x: 0, y: 0 };
      const r = renderer.domElement.getBoundingClientRect();
      // Characters and the camera are small from far away: a click near them picks them first.
      let near: { info: World3dPickInfo; d: number } | null = null;
      for (const o of [...content.figures, ...(content.cameraGizmo ? [content.cameraGizmo] : [])]) {
        if (!o.visible) continue;
        const p = o.position.clone().add(new THREE.Vector3(0, o === content.cameraGizmo ? 0 : 0.9, 0)).project(camera);
        if (p.z > 1 || p.z < -1) continue;
        const sx = r.left + ((p.x + 1) / 2) * r.width;
        const sy = r.top + ((1 - p.y) / 2) * r.height;
        const d = Math.hypot(sx - clientX, sy - clientY);
        if (d <= PICK_NEAR_PX && (!near || d < near.d)) near = { info: o.userData.pick as World3dPickInfo, d };
      }
      if (near) return near.info;
      raycaster.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
      for (const hit of raycaster.intersectObjects(content.scene.children, true)) {
        if (marker && findPickable(hit.object) === null && (hit.object === marker || marker.children.includes(hit.object))) continue;
        const owner = findPickable(hit.object);
        if (!owner) continue;
        const info = owner.userData.pick as World3dPickInfo;
        if (info.kind === 'street') {
          return { ...info, x: Math.round(hit.point.x * 10) / 10, y: Math.round(-hit.point.z * 10) / 10, id: `street_${Math.round(hit.point.x)}_${Math.round(-hit.point.z)}` };
        }
        return info;
      }
      return null;
    },
    setSelection(sel) {
      selection = sel;
      buildMarker();
    },
    groundPoint(clientX, clientY) {
      if (!content) return null;
      const r = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
      const hit = new THREE.Vector3();
      // Walk along the ray to the ground (flat, sloped or rolling), then refine by bisection.
      const { origin, direction } = raycaster.ray;
      const above = (t: number) => origin.y + direction.y * t - content!.groundAt(origin.x + direction.x * t);
      let t0 = 0;
      let t1 = -1;
      for (let t = 0.5; t <= 500; t += 0.5) {
        if (above(t) <= 0) {
          t1 = t;
          break;
        }
        t0 = t;
      }
      if (t1 < 0) return null;
      for (let i = 0; i < 24; i++) {
        const m = (t0 + t1) / 2;
        if (above(m) > 0) t0 = m;
        else t1 = m;
      }
      hit.copy(origin).addScaledVector(direction, t1);
      if (hit.distanceTo(camera.position) > 500) return null;
      const world = { x: Math.round(hit.x * 100) / 100, y: Math.round(-hit.z * 100) / 100 };
      const st = content.worldToStage(world.x, world.y);
      return { world, stage: { x: Math.round(st.x * 100) / 100, y: Math.round(st.y * 100) / 100 } };
    },
    setLive(live) {
      content?.setLive(live);
    },
    isOnAimHandle(clientX, clientY) {
      return aimHandleHit(clientX, clientY);
    },
    aimTowards(clientX, clientY, from) {
      if (!content) return null;
      const r = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
      const { origin, direction } = raycaster.ray;
      const c = content.stageToWorld(from.x, from.y, from.h + 0.15);
      const yr = (from.yaw * Math.PI) / 180;
      const pr = (from.pitch * Math.PI) / 180;
      const ahead = content
        .stageToWorld(from.x + Math.sin(yr) * Math.cos(pr), from.y + Math.cos(yr) * Math.cos(pr), from.h + 0.15 + Math.sin(pr))
        .sub(c)
        .normalize();
      // Where the ray crosses the frame sphere around the camera; of the two crossings, the one nearer the current aim.
      const oc = origin.clone().sub(c);
      const b = oc.dot(direction);
      const disc = b * b - (oc.lengthSq() - AIM_FRAME_M * AIM_FRAME_M);
      let point: THREE.Vector3;
      if (disc >= 0) {
        const pts = [-b - Math.sqrt(disc), -b + Math.sqrt(disc)].filter((t) => t > 0).map((t) => origin.clone().addScaledVector(direction, t));
        if (!pts.length) return null;
        point = pts.reduce((best, p) => (p.clone().sub(c).normalize().dot(ahead) > best.clone().sub(c).normalize().dot(ahead) ? p : best));
      } else {
        point = origin.clone().addScaledVector(direction, Math.max(0, -b));
      }
      const dir = point.sub(c).normalize();
      const a = content.worldToStage(c.x, -c.z);
      const t = content.worldToStage(c.x + dir.x, -(c.z + dir.z));
      const yaw = (Math.atan2(t.x - a.x, t.y - a.y) * 180) / Math.PI;
      const pitch = (Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1)) * 180) / Math.PI;
      return { yaw: (yaw + 360) % 360, pitch: Math.max(-80, Math.min(80, pitch)) };
    },
    setSmoothMotion(on) {
      if (on === smoothMotion) return;
      smoothMotion = on;
      if (!content) return;
      rebuild();
      buildMarker();
    },
    setGhost(hex) {
      if (ghost) {
        ghost.parent?.remove(ghost);
        ghost.traverse((o) => {
          const m = o as THREE.Mesh;
          m.geometry?.dispose();
          (m.material as THREE.Material | undefined)?.dispose?.();
        });
        ghost = null;
      }
      if (!hex) return;
      ghost = buildWorld3dFigure(hex, true);
      // Ground ring drawn over everything: the spot stays visible from far away or behind roofs.
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.42, 0.6, 32),
        new THREE.MeshBasicMaterial({ color: DS3D_PRIMARY, transparent: true, opacity: 0.85, depthTest: false, side: THREE.DoubleSide }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      ring.renderOrder = 20;
      ring.name = 'ghost-ring';
      ghost.add(ring);
      ghost.visible = false;
      content?.scene.add(ghost);
    },
    moveGhost(clientX, clientY) {
      if (!ghost) return;
      const g = clientX === null || clientY === undefined ? null : this.groundPoint(clientX, clientY);
      if (!g || !content) {
        ghost.visible = false;
        return;
      }
      ghost.position.copy(content.plan ? content.stageToWorld(g.stage.x, g.stage.y, 0.15) : new THREE.Vector3(g.world.x, content.groundAt(g.world.x) + 0.15, -g.world.y));
      ghost.visible = true;
      // Keep the ring about 24 px wide on screen at any distance.
      const ring = ghost.getObjectByName('ghost-ring');
      if (ring) {
        const px = renderer.domElement.clientHeight || 1;
        const metresPerPx = (2 * ghost.position.distanceTo(camera.position) * Math.tan(((camera.fov / 2) * Math.PI) / 180)) / px;
        ring.scale.setScalar(Math.max(1, (24 * metresPerPx) / 1.2));
      }
    },
    freeCameraPose() {
      if (!content) return null;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const p = camera.position;
      const a = content.worldToStage(p.x, -p.z);
      const b = content.worldToStage(p.x + dir.x, -(p.z + dir.z));
      const yaw = (Math.atan2(b.x - a.x, b.y - a.y) * 180) / Math.PI;
      const pitch = (Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1)) * 180) / Math.PI;
      return { x: a.x, y: a.y, h: Math.max(0.3, p.y - 0.15), yaw: (yaw + 360) % 360, pitch, fov: camera.fov };
    },
    setNavKeysEnabled(v) {
      nav.setKeysEnabled(v);
    },
    setPaused(v) {
      paused = v;
      frameTimes.length = 0;
    },
    shrinkOut(sel) {
      return new Promise<void>((resolve) => {
        if (!content || (sel.kind !== 'building' && sel.kind !== 'prop' && sel.kind !== 'landmark')) return resolve();
        let target: THREE.Object3D | null = null;
        content.scene.traverse((o) => {
          const p = o.userData?.pick as World3dPickInfo | undefined;
          if (!target && p && p.kind === sel.kind && p.id === sel.id) target = o;
        });
        if (!target) return resolve();
        clearMarker();
        const obj = target as THREE.Object3D;
        shrinks.push({ obj, rise: sel.kind !== 'prop', from: obj.scale.clone(), start: performance.now(), done: resolve });
      });
    },
    selectionAnchor() {
      if (!marker) return null;
      const p = markerTop.clone().project(camera);
      if (p.z > 1 || p.z < -1) return null;
      const r = host.getBoundingClientRect();
      return { x: ((p.x + 1) / 2) * r.width, y: ((1 - p.y) / 2) * r.height };
    },
    setTime(t) {
      time = t;
      content?.pose(t);
    },
    setViewfinder(v) {
      viewfinder = v;
    },
    setCameraMode(m) {
      mode = m;
      nav.setEnabled(m === 'free');
      content?.overlays.forEach((o) => (o.visible = overlayShown(o)));
    },
    setMoveSpeed(mps) {
      nav.setSpeed(mps);
    },
    setLookSensitivity(mult) {
      nav.setLookSensitivity(mult);
    },
    setQuality(q) {
      quality = q;
      applyTier(q === 'saver' ? TIERS.length - 1 : 0);
      frameTimes.length = 0;
    },
    screenshot() {
      return new Promise((resolve) => {
        if (!content || lost) return resolve(null);
        renderer.domElement.toBlob((b) => resolve(b), 'image/png');
      });
    },
    resetView,
    setOverlaysVisible(visible) {
      overlaysVisible = visible;
      content?.overlays.forEach((o) => (o.visible = overlayShown(o)));
    },
    setPlannedCameraVisible(visible) {
      plannedCameraVisible = visible;
      content?.overlays.forEach((o) => (o.visible = overlayShown(o)));
    },
    stepBack(m) {
      camera.translateZ(m);
    },
    followStageMove(from, to) {
      if (!content) return;
      camera.position.add(content.stageToWorld(to.x, to.y, 0).sub(content.stageToWorld(from.x, from.y, 0)));
    },
    metrics: () => ({ fps, tier, contextLost }),
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      nav.dispose();
      content?.dispose();
      content = null;
      renderer.domElement.removeEventListener('webglcontextlost', onLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onRestored);
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
