# Demo media

| File | Description |
| ---- | ----------- |
| `demo.mp4` | Screen recording of **this repo’s** `apps/studio` playing `examples/edo-rainy-night` (blockout + camera motion). |
| `poster.png` | Frame at ~4s from `demo.mp4`. |

**Not included:** Bloomway product UI, Academy E20/E21 tutorials, or AI final renders.

**Regenerate** (from repo root on a machine with Playwright + ffmpeg):

```bash
npm install
npx playwright install chromium
npm run record:demo
```

Recorded from local path: `bloomway-world-director` (OSS Studio preview build).
