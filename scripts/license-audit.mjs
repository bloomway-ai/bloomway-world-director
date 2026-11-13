#!/usr/bin/env node
/** Summarize license fields in package-lock.json (engineering aid, not legal sign-off). */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lock = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const pkgs = lock.packages ?? {};

const byLic = new Map();
const missing = [];

for (const [p, meta] of Object.entries(pkgs)) {
  if (!p) continue;
  const name = p.replace(/^node_modules\//, '');
  const lic = meta.license ?? '(none)';
  if (!meta.license && p.startsWith('node_modules/')) missing.push(name);
  const arr = byLic.get(lic) ?? [];
  arr.push(name);
  byLic.set(lic, arr);
}

const direct = [
  'react',
  'react-dom',
  'three',
  'vite',
  '@vitejs/plugin-react',
  'tailwindcss',
  '@tailwindcss/vite',
  'playwright',
  'tsx',
  'typescript',
];

console.log('# license-audit (informal)\n');
console.log('Lockfile:', path.join(root, 'package-lock.json'));
console.log('License kinds:', [...byLic.keys()].sort().join(', '));
console.log('Packages missing license field:', missing.length);
if (missing.length) console.log('  ', missing.slice(0, 20).join(', '), missing.length > 20 ? '...' : '');
console.log('\n## Direct dependencies\n');
for (const n of direct) {
  const key = `node_modules/${n}`;
  const lic = pkgs[key]?.license ?? '(not in lockfile)';
  console.log(`- ${n}: ${lic}`);
}
console.log('\n## Non-OSI-common licenses (sample)\n');
const common = new Set(['MIT', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'BlueOak-1.0.0', '0BSD', '(none)']);
for (const [lic, names] of [...byLic.entries()].sort()) {
  if (common.has(lic)) continue;
  console.log(`- ${lic} (${names.length}): ${names.slice(0, 6).join(', ')}${names.length > 6 ? ' …' : ''}`);
}
