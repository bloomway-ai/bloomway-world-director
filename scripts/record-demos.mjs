/**
 * Records two OSS Studio demo videos:
 *  - media/demo-city-tour.mp4 — one-line city + WASD / orbit camera tour
 *  - media/demo-drama.mp4 — one-line story + character/camera playback
 */
import { spawn } from 'node:child_process';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mediaDir = path.join(root, 'media');
const port = 4174;
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
  await page.waitForTimeout(400);
  await page.click('[data-testid=ds3d-v2-generate]');
}

async function waitCanvas(page) {
  await page.waitForSelector('[data-testid=previs-canvas-host] canvas', { timeout: 45000 });
}

async function tourViewport(page) {
  const host = page.locator('[data-testid=previs-canvas-host]');
  const box = await host.boundingBox();
  if (!box) return;
  const cx = box.x + box.width * 0.5;
  const cy = box.y + box.height * 0.42;
  await page.mouse.click(cx, cy);
  await page.waitForTimeout(300);
  for (const key of ['w', 'w', 'w', 'd', 'd', 'w', 'a']) {
    await page.keyboard.press(key);
    await page.waitForTimeout(280);
  }
  await page.mouse.move(cx, cy);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(cx + 120, cy - 70, { steps: 18 });
  await page.mouse.up({ button: 'right' });
  await page.waitForTimeout(500);
  await page.mouse.move(cx - 40, cy + 30);
  await page.mouse.down();
  await page.mouse.move(cx + 70, cy + 90, { steps: 20 });
  await page.mouse.up();
}

async function recordClip(page, runMs) {
  await page.waitForTimeout(runMs);
}

async function encodeWebm(webmPath, outMp4, durationSec) {
  execSync(
    `ffmpeg -y -i "${webmPath}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart -t ${durationSec} "${outMp4}"`,
    { stdio: 'inherit' },
  );
}

async function captureScenario(name, setup, recordMs, durationSec, outFile, posterAt) {
  const recordDir = path.join(root, `.demo-record-${name}`);
  await rm(recordDir, { recursive: true, force: true });
  await mkdir(recordDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: recordDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  await setup(page);
  await recordClip(page, recordMs);

  const video = page.video();
  await context.close();
  await browser.close();
  if (!video) throw new Error(`No video for ${name}`);
  const webmPath = await video.path();
  const staged = path.join(recordDir, `${name}.webm`);
  await copyFile(webmPath, staged);

  await encodeWebm(staged, outFile, durationSec);
  if (posterAt != null) {
    const poster = outFile.replace(/\.mp4$/i, '-poster.png');
    execSync(`ffmpeg -y -ss ${posterAt} -i "${outFile}" -frames:v 1 "${poster}"`, { stdio: 'inherit' });
  }
  await rm(recordDir, { recursive: true, force: true });
  console.log('Wrote', outFile);
}

const preview = runPreview();
try {
  console.log('Building studio…');
  execSync('npm run build -w @bloomway/studio', { cwd: root, stdio: 'inherit' });
  await waitForServer();
  await mkdir(mediaDir, { recursive: true });

  await captureScenario(
    'city',
    async (page) => {
      await page.goto(`${base}/`, { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-testid=ds3d-v2-text]');
      await page.waitForTimeout(1200);
      await typeAndSend(page, 'Neon cyberpunk city at night in the rain');
      await waitCanvas(page);
      await page.waitForTimeout(3500);
      await typeAndSend(page, 'new plan');
      await page.waitForTimeout(1500);
      await tourViewport(page);
      await page.waitForTimeout(1200);
    },
    2000,
    28,
    path.join(mediaDir, 'demo-city-tour.mp4'),
    12,
  );

  await captureScenario(
    'drama',
    async (page) => {
      await page.goto(`${base}/`, { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-testid=ds3d-v2-text]');
      await page.waitForTimeout(800);
      await typeAndSend(page, 'Rainy night — two rivals meet in the street');
      await waitCanvas(page);
      await page.waitForTimeout(2500);
      const play = page.locator('[data-testid=ds3d-v2-play]');
      if (await play.isVisible()) await play.click();
    },
    16500,
    24,
    path.join(mediaDir, 'demo-drama.mp4'),
    8,
  );
} finally {
  preview.kill('SIGTERM');
}
