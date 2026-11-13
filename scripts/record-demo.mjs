/**
 * Records media/demo.mp4 from the OSS Studio (local path only).
 * Requires: npm install && npx playwright install chromium
 */
import { spawn } from 'node:child_process';
import { mkdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mediaDir = path.join(root, 'media');
const demoOut = path.join(mediaDir, 'demo.mp4');
const posterOut = path.join(mediaDir, 'poster.png');
const port = 4173;
const baseUrl = `http://127.0.0.1:${port}/?autoplay=1`;

function runPreview() {
  return spawn('npm', ['run', 'preview', '-w', '@bloomway/studio', '--', '--port', String(port), '--host', '127.0.0.1'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BROWSER: 'none' },
  });
}

async function waitForServer(ms = 45000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(baseUrl);
      if (res.ok) return;
    } catch {
      // keep trying
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error('Preview server did not become ready');
}

const preview = runPreview();
preview.stdout?.on('data', () => {});
preview.stderr?.on('data', () => {});

try {
  console.log('Building studio…');
  execSync('npm run build -w @bloomway/studio', { cwd: root, stdio: 'inherit' });
  console.log('Waiting for preview on', baseUrl);
  await waitForServer();

  await mkdir(mediaDir, { recursive: true });
  const recordDir = path.join(root, '.demo-record-tmp');
  await rm(recordDir, { recursive: true, force: true });
  await mkdir(recordDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: recordDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="previs-canvas-host"] canvas', { timeout: 30000 });
  await page.waitForTimeout(14000);

  const video = page.video();
  await context.close();
  await browser.close();

  if (!video) throw new Error('No video captured');
  const webmPath = await video.path();
  await rename(webmPath, path.join(recordDir, 'capture.webm'));

  console.log('Encoding demo.mp4…');
  execSync(
    `ffmpeg -y -i "${path.join(recordDir, 'capture.webm')}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart -t 16 "${demoOut}"`,
    { stdio: 'inherit' },
  );
  execSync(
    `ffmpeg -y -ss 4 -i "${demoOut}" -frames:v 1 "${posterOut}"`,
    { stdio: 'inherit' },
  );

  await rm(recordDir, { recursive: true, force: true });
  console.log('Wrote', demoOut, 'and', posterOut);
} finally {
  preview.kill('SIGTERM');
}
