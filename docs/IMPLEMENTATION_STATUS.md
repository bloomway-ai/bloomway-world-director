# Implementation status (MIT + docs pass)

**Updated:** 2026-03-26 (Cursor plan mode — code files blocked until Agent mode)

## Completed in this pass (markdown)

| File | Purpose |
| ---- | ------- |
| [README.md](../README.md) | English home + Commercial use / Attribution / Branding |
| [README.zh-CN.md](../README.zh-CN.md) | Chinese sections + 共创 |
| [docs/commercial-use.md](commercial-use.md) | MIT vs services boundary |
| [TRADEMARKS.md](../TRADEMARKS.md) | Trademark guidance |
| [docs/THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) | Dependency/asset checklist |
| [docs/STUDIO_BRANDING.md](STUDIO_BRANDING.md) | Official UI branding spec |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Contributions + MIT alignment |

## Blocked until Agent mode (user asked to implement)

| File | Action |
| ---- | ------ |
| `LICENSE` | Copy standard MIT text; copyright line `Copyright (c) 2026 Bloomway AI` — **legal entity to be confirmed** |
| `apps/studio/src/components/ProjectAttribution.tsx` | Footer branding per STUDIO_BRANDING.md |
| Remove obsolete `docs/legal/LICENSE_REQUIREMENTS.md` if present | Replaced by MIT + commercial-use.md |
| `package.json` / studio shell | Wire `npm run dev` commands in README |

## Removed / avoided phrasing (per audit)

The new docs do **not** require:

- Email before commercial use
- Revenue share on outputs
- Mandatory on-screen attribution in videos
- Mandatory UI link as a license condition (only voluntary + MIT notices)
- Bloomway account for local use

## Commercial contact email

Using **info@bloomway.ai** — already published in Bloomway product i18n (e.g. challenges, support) in `bloomway-studio` / `bloomway-launch-step1` workflow messages. **Not a placeholder.**

## Copyright / MIT scope (pending legal sign-off)

| Item | Status |
| ---- | ------ |
| Extracted code from `bloomway-launch-step1` | Not yet copied; MIT applies when committed here |
| Example media | Per-example README required |
| three.js / React | MIT-compatible; list in THIRD_PARTY_LICENSES after lockfile |
| Hosted MCP/API | Out of MIT scope — documented in commercial-use.md |

## Verification (pending studio code)

- [ ] Local run without registration gate
- [ ] Footer does not block edit/export
- [ ] `LICENSE` on disk matches README
- [ ] Build passes after monorepo scaffold

## Plan cross-reference

See **第十二节：遗漏问题与隐患稽核** in the same Cursor plan file `3d_previs_oss_launch_4e33d920.plan.md` (MIT 对齐、公开前 G 清单、废止强制署名方案).

## Next step for user

Approve **Agent mode** and ask to continue: create `LICENSE`, `ProjectAttribution.tsx`, `SECURITY.md`, `implementation-audit.md`, and remove any superseded legal-draft references.
