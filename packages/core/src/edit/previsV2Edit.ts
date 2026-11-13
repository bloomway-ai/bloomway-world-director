/**
 * Manual edits of a 3D Director plan (free): an empty plan in the current world, characters, and character /
 * camera keyframes at a time. Every function returns a new plan; inputs are never mutated (undo keeps snapshots).
 * Coordinates are stage coordinates (x right, y away; metres).
 */
import { createPrevisWorldContext } from '../previsWorldPlan.ts';
import { blendPrevisCameraKeys, blendPrevisCharacterKeys, simplifyPrevisCameraKeys } from './previsSmoothEdit';
import {
  samplePrevisCamera,
  samplePrevisCharacterHeading,
  samplePrevisCharacterSmooth,
  type PrevisCameraKey,
  type PrevisCharacter,
  type PrevisPlan,
} from '../previsPlanCore.ts';
import type { PrevisWorldRef } from '../previsWorldGen.ts';

/** Keys this close in time are the same key. */
export const PREVIS_V2_KEY_SNAP_SEC = 0.05;
const COLORS = ['blue', 'red', 'yellow', 'green', 'purple', 'orange', 'pink', 'cyan'];
const MANUAL_FOV = 40;
const AIM_DISTANCE_M = 8;

const r2 = (v: number) => Math.round(v * 100) / 100 + 0;
const clampT = (plan: PrevisPlan, t: number) => r2(Math.max(0, Math.min(plan.durationSec, t)));
const clone = (plan: PrevisPlan): PrevisPlan => JSON.parse(JSON.stringify(plan)) as PrevisPlan;

/** An empty plan in `world` (no cast yet), its stage centred on `focusX` along the street when given. */
export function createManualPrevisPlan(world: PrevisWorldRef, durationSec: number, focusX?: number): PrevisPlan {
  const ctx = createPrevisWorldContext('', { ref: world, ...(typeof focusX === 'number' ? { focus: { x: focusX, y: 0 } } : {}) });
  const { width, depth } = ctx.geo.stage;
  return {
    version: 1,
    durationSec,
    stage: { width, depth },
    set: { kind: 'outdoor', description: `A ${ctx.geo.streetLabel}.`, world: ctx.ref },
    props: ctx.fixed,
    characters: [],
    camera: { fovDeg: MANUAL_FOV, keys: [{ t: 0, x: r2(width * 0.25), y: r2(-depth * 0.45), h: 1.6, lookAt: { x: 0, y: 0, h: 1.2 } }] },
  };
}

/** New character standing at `at` (one key at `t`); returns the plan and the new id. */
export function addPrevisCharacter(plan: PrevisPlan, at: { x: number; y: number }, t: number, name: string): { plan: PrevisPlan; id: string } {
  const next = clone(plan);
  let n = 1;
  while (next.characters.some((c) => c.id === `c${n}`)) n++;
  const id = `c${n}`;
  const used = new Set(next.characters.map((c) => c.color));
  const color = COLORS.find((c) => !used.has(c)) ?? COLORS[(n - 1) % COLORS.length];
  next.characters.push({ id, name, color, path: [{ t: clampT(plan, t), x: r2(at.x), y: r2(at.y), facing: 0 }] });
  return { plan: next, id };
}

export function removePrevisCharacter(plan: PrevisPlan, id: string): PrevisPlan {
  const next = clone(plan);
  next.characters = next.characters.filter((c) => c.id !== id);
  return next;
}

/** Longest character name (characters). */
export const PREVIS_CHARACTER_NAME_MAX = 24;

/**
 * Rename a character; the plan's own text (title, beats, contact notes) follows. Empty or unchanged names return the
 * plan as is. A Latin name only matches whole words; "Character 1" never touches "Character 10".
 */
export function renamePrevisCharacter(plan: PrevisPlan, id: string, raw: string): PrevisPlan {
  const c = plan.characters.find((x) => x.id === id);
  const name = raw.replace(/@@/g, '').replace(/[【】]/g, '').replace(/\s+/g, ' ').trim().slice(0, PREVIS_CHARACTER_NAME_MAX);
  if (!c || !name || name === c.name) return plan;
  const next = clone(plan);
  next.characters.find((x) => x.id === id)!.name = name;
  const old = c.name.trim();
  if (old) {
    const re = new RegExp(`(?<![A-Za-z0-9])${old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9])`, 'g');
    const swap = (s: string) => s.replace(re, () => name);
    if (next.title) next.title = swap(next.title);
    for (const b of next.beats ?? []) b.text = swap(b.text);
    for (const k of next.contacts ?? []) if (k.what) k.what = swap(k.what);
  }
  return next;
}

/** Colour the next added character gets. */
export function nextPrevisCharacterColor(plan: PrevisPlan | null): string {
  const used = new Set((plan?.characters ?? []).map((c) => c.color));
  return COLORS.find((c) => !used.has(c)) ?? COLORS[(plan?.characters.length ?? 0) % COLORS.length];
}

/** Where a character is and faces (degrees, 0 = +y) at `t`. */
export function previsCharacterPoseAt(c: PrevisCharacter, t: number): { x: number; y: number; facing: number } {
  const p = samplePrevisCharacterSmooth(c, t);
  const deg = (samplePrevisCharacterHeading(c, t) * 180) / Math.PI;
  return { x: r2(p.x), y: r2(p.y), facing: r2(((deg % 360) + 360) % 360) };
}

/** Write (or update) the character's key at `t`; missing fields come from the pose at `t`. */
export function setPrevisCharacterKey(
  plan: PrevisPlan,
  id: string,
  t: number,
  patch: { x?: number; y?: number; facing?: number },
): PrevisPlan {
  // Moving the character by hand re-blends the planned / recorded keys around the new spot.
  const moves = patch.x != null || patch.y != null;
  const next = clone(plan);
  const c = next.characters.find((x) => x.id === id);
  if (!c) return plan;
  const at = clampT(plan, t);
  const i = c.path.findIndex((k) => Math.abs(k.t - at) <= PREVIS_V2_KEY_SNAP_SEC);
  // An existing key keeps its own values; a new key starts from the pose at `t`.
  const pose = i >= 0 ? { x: c.path[i].x, y: c.path[i].y, facing: c.path[i].facing ?? previsCharacterPoseAt(c, at).facing } : previsCharacterPoseAt(c, at);
  const key = {
    t: at,
    x: r2(patch.x ?? pose.x),
    y: r2(patch.y ?? pose.y),
    facing: r2((((patch.facing ?? pose.facing) % 360) + 360) % 360),
  };
  if (i >= 0) c.path[i] = { ...c.path[i], ...key, byHand: true, t: c.path[i].t };
  else c.path = [...c.path, { ...key, byHand: true }].sort((a, b) => a.t - b.t);
  if (moves) c.path = blendPrevisCharacterKeys(c.path, at);
  return next;
}

/** Remove the character key at `t` (the last key stays). */
export function removePrevisCharacterKey(plan: PrevisPlan, id: string, t: number): PrevisPlan {
  const c = plan.characters.find((x) => x.id === id);
  if (!c || c.path.length <= 1) return plan;
  const i = c.path.findIndex((k) => Math.abs(k.t - t) <= PREVIS_V2_KEY_SNAP_SEC);
  if (i < 0) return plan;
  const next = clone(plan);
  next.characters.find((x) => x.id === id)!.path.splice(i, 1);
  return next;
}

/** Camera position and yaw (degrees, 0 = looking toward +y) at `t`. */
export function previsCameraPoseAt(plan: PrevisPlan, t: number): { x: number; y: number; h: number; yaw: number; pitch: number } {
  const s = samplePrevisCamera(plan, t);
  const dx = s.target.x - s.position.x;
  const dy = s.target.y - s.position.y;
  const dh = s.target.h - s.position.h;
  const yaw = (Math.atan2(dx, dy) * 180) / Math.PI;
  const pitch = (Math.atan2(dh, Math.hypot(dx, dy)) * 180) / Math.PI;
  return { x: r2(s.position.x), y: r2(s.position.y), h: r2(s.position.h), yaw: r2(((yaw % 360) + 360) % 360), pitch: r2(pitch) };
}

/** The camera key in effect at `t` (the key at `t`, else the last one before it, else the first). */
function cameraKeyAt(plan: PrevisPlan, t: number): PrevisCameraKey | null {
  const keys = plan.camera.keys;
  if (!keys.length) return null;
  let k = keys[0];
  for (const key of keys) {
    if (key.t <= t + PREVIS_V2_KEY_SNAP_SEC) k = key;
    else break;
  }
  return k;
}

/** Character the camera aims at around `t`, or null when it aims at a fixed point. */
export function previsCameraAimAt(plan: PrevisPlan, t: number): string | null {
  const k = cameraKeyAt(plan, t);
  return k && typeof k.lookAt === 'string' && plan.characters.some((c) => c.id === k.lookAt) ? k.lookAt : null;
}

/** How a key write came about: by hand (re-blends nearby planned / recorded keys when it moves the camera), or recorded. */
export interface PrevisKeyWrite {
  recorded?: boolean;
  /** The key changes where the camera / character is or looks (not only its lens, nor an in-place key). */
  moves?: boolean;
}

/**
 * Write `key` at `t` (merged into a key within the snap), drop the planner's shots (keys now drive the camera). The
 * planner's dense solved keys are reduced to the ones that shape the move first; a hand key that moves the camera
 * re-blends the planned / recorded keys around it.
 */
function putCameraKey(plan: PrevisPlan, t: number, key: Omit<PrevisCameraKey, 't'>, how: PrevisKeyWrite = {}): PrevisPlan {
  const next = clone(plan);
  const at = clampT(plan, t);
  if (next.camera.shots?.length) next.camera.keys = simplifyPrevisCameraKeys(next.camera.keys, next.camera.shots.map((s) => s.t));
  const keys = next.camera.keys;
  const i = keys.findIndex((k) => Math.abs(k.t - at) <= PREVIS_V2_KEY_SNAP_SEC);
  const aimed = typeof key.lookAt === 'string';
  const hand = how.recorded ? {} : { byHand: true };
  if (i >= 0) {
    const merged: PrevisCameraKey = { ...keys[i], ...key, ...hand, t: keys[i].t };
    delete merged.yawDeg;
    if (!aimed) delete merged.lookAtH;
    keys[i] = merged;
  } else keys.push({ t: at, ...key, ...hand });
  keys.sort((a, b) => a.t - b.t);
  if (!how.recorded && how.moves !== false) next.camera.keys = blendPrevisCameraKeys(keys, at);
  delete next.camera.shots;
  return next;
}

/**
 * Write (or update) the camera key at `t`; missing fields come from the camera at `t`. Turning (yaw / pitch) aims at a
 * fixed point in front of the camera; moving, height and lens keep aiming at the character it aims at. The planner's
 * shot list is dropped (keys now drive the camera).
 */
export function setPrevisCameraKey(
  plan: PrevisPlan,
  t: number,
  patch: { x?: number; y?: number; h?: number; yaw?: number; pitch?: number; fov?: number },
  how: Pick<PrevisKeyWrite, 'recorded'> = {},
): PrevisPlan {
  const at = clampT(plan, t);
  const write: PrevisKeyWrite = {
    ...how,
    moves: patch.x != null || patch.y != null || patch.h != null || patch.yaw != null || patch.pitch != null,
  };
  const pose = previsCameraPoseAt(plan, at);
  const x = patch.x ?? pose.x;
  const y = patch.y ?? pose.y;
  const h = Math.max(0.3, patch.h ?? pose.h);
  const fov = typeof patch.fov === 'number' ? { fovDeg: r2(Math.max(10, Math.min(100, patch.fov))) } : {};
  const aim = patch.yaw == null && patch.pitch == null ? previsCameraAimAt(plan, at) : null;
  if (aim) {
    const prev = cameraKeyAt(plan, at);
    return putCameraKey(plan, at, { x: r2(x), y: r2(y), h: r2(h), lookAt: aim, lookAtH: prev?.lookAtH ?? 1.3, ...fov }, write);
  }
  const yaw = ((patch.yaw ?? pose.yaw) * Math.PI) / 180;
  const pitch = ((patch.pitch ?? pose.pitch) * Math.PI) / 180;
  const flat = Math.cos(pitch) * AIM_DISTANCE_M;
  return putCameraKey(
    plan,
    at,
    {
      x: r2(x),
      y: r2(y),
      h: r2(h),
      lookAt: { x: r2(x + Math.sin(yaw) * flat), y: r2(y + Math.cos(yaw) * flat), h: r2(h + Math.sin(pitch) * AIM_DISTANCE_M) },
      ...fov,
    },
    write,
  );
}

/** Remove the camera key at `t` (the last key stays). */
export function removePrevisCameraKey(plan: PrevisPlan, t: number): PrevisPlan {
  if (plan.camera.keys.length <= 1) return plan;
  const i = plan.camera.keys.findIndex((k) => Math.abs(k.t - t) <= PREVIS_V2_KEY_SNAP_SEC);
  if (i < 0) return plan;
  const next = clone(plan);
  next.camera.keys.splice(i, 1);
  if (next.camera.shots?.length) next.camera.keys = simplifyPrevisCameraKeys(next.camera.keys, next.camera.shots.map((s) => s.t));
  delete next.camera.shots;
  return next;
}

/** Remove the camera (all its keys): no planned camera until one is placed again. */
export function removePrevisCamera(plan: PrevisPlan): PrevisPlan {
  const next = clone(plan);
  next.camera.keys = [];
  delete next.camera.shots;
  return next;
}

/** How the camera moves over the shot: one key (holds), its keyframe path, or baked to follow a character. */
export type PrevisCameraMotion = 'static' | 'path' | 'follow';
const FOLLOW_MOVE = 'follow';
const FOLLOW_STEP_SEC = 1;

export function previsCameraMotion(plan: PrevisPlan): PrevisCameraMotion {
  const keys = plan.camera.keys;
  if (keys.length <= 1) return 'static';
  return keys.every((k) => k.move === FOLLOW_MOVE && typeof k.lookAt === 'string') ? 'follow' : 'path';
}

/**
 * static: the camera holds its pose at `t` for the whole shot (one key; it still turns to a character it aims at).
 * follow: keys every second keep the camera's offset at `t` from the character (`id`, else the one it aims at, else
 * the first), aiming at them. path: a followed camera keeps its keys as a plain path (no change from static).
 */
export function setPrevisCameraMotion(plan: PrevisPlan, t: number, motion: PrevisCameraMotion, id?: string): PrevisPlan {
  if (!plan.camera.keys.length) return plan;
  const at = clampT(plan, t);
  const s = samplePrevisCamera(plan, at);
  const pose = previsCameraPoseAt(plan, at);
  const current = cameraKeyAt(plan, at);
  if (motion === 'path') {
    if (previsCameraMotion(plan) !== 'follow') return plan;
    const next = clone(plan);
    next.camera.keys.forEach((k) => delete k.move);
    return next;
  }
  if (motion === 'static') {
    const next = clone(plan);
    const aim = previsCameraAimAt(plan, at);
    const yaw = (pose.yaw * Math.PI) / 180;
    const pitch = (pose.pitch * Math.PI) / 180;
    const flat = Math.cos(pitch) * AIM_DISTANCE_M;
    next.camera.keys = [
      {
        t: 0,
        x: pose.x,
        y: pose.y,
        h: pose.h,
        ...(aim
          ? { lookAt: aim, lookAtH: current?.lookAtH ?? 1.3 }
          : { lookAt: { x: r2(pose.x + Math.sin(yaw) * flat), y: r2(pose.y + Math.cos(yaw) * flat), h: r2(pose.h + Math.sin(pitch) * AIM_DISTANCE_M) } }),
        fovDeg: r2(s.fovDeg),
      },
    ];
    delete next.camera.shots;
    return next;
  }
  const who = plan.characters.find((c) => c.id === (id ?? previsCameraAimAt(plan, at))) ?? plan.characters[0];
  if (!who) return plan;
  const cp = previsCharacterPoseAt(who, at);
  const ox = pose.x - cp.x;
  const oy = pose.y - cp.y;
  const lookAtH = current && current.lookAt === who.id ? current.lookAtH ?? 1.3 : 1.3;
  const times = new Set<number>();
  for (let u = 0; u < plan.durationSec; u += FOLLOW_STEP_SEC) times.add(r2(u));
  times.add(r2(plan.durationSec));
  for (const k of who.path) times.add(clampT(plan, k.t));
  const next = clone(plan);
  next.camera.keys = [...times]
    .sort((a, b) => a - b)
    .map((u) => {
      const p = previsCharacterPoseAt(who, u);
      return { t: u, x: r2(p.x + ox), y: r2(p.y + oy), h: pose.h, lookAt: who.id, lookAtH, move: FOLLOW_MOVE, fovDeg: r2(s.fovDeg) };
    });
  delete next.camera.shots;
  return next;
}

/** Aim at a character from where the camera is at `t`, or (null) at a fixed point straight ahead. */
export function setPrevisCameraAim(plan: PrevisPlan, t: number, id: string | null): PrevisPlan {
  if (!plan.camera.keys.length) return plan;
  const at = clampT(plan, t);
  const pose = previsCameraPoseAt(plan, at);
  if (!id) return setPrevisCameraKey(plan, at, { yaw: pose.yaw, pitch: pose.pitch });
  if (!plan.characters.some((c) => c.id === id)) return plan;
  const prev = cameraKeyAt(plan, at);
  return putCameraKey(plan, at, { x: pose.x, y: pose.y, h: pose.h, lookAt: id, lookAtH: prev?.lookAt === id ? prev.lookAtH ?? 1.3 : 1.3 });
}

/** Shot sizes, wide to tight: frame height at the subject (m) and where on them the camera aims (m). */
export const PREVIS_SHOT_SIZES = ['long', 'full', 'medium', 'close', 'detail'] as const;
export type PrevisShotSize = (typeof PREVIS_SHOT_SIZES)[number];
const SHOT_FRAME: Record<PrevisShotSize, { frameM: number; aimH: number }> = {
  long: { frameM: 7, aimH: 1 },
  full: { frameM: 2.3, aimH: 0.95 },
  medium: { frameM: 1.4, aimH: 1.25 },
  close: { frameM: 0.9, aimH: 1.45 },
  detail: { frameM: 0.45, aimH: 1.6 },
};
const halfTan = (fovDeg: number) => Math.tan(((fovDeg / 2) * Math.PI) / 180);

/** Shot size of the camera at `t` on the character it aims at (null when it aims at a fixed point). */
export function previsCameraShotSizeAt(plan: PrevisPlan, t: number): PrevisShotSize | null {
  if (!previsCameraAimAt(plan, t)) return null;
  const s = samplePrevisCamera(plan, t);
  const d = Math.hypot(s.target.x - s.position.x, s.target.y - s.position.y, s.target.h - s.position.h);
  const frame = 2 * d * halfTan(s.fovDeg);
  let best: PrevisShotSize = 'medium';
  for (const k of PREVIS_SHOT_SIZES) {
    if (Math.abs(Math.log(frame / SHOT_FRAME[k].frameM)) < Math.abs(Math.log(frame / SHOT_FRAME[best].frameM))) best = k;
  }
  return best;
}

/** Move the camera along its line to the character it aims at so they fill the frame as `size` (lens unchanged). */
export function setPrevisCameraShotSize(plan: PrevisPlan, t: number, size: PrevisShotSize): PrevisPlan {
  const at = clampT(plan, t);
  const id = previsCameraAimAt(plan, at);
  const who = plan.characters.find((c) => c.id === id);
  if (!who) return plan;
  const s = samplePrevisCamera(plan, at);
  const cp = previsCharacterPoseAt(who, at);
  const { frameM, aimH } = SHOT_FRAME[size];
  const d = frameM / (2 * halfTan(s.fovDeg));
  let dx = s.position.x - cp.x;
  let dy = s.position.y - cp.y;
  let len = Math.hypot(dx, dy);
  if (len < 0.2) {
    const f = (cp.facing * Math.PI) / 180;
    dx = Math.sin(f);
    dy = Math.cos(f);
    len = 1;
  }
  let h = s.position.h;
  if (Math.abs(h - aimH) > d * 0.8) h = aimH + Math.sign(h - aimH) * d * 0.8;
  const flat = Math.sqrt(Math.max(d * d - (h - aimH) ** 2, 0.36));
  return putCameraKey(plan, at, { x: r2(cp.x + (dx / len) * flat), y: r2(cp.y + (dy / len) * flat), h: r2(Math.max(0.3, h)), lookAt: who.id, lookAtH: aimH });
}

/** Camera height presets (m) and the tilt used when the camera aims at a fixed point. */
export const PREVIS_CAMERA_HEIGHTS = { low: 0.5, eye: 1.6, high: 3.2, top: 9 } as const;
export type PrevisCameraHeightPreset = keyof typeof PREVIS_CAMERA_HEIGHTS;
const FIXED_PITCH: Record<PrevisCameraHeightPreset, number> = { low: 8, eye: 0, high: -15, top: -60 };

export function previsCameraHeightPreset(h: number): PrevisCameraHeightPreset {
  if (h < 1) return 'low';
  if (h < 2.4) return 'eye';
  return h < 6 ? 'high' : 'top';
}

export function setPrevisCameraHeight(plan: PrevisPlan, t: number, preset: PrevisCameraHeightPreset): PrevisPlan {
  const h = PREVIS_CAMERA_HEIGHTS[preset];
  return previsCameraAimAt(plan, t) ? setPrevisCameraKey(plan, t, { h }) : setPrevisCameraKey(plan, t, { h, pitch: FIXED_PITCH[preset] });
}

/**
 * Apply a camera panel edit at the playhead: a static camera edits its one key, a followed camera is baked again from
 * the edited pose, so the motion the user chose stays.
 */
export function editPrevisCamera(plan: PrevisPlan, t: number, edit: (p: PrevisPlan, at: number) => PrevisPlan): PrevisPlan {
  if (!plan.camera.keys.length) return plan;
  const motion = previsCameraMotion(plan);
  const at = motion === 'static' ? plan.camera.keys[0].t : t;
  const next = edit(plan, at);
  if (next === plan) return plan;
  if (motion === 'follow' && previsCameraAimAt(next, at)) return setPrevisCameraMotion(next, at, 'follow');
  return next;
}

/** True when any character or the camera moves (more than one key, or planned shots). */
export function previsHasMotion(plan: PrevisPlan): boolean {
  return plan.camera.keys.length > 1 || !!plan.camera.shots?.length || plan.characters.some((c) => c.path.length > 1);
}

/** Reset motion: every character and the camera keep only their first key (where they start), no planned shots. */
export function resetPrevisMotion(plan: PrevisPlan): PrevisPlan {
  if (!previsHasMotion(plan)) return plan;
  const next = clone(plan);
  for (const c of next.characters) {
    const first = [...c.path].sort((a, b) => a.t - b.t)[0];
    if (first) c.path = [{ ...first, t: 0 }];
  }
  const cam = [...next.camera.keys].sort((a, b) => a.t - b.t)[0];
  next.camera.keys = cam ? [{ ...cam, t: 0 }] : [];
  delete next.camera.shots;
  return next;
}

/** Live samples taken while recording (stage coordinates; t from the start of the take). */
export interface PrevisRecordedCameraSample {
  t: number;
  x: number;
  y: number;
  h: number;
  yaw: number;
  pitch: number;
}
export interface PrevisRecordedCharacterSample {
  t: number;
  x: number;
  y: number;
}

/** Key spacing for recorded motion: dense enough to keep the move, sparse enough to edit. */
export const PREVIS_V2_RECORD_KEY_SEC = 0.5;

function sampleAt<T extends { t: number }>(samples: T[], t: number): T {
  let best = samples[0];
  for (const s of samples) if (Math.abs(s.t - t) < Math.abs(best.t - t)) best = s;
  return best;
}
function keyTimes(end: number, step: number): number[] {
  const times: number[] = [];
  for (let t = 0; t < end - 1e-6; t += step) times.push(r2(t));
  times.push(r2(end));
  return times;
}

/** Replace the camera with a recorded move (keys every `step` s, field of view of the recorded frame). */
export function applyRecordedCamera(plan: PrevisPlan, samples: PrevisRecordedCameraSample[], fov: number, step = PREVIS_V2_RECORD_KEY_SEC): PrevisPlan {
  if (!samples.length) return plan;
  const end = Math.min(plan.durationSec, samples[samples.length - 1].t);
  let next: PrevisPlan = { ...clone(plan), camera: { ...plan.camera, keys: [] } };
  delete next.camera.shots;
  for (const t of keyTimes(end, step)) {
    const s = sampleAt(samples, t);
    next = setPrevisCameraKey(next, t, { x: s.x, y: s.y, h: s.h, yaw: s.yaw, pitch: s.pitch, fov }, { recorded: true });
  }
  return next;
}

/** Replace a character's path during the take with a recorded walk (later keys are kept); facing follows the walk. */
export function applyRecordedCharacter(plan: PrevisPlan, id: string, samples: PrevisRecordedCharacterSample[], step = PREVIS_V2_RECORD_KEY_SEC): PrevisPlan {
  if (!samples.length || !plan.characters.some((c) => c.id === id)) return plan;
  const end = Math.min(plan.durationSec, samples[samples.length - 1].t);
  const next = clone(plan);
  const c = next.characters.find((x) => x.id === id)!;
  const later = c.path.filter((k) => k.t > end + PREVIS_V2_KEY_SNAP_SEC);
  const keys = keyTimes(end, step).map((t, i, all) => {
    const s = sampleAt(samples, t);
    const ahead = sampleAt(samples, all[Math.min(all.length - 1, i + 1)]);
    const behind = sampleAt(samples, all[Math.max(0, i - 1)]);
    const dx = ahead.x - behind.x;
    const dy = ahead.y - behind.y;
    const moving = Math.hypot(dx, dy) > 0.05;
    return { t, x: r2(s.x), y: r2(s.y), ...(moving ? { facing: r2(((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360) } : {}) };
  });
  // Standing keys keep the last walking direction.
  let facing = c.path[0]?.facing ?? 0;
  c.path = [...keys.map((k) => ('facing' in k ? ((facing = k.facing as number), k) : { ...k, facing })), ...later];
  return next;
}
