/**
 * Recording for the new 3D Director Studio: a dedicated canvas at the output size records the planned shots in
 * real time (3D only, overlays hidden, reduced quality), and a 45° overview without people feeds the scene image.
 */
import * as THREE from 'three';
import type { PrevisPlan } from '@core/previsPlanCore.ts';
import type { PrevisAspect } from '@edit/previsVersions.ts';
import { buildWorld3dContent } from './world3dContent';

export type World3dRecordFailure = 'unsupported' | 'hidden' | 'aborted' | 'choppy';

export class World3dRecordError extends Error {
  constructor(public readonly reason: World3dRecordFailure) {
    super(`Recording failed: ${reason}`);
    this.name = 'World3dRecordError';
  }
}

const MAX_FRAME_GAP_MS = 250;
const FPS = 30;

/** Wait until `due` (performance.now() ms): a timer to ~2 ms before, then a short spin for an even cadence. */
async function waitUntil(due: number): Promise<void> {
  const early = due - performance.now() - 2;
  if (early > 0) await new Promise((r) => setTimeout(r, early));
  while (performance.now() < due) {
    /* spin ≤ ~2 ms */
  }
}
const TAIL_SEC = 0.15;
const RECORD_HIDE_BEYOND_M = 60;

export function world3dOutputSize(aspect: PrevisAspect): { width: number; height: number } {
  return aspect === '9:16' ? { width: 720, height: 1280 } : { width: 1280, height: 720 };
}

function pickMime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  return ['video/mp4;codecs=avc1', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
}

export function canRecordWorld3d(): boolean {
  return pickMime() !== null;
}

/**
 * Record `plan` along its planned shots (or `cameraAt` when given). Throws World3dRecordError; retries once when
 * the browser throttled frames.
 */
export async function recordWorld3dVideo(params: {
  plan: PrevisPlan;
  aspect: PrevisAspect;
  /** Motion between keys as shown in the workspace (default smooth). */
  smooth?: boolean;
  cameraAt?: (t: number, camera: THREE.PerspectiveCamera) => void;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}): Promise<{ blob: Blob; mime: string }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await recordOnce(params);
    if (r.maxGapMs <= MAX_FRAME_GAP_MS) return { blob: r.blob, mime: r.mime };
  }
  throw new World3dRecordError('choppy');
}

async function recordOnce(params: {
  plan: PrevisPlan;
  aspect: PrevisAspect;
  smooth?: boolean;
  cameraAt?: (t: number, camera: THREE.PerspectiveCamera) => void;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}): Promise<{ blob: Blob; maxGapMs: number; mime: string }> {
  const mime = pickMime();
  if (!mime) throw new World3dRecordError('unsupported');
  const { width, height } = world3dOutputSize(params.aspect);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const content = buildWorld3dContent(params.plan, { smooth: params.smooth });
  content.overlays.forEach((o) => (o.visible = false));
  content.farFrom(RECORD_HIDE_BEYOND_M).forEach((o) => (o.visible = false));
  content.sun.shadow.mapSize.set(2048, 2048);
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.05, 3000);
  const duration = params.plan.durationSec;
  const aim = (t: number) => (params.cameraAt ? params.cameraAt(t, camera) : content.aimShotCamera(camera, t));
  try {
    content.pose(0);
    aim(0);
    renderer.render(content.scene, camera);
    // Frame-stepped capture: frame i shows exactly t = i / FPS and is pushed with requestFrame() on an even
    // 1/FPS schedule, so motion never judders even when the display refresh and the recorder rate disagree.
    const stream = canvas.captureStream(0);
    const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack;
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));
    let failure: World3dRecordFailure | null = null;
    let maxGapMs = 0;
    const frames = Math.round((duration + TAIL_SEC) * FPS);
    recorder.start();
    const start = performance.now();
    for (let i = 0; i <= frames; i++) {
      const due = start + (i * 1000) / FPS;
      await waitUntil(due);
      maxGapMs = Math.max(maxGapMs, performance.now() - due);
      if (params.signal?.aborted) failure = 'aborted';
      else if (document.visibilityState === 'hidden') failure = 'hidden';
      if (failure) break;
      const t = Math.min(i / FPS, duration);
      content.pose(t);
      aim(t);
      content.animate(i / FPS, camera.position);
      renderer.render(content.scene, camera);
      track.requestFrame();
      params.onProgress?.(Math.min(1, t / duration));
    }
    await waitUntil(performance.now() + 1000 / FPS);
    recorder.stop();
    await stopped;
    stream.getTracks().forEach((tr) => tr.stop());
    if (failure) throw new World3dRecordError(failure);
    return { blob: new Blob(chunks, { type: mime.split(';')[0] }), maxGapMs, mime };
  } finally {
    content.dispose();
    renderer.dispose();
  }
}

/** One frame through the planned camera at `t` (people included, overlays hidden) as a PNG. */
export async function renderWorld3dShotPng(plan: PrevisPlan, t: number, aspect: PrevisAspect, smooth = true): Promise<Blob | null> {
  const { width, height } = world3dOutputSize(aspect);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const content = buildWorld3dContent(plan, { smooth });
  try {
    content.overlays.forEach((o) => (o.visible = false));
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.05, 3000);
    content.pose(t);
    content.aimShotCamera(camera, t);
    content.animate(t, camera.position);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(content.scene, camera);
    return await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
  } finally {
    content.dispose();
    renderer.dispose();
  }
}

/** 45° view of the set from the open side, without people or overlays (PNG data URL) — source of the scene image. */
export function renderWorld3dOverview(plan: PrevisPlan, size = { width: 1600, height: 900 }): string {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(size.width, size.height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  const content = buildWorld3dContent(plan);
  try {
    content.overlays.forEach((o) => (o.visible = false));
    content.figures.forEach((f) => (f.visible = false));
    const hw = plan.stage.width / 2;
    const hd = plan.stage.depth / 2;
    // Half top-down (~45°) from the open side of the set, wide enough to read the street layout.
    const camera = new THREE.PerspectiveCamera(45, size.width / size.height, 0.1, 3000);
    if (plan.stage.width < 14) {
      // Narrow (styled) street: from above the street centre line, behind the stage.
      camera.position.copy(content.stageToWorld(0, -hd * 2.1, 12));
      camera.lookAt(content.stageToWorld(0, hd * 0.2, 0));
    } else {
      camera.position.copy(content.stageToWorld(hw * 2.4, -hd * 1.3, 16));
      camera.lookAt(content.stageToWorld(-hw * 0.3, hd * 0.1, 0));
    }
    renderer.render(content.scene, camera);
    return canvas.toDataURL('image/png');
  } finally {
    content.dispose();
    renderer.dispose();
  }
}
