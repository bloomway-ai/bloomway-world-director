# Demo recording shotlist (OSS Studio only)

**Scope:** This video must be recorded from **this repository** at  
`/Users/guojun/Desktop/工作/Bloomway/bloomway-world-director`  
(`apps/studio` + `examples/edo-rainy-night`). Do **not** use E20, Academy tutorials, or the full Bloomway product UI.

**Target length:** 12–18 seconds (full play-through of the 12s plan, plus ~2s hold at start).

| Step | Action | What viewers should see |
| ---- | ------ | ------------------------ |
| 1 | Open `http://localhost:5173/?autoplay=1` (or click Play) | Header + gray blockout city + blue/red capsules |
| 2 | Let timeline run 0 → 12s | Camera pulls from behind traveler, arcs, pulls back |
| 3 | Optional | Brief pause/scrub to show timeline control (not required in final cut) |

**Output files:**

- `media/demo.mp4` — H.264, 1280×720 or viewport size
- `media/poster.png` — frame from ~4s
- `media/README.md` — source statement

**Automation:** `npm run record:demo` (Playwright screen recording against local dev server).
