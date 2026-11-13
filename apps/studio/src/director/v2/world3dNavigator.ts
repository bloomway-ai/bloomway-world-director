/**
 * Viewport navigation (no inertia): left-drag grabs the ground and drags the space under the cursor, right-drag
 * turns the view, W/A/S/D move, Q/E go down / up, Shift is faster, the wheel moves forward / back. Keys work while
 * the viewport has focus, also together with a right-drag. Touch: one finger drags the space, two fingers turn the
 * view and pinch moves forward / back. Trackpad: two-finger swipe turns the view, pinch moves forward / back.
 * The camera never enters solid buildings or goes below the ground.
 */
import * as THREE from 'three';

export interface World3dNavigator {
  /** Walking speed in m/s (Shift = ×3). */
  setSpeed(mps: number): void;
  /** Multiplier on right-drag turning speed (1 = default). */
  setLookSensitivity(mult: number): void;
  /** Sync yaw / pitch after the camera was placed programmatically. */
  syncFromCamera(): void;
  setEnabled(enabled: boolean): void;
  /** Keyboard movement only (e.g. while the keys walk a character). */
  setKeysEnabled(enabled: boolean): void;
  /** Advance key movement; call once per frame. */
  update(dt: number): void;
  dispose(): void;
}

export interface World3dNavigatorOptions {
  /** True when a point (three.js coordinates) is inside something solid. */
  blocked?: (p: THREE.Vector3) => boolean;
  minHeight?: number;
  /** Ground height at three.js x (sloped / rolling worlds); flat ground at 0 when missing. */
  groundAt?: (x: number) => number;
}

const LOOK_RAD_PER_PX = 0.0035;
const WHEEL_M_PER_UNIT = 0.012;
const TRACKPAD_PINCH_M_PER_UNIT = 0.08;
/** Two-finger swipe deltas relative to a right-drag in pixels. */
const TRACKPAD_TURN_SCALE = 0.6;
const MOVE_KEYS = new Set(['w', 'a', 's', 'd', 'q', 'e', 'shift']);

export function createWorld3dNavigator(
  camera: THREE.PerspectiveCamera,
  dom: HTMLElement,
  opts: World3dNavigatorOptions = {},
): World3dNavigator {
  const minHeight = opts.minHeight ?? 0.3;
  let speed = 4;
  let lookRadPerPx = LOOK_RAD_PER_PX;
  let enabled = true;
  let keysEnabled = true;
  let yaw = 0;
  let pitch = 0;
  const keys = new Set<string>();
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const raycaster = new THREE.Raycaster();
  let grab: { point: THREE.Vector3; plane: THREE.Plane; pointerId: number; eyeY: number } | null = null;
  let look: { x: number; y: number; pointerId: number } | null = null;
  /** Active touch points and the last two-finger midpoint / spread. */
  const touches = new Map<number, { x: number; y: number }>();
  let pair: { mx: number; my: number; dist: number } | null = null;

  const applyLook = () => {
    const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
    camera.lookAt(camera.position.clone().add(dir));
  };
  const syncFromCamera = () => {
    const d = new THREE.Vector3();
    camera.getWorldDirection(d);
    yaw = Math.atan2(d.x, -d.z);
    pitch = Math.asin(THREE.MathUtils.clamp(d.y, -1, 1));
  };
  /** Move to `next` unless blocked; slide along walls; keep above the ground. */
  const floorAt = (x: number) => (opts.groundAt?.(x) ?? 0) + minHeight;
  const moveTo = (next: THREE.Vector3) => {
    next.y = Math.max(floorAt(next.x), next.y);
    const blocked = opts.blocked;
    if (!blocked || !blocked(next)) {
      camera.position.copy(next);
      return;
    }
    const xOnly = new THREE.Vector3(next.x, next.y, camera.position.z);
    const zOnly = new THREE.Vector3(camera.position.x, next.y, next.z);
    if (!blocked(xOnly)) camera.position.copy(xOnly);
    else if (!blocked(zOnly)) camera.position.copy(zOnly);
    else camera.position.y = Math.max(floorAt(camera.position.x), camera.position.y);
  };
  const rayAt = (e: { clientX: number; clientY: number }) => {
    const r = dom.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.ray;
  };

  const startGrab = (e: { clientX: number; clientY: number; pointerId: number }) => {
    // Grab the ground under the pointer (or a plane through the aimed point when looking at the sky).
    const ray = rayAt(e);
    const hit = new THREE.Vector3();
    // On sloped / rolling ground the grab plane sits at the ground height under the camera.
    let plane = opts.groundAt ? new THREE.Plane(new THREE.Vector3(0, 1, 0), -opts.groundAt(camera.position.x)) : ground;
    if (!ray.intersectPlane(plane, hit) || hit.distanceTo(camera.position) > 400) {
      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      plane = new THREE.Plane().setFromNormalAndCoplanarPoint(fwd.clone().negate(), camera.position.clone().addScaledVector(fwd, 20));
      if (!ray.intersectPlane(plane, hit)) return false;
    }
    // Lock pan plane height for this grab so sloped ground does not retarget the ray each frame.
    if (opts.groundAt) plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -hit.y);
    grab = { point: hit, plane, pointerId: e.pointerId, eyeY: camera.position.y };
    return true;
  };
  /** Horizontal pan while dragging; do not snap Y to rolling ground (that causes visible jitter). */
  const panTo = (next: THREE.Vector3) => {
    next.y = grab?.eyeY ?? camera.position.y;
    const blocked = opts.blocked;
    if (!blocked || !blocked(next)) {
      camera.position.copy(next);
      return;
    }
    const xOnly = new THREE.Vector3(next.x, next.y, camera.position.z);
    const zOnly = new THREE.Vector3(camera.position.x, next.y, next.z);
    if (!blocked(xOnly)) camera.position.copy(xOnly);
    else if (!blocked(zOnly)) camera.position.copy(zOnly);
  };
  const dolly = (m: number) => {
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    moveTo(camera.position.clone().addScaledVector(fwd, m * Math.max(1, speed / 4)));
  };
  const turn = (dx: number, dy: number) => {
    yaw += dx * lookRadPerPx;
    pitch = THREE.MathUtils.clamp(pitch - dy * lookRadPerPx, -1.45, 1.45);
    applyLook();
  };
  const pairOf = () => {
    const [a, b] = [...touches.values()];
    return { mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, dist: Math.hypot(a.x - b.x, a.y - b.y) };
  };

  const onPointerDown = (e: PointerEvent) => {
    if (!enabled) return;
    dom.focus({ preventScroll: true });
    if (e.pointerType === 'touch') {
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      dom.setPointerCapture(e.pointerId);
      e.preventDefault();
      if (touches.size === 1) startGrab(e);
      else {
        grab = null;
        pair = touches.size === 2 ? pairOf() : null;
      }
      return;
    }
    if (e.button === 2) {
      look = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
      dom.setPointerCapture(e.pointerId);
      e.preventDefault();
    } else if (e.button === 0) {
      if (!startGrab(e)) return;
      dom.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  };
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch' && touches.has(e.pointerId)) {
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size >= 2 && pair) {
        // Two fingers: the midpoint turns the view (like a right-drag), the spread moves forward / back.
        const next = pairOf();
        turn(next.mx - pair.mx, next.my - pair.my);
        dolly((next.dist - pair.dist) * 0.05);
        pair = next;
        return;
      }
    }
    if (look && e.pointerId === look.pointerId) {
      turn(e.clientX - look.x, e.clientY - look.y);
      look.x = e.clientX;
      look.y = e.clientY;
    } else if (grab && e.pointerId === grab.pointerId) {
      const hit = new THREE.Vector3();
      if (!rayAt(e).intersectPlane(grab.plane, hit)) return;
      const delta = grab.point.clone().sub(hit);
      delta.y = 0;
      panTo(camera.position.clone().add(delta));
    }
  };
  const onPointerUp = (e: PointerEvent) => {
    if (look?.pointerId === e.pointerId) look = null;
    if (grab?.pointerId === e.pointerId) grab = null;
    if (touches.delete(e.pointerId)) {
      pair = touches.size === 2 ? pairOf() : null;
      // Back to one finger: keep dragging the space from where that finger is now.
      if (touches.size === 1) {
        const [id, p] = [...touches.entries()][0];
        startGrab({ clientX: p.x, clientY: p.y, pointerId: id });
      }
    }
    if (dom.hasPointerCapture(e.pointerId)) dom.releasePointerCapture(e.pointerId);
  };
  /** Trackpad scroll (small, fractional or sideways deltas) vs a notched mouse wheel. */
  const isTrackpadScroll = (e: WheelEvent) => {
    if (e.deltaMode !== 0) return false;
    if (Math.abs(e.deltaX) > 0.5) return true;
    const legacy = (e as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY;
    if (typeof legacy === 'number' && legacy !== 0) return legacy % 120 !== 0;
    return Math.abs(e.deltaY) < 40;
  };
  const onWheel = (e: WheelEvent) => {
    if (!enabled) return;
    e.preventDefault();
    if (e.ctrlKey) {
      // Trackpad pinch (reported as ctrl + wheel).
      dolly(-e.deltaY * TRACKPAD_PINCH_M_PER_UNIT);
      return;
    }
    if (isTrackpadScroll(e)) {
      // Two-finger swipe turns the view, like dragging with the right button.
      turn(-e.deltaX * TRACKPAD_TURN_SCALE, -e.deltaY * TRACKPAD_TURN_SCALE);
      return;
    }
    dolly(-e.deltaY * WHEEL_M_PER_UNIT);
  };
  const onContextMenu = (e: Event) => e.preventDefault();
  const typing = (t: EventTarget | null) => {
    const el = t as HTMLElement | null;
    return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (!enabled || !keysEnabled || typing(e.target) || document.activeElement !== dom) return;
    const k = e.key.toLowerCase();
    if (!MOVE_KEYS.has(k)) return;
    keys.add(k);
    e.preventDefault();
    e.stopPropagation();
  };
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
  const onBlur = () => keys.clear();

  dom.addEventListener('pointerdown', onPointerDown);
  dom.addEventListener('pointermove', onPointerMove);
  dom.addEventListener('pointerup', onPointerUp);
  dom.addEventListener('pointercancel', onPointerUp);
  dom.addEventListener('wheel', onWheel, { passive: false });
  dom.addEventListener('contextmenu', onContextMenu);
  dom.addEventListener('blur', onBlur);
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('keyup', onKeyUp, true);
  syncFromCamera();

  return {
    setSpeed(mps) {
      speed = THREE.MathUtils.clamp(mps, 0.5, 30);
    },
    setLookSensitivity(mult) {
      lookRadPerPx = LOOK_RAD_PER_PX * THREE.MathUtils.clamp(mult, 0.25, 4);
    },
    syncFromCamera,
    setKeysEnabled(v) {
      keysEnabled = v;
      if (!v) keys.clear();
    },
    setEnabled(v) {
      enabled = v;
      if (!v) {
        keys.clear();
        look = null;
        grab = null;
        touches.clear();
        pair = null;
      }
    },
    update(dt) {
      if (!enabled || keys.size === 0) return;
      const step = speed * (keys.has('shift') ? 3 : 1) * dt;
      const fx = Math.sin(yaw);
      const fz = -Math.cos(yaw);
      const move = new THREE.Vector3();
      if (keys.has('w')) move.add(new THREE.Vector3(fx, 0, fz));
      if (keys.has('s')) move.add(new THREE.Vector3(-fx, 0, -fz));
      if (keys.has('d')) move.add(new THREE.Vector3(-fz, 0, fx));
      if (keys.has('a')) move.add(new THREE.Vector3(fz, 0, -fx));
      if (move.lengthSq() > 0) move.normalize().multiplyScalar(step);
      if (keys.has('e')) move.y += step;
      if (keys.has('q')) move.y -= step;
      if (move.lengthSq() > 0) moveTo(camera.position.clone().add(move));
    },
    dispose() {
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('pointercancel', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('contextmenu', onContextMenu);
      dom.removeEventListener('blur', onBlur);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
    },
  };
}
