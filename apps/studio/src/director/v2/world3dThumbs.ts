/**
 * Small isometric pictures of preset worlds (the centre block floating on a transparent background), rendered one
 * at a time when the browser is idle with a single offscreen renderer, and cached for the session.
 */
import * as THREE from 'three';
import { buildWorld3dContent } from './world3dContent';
import { world3dBlockFrame, world3dIsoCamera, WORLD3D_BLOCK_YAW } from './world3dAscii';
import type { PrevisWorldRef } from '@core/previsWorldGen.ts';

export type World3dThumbTier = 'strip' | 'hero';

const TIER: Record<World3dThumbTier, { w: number; h: number }> = {
  strip: { w: 240, h: 160 },
  hero: { w: 480, h: 320 },
};

const cacheKey = (key: string, tier: World3dThumbTier) => (tier === 'strip' ? key : `${key}:hero`);

const cache = new Map<string, string>();
const waiting = new Map<string, Array<(url: string | null) => void>>();
const queue: Array<{ cacheKey: string; ref: PrevisWorldRef; w: number; h: number }> = [];
let renderer: THREE.WebGLRenderer | null = null;
let running = false;

const idle = (fn: () => void): void => {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 600 });
  else window.setTimeout(fn, 30);
};

function renderOne(ref: PrevisWorldRef, w: number, h: number): string | null {
  try {
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ canvas: document.createElement('canvas'), antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0xe4e4e7, 1);
    }
    renderer.setSize(w, h, false);
    const content = buildWorld3dContent({ world: ref });
    content.grow(1);
    let meshCount = 0;
    content.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && o.visible) meshCount++;
    });
    if (!meshCount) {
      content.dispose();
      return null;
    }
    content.scene.background = null;
    content.scene.fog = null;
    const block = world3dBlockFrame(content);
    const aspect = w / h;
    const halfW = Math.max(block.w / 0.9, (block.h / 0.88) * aspect);
    const camera = new THREE.OrthographicCamera(-halfW, halfW, halfW / aspect, -halfW / aspect, 0.1, 2000);
    world3dIsoCamera(camera, block.focus, WORLD3D_BLOCK_YAW);
    renderer.render(content.scene, camera);
    const url = renderer.domElement.toDataURL('image/png');
    content.dispose();
    return url;
  } catch {
    return null;
  }
}

function pump(): void {
  if (running) return;
  const next = queue.shift();
  if (!next) return;
  running = true;
  idle(() => {
    const url = cache.get(next.cacheKey) ?? renderOne(next.ref, next.w, next.h);
    if (url) cache.set(next.cacheKey, url);
    for (const cb of waiting.get(next.cacheKey) ?? []) cb(url);
    waiting.delete(next.cacheKey);
    running = false;
    pump();
  });
}

/** Picture of a world (data URL), from the cache or rendered when the browser is idle. */
export function requestWorld3dThumb(
  key: string,
  ref: PrevisWorldRef,
  cb: (url: string | null) => void,
  tier: World3dThumbTier = 'strip',
): () => void {
  const ck = cacheKey(key, tier);
  const { w, h } = TIER[tier];
  const hit = cache.get(ck);
  if (hit) {
    cb(hit);
    return () => {};
  }
  const list = waiting.get(ck) ?? [];
  list.push(cb);
  waiting.set(ck, list);
  if (!queue.some((q) => q.cacheKey === ck)) queue.push({ cacheKey: ck, ref, w, h });
  pump();
  return () => {
    const l = waiting.get(ck);
    if (l) waiting.set(ck, l.filter((x) => x !== cb));
  };
}
