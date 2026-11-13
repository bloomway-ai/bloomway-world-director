/**
 * Light ASCII rendering of a world for the empty 3D Director (backdrop behind the world presets). Pass 1 draws the
 * world into a data target (R = lit luminance with a slow moving light band, G = ground, B = stable luminance);
 * pass 2 turns it into monospaced glyph cells on a light background: buildings as glyphs whose density follows the
 * shading (each cell flickers between neighbouring glyphs), ground as a fine dot field, and a fading green trail
 * where the pointer passes.
 */
import * as THREE from 'three';
import { buildWorld3dContent, type World3dContent } from './world3dContent';
import { PREVIS_WORLD_HILL_AMP_M, type PrevisWorldRef } from '@core/previsWorldGen.ts';

const GLYPHS = '.:-=+*#%@0ONMWBX';
const TILE_W = 12;
const TILE_H = 16;
const CELL_W = 7;
const CELL_H = 10.5;
const FPS = 30;
const TRAIL_MAX = 32;
const TRAIL_EVERY_MS = 45;
const TRAIL_LIFE_S = 2.2;
const TRAIL_RADIUS = 26;
/** Street objects within this radius of the centre are drawn (m). */
const KEEP_RADIUS_M = 40;

const rgb = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const DATA_VERT = /* glsl */ `
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const DATA_FRAG = /* glsl */ `
uniform float uTime;
uniform vec2 uGround;
uniform float uSize;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
void main() {
  vec3 n = normalize(vWorldNormal);
  if (!gl_FrontFacing) n = -n;
  float groundH = uGround.x * vWorldPos.x + uGround.y * sin(6.2831853 * vWorldPos.x / 90.0);
  float ground = (vWorldPos.y - groundH < 0.45 && n.y > 0.8) ? 1.0 : 0.0;
  vec3 key = normalize(vec3(-0.80, 0.50, 0.36));
  vec3 fill = normalize(vec3(0.73, 0.60, -0.14));
  float stable = clamp(0.24 + max(dot(n, key), 0.0) * 0.43 + max(dot(n, fill), 0.0) * 0.13 + max(n.y, 0.0) * 0.14, 0.22, 0.78);
  float az = -1.0 + sin(uTime * 0.24) * 0.70;
  float el = 0.61 + sin(uTime * 0.13) * 0.07;
  vec3 moving = vec3(sin(az) * cos(el), sin(el), cos(az) * cos(el));
  vec3 axis = normalize(vec3(0.85, 0.10, 0.45));
  float d = dot(vWorldPos / uSize, axis) - sin(uTime * 0.28) * 0.40;
  float ribbon = exp(-d * d / 0.0036);
  float m = max(dot(n, moving), 0.0);
  float change = clamp((dot(n, moving) - dot(n, key)) * 0.04 + ribbon * m * 0.10 - 0.022 * (1.0 - m) * ribbon, -0.06, 0.10);
  gl_FragColor = vec4(stable + change, ground, stable, 1.0);
}`;

const POST_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const POST_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tScene;
uniform sampler2D tGlyphs;
uniform float uCount;
uniform vec2 uRes;
uniform vec2 uCell;
uniform vec2 uDot;
uniform float uTime;
uniform vec3 uBg;
uniform vec3 uInk;
uniform vec3 uDotInk;
uniform vec3 uTrailInk;
uniform vec4 uTrail[${TRAIL_MAX}];
uniform float uTrailCount;
varying vec2 vUv;

vec2 cellUv(vec2 ci) { return ((ci + 0.5) * uCell + uRes * 0.5) / uRes; }
float isArch(vec4 s) { return (s.a > 0.5 && s.g < 0.5) ? 1.0 : 0.0; }

void main() {
  vec2 pixel = vUv * uRes;
  vec2 grid = (pixel - uRes * 0.5) / uCell;
  vec2 ci = floor(grid);
  float hash = fract(sin(dot(ci, vec2(127.1, 311.7))) * 43758.5453);
  vec4 s = texture2D(tScene, cellUv(ci));
  vec3 col = uBg;

  vec4 sp = texture2D(tScene, vUv);
  if (sp.a > 0.5 && sp.g > 0.5) {
    vec2 g = (fract(pixel / uDot) - 0.5) * uDot;
    float dotMask = 1.0 - smoothstep(0.55, 1.1, length(g));
    col = mix(uBg, uDotInk, dotMask * clamp(0.55 + (sp.r - 0.5), 0.3, 1.0));
  }

  if (isArch(s) > 0.5) {
    vec4 nl = texture2D(tScene, cellUv(ci + vec2(-1.0, 0.0)));
    vec4 nr = texture2D(tScene, cellUv(ci + vec2(1.0, 0.0)));
    vec4 nd = texture2D(tScene, cellUv(ci + vec2(0.0, -1.0)));
    vec4 nu = texture2D(tScene, cellUv(ci + vec2(0.0, 1.0)));
    float sil = 1.0 - min(min(isArch(nl), isArch(nr)), min(isArch(nd), isArch(nu)));
    float tone = 0.0;
    if (isArch(nl) > 0.5) tone = max(tone, abs(nl.b - s.b));
    if (isArch(nr) > 0.5) tone = max(tone, abs(nr.b - s.b));
    if (isArch(nd) > 0.5) tone = max(tone, abs(nd.b - s.b));
    if (isArch(nu) > 0.5) tone = max(tone, abs(nu.b - s.b));
    float edge = max(sil, smoothstep(0.14, 0.30, tone));
    float light = clamp((s.r - 0.5) * 2.15 + 0.5, 0.0, 1.0);
    float shimmer = (sin(dot(ci, vec2(0.073, 0.051)) - uTime * 0.55) + 0.45 * sin(dot(ci, vec2(-0.037, 0.089)) + uTime * 0.31)) * 0.012;
    // Light theme: shaded faces get the dense glyphs.
    float density = max(clamp((0.5 - light) * 1.15 + 0.5 + shimmer, 0.0, 1.0), edge * 0.45);
    float tile = clamp(floor(density * uCount), 0.0, uCount - 1.0);
    float tempo = fract(sin(dot(ci, vec2(269.5, 183.3))) * 43758.5453);
    float phase = mod(floor(uTime * 2.35 / mix(0.35, 0.55, tempo) + hash * 4.0), 4.0);
    float off = phase < 0.5 ? -1.0 : (phase > 1.5 && phase < 2.5 ? 1.0 : 0.0);
    tile += off;
    if (tile < 0.0) tile = 1.0;
    if (tile > uCount - 1.0) tile = uCount - 2.0;
    vec2 f = fract(grid);
    float mask = texture2D(tGlyphs, vec2((tile + 0.02 + f.x * 0.96) / uCount, 0.02 + f.y * 0.96)).r;
    float trail = 0.0;
    for (int i = 0; i < ${TRAIL_MAX}; i++) {
      if (float(i) >= uTrailCount) break;
      vec4 p = uTrail[i];
      float age = uTime - p.z;
      if (age < 0.0 || age > ${TRAIL_LIFE_S.toFixed(1)}) continue;
      float dist = length(((ci + 0.5) * uCell + uRes * 0.5) - p.xy);
      if (dist > ${TRAIL_RADIUS.toFixed(1)}) continue;
      if (hash < 0.78 * (1.0 - smoothstep(0.0, ${TRAIL_RADIUS.toFixed(1)}, dist))) trail = max(trail, pow(1.0 - age / ${TRAIL_LIFE_S.toFixed(1)}, 1.35));
    }
    float ink = clamp(max(0.55 + 0.45 * (1.0 - light), sil * 0.92), 0.0, 1.0);
    vec3 glyph = mix(uInk, uTrailInk, trail);
    col = mix(col, glyph, mask * mix(ink, 1.0, trail));
  }
  gl_FragColor = vec4(col, 1.0);
}`;

const ISO_EL = (30 * Math.PI) / 180;
export const WORLD3D_BLOCK_YAW = -Math.PI / 4;

/**
 * Keep only a compact block at the centre of a world (landmarks stay) and measure it from the isometric view at
 * `yaw`: centre and half size along the view's right / up axes. Used by the ASCII backdrop and the preset thumbnails.
 */
export function world3dBlockFrame(content: World3dContent, yaw = WORLD3D_BLOCK_YAW): { focus: THREE.Vector3; w: number; h: number; keep: number } {
  // Lines, particles and sky pieces (planets, stars) carry no block surfaces.
  content.scene.traverse((o) => {
    if ((o as THREE.Points).isPoints || (o as THREE.Line).isLine || o.userData.sky) o.visible = false;
  });
  // At least 40 m, and wide enough for a dozen buildings (sparse districts have wide roads and big gaps).
  const all = content.farFrom(-1);
  const kindOf = (o: THREE.Object3D) => (o.userData.pick as { kind?: string } | undefined)?.kind;
  const dist = (o: THREE.Object3D) => Math.hypot(o.position.x, o.position.z);
  const near = all.filter((o) => kindOf(o) === 'building').map(dist).sort((a, b) => a - b);
  const keep = Math.max(KEEP_RADIUS_M, (near[Math.min(11, near.length - 1)] ?? 0) + 8);
  // Landmarks stay (Eiffel tower, castle…), except far terrain (mountains, hills, walls) that would fill the frame.
  const terrain = new Set(['mountain', 'hill', 'great_wall', 'suspension_bridge']);
  for (const o of all) {
    const sub = (o.userData.pick as { sub?: string } | undefined)?.sub ?? '';
    if ((kindOf(o) !== 'landmark' || terrain.has(sub)) && dist(o) > keep) o.visible = false;
  }
  const box = new THREE.Box3();
  const part = new THREE.Box3();
  for (const o of all) {
    if (!o.visible) continue;
    part.setFromObject(o);
    // Buildings and landmarks only: flat road / sidewalk strips would widen the frame.
    if (part.isEmpty() || part.max.y - part.min.y < 2 || part.max.x - part.min.x > keep * 2.5 || part.max.z - part.min.z > keep * 2.5) continue;
    if (Math.hypot((part.min.x + part.max.x) / 2, (part.min.z + part.max.z) / 2) > keep * 1.6) continue;
    box.union(part);
  }
  if (box.isEmpty()) box.set(new THREE.Vector3(-30, 0, -30), new THREE.Vector3(30, 20, 30));
  const focus = box.getCenter(new THREE.Vector3());
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const up = new THREE.Vector3(-Math.sin(yaw) * Math.sin(ISO_EL), Math.cos(ISO_EL), -Math.cos(yaw) * Math.sin(ISO_EL));
  let w = 0;
  let h = 0;
  for (const x of [box.min.x, box.max.x])
    for (const y of [box.min.y, box.max.y])
      for (const z of [box.min.z, box.max.z]) {
        const d = new THREE.Vector3(x, y, z).sub(focus);
        w = Math.max(w, Math.abs(d.dot(right)));
        h = Math.max(h, Math.abs(d.dot(up)));
      }
  return { focus, w: w * 1.08, h: h * 1.08, keep };
}

/** Isometric camera position looking at `focus` from `yaw`. */
export function world3dIsoCamera(camera: THREE.Camera, focus: THREE.Vector3, yaw: number): void {
  camera.position.set(focus.x + Math.sin(yaw) * Math.cos(ISO_EL) * 600, focus.y + Math.sin(ISO_EL) * 600, focus.z + Math.cos(yaw) * Math.cos(ISO_EL) * 600);
  camera.lookAt(focus);
}

function glyphAtlas(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = TILE_W * GLYPHS.length;
  c.height = TILE_H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#fff';
  g.font = '14px "Courier New", monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (let i = 0; i < GLYPHS.length; i++) g.fillText(GLYPHS[i], i * TILE_W + TILE_W / 2, TILE_H / 2 + 1);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
}

export interface World3dAsciiBackdrop {
  setWorld(ref: PrevisWorldRef): void;
  /** Pointer position in CSS pixels relative to the canvas (leaves a trail). */
  pointer(x: number, y: number): void;
  dispose(): void;
}

export function createWorld3dAsciiBackdrop(canvas: HTMLCanvasElement, opts: { reducedMotion?: boolean; centerY?: number } = {}): World3dAsciiBackdrop {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
  const pr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(pr);
  const target = new THREE.WebGLRenderTarget(2, 2, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true });
  const dataMat = new THREE.ShaderMaterial({
    vertexShader: DATA_VERT,
    fragmentShader: DATA_FRAG,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uGround: { value: new THREE.Vector2() }, uSize: { value: 120 } },
  });
  const atlas = glyphAtlas();
  const trail = Array.from({ length: TRAIL_MAX }, () => new THREE.Vector4(0, 0, -99, 0));
  const post = new THREE.ShaderMaterial({
    vertexShader: POST_VERT,
    fragmentShader: POST_FRAG,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tScene: { value: target.texture },
      tGlyphs: { value: atlas },
      uCount: { value: GLYPHS.length },
      uRes: { value: new THREE.Vector2(1, 1) },
      uCell: { value: new THREE.Vector2(CELL_W, CELL_H) },
      uDot: { value: new THREE.Vector2(6, 9) },
      uTime: { value: 0 },
      uBg: { value: rgb('#f3f4f1') },
      uInk: { value: rgb('#3b4148') },
      uDotInk: { value: rgb('#b7bcc2') },
      uTrailInk: { value: rgb('#65a30d') },
      uTrail: { value: trail },
      uTrailCount: { value: 0 },
    },
  });
  const quadScene = new THREE.Scene();
  quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2000);

  let content: World3dContent | null = null;
  /** Half size of the drawn block in view units (right / up at the starting yaw) and its centre. */
  const fit = { w: 40, h: 25 };
  const focus = new THREE.Vector3();
  let width = 1;
  let height = 1;
  let time = 0;
  let last = performance.now();
  let lastFrame = 0;
  let trailCount = 0;
  let lastTrail = 0;
  let raf = 0;
  let disposed = false;
  const yaw0 = WORLD3D_BLOCK_YAW;

  const frame = () => {
    const aspect = width / height;
    // The block fills about 58 % of the width or half the height (the presets and composer sit below it).
    const halfW = Math.max(fit.w / 0.58, (fit.h / 0.5) * aspect);
    const halfH = halfW / aspect;
    const dy = (0.5 - (opts.centerY ?? 0.3)) * 2 * halfH;
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH - dy;
    camera.bottom = -halfH - dy;
    camera.updateProjectionMatrix();
  };

  const resize = () => {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    if (w === width && h === height) return;
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    target.setSize(Math.round(w * pr), Math.round(h * pr));
    (post.uniforms.uRes.value as THREE.Vector2).set(w, h);
    trailCount = 0;
    frame();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const render = () => {
    if (!content) return;
    world3dIsoCamera(camera, focus, yaw0 + (opts.reducedMotion ? 0 : time * 0.03));
    dataMat.uniforms.uTime.value = time;
    post.uniforms.uTime.value = time;
    post.uniforms.uTrailCount.value = trailCount;
    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    content.scene.overrideMaterial = dataMat;
    renderer.render(content.scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCam);
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!opts.reducedMotion) time += dt;
    if (now - lastFrame < 1000 / FPS - 2) return;
    lastFrame = now;
    render();
  };
  raf = requestAnimationFrame(loop);

  return {
    setWorld(ref) {
      content?.dispose();
      content = buildWorld3dContent({ world: ref });
      content.grow(1);
      content.scene.background = null;
      content.scene.fog = null;
      (dataMat.uniforms.uGround.value as THREE.Vector2).set(ref.slope ?? 0, ref.hills ? PREVIS_WORLD_HILL_AMP_M : 0);
      const block = world3dBlockFrame(content, yaw0);
      dataMat.uniforms.uSize.value = block.keep * 2.4;
      focus.copy(block.focus);
      fit.w = block.w;
      fit.h = block.h;
      frame();
      render();
    },
    pointer(x, y) {
      if (opts.reducedMotion) return;
      const now = performance.now();
      if (now - lastTrail < TRAIL_EVERY_MS) return;
      lastTrail = now;
      for (let i = TRAIL_MAX - 1; i > 0; i--) trail[i].copy(trail[i - 1]);
      trail[0].set(x, height - y, time, 1);
      trailCount = Math.min(TRAIL_MAX, trailCount + 1);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      content?.dispose();
      content = null;
      dataMat.dispose();
      post.dispose();
      atlas.dispose();
      target.dispose();
      renderer.dispose();
    },
  };
}
