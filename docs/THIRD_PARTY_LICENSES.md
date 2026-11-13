# Third-party licenses and distribution

**Audit snapshot date:** 2026-11-13  
**Lockfile:** root `package-lock.json` (npm lockfile v3)  
**Method:** SPDX `license` fields on lockfile packages + inspection of Studio `dist/` after `npm run build -w @bloomway/studio`. Automated summary: `node scripts/license-audit.mjs`.

This document **does not** certify full legal compliance. Flagged items need human review before a public release.

---

## 1. What we ship to end users

| Artifact | Contents | How produced |
| -------- | -------- | ------------ |
| `apps/studio/dist/` | Bundled JS/CSS, `index.html`, static `public/` assets (examples JSON, brand images) | `vite build` |
| `node_modules/` | **Not** published in git; installed via `npm ci` | dev/deploy only |

**Runtime libraries compiled into the browser bundle** (direct prod dependencies of `@bloomway/studio`):

| Package | Lock version | License (lockfile) | Role |
| ------- | ------------ | ------------------- | ---- |
| `react` | 19.3.1 | MIT | UI |
| `react-dom` | 19.3.1 | MIT | UI |
| `three` | 0.175.0 | MIT | WebGL viewport |

Build-time only (not intended in browser runtime bundle, but required to build): `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, transitive toolchain (Babel, Rollup, etc.) — overwhelmingly **MIT / ISC / Apache-2.0**.

**Root workspace devDependencies** (scripts / CI, not browser bundle):

| Package | License |
| ------- | ------- |
| `playwright` | Apache-2.0 |
| `tsx` | MIT |
| `typescript` | Apache-2.0 |

---

## 2. Lockfile-wide notes (transitive)

From `scripts/license-audit.mjs` on this lockfile:

- **Dominant licenses:** MIT, ISC, Apache-2.0, BSD-3-Clause, BlueOak-1.0.0.
- **Packages without SPDX in lockfile:** workspace roots (`apps/studio`, `packages/core`, `@bloomway/*`) — **our** packages; covered by root [MIT](../LICENSE).
- **CC-BY-4.0:** `caniuse-lite` (browser support data for frontend tooling). Typically **not** shipped in production bundle; attribution not usually required for app distribution, but retain in dependency tree notices if counsel advises.
- **MPL-2.0:** `lightningcss` platform packages (Tailwind CSS 4 pipeline). May participate in **build** output. MPL-2.0 may require making **corresponding source** of MPL-licensed files available when distributing binaries that include them. **Review before release** — if required, add MPL notice file in distribution docs.
- **0BSD:** `tslib` under `@tailwindcss/oxide-wasm32-wasi` (platform-specific optional path).

**Unknown / special:** Any future dependency without `license` in lockfile must be resolved before tagging a release.

---

## 3. Static assets (`apps/studio/public/`)

| Path | Nature | Code / content license | Trademark |
| ---- | ------ | ---------------------- | ----------- |
| `examples/**/*.json` | OSS example data | MIT (same repo) | — |
| `brand/bloomway-wordmark-dark.png` | Company logo | MIT does **not** grant logo/trademark rights | Bloomway — [TRADEMARKS.md](../TRADEMARKS.md) |
| `brand/bloomway-wordmark.svg` | Company wordmark asset | same | same |

No third-party icon fonts or stock 3D models are bundled. Blockout geometry is **procedural** in source.

---

## 4. MIT scope reminder

Root [MIT](../LICENSE) applies to **this repository’s source and docs**. `node_modules` remain under their respective licenses. Bloomway **hosted** APIs and services are **not** covered.

See also [commercial-use.md](commercial-use.md).

---

## 5. Regenerate audit

```bash
node scripts/license-audit.mjs
```

Commit updated `package-lock.json` before re-running for release tags.
