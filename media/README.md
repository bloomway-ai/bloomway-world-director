# Demo media

Recordings of **this repository’s** OSS Studio (`apps/studio`). Not the commercial Bloomway app UI, Academy tutorials, or AI final renders.

## Files

| File | Description | Audio |
| ---- | ----------- | ----- |
| `demo-city-tour.mp4` | ~26s — one-line cyberpunk city, `new plan`, WASD / orbit camera tour | **None** (video only) |
| `demo-city-tour-poster.png` | Frame export (~12s) from city tour | N/A |
| `demo-drama.mp4` | ~22s — one-line street drama; dual character blocking + timeline play | **None** |
| `demo-drama-poster.png` | Frame export (~8s) from drama demo | N/A |
| `demo.mp4` | ~15.5s legacy — `edo-rainy-night` autoplay blockout | **None** |
| `poster.png` | Frame from `demo.mp4` (~5s) | N/A |

Regenerate:

```bash
npm install
npx playwright install chromium
npm run record:demos   # city + drama (recommended)
# npm run record:demo  # legacy clip only
```

Automation: `scripts/record-demos.mjs`, `scripts/record-demo.mjs`.

---

## Provenance (source)

| Asset | How produced | Software shown |
| ----- | ------------- | -------------- |
| All `.mp4` | Playwright screen capture of local `vite preview` + ffmpeg H.264 (`yuv420p`) | OSS Studio at `localhost` (no login) |
| All `.png` | ffmpeg single-frame extract from corresponding `.mp4` | same |

**No** third-party stock video, music, or external UI capture is intentionally included.

Visible on-screen content includes: low-poly **program-generated** worlds, capsule **blocking actors**, English OSS chrome, optional Bloomway wordmark image under [apps/studio/public/brand/](../apps/studio/public/brand/) (trademark — see [TRADEMARKS.md](../TRADEMARKS.md)), and footer link to bloomway.ai.

---

## License (proposed — pending company confirmation)

> **Status:** *Proposed for company sign-off.* Do not treat CC BY as final until rights are confirmed.

| Category | Proposed license | Scope |
| -------- | ---------------- | ----- |
| Company-owned screen recordings & posters in this folder (`*.mp4`, `*.png` listed above) | [**CC BY 4.0**](https://creativecommons.org/licenses/by/4.0/) | Redistribute and remix with **attribution** (e.g. “Bloomway World Director — bloomway-ai/bloomway-world-director”) |
| Repository **source code** | [MIT](../LICENSE) | Separate from media; includes `LICENSE` notice requirements |
| **Trademarks** (Bloomway name, logos in frame) | Not licensed by MIT or CC | [TRADEMARKS.md](../TRADEMARKS.md) |
| Third-party assets | Not claimed here | None identified in recordings; brand PNG/SVG files are company marks, not third-party stock |

Until CC BY is confirmed, redistribute media **only** as part of this repository or with company approval.

---

## Content review log (technical, not legal clearance)

**Review date:** 2026-11-13  
**Reviewer:** Engineering (agent-assisted)  
**Method:** `ffprobe` (duration, streams); single-frame grabs at ~3s per `.mp4`; spot-check of visible UI text.

| Check | demo.mp4 | demo-city-tour.mp4 | demo-drama.mp4 |
| ----- | -------- | ------------------ | -------------- |
| Duration | ~15.5s | ~26s | ~22.5s |
| Audio track | None | None | None |
| API keys / tokens visible | Not observed in sampled frame | Not observed | Not observed |
| Internal URLs / hostnames | Local dev only implied; no corp hostnames in frame | Composer shows user-typed prompt only | Timeline + composer reply only |
| User PII | None observed | None observed | None observed |
| Product UI (non-OSS) | Not observed | Not observed | Not observed |
| AI-rendered final footage | Not present (blockout only) | Not present | Not present |

**Not covered by this review:** Every frame of each video; audio (files have no audio); future edits after this date; poster frames not individually re-checked beyond their source `.mp4`.

This review **does not** state “zero risk” or complete legal clearance for publication.

---

## Company actions still required

1. Confirm company owns screen-recording copyright and approves **CC BY 4.0** (or another license) for this folder.  
2. Confirm trademark use on-screen is acceptable for public GitHub/README embedding.
