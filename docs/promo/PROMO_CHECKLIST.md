# Promotion & assets checklist (vs launch plan)

**Last reviewed:** 2026-11-14 (promo pack pass)

## On GitHub / in repo

| Asset | Plan | Status |
| ----- | ---- | ------ |
| `media/demo-city-tour.mp4` + poster | Main city demo | **Done** — README posters |
| `media/demo-drama.mp4` + poster | Drama blocking demo | **Done** |
| `media/screenshots/*.png` | README UI shots | **Done** — `npm run capture:screenshots` |
| `docs/promo/social-preview.png` | OG-style preview | **Done** — upload in repo About if not auto |
| 7-language README + hub posters | Plan | **Done** |
| `docs/i18n/{locale}/` | COMMERCIAL + UPDATES pointers | **Done** |
| `docs/gallery/README.md` | Gallery skeleton | **Done** |
| `docs/discussions/welcome.md` + `one-scene-three-moves.md` | Welcome + challenge | **Done** — post on GitHub Discussions |
| Examples: edo, street, modern-city, mars | Plan | **Done** — `npm run verify:examples` |
| Per-example `media/screenshot.png` | Plan | **Done** (v0.1 placeholders + Studio stills) |
| `docs/promo/LAUNCH_POST_EN.md` | Short post | **Done** |
| Dependabot + Issue/PR templates | Plan | **Done** |
| DCO workflow | Plan | **Done** — branch protection optional |

## GitHub.com (manual / org settings)

| Item | Status |
| ---- | ------ |
| Org profile + repo Pin | **Done** |
| Repo About + Topics | **Done** |
| **Social preview image** (Settings → General) | **Todo** — use `docs/promo/social-preview.png` |
| **Discussions** enabled + welcome + pinned challenge | **Automate via gh after push** |
| Branch protection + required checks | **Org admin** — enable `Verify` + `DCO` on `main` |
| Release assets (attach mp4) | **Optional** — files in `media/` |

## Raw demo URLs

- `https://raw.githubusercontent.com/bloomway-ai/bloomway-world-director/main/media/demo-city-tour.mp4`
- `https://raw.githubusercontent.com/bloomway-ai/bloomway-world-director/main/media/demo-drama.mp4`