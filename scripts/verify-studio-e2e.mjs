/** E2E check: OSS Studio loads and timeline advances (local bloomway-world-director). */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = 5175;
const url = `http://127.0.0.1:${port}/?example=1&autoplay=1`;
const CANVAS_SEL = '[data-testid="previs-canvas-host"] canvas';

const dev = spawn('npm', ['run', 'dev', '-w', '@bloomway/studio', '--', '--port', String(port), '--host', '127.0.0.1'], {
  cwd: root,
  stdio: 'ignore',
});

async function waitReady() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('dev server timeout');
}

/** Attach listeners so CI logs show React/WebGL crashes, not only Playwright timeouts. */
function wirePageDiagnostics(page) {
  const lines = [];
  const push = (tag, text) => {
    const line = `[${tag}] ${text}`;
    lines.push(line);
    console.error(line);
  };
  page.on('pageerror', (err) => push('pageerror', err?.stack || String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') push('console', msg.text());
  });
  return lines;
}

function formatDiagnostics(ex, diag) {
  const parts = [ex?.message || String(ex)];
  if (diag.length) {
    parts.push('', 'Browser diagnostics:', ...diag.slice(-20));
  }
  return parts.join('\n');
}

try {
  await waitReady();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const diag = wirePageDiagnostics(page);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    try {
      await page.waitForSelector(CANVAS_SEL, { timeout: 30000, state: 'visible' });
    } catch (ex) {
      const bodySnippet = await page.locator('body').innerText().catch(() => '');
      if (bodySnippet) diag.push(`[body] ${bodySnippet.slice(0, 400).replace(/\s+/g, ' ').trim()}`);
      throw new Error(formatDiagnostics(ex, diag));
    }
    const t0 = await page.textContent('[data-testid="time-label"]');
    await page.waitForTimeout(2500);
    const t1 = await page.textContent('[data-testid="time-label"]');
    if (!t0 || !t1 || t0 === t1) {
      throw new Error(`Timeline did not advance: "${t0}" -> "${t1}"\n${diag.join('\n')}`);
    }
    console.log('OK verify:studio-e2e', { t0, t1 });
  } finally {
    await browser.close().catch(() => {});
  }
} finally {
  dev.kill('SIGTERM');
}