import type { PrevisPlan } from '../previsPlanCore.ts';

export type PrevisAspect = '16:9' | '9:16';
export type PrevisPreviewMedia = 'video' | 'topdown' | 'scene' | 'still';
export type PrevisVersionSource = 'text' | 'smart' | 'manual';

/** One generated previs. URLs only (GCS); the plan JSON is small enough to keep in node content. */
export interface PrevisVersion {
  id: number;
  source: PrevisVersionSource;
  /** Smart-revise instruction, empty for text generations. */
  instruction?: string;
  textSnapshot: string;
  plan: PrevisPlan;
  videoUrl: string;
  topDownUrl: string;
  /** 45° render of the set without people (what the scene image is made from). */
  sceneOverviewUrl?: string;
  /** Scene reference image with the same layout; fed to VIDEO_GEN with the top-down map. */
  sceneImageUrl?: string;
  /** Scene image generation failed (the user can retry). */
  sceneFailed?: boolean;
  /** 15 / 30 (V1) or any whole 5–30 s (3D Director). */
  durationSec: number;
  aspect: PrevisAspect;
  sparks: number;
  repairs: number;
  createdAt: number;
}

/** A paid plan whose render/upload failed; re-rendering it is free. */
export interface PrevisPendingRender {
  source: PrevisVersionSource;
  instruction?: string;
  textSnapshot: string;
  plan: PrevisPlan;
  durationSec: number;
  aspect: PrevisAspect;
  sparks: number;
  repairs: number;
}

/** DIRECTOR_STUDIO `content.previs`. */
export interface DirectorStudioPrevisState {
  draftText?: string;
  /** Hash of the script segment text the draft was taken from. */
  baselineHash?: string;
  segmentId?: string;
  /** 15 / 30 (V1) or any whole 5–30 s (3D Director). */
  durationSec?: number;
  aspect?: PrevisAspect;
  versions?: PrevisVersion[];
  outputVersionId?: number | null;
  selectedVersionId?: number | null;
  activePreview?: PrevisPreviewMedia;
  pendingRender?: PrevisPendingRender | null;
}

export const PREVIS_MAX_VERSIONS = 20;

export function readPrevisState(content: unknown): DirectorStudioPrevisState {
  const raw = (content as { previs?: unknown } | null | undefined)?.previs;
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as DirectorStudioPrevisState) : {};
}

export function listPrevisVersions(state: DirectorStudioPrevisState): PrevisVersion[] {
  return Array.isArray(state.versions) ? state.versions : [];
}

export function findPrevisVersion(state: DirectorStudioPrevisState, id: number | null | undefined): PrevisVersion | null {
  if (id == null) return null;
  return listPrevisVersions(state).find((v) => v.id === id) ?? null;
}

/** Version shown on the canvas node and fed downstream. */
export function resolvePrevisOutputVersion(state: DirectorStudioPrevisState): PrevisVersion | null {
  const versions = listPrevisVersions(state);
  return findPrevisVersion(state, state.outputVersionId) ?? versions[versions.length - 1] ?? null;
}

export function resolvePrevisSelectedVersion(state: DirectorStudioPrevisState): PrevisVersion | null {
  return findPrevisVersion(state, state.selectedVersionId) ?? resolvePrevisOutputVersion(state);
}

/** Append a new version, make it selected + output, and keep the newest `cap` versions. */
export function appendPrevisVersion(
  state: DirectorStudioPrevisState,
  version: Omit<PrevisVersion, 'id'>,
  cap = PREVIS_MAX_VERSIONS,
): DirectorStudioPrevisState {
  const versions = listPrevisVersions(state);
  const id = versions.reduce((m, v) => Math.max(m, v.id), 0) + 1;
  let next = [...versions, { ...version, id }];
  while (next.length > cap) {
    const dropIndex = next.findIndex((v) => v.id !== id);
    if (dropIndex < 0) break;
    next = next.filter((_, i) => i !== dropIndex);
  }
  return {
    ...state,
    versions: next,
    outputVersionId: id,
    selectedVersionId: id,
    activePreview: 'video',
    pendingRender: null,
  };
}

/** Replace fields of one version (no-op when it is gone). */
export function patchPrevisVersion(
  state: DirectorStudioPrevisState,
  id: number,
  fields: Partial<Omit<PrevisVersion, 'id'>>,
): DirectorStudioPrevisState {
  const versions = listPrevisVersions(state);
  if (!versions.some((v) => v.id === id)) return state;
  return { ...state, versions: versions.map((v) => (v.id === id ? { ...v, ...fields } : v)) };
}

/** Set layout identity (set + props): versions with the same layout can share one scene image. */
export function previsSetSignature(plan: PrevisPlan): string {
  const props = [...(plan.props ?? [])]
    .map((p) => [p.kind ?? '', p.label, p.x, p.y, p.w, p.d, p.h, p.facing ?? ''].join(','))
    .sort();
  return hashPrevisText(JSON.stringify([plan.set ?? null, plan.stage, props]));
}

/** Newest other version with the same set layout and a scene image. */
export function findReusablePrevisScene(state: DirectorStudioPrevisState, plan: PrevisPlan, exceptId?: number): string | null {
  const sig = previsSetSignature(plan);
  const hit = [...listPrevisVersions(state)]
    .reverse()
    .find((v) => v.id !== exceptId && v.sceneImageUrl && previsSetSignature(v.plan) === sig);
  return hit?.sceneImageUrl ?? null;
}

/** Small stable hash for detecting upstream script edits (not security-sensitive). */
export function hashPrevisText(text: string): string {
  let h = 5381;
  const s = text.replace(/\s+/g, ' ').trim();
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const FIGURE_HEX: Record<string, string> = {
  blue: '#3b82f6',
  red: '#ef4444',
  yellow: '#eab308',
  green: '#22c55e',
  purple: '#a855f7',
  orange: '#f97316',
  pink: '#ec4899',
  cyan: '#06b6d4',
  gray: '#9ca3af',
  grey: '#9ca3af',
};

/** Previs figure color name → hex used by the 3D render, top-down map and legend. */
export function previsFigureHex(color: string): string {
  const key = String(color || '').trim().toLowerCase();
  if (FIGURE_HEX[key]) return FIGURE_HEX[key];
  return /^#[0-9a-f]{3,8}$/i.test(key) ? key : FIGURE_HEX.gray;
}
