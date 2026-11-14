import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  normalizePrevisPlan,
  validatePrevisPlan,
  samplePrevisCamera,
} from '../packages/core/src/previsPlanCore.ts';
import { generatePrevisWorld, normalizePrevisWorldRef } from '../packages/core/src/previsWorldGen.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const examplesDir = join(root, 'examples');

function discoverExampleDirs(): string[] {
  return readdirSync(examplesDir)
    .map((name) => join(examplesDir, name))
    .filter((p) => statSync(p).isDirectory())
    .filter((p) => {
      try {
        statSync(join(p, 'plan.json'));
        return true;
      } catch {
        return false;
      }
    })
    .sort();
}

let failed = false;

for (const dir of discoverExampleDirs()) {
  const name = dir.replace(examplesDir + '/', '');
  const planPath = join(dir, 'plan.json');
  const refPath = join(dir, 'world-ref.json');
  const plan = normalizePrevisPlan(JSON.parse(readFileSync(planPath, 'utf8')));
  let refInput: unknown = (plan.set as { world?: unknown } | undefined)?.world;
  if (!refInput) {
    try {
      refInput = JSON.parse(readFileSync(refPath, 'utf8'));
    } catch (e) {
      console.error(`[${name}] missing world-ref.json and no set.world in plan`);
      failed = true;
      continue;
    }
  }
  const ref = normalizePrevisWorldRef(refInput);

  const issues = validatePrevisPlan(plan);
  const errors = issues.filter((i) => i.level === 'error');
  if (errors.length) {
    console.error(`[${name}] validate errors:`, errors);
    failed = true;
    continue;
  }

  const world = generatePrevisWorld(ref);
  if (world.buildings.length < 1) {
    console.error(`[${name}] expected buildings in generated world`);
    failed = true;
    continue;
  }

  const t0 = samplePrevisCamera(plan, 0);
  const tMid = samplePrevisCamera(plan, plan.durationSec / 2);
  const tEnd = samplePrevisCamera(plan, plan.durationSec);
  const dist = (a: typeof t0, b: typeof t0) =>
    Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y, a.position.h - b.position.h);
  const moveMid = dist(t0, tMid);
  const moveEnd = dist(tMid, tEnd);
  if (moveMid < 0.5 && moveEnd < 0.5) {
    console.error(`[${name}] camera did not move enough`, { moveMid, moveEnd });
    failed = true;
    continue;
  }
  console.log(`OK example: ${name} (buildings=${world.buildings.length}, travel=${moveMid.toFixed(2)}/${moveEnd.toFixed(2)})`);
}

if (failed) process.exit(1);
console.log('OK verify:examples');