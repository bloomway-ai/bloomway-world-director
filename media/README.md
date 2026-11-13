# Demo media

| File | Description |
| ---- | ----------- |
| `demo.mp4` | ~15s screen recording of **this repo’s** Studio UI (header, Play, timeline, 3D blockout) playing `edo-rainy-night`. |
| `poster.png` | Frame at ~5s from `demo.mp4`. |

Recorded after the 2026-11-13 Studio UI refresh (`studio.css`, timeline controls).

**Not included:** Bloomway product UI, Academy E20/E21 tutorials, or AI final renders.

**Regenerate** (from repo root on a machine with Playwright + ffmpeg):

```bash
npm install
npx playwright install chromium
npm run record:demo
```

Recorded from local path: `bloomway-world-director` (OSS Studio preview build).
