# Implementation audit (Bloomway World Director)

**Audit date:** 2026-11-13  
**Repository path:** `bloomway-world-director` (local working copy; not yet public on GitHub)  
**Purpose:** Single source of truth for what is **verified**, **experimental**, or **planned**. README Quick start, limitations, and roadmap must match this file.

> This document contains **no** API keys, internal hostnames, or production credentials.

---

## 1. What this project is

| Statement | Status |
| --------- | ------ |
| 3D world layout + character blocking + camera previs (low-poly blockout) | **Verified** (core library + example) |
| General-purpose AI video generation model | **Not in scope** — final footage is optional via Bloomway platform |
| Full natural-language director assistant (any sentence → plan) | **Not in this repo** — requires Bloomway hosted LLM |

---

## 2. Local capabilities (no Bloomway account)

| Capability | Status | Evidence |
| ---------- | ------ | -------- |
| Load `plan.json` + `world-ref.json` | **Verified** | `npm run verify:example` |
| `validatePrevisPlan` | **Verified** | Same script |
| Deterministic `generatePrevisWorld(ref)` | **Verified** | Same script (edo style) |
| Camera path sampling over time (`samplePrevisCamera`) | **Verified** | Same script prints position deltas |
| WebGL blockout playback in browser | **Verified** | `npm run verify:studio-e2e`; `media/demo.mp4` from `npm run record:demo` ([verification-log.md](verification-log.md)) |
| Rule/keyword world hints without LLM | **Experimental** | Partial port planned; not required for example |
| Import full product 3D Director UI | **Planned** | Subset only in `apps/studio` |

**Local baseline:** Node.js ≥ 20, npm ≥ 10. **No** API keys, **no** network calls required for `verify:example` or default Studio example.

---

## 3. Hosted / cloud (Bloomway platform)

| Capability | Status | Notes |
| ---------- | ------ | ----- |
| Story → blocking plan (LLM) | **Hosted only** | `plan-director-previs` Edge function in product repo |
| World chat assistant (LLM) | **Hosted only** | Not shipped in OSS |
| Sparks billing, teams, projects | **Hosted only** | |
| MCP tools for World Director | **Planned** | No Director-specific MCP tool in `cloud-run/mcp-api` today (verified 2026-03-26) |
| Video / scene image generation from previs | **Hosted optional** | Separate product workflow |

---

## 4. Code modules (product source → OSS)

| Module | Product path | In OSS? |
| ------ | ------------ | ------- |
| Plan core (types, validate, camera sample) | `bloomway-launch-step1/supabase/functions/_shared/previsPlanCore.ts` | **Yes** — `packages/core/src/` (extracted copy) |
| World generator | `previsWorldGen.ts`, `previsWorldWater.ts` | **Yes** — same |
| Full `DirectorStudio3dWorkspace` | `components/directorStudio/v2/*` | **No** — minimal Studio only |
| LLM prompts / Edge functions | `supabase/functions/plan-director-previs/*` | **No** |

Extraction is a **copy** with provenance in `packages/core/PROVENANCE.md`. Copyright under MIT applies to OSS copy; product deployment remains separate.

---

## 5. Example: `examples/edo-rainy-night`

| Claim | Status |
| ----- | ------ |
| Edo-era styled street world (`style: edo`, `timeOfDay: night`) | **Verified** — deterministic from ref |
| Rain weather on ref | **Verified** — `weather: rain` in ref |
| Character blocking (capsule paths) | **Verified** — plan JSON |
| Camera push / follow / pull back | **Verified** — multiple `camera.keys`; motion via `samplePrevisCamera` + Studio playback |

**Not claimed:** cinematic rain VFX, AI environment art, or LLM from one-sentence prompt in this example.

---

## 6. Known limitations

1. **Natural language:** README marketing lines describe the **product vision**; this repo’s example uses **checked-in JSON** (+ optional keyword rules later), not unconstrained NLU.
2. **Visual fidelity:** Low-poly blockout only; not representative of Bloomway final renders.
3. **Studio UI:** English only; subset of product features.
4. **Examples:** One fully wired example; `modern-city-street` and `mars-base` are **Planned** (refs validated in product tests, not yet in OSS examples).
5. **Copyright entity:** MIT License lists **Bloomway AI Inc.** — **待人工确认** with legal counsel.

---

## 7. Licensing scope (MIT)

- **Covers:** Source files in this repository under `LICENSE`, except where another file states a different license.
- **Does not cover:** Bloomway hosted services, third-party APIs you configure, or media files with separate `MEDIA_LICENSE` in example folders.
- **Does not impose:** commercial registration, mandatory UI attribution, mandatory end-video credits, or anti-competitive terms.

See [commercial-use.md](commercial-use.md), [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

---

## 8. Verification log

See [docs/verification-log.md](verification-log.md) for commands, environment, and outputs from the acceptance run.
