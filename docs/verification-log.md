# Verification log (acceptance run)

**Date:** 2026-11-13 (local, agent run)  
**Host:** Darwin arm64, Node.js v24.13.0, npm 11.6.2  
**Repo path (absolute):** `/Users/guojun/Desktop/工作/Bloomway/bloomway-world-director`  
**Bloomway test account:** **Not used** — OSS example is intentionally account-free (no `bloomway-launch-step1` login).

## Prerequisites stated in README

| Requirement | Verified |
| ----------- | -------- |
| Node.js ≥ 20 | Yes (`node -v` → v24.13.0) |
| npm ≥ 10 | Yes (`npm -v` → 11.6.2) |
| Bloomway account for local example | **Not required** |
| Paid API keys for example | **Not required** |

## Commands and results

### 1. Install

```bash
cd /Users/guojun/Desktop/工作/Bloomway/bloomway-world-director
npm install
npx playwright install chromium
```

**Result:** exit 0.

### 2. Example validation + camera motion (deterministic)

```bash
npm run verify:example
```

**Result:** exit 0, `OK verify:example`. `buildingCount`: 279. `cameraTravel.moveMid` ≈ 5.80 m, `moveEnd` ≈ 13.33 m.

### 3. Build

```bash
npm run build
```

**Result:** exit 0.

### 4. Studio E2E (Playwright, real local dev server)

```bash
npm run verify:studio-e2e
```

**Result:** exit 0 — `OK verify:studio-e2e { t0: '0.5s / 12s', t1: '3.0s / 12s' }` (timeline advanced; canvas present).

### 5. Demo recording (OSS Studio only)

```bash
npm run record:demo
```

**Result:** exit 0 — wrote `media/demo.mp4` (~16s, 1280×720) and `media/poster.png`. Source: `apps/studio` preview + `?autoplay=1`, not E20/product UI.

## Network usage

| Step | Network |
| ---- | ------- |
| `npm install` / Playwright browser download | Required |
| `verify:example` / `build` / `verify:studio-e2e` / `record:demo` | **None** (localhost only after install) |

## Gitleaks

See `docs/ACCEPTANCE.md` — rescanned after new commits.

---

## Homepage / README pass (2026-11-14)

| Command | Result |
| ------- | ------ |
| `npm run i18n-check` | OK (8 README files) |
| `npm run verify:examples` | OK — all four example dirs |
| `npm run build:pages` | OK — `apps/studio/dist` |
| `npm run verify:studio-e2e` | OK — timeline `0.7s → 3.1s / 12s` |

Release URL check: `final_v2_cold_open.mp4` → HTTP 302 (asset exists).  
GitHub Pages URL: **404** until Pages + Actions deploy enabled (see `docs/deploy/studio-hosting.md`).
