/** E2E check: OSS Studio loads and timeline advances (local bloomway-world-director). */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = 5175;
const url = `http://127.0.0.1:${port}/?autoplay=1`;

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

try {
  await waitReady();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="previs-canvas-host"] canvas', { timeout: 20000 });
  const t0 = await page.textContent('[data-testid="time-label"]');
  await page.waitForTimeout(2500);
  const t1 = await page.textContent('[data-testid="time-label"]');
  await browser.close();
  if (!t0 || !t1 || t0 === t1) {
    throw new Error(`Timeline did not advance: "${t0}" -> "${t1}"`);
  }
  console.log('OK verify:studio-e2e', { t0, t1 });
} finally {
  dev.kill('SIGTERM');
}
