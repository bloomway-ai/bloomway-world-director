/** WASD pilot keys shared by free camera (navigator) and OSS selection pilot. */
export const PILOT_MOVE_KEYS = new Set(['w', 'a', 's', 'd', 'q', 'e', 'shift']);

const CODE_TO_MOVE: Record<string, string> = {
  KeyW: 'w',
  KeyA: 'a',
  KeyS: 's',
  KeyD: 'd',
  KeyQ: 'q',
  KeyE: 'e',
  ShiftLeft: 'shift',
  ShiftRight: 'shift',
};

export function pilotKeyFromEvent(e: KeyboardEvent): string | null {
  const fromCode = CODE_TO_MOVE[e.code];
  if (fromCode) return fromCode;
  const k = e.key.toLowerCase();
  return PILOT_MOVE_KEYS.has(k) ? k : null;
}

export function typingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

/** Stage-plane step from camera yaw (degrees) and WASD. Optional Q/E → vertical (camera only). */
export function pilotStageStep(
  keys: Set<string>,
  yawDeg: number,
  speedMps: number,
  dt: number,
  opts?: { vertical?: boolean },
): { dx: number; dy: number; dz: number } {
  const step = speedMps * (keys.has('shift') ? 3 : 1) * dt;
  const yaw = (yawDeg * Math.PI) / 180;
  const fy = (keys.has('w') ? 1 : 0) - (keys.has('s') ? 1 : 0);
  const fx = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0);
  let dx = 0;
  let dy = 0;
  if (fx || fy) {
    const len = Math.hypot(fx, fy) || 1;
    dx = ((Math.sin(yaw) * fy + Math.cos(yaw) * fx) / len) * step;
    dy = ((Math.cos(yaw) * fy - Math.sin(yaw) * fx) / len) * step;
  }
  let dz = 0;
  if (opts?.vertical) {
    if (keys.has('e')) dz += step;
    if (keys.has('q')) dz -= step;
  }
  return { dx, dy, dz };
}