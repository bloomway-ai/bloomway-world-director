#!/usr/bin/env node
/** Sanity-check seven README locales (structure markers, not translation quality). */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const LOCALES = ['en', 'zh-CN', 'ms', 'id', 'ja', 'ko', 'es'];
const files = ['README.md', ...LOCALES.map((l) => `README.${l}.md`)];

const mustHave = [
  'Bloomway World Director',
  'bloomway-ai/bloomway-world-director',
  'info@bloomway.ai',
  'bloomway.ai',
];

const pathMarkers = [
  /Path\s*1|Three paths|三条路径|Laluan\s*1|Tiga laluan|Jalur\s*1|Tiga jalur|パス\s*1|3\s*つのパス|경로\s*1|세 가지 경로|Ruta\s*1|Tres rutas|\*\*\s*1\s*—/i,
];

let failed = false;
for (const f of files) {
  const p = path.join(root, f);
  if (!existsSync(p)) {
    console.error('Missing:', f);
    failed = true;
    continue;
  }
  const text = readFileSync(p, 'utf8');
  for (const s of mustHave) {
    if (!text.includes(s)) {
      console.error(`${f}: missing "${s}"`);
      failed = true;
    }
  }
  if (f !== 'README.md') {
    const hasPath = pathMarkers.some((rx) => rx.test(text));
    if (!hasPath) {
      console.error(`${f}: missing Path 1 / 路径一 marker`);
      failed = true;
    }
    if (!/README\.md|Choose your language|选择语言|Bahasa|语言/i.test(text)) {
      console.error(`${f}: missing language hub link`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('OK i18n-check-readme:', files.length, 'files');