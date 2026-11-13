/**
 * 3D Director timeline: several keyframes at once — selected with a box, moved along the timeline together (moving a
 * key changes how fast the motion to and from it is), deleted together. Tracks: 'camera' or a character id.
 */
import type { PrevisPlan } from '../previsPlanCore.ts';

export interface PrevisKeyRef {
  track: string;
  t: number;
}

/** Moved keys stay at least this far (s) from the unselected keys next to them (order never changes). */
const KEY_GAP_SEC = 0.1;
/** Moves snap to this step (s). */
const MOVE_STEP_SEC = 0.05;

const r2 = (v: number) => Math.round(v * 100) / 100;
const sameT = (a: number, b: number) => Math.abs(a - b) < 1e-6;

function keysOf(plan: PrevisPlan, track: string): Array<{ t: number }> {
  if (track === 'camera') return plan.camera.shots?.length ? [] : plan.camera.keys;
  return plan.characters.find((c) => c.id === track)?.path ?? [];
}

export function isPrevisKeySelected(sel: readonly PrevisKeyRef[], track: string, t: number): boolean {
  return sel.some((s) => s.track === track && sameT(s.t, t));
}

/** The selection without keys that no longer exist (after an edit, another draft…). */
export function prunePrevisKeySelection(plan: PrevisPlan, sel: readonly PrevisKeyRef[]): PrevisKeyRef[] {
  const kept = sel.filter((s) => keysOf(plan, s.track).some((k) => sameT(k.t, s.t)));
  return kept.length === sel.length ? (sel as PrevisKeyRef[]) : kept;
}

/** Keys of `tracks` between `t0` and `t1` (a box drawn over the timeline). */
export function previsKeysInRange(plan: PrevisPlan, tracks: readonly string[], t0: number, t1: number): PrevisKeyRef[] {
  const lo = Math.min(t0, t1);
  const hi = Math.max(t0, t1);
  return tracks.flatMap((track) => keysOf(plan, track).filter((k) => k.t >= lo - 1e-6 && k.t <= hi + 1e-6).map((k) => ({ track, t: k.t })));
}

/** How far (s) the selected keys can move together: inside 0…duration, never past an unselected neighbour. */
export function previsKeyShiftRange(plan: PrevisPlan, sel: readonly PrevisKeyRef[], duration: number): { min: number; max: number } {
  let min = -Infinity;
  let max = Infinity;
  for (const track of new Set(sel.map((s) => s.track))) {
    const keys = [...keysOf(plan, track)].sort((a, b) => a.t - b.t);
    const chosen = keys.map((k) => isPrevisKeySelected(sel, track, k.t));
    keys.forEach((k, i) => {
      if (!chosen[i]) return;
      min = Math.max(min, -k.t);
      max = Math.min(max, duration - k.t);
      for (let j = i - 1; j >= 0; j--) {
        if (chosen[j]) continue;
        min = Math.max(min, keys[j].t + KEY_GAP_SEC - k.t);
        break;
      }
      for (let j = i + 1; j < keys.length; j++) {
        if (chosen[j]) continue;
        max = Math.min(max, keys[j].t - KEY_GAP_SEC - k.t);
        break;
      }
    });
  }
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) return { min: 0, max: 0 };
  return { min: r2(min), max: r2(max) };
}

/** Clamp and snap a requested move of the selection. */
export function previsKeyShift(plan: PrevisPlan, sel: readonly PrevisKeyRef[], dt: number, duration: number): number {
  const { min, max } = previsKeyShiftRange(plan, sel, duration);
  const snapped = Math.round(dt / MOVE_STEP_SEC) * MOVE_STEP_SEC;
  return r2(Math.max(min, Math.min(max, snapped)));
}

/** Move the selected keys together by `dt` (clamped, snapped); returns the plan and the moved selection. */
export function shiftPrevisKeys(
  plan: PrevisPlan,
  sel: readonly PrevisKeyRef[],
  dt: number,
  duration: number,
): { plan: PrevisPlan; sel: PrevisKeyRef[] } {
  const d = previsKeyShift(plan, sel, dt, duration);
  if (d === 0 || sel.length === 0) return { plan, sel: [...sel] };
  const next: PrevisPlan = JSON.parse(JSON.stringify(plan));
  const move = <K extends { t: number }>(track: string, keys: K[]): K[] =>
    keys.map((k) => (isPrevisKeySelected(sel, track, k.t) ? { ...k, t: r2(k.t + d) } : k)).sort((a, b) => a.t - b.t);
  if (sel.some((s) => s.track === 'camera') && !next.camera.shots?.length) next.camera.keys = move('camera', next.camera.keys);
  for (const c of next.characters) if (sel.some((s) => s.track === c.id)) c.path = move(c.id, c.path);
  return { plan: next, sel: sel.map((s) => ({ ...s, t: r2(s.t + d) })) };
}

/** Delete the selected keys; every track keeps at least one key (its earliest), so nobody disappears. */
export function removePrevisKeys(plan: PrevisPlan, sel: readonly PrevisKeyRef[]): PrevisPlan {
  if (sel.length === 0) return plan;
  const next: PrevisPlan = JSON.parse(JSON.stringify(plan));
  const keep = <K extends { t: number }>(track: string, keys: K[]): K[] => {
    const rest = keys.filter((k) => !isPrevisKeySelected(sel, track, k.t));
    return rest.length > 0 ? rest : [...keys].sort((a, b) => a.t - b.t).slice(0, 1);
  };
  let changed = false;
  if (sel.some((s) => s.track === 'camera') && !next.camera.shots?.length) {
    const keys = keep('camera', next.camera.keys);
    changed ||= keys.length !== next.camera.keys.length;
    next.camera.keys = keys;
  }
  for (const c of next.characters) {
    if (!sel.some((s) => s.track === c.id)) continue;
    const path = keep(c.id, c.path);
    changed ||= path.length !== c.path.length;
    c.path = path;
  }
  return changed ? next : plan;
}
