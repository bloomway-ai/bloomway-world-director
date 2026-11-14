/**
 * OSS Studio screenshots for README / social preview (English UI).
 * Output: media/screenshots/{home,world,camera-timeline}.png
 */
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'media', 'screenshots');
const port = 4175;
const base = `http://127.0.0.1:${port}`;

function runPreview() {
  return spawn('npm', ['run', 'preview', '-w', '@bloomway/studio', '--', '--port', String(port), '--host', '127.0.0.1'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BROWSER: 'none' },
  });
}

async function waitForServer(ms = 60000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(base);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error('Preview server did not become ready');
}

async function typeAndSend(page, text) {
  const area = page.locator('[data-testid=ds3d-v2-text]');
  await area.click();
  await area.fill(text);
  await page.waitForTimeout(300);
  await page.click('[data-testid=ds3d-v2-generate]');
}

const preview = runPreview();
try {
  const { execSync } = await import('node:child_process');
  execSync('npm run build -w @bloomway/studio', { cwd: root, stdio: 'inherit' });
  await waitForServer();
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid=ds3d-v2-home-backdrop], [data-testid=ds3d-v2-presets]', { timeout: 30000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, 'home.png') });
  console.log('Wrote home.png');

  await typeAndSend(page, 'Snowy daytime Tokyo urban city');
  await page.waitForSelector('[data-testid=previs-canvas-host] canvas', { timeout: 45000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, 'world.png') });
  console.log('Wrote world.png');

  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid=ds3d-v2-text]', { timeout: 30000 });
  await page.waitForTimeout(600);
  await typeAndSend(page, 'Rainy night — two rivals meet in the street');
  await page.waitForSelector('[data-testid=previs-canvas-host] canvas', { timeout: 45000 });
  await page.waitForTimeout(2500);
  await page.waitForSelector('[data-testid=ds3d-v2-play]', { timeout: 45000 });
  const play = page.locator('[data-testid=ds3d-v2-play]');
  if (await play.isVisible()) await play.click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, 'camera-timeline.png') });
  console.log('Wrote camera-timeline.png');

  await browser.close();
} finally {
  preview.kill('SIGTERM');
}