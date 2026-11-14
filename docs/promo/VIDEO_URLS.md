# README demo display

## v0.1 README layout (2026-11-14)

| Asset | Role |
| ----- | ---- |
| `media/studio-hero.gif` | **README top** — real OSS Studio workflow (~15s from `demo.mp4`) |
| `media/demo.mp4` | Full hero clip in git (~280KB) |
| `media/promo-cold-open.gif` | **Lower README** — brand/product montage preview |
| Release **`final_v2_cold_open.mp4`** | Full ~63s brand film (**filename on Release**, not `promo-cold-open.mp4`) |
| `media/demo-city-tour.gif` / `demo-drama.gif` | Supplementary loops |
| Release `demo-*.mp4` | Full quality MP4 links |

### Verified Release URLs (v0.1.0)

| Asset | Download URL | Check (2026-11-14) |
| ----- | ------------ | ------------------ |
| Brand film | `https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/final_v2_cold_open.mp4` | HTTP **302** → asset (OK) |
| City tour | `.../demo-city-tour.mp4` | OK on Release |
| Street drama | `.../demo-drama.mp4` | OK on Release |
| ~~promo-cold-open.mp4~~ | — | **Invalid** — label only; file is `final_v2_cold_open.mp4` |

Regenerate hero GIF after re-recording:

```bash
npm run record:demo
ffmpeg -y -i media/demo.mp4 -vf "fps=10,scale=960:-2:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer" -loop 0 media/studio-hero.gif
```

Regenerate supplementary GIFs:

```bash
npm run record:demos
npm run preview:demos-gif
```

## Native `<video>` player (optional upgrade)

GitHub **removes** most `<video src="releases/download/...">` tags in README. For a player with controls, drag-drop upload to GitHub editor → `user-attachments` URL ([GitHub docs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files)).