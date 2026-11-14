# README demo display

## v0.1 README layout (2026-11-14, final)

| Asset | Role |
| ----- | ---- |
| `media/promo-full-demo-readme.mp4` | **Above fold** — 63s inline `<video controls>` (~8MB, 1280p; under GitHub size budget) |
| `media/promo-full-demo-poster.png` | Video `poster` image |
| `media/try-in-browser-cover.png` | **Try in browser** — world + camera/timeline still |
| `media/hero-previs-loop.gif` | **Studio in action** — street drama / timeline (~10s, ~800KB) |
| `media/demo-city-tour.gif` / `demo-drama.gif` | City tour + street drama (~1MB each) |
| `media/studio-hero.gif` | Optional — legacy Edo loop; not README hero |
| `media/demo.mp4` | Legacy Edo autoplay clip in git (~15s) |
| `media/promo-cold-open.gif` | **Not in README** (large montage) |
| Release **`final_v2_cold_open.mp4`** | Full ~63s brand film (**filename on Release**, not `promo-cold-open.mp4`) |
| Release `demo-*.mp4` | Full quality OSS demo MP4 links |

### Verified Release URLs (v0.1.0)

| Asset | Download URL | Check |
| ----- | ------------ | ----- |
| Brand film (1080p master) | `.../final_v2_cold_open.mp4` | ~33MB — unchanged master |
| README inline player | `.../promo-full-demo-readme.mp4` | ~8MB — same 63s timeline, 1280p |
| City tour | `.../demo-city-tour.mp4` | On Release |
| Street drama | `.../demo-drama.mp4` | On Release |
| ~~promo-cold-open.mp4~~ | — | **Invalid** — label only; file is `final_v2_cold_open.mp4` |

Regenerate hero loop:

```bash
npm run record:demos
npm run preview:demos-gif
```

Regenerate try cover: `python3 scripts/build-try-cover.py`

## Native `<video>` player (optional upgrade)

GitHub **removes** most `<video src="releases/download/...">` tags in README. Prefer **poster image + link** to Release MP4 (current layout). For inline player with controls, use GitHub `user-attachments` URL ([GitHub docs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files)).