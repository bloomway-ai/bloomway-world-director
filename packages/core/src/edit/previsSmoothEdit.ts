/**
 * Hand edits on planned / recorded motion (3D Director). The planner's camera is solved into a key every 0.25 s and
 * recordings keep a key every 0.5 s; a hand key dropped among them makes the path kink and jitter. Before the first
 * hand edit the planned camera is reduced to the keys that shape its move, and every hand edit re-blends: planned /
 * recorded keys close to it give way, so the motion runs from the nearest kept positions through the new one.
 */
import type { PrevisCameraKey, PrevisCharacterKey, PrevisPoint3 } from '../previsPlanCore.ts';

/** Planned / recorded keys this close to a hand key give way to it (s). */
export const PREVIS_BLEND_SEC = 1.2;
/** A planned camera key is kept when dropping it would move the path by more than this (m). */
const SIMPLIFY_TOL_M = 0.3;
/** Two keys closer than this (m) are the same spot (a stand). */
const SAME_SPOT_M = 0.05;

function lerp(a: number, b: number, w: number): number {
  return a + (b - a) * w;
}

function aimPoint(k: PrevisCameraKey): PrevisPoint3 | null {
  return typeof k.lookAt === 'string' ? null : k.lookAt;
}

function sameAim(a: PrevisCameraKey, b: PrevisCameraKey): boolean {
  if (typeof a.lookAt === 'string' || typeof b.lookAt === 'string') return a.lookAt === b.lookAt;
  return true;
}

/** How far `k` is from the straight move between `a` and `b` at its time (position, and a fixed aim point). */
function deviation(a: PrevisCameraKey, b: PrevisCameraKey, k: PrevisCameraKey): number {
  const w = b.t > a.t ? (k.t - a.t) / (b.t - a.t) : 0;
  const pos = Math.hypot(k.x - lerp(a.x, b.x, w), k.y - lerp(a.y, b.y, w), k.h - lerp(a.h, b.h, w));
  const pa = aimPoint(a);
  const pb = aimPoint(b);
  const pk = aimPoint(k);
  const aim = pa && pb && pk ? Math.hypot(pk.x - lerp(pa.x, pb.x, w), pk.y - lerp(pa.y, pb.y, w), pk.h - lerp(pa.h, pb.h, w)) : 0;
  const lens = Math.abs((k.fovDeg ?? 0) - lerp(a.fovDeg ?? 0, b.fovDeg ?? 0, w)) / 10 + Math.abs((k.rollDeg ?? 0) - lerp(a.rollDeg ?? 0, b.rollDeg ?? 0, w)) / 10;
  return Math.max(pos, aim, lens);
}

/**
 * The keys that shape a dense planned camera: first, last, both sides of each shot change, aim switches, and as few
 * others as keep the path within 0.3 m (Douglas–Peucker on time).
 */
export function simplifyPrevisCameraKeys(keys: readonly PrevisCameraKey[], shotTimes: readonly number[] = []): PrevisCameraKey[] {
  const sorted = [...keys].sort((a, b) => a.t - b.t);
  if (sorted.length <= 2) return sorted;
  const keep = new Set<number>([0, sorted.length - 1]);
  for (const st of shotTimes) {
    let best = 0;
    for (let i = 1; i < sorted.length; i++) if (Math.abs(sorted[i].t - st) < Math.abs(sorted[best].t - st)) best = i;
    keep.add(best);
    if (best > 0) keep.add(best - 1);
  }
  for (let i = 1; i < sorted.length; i++) {
    if (!sameAim(sorted[i - 1], sorted[i]) || sorted[i].byHand) {
      keep.add(i - 1);
      keep.add(i);
    }
  }
  const anchors = [...keep].sort((a, b) => a - b);
  const refine = (i: number, j: number) => {
    let worst = -1;
    let dev = SIMPLIFY_TOL_M;
    for (let k = i + 1; k < j; k++) {
      const d = deviation(sorted[i], sorted[j], sorted[k]);
      if (d > dev) {
        dev = d;
        worst = k;
      }
    }
    if (worst < 0) return;
    keep.add(worst);
    refine(i, worst);
    refine(worst, j);
  };
  for (let n = 1; n < anchors.length; n++) refine(anchors[n - 1], anchors[n]);
  return [...keep].sort((a, b) => a - b).map((i) => sorted[i]);
}

/** Camera keys after a hand key at `at`: planned / recorded keys near it give way (ends and aim switches stay). */
export function blendPrevisCameraKeys(keys: readonly PrevisCameraKey[], at: number): PrevisCameraKey[] {
  const sorted = [...keys].sort((a, b) => a.t - b.t);
  return sorted.filter((k, i) => {
    if (k.byHand || Math.abs(k.t - at) >= PREVIS_BLEND_SEC || i === 0 || i === sorted.length - 1) return true;
    const prev = sorted[i - 1];
    const next = sorted[i + 1];
    return (prev && !sameAim(prev, k)) || (next && !sameAim(k, next));
  });
}

/** Character keys after a hand key at `at`: planned / recorded keys near it give way (ends and stands stay). */
export function blendPrevisCharacterKeys(path: readonly PrevisCharacterKey[], at: number): PrevisCharacterKey[] {
  const sorted = [...path].sort((a, b) => a.t - b.t);
  const sameSpot = (a?: PrevisCharacterKey, b?: PrevisCharacterKey) => !!a && !!b && Math.hypot(a.x - b.x, a.y - b.y) <= SAME_SPOT_M;
  return sorted.filter((k, i) => {
    if (k.byHand || Math.abs(k.t - at) >= PREVIS_BLEND_SEC || i === 0 || i === sorted.length - 1) return true;
    return sameSpot(sorted[i - 1], k) || sameSpot(k, sorted[i + 1]);
  });
}
