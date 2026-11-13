# Third-party notices (distribution)

Companion to [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md). Root [MIT](../LICENSE) applies **only** to Bloomway AI Inc. code in this repository—not to dependencies, which keep their own licenses.

**Lockfile:** `package-lock.json` · **Audit:** `node scripts/license-audit.mjs` · **Studio build check:** 2026-11-13 (`npm run build -w @bloomway/studio`, grep `apps/studio/dist/`).

---

## What we distribute publicly (v0.1.0 intent)

| Channel | What recipients get | Third-party code inside? |
| ------- | ------------------- | ------------------------ |
| **Git source** | `.ts`, `.tsx`, docs, `examples/`, `media/`, scripts; **not** `node_modules/` | Only if user runs `npm ci` locally |
| **Built Studio** (`apps/studio/dist/`) | Precompiled JS/CSS/HTML + `public/` static files | **Runtime:** React, ReactDOM, Three.js (MIT), bundled by Vite |
| **npm install** | Full dependency tree under `node_modules/` | Yes — each package under its license |

We do **not** relicense third-party code as MIT.

---

## Browser bundle (runtime) — shipped with prebuilt Studio

Verified 2026-11-13: no string matches for `lightningcss` or `caniuse` in `apps/studio/dist/`.

| Package | Version (lock) | License | In bundle |
| ------- | -------------- | ------- | --------- |
| `react` | 19.3.1 | MIT | yes |
| `react-dom` | 19.3.1 | MIT | yes |
| `three` | 0.175.0 | MIT | yes |

MIT distributions: include the MIT copyright and permission notice for these libraries when redistributing **substantial portions** of the combined bundle (standard practice for minified JS; full texts are in each package’s `node_modules/<pkg>/LICENSE` after `npm ci`).

---

## Build-time only — not in browser bundle

### `lightningcss` (MPL-2.0)

| Item | Detail |
| ---- | ------ |
| Versions | `lightningcss@1.33.0` + platform packages (`lightningcss-darwin-arm64`, …) |
| License | **MPL-2.0** |
| Role | Tailwind CSS 4 / `@tailwindcss/vite` compile CSS at **build** time |
| Output | Static `.css` in `dist/assets/*.css` (standard CSS; no Lightning CSS runtime in bundle) |
| Local modifications | **None** to upstream `lightningcss` sources in this repo |
| Corresponding source | https://github.com/parcel-bundler/lightningcss tag **v1.33.0** (matches lockfile resolved version) |

**Engineering conclusion:** MPL files are used on the **build machine** to produce CSS. We have **not** copied MPL source into `packages/` or patched vendor code. If counsel requires MPL notice for your distribution channel, point recipients to the tag above; obligating **binary** redistribution of MPL **unmodified** build tools is lower risk when the **shipped artifact** is the compiled CSS/JS without Lightning CSS linked at runtime.

### Other build toolchain (representative)

| Package | License | Shipped in `dist/`? |
| ------- | ------- | ------------------- |
| `vite`, `@vitejs/plugin-react` | MIT | no (build tool) |
| `tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/node` | MIT | no |
| `typescript`, `tsx` | Apache-2.0 / MIT | no |
| `playwright` | Apache-2.0 | no (demo recording only) |
| `caniuse-lite` | **CC-BY-4.0** | **no** (grep dist); dev/browserlist data for tooling |

### `@tailwindcss/oxide` (native CSS engine)

Pulled by Tailwind 4; runs at build time. License per lockfile: **MIT** (package `tailwindcss` family). Not present as runtime in `dist/`.

---

## Static assets in `apps/studio/public/`

| Path | Third-party? | Notes |
| ---- | ------------ | ----- |
| `examples/**/*.json` | no | MIT (this repo) |
| `brand/*` | no (company marks) | **Trademark** — not licensed for third-party product promotion |

---

## Workspace packages without SPDX in lockfile

`@bloomway/studio`, `@bloomway/previs-core` — **Bloomway AI Inc.** MIT at repository root.

---

## Copying notices with releases

When publishing a **GitHub Release** that includes `apps/studio/dist/`:

1. Ship root [LICENSE](../LICENSE) (MIT).
2. Ship this file and [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
3. Ship [media/LICENSE](../media/LICENSE) if demo media is attached.
4. Do not represent third-party components as MIT.

Regenerate dependency summary after any lockfile change.
