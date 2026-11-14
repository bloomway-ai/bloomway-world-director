# README inline video (GitHub limitation)

GitHub **strips `<video>` tags** from repository READMEs (including `src` pointing at Release assets). A `<sub>` caption may remain with **no player and no poster**.

## What works on the repo homepage

1. **Play page (no login):** [watch-full-demo.html](https://bloomway-ai.github.io/bloomway-world-director/watch-full-demo.html) — hosted on GitHub Pages with `promo-full-demo-readme.mp4` (~8MB, 63s).
2. **True inline player:** upload `media/promo-full-demo-readme.mp4` via the **GitHub web editor** (drag-and-drop while editing `README.md`). GitHub inserts a line like:

   ```text
   https://github.com/user-attachments/assets/<uuid>
   ```

   Keep that URL **alone on its own line** (blank lines above/below). GitHub renders a native player. File must stay **≤ 10MB** on free org plans.

   Do **not** save a dummy release when testing in the release notes editor — only copy the URL into README.

## Source encode

```bash
./scripts/compress-promo-readme.sh
```

1080p master remains Release `final_v2_cold_open.mp4` only.