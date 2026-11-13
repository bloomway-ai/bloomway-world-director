import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  normalizePrevisPlan,
  validatePrevisPlan,
  samplePrevisCamera,
} from '../packages/core/src/previsPlanCore.ts';
import { generatePrevisWorld, normalizePrevisWorldRef } from '../packages/core/src/previsWorldGen.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const planPath = resolve(root, 'examples/edo-rainy-night/plan.json');
const refPath = resolve(root, 'examples/edo-rainy-night/world-ref.json');

const plan = normalizePrevisPlan(JSON.parse(readFileSync(planPath, 'utf8')));
const ref = normalizePrevisWorldRef(JSON.parse(readFileSync(refPath, 'utf8')));

const issues = validatePrevisPlan(plan);
const errors = issues.filter((i) => i.level === 'error');
const warns = issues.filter((i) => i.level === 'warn');
if (warns.length) console.warn('validatePrevisPlan warnings:', warns);
if (errors.length > 0) {
  console.error('validatePrevisPlan errors:', errors);
  process.exit(1);
}

const world = generatePrevisWorld(ref);
const buildingCount = world.buildings.length;
if (buildingCount < 1) {
  console.error('Expected at least one building in generated world');
  process.exit(1);
}

const t0 = samplePrevisCamera(plan, 0);
const tMid = samplePrevisCamera(plan, plan.durationSec / 2);
const tEnd = samplePrevisCamera(plan, plan.durationSec);
const dist = (a: typeof t0, b: typeof t0) =>
  Math.hypot(
    a.position.x - b.position.x,
    a.position.y - b.position.y,
    a.position.h - b.position.h,
  );

const moveMid = dist(t0, tMid);
const moveEnd = dist(tMid, tEnd);
if (moveMid < 0.5 && moveEnd < 0.5) {
  console.error('Camera did not move enough between samples', { moveMid, moveEnd });
  process.exit(1);
}

console.log('OK verify:example');
console.log(JSON.stringify({
  planTitle: plan.title,
  durationSec: plan.durationSec,
  buildingCount,
  cameraSamples: { t0, tMid, tEnd },
  cameraTravel: { moveMid, moveEnd },
  validationWarnings: warns,
}, null, 2));
