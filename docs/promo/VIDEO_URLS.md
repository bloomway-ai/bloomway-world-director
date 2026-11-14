# README demo display

## What we use in v0.1 README

| Asset | Role |
| ----- | ---- |
| `media/promo-cold-open.gif` | **README top** — brand cold open preview |
| Release `promo-cold-open.mp4` | Full 63s with audio (not committed to git) |
| `media/demo-city-tour.gif` / `demo-drama.gif` | **Auto-play loops** in README (GitHub always shows GIFs) |
| Release `demo-*.mp4` | **Full quality** — link “▶ Full MP4” |
| `media/demo-*.mp4` in git | Source for recording / CI |

Regenerate GIF previews after re-recording:

```bash
npm run record:demos
npm run preview:demos-gif
```

## Native `<video>` player (optional upgrade)

GitHub **removes** most `<video src="releases/download/...">` tags in README. For a real player with controls:

1. On github.com, **Edit** `README.md`.
2. **Drag & drop** the `.mp4` into the editor (or paste from `media/`).
3. GitHub inserts a `https://github.com/user-attachments/assets/...` URL — keep it on its own line or in `<video src="...">`.
4. Replace the GIF block if you prefer one hosted player.

Release URLs (full file download / optional embed tests):

| Demo | URL |
| ---- | --- |
| City tour | `https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-city-tour.mp4` |
| Street drama | `https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-drama.mp4` |

```bash
gh release upload v0.1.0 media/demo-city-tour.mp4 media/demo-drama.mp4 --clobber
```