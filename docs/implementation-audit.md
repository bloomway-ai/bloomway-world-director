# Implementation audit (Bloomway World Director)

**Audit date:** 2026-11-14 (README/homepage pass)  
**Applies to:** `v0.1.1` · public repo `bloomway-ai/bloomway-world-director`  
**Purpose:** Single source of truth for what is **verified**, **experimental**, or **planned**. Root `README.md` must match this file.

> This document contains **no** API keys, internal hostnames, or production credentials.

---

## 1. What this project is

| Statement | Status |
| --------- | ------ |
| 3D world layout + character blocking + camera previs (low-poly blockout) | **Verified** (core library + Studio) |
| General-purpose AI video generation model | **Not in scope** — final footage is optional via Bloomway platform |
| Full natural-language director assistant (any sentence → plan) | **Not in this repo** — requires Bloomway hosted LLM |
| Bloomway Director MCP tools | **Planned** — [mcp/README.md](mcp/README.md); nothing to configure in OSS today |

---

## 2. Local capabilities (no Bloomway account)

| Capability | Status | Evidence |
| ---------- | ------ | -------- |
| Load `plan.json` + `world-ref.json` | **Verified** | `npm run verify:example` · `npm run verify:examples` |
| `validatePrevisPlan` | **Verified** | Same |
| Deterministic `generatePrevisWorld(ref)` | **Verified** | Same |
| Camera path sampling (`samplePrevisCamera`) | **Verified** | Same + Studio playback |
| WebGL blockout playback in browser | **Verified** | `npm run verify:studio-e2e`; `media/demo.mp4` |
| Rule/keyword composer (offline) | **Verified** | `apps/studio/src/director/ossLocalComposer.ts` — presets + patches; **no** network |
| OSS Studio static build (Pages/Vercel) | **Verified** (build) | `npm run build` / `build:pages` — **live URL** depends on hosting enablement |
| Import full product 3D Director UI | **Planned** | Subset in `apps/studio` only |

**Local baseline:** Node.js ≥ 20, npm ≥ 10. **No** API keys, **no** network required for default Studio blockout.

---

## 3. Hosted / cloud (Bloomway platform)

| Capability | Status | Notes |
| ---------- | ------ | ----- |
| Story → blocking plan (LLM) | **Hosted only** | Product Edge stack — not vendored in OSS |
| World chat assistant (LLM) | **Hosted only** | Not shipped in OSS |
| Sparks billing, teams, projects | **Hosted only** | |
| MCP tools for World Director | **Planned** | No Director-specific MCP in product API (checked 2026-03-26) |
| Video / scene image generation from previs | **Hosted optional** | Separate product workflow; may cost Sparks |

---

## 4. Code modules (product source → OSS)

| Module | Product path | In OSS? |
| ------ | ------------ | ------- |
| Plan core | `previsPlanCore.ts` (product) | **Yes** — `packages/core/src/` |
| World generator | `previsWorldGen.ts`, `previsWorldWater.ts` | **Yes** |
| Full `DirectorStudio3dWorkspace` | `components/directorStudio/v2/*` | **No** — minimal Studio |
| LLM prompts / Edge functions | `plan-director-previs/*` | **No** |

Extraction provenance: [packages/core/PROVENANCE.md](../packages/core/PROVENANCE.md).

---

## 5. Examples (all four folders)

| Example | Core validate | Bundled in `apps/studio/public` | Studio UX (v0.1) |
| ------- | ------------- | ------------------------------ | ---------------- |
| `edo-rainy-night` | **Verified** | **Yes** | Default `?example=1` / Edo preset |
| `street-drama` | **Verified** | **Yes** | Composer drama phrases → `fetchPlanUrl` |
| `modern-city-street` | **Verified** | **Yes** | Presets/keywords; **no** dedicated tile |
| `mars-base` | **Verified** | **Yes** | Mars preset + JSON; **no** dedicated tile |

Matrix: [examples/STATUS.md](examples/STATUS.md).

---

## 6. Known limitations

1. **Natural language:** OSS composer = **keywords + presets + bundled plan fetch** — not open-ended NLU or cloud LLM.
2. **Visual fidelity:** Blockout only; not Bloomway final renders.
3. **Studio UI:** English chrome in v0.1.
4. **Examples:** Four validate; two are first-visit friendly without reading docs.
5. **GitHub Pages OSS Studio:** **Live** at https://bloomway-ai.github.io/bloomway-world-director/ (see [deploy/studio-hosting.md](deploy/studio-hosting.md) for forks).
6. **Copyright entity:** MIT lists **Bloomway AI Inc.** — [EXTRACTED_CODE.md](EXTRACTED_CODE.md).

---

## 7. Licensing scope (MIT)

- **Covers:** Repository source under `LICENSE` unless otherwise noted.
- **Does not cover:** Bloomway hosted services or third-party APIs you configure.
- **Demo media:** CC BY 4.0 in `media/` — see [media/README.md](../media/README.md).

See [commercial-use.md](commercial-use.md).

---

## 8. Verification log

See [verification-log.md](verification-log.md). Re-run after material README or Studio changes.