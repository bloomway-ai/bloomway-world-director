#!/usr/bin/env node
/** Sanity-check seven README locales (structure markers, not translation quality). */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const LOCALES = ['en', 'zh-CN', 'ms', 'id', 'ja', 'ko', 'es'];
const files = ['README.md', ...LOCALES.map((l) => `README.${l}.md`)];
/** README.en.md is a pointer to README.md — skip locale-only structure rules. */
const pointerOnly = new Set(['README.en.md']);

const mustHave = [
  'Bloomway World Director',
  'bloomway-ai/bloomway-world-director',
  'info@bloomway.ai',
  'bloomway.ai',
];

const pathMarkers = [
  /Path\s*1|Three paths|三条路径|Try it|试玩|体验一下|Studio in action|开源 Studio|Cuba|Mula|Mulai|クイック|빠른 시작|Inicio rápido|Quick start|快速开始/i,
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
  if (f !== 'README.md' && !pointerOnly.has(f)) {
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