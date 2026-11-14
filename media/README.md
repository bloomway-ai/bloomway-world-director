# Demo media

Recordings of **this repository’s** OSS Studio (`apps/studio`). Not the commercial Bloomway app UI, Academy tutorials, or AI final renders.

## README hero (OSS Studio)

| File | Description |
| ---- | ----------- |
| `studio-hero.gif` | README **top** — loop from `demo.mp4` (~15s, 720px, ~1.7MB) |
| `demo.mp4` | Hero clip in git (~15.5s, silent) |

## Brand film (lower README)

| File | Description |
| ---- | ----------- |
| `promo-cold-open.gif` | Product montage loop (~12s) |
| `promo-cold-open-poster.png` | Still frame |
| Release `final_v2_cold_open.mp4` | **Not in git** (~33MB) — [Release download](https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/final_v2_cold_open.mp4) (filename is **not** `promo-cold-open.mp4`) |

Brand clip = **product vision**, not a substitute for OSS blockout demos below.

## Files

| File | Description | Audio | CC BY 4.0 scope |
| ---- | ----------- | ----- | ---------------- |
| `demo-city-tour.mp4` | ~20s — snowy daytime Tokyo (`jp_modern`), `new plan`, WASD / orbit tour | None | Company-owned demo — same license as below |
| `demo-city-tour-poster.png` | Frame ~14s from city tour | — | Derivative of `demo-city-tour.mp4` |
| `demo-drama.mp4` | ~22.5s — street drama blocking + timeline play | None | Company-owned demo — same license as below |
| `demo-drama-poster.png` | Frame ~8s from drama demo | — | Derivative |
| `demo-city-tour.gif` | README looping preview (~12s) | None | Derivative of city tour MP4 |
| `demo-drama.gif` | README looping preview (~12s) | None | Derivative of drama MP4 |
| `demo.mp4` | ~15.5s legacy — Edo rainy night autoplay blockout | None | **Named in company CC BY approval** |
| `poster.png` | Frame from `demo.mp4` (~5s) | — | **Named in company CC BY approval** |
| `screenshots/home.png` | README — Studio home (presets + composer) | None | Static UI capture |
| `screenshots/world.png` | README — one-line world (e.g. snowy Tokyo) | None | Static UI capture |
| `screenshots/camera-timeline.png` | README — camera timeline + playback | None | Static UI capture |

Regenerate:

```bash
npm install
npx playwright install chromium
npm run record:demos        # city + drama (recommended)
npm run capture:screenshots # README stills (home / world / timeline)
npm run preview:demos-gif   # README GIF loops from demo MP4s
# DEMO_ONLY=city npm run record:demos
# npm run record:demo  # legacy clip only
```

Automation: `scripts/record-demos.mjs`, `scripts/record-demo.mjs`.

---

## License — Creative Commons Attribution 4.0 International

**Status:** **Approved** (company, 2026-11-13) for company-owned screen recordings and poster images in this directory, including explicitly **`demo.mp4`** and **`poster.png`**, and the other listings above produced the same way.

| Item | Detail |
| ---- | ------ |
| **License** | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| **Legal text** | https://creativecommons.org/licenses/by/4.0/legalcode |
| **Deed (human-readable)** | https://creativecommons.org/licenses/by/4.0/ |
| **Directory marker** | [media/LICENSE](LICENSE) |
| **Copyright** | Copyright (c) 2026 Bloomway AI Inc. |

### Required attribution (copy or adapt)

When sharing or embedding these files, credit:

```text
Bloomway World Director — Bloomway AI Inc.
https://github.com/bloomway-ai/bloomway-world-director
```

### If you modify a file

- State that you changed the work.
- Retain identification of the original source and the above attribution.
- Link to the license: https://creativecommons.org/licenses/by/4.0/

### Not covered by CC BY in this folder

| Category | Treatment |
| -------- | --------- |
| **Third-party stock** audio/video/UI | Not claimed; none intentionally included |
| **Trademarks** (Bloomway name, logos in frame) | Display ≠ endorsement; **no** separate trademark license for promoting other products — [TRADEMARKS.md](../TRADEMARKS.md) |
| **Repository source code** | [MIT](../LICENSE) at repo root — separate from media |
| **Third-party npm / fonts / models** | Not part of this directory |

---

## Provenance (how assets were made)

| Asset | How produced | Software shown |
| ----- | ------------- | -------------- |
| All `.mp4` | Playwright screen capture of local `vite preview` + ffmpeg H.264 (`yuv420p`) | OSS Studio on `localhost` (no login) |
| All `.png` | ffmpeg single-frame extract from corresponding `.mp4` (or legacy pipeline for `poster.png`) | same |

On-screen content includes: procedural blockout worlds, capsule blocking actors, English OSS chrome, optional Bloomway wordmark under [apps/studio/public/brand/](../apps/studio/public/brand/), and footer link to bloomway.ai.

---

## Technical acceptance log (screen review)

**Review date:** 2026-11-13 (re-checked after snowy Tokyo city tour re-record)  
**Method:** `ffprobe` (duration, audio streams); sample frames at fixed offsets; visual review of captured UI.

| File | Duration | Audio | Sample frame | Technical acceptance |
| ---- | -------- | ----- | ------------ | ------------------- |
| `demo.mp4` | ~15.5s | None | ~3s | **Done** — legacy Edo blockout UI only |
| `demo-city-tour.mp4` | ~20.2s | None | ~5s | **Done** — Tokyo/snow/day composer reply; no secrets observed |
| `demo-drama.mp4` | ~22.6s | None | ~6s | **Done** — timeline + blocking; no secrets observed |
| `*.png` posters | — | N/A | from parent `.mp4` | **Done** (not re-pixeled beyond ffmpeg extract) |

**Observed in samples (all three videos):** OSS-only UI, local rules composer copy, blockout 3D, Bloomway OSS branding; **no** API keys, credentials, internal hostnames, or user PII in sampled frames.

**Not covered:** Every frame; audio content (files have no audio track); videos recorded after this date without updating this log.

**Media验收（技术）:** **完成** for the files listed above on 2026-11-13. This is **not** a legal “zero risk” clearance.

---

## Internal items outside this README

- **Security email routing:** see [SECURITY.md](../SECURITY.md) — **等待邮箱管理人员确认**
- **Extracted core employment rights:** see [docs/EXTRACTED_CODE.md](../docs/EXTRACTED_CODE.md)
