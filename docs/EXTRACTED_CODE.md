# Extracted core modules — provenance and rights checklist

Bloomway AI Inc. **agrees** to release these files under the repository **MIT License**, to the extent the company has the right to do so.

**Company sign-off (2026-11-13):** Bloomway confirmed publication of the three extracted modules under MIT, legal entity **Bloomway AI Inc.**, and internal rights to license these versions. Agreement text and registration copies remain **out of this public repository**.

---

## Files in scope

| OSS path | Internal path (historical) | Lines (approx.) |
| -------- | -------------------------- | ----------------- |
| `packages/core/src/previsPlanCore.ts` | `bloomway-launch-step1/supabase/functions/_shared/previsPlanCore.ts` | ~3228 |
| `packages/core/src/previsWorldGen.ts` | same directory | ~1359 |
| `packages/core/src/previsWorldWater.ts` | same directory | ~200 |

Copy recorded in [packages/core/PROVENANCE.md](../packages/core/PROVENANCE.md): **2026-03-26**.

---

## Authors and change history **in this public repository**

| File | `git blame` (this repo) | Commit introducing copy |
| ---- | ------------------------ | ------------------------ |
| All three | **100%** attributed to `josuke0123` | `7458d06` — *chore: initial open-source skeleton for pre-public acceptance* |

There are **no** per-file `Copyright` headers or `@author` tags in the TypeScript sources. This repository does **not** contain HR records, employment contracts, or internal monorepo blame history.

**What we do not infer:** That `josuke0123` equals a specific legal assignee, or that all historical edits were employee work-for-hire.

---

## Third-party or pasted code (static review)

| File | External copyright marks | Known third-party snippets |
| ---- | ------------------------ | --------------------------- |
| `previsPlanCore.ts` | none found | **none identified** (TypeScript only; imports `@core` types) |
| `previsWorldGen.ts` | none found | **none identified** |
| `previsWorldWater.ts` | none found | **none identified** |

No embedded code attributed to Apache, BSD, GPL, or other vendors was found by repository text search. If internal history shows merges from third-party sources, update this table.

**Basis for “none identified”:** No `Copyright`, `SPDX`, or “copied from …” markers in these files; no non-Bloomway license headers.

---

## Company decision (recorded)

| Item | Status |
| ---- | ------ |
| MIT publication of these three files | **Confirmed** (2026-11-13) |
| Work-for-hire / contractor rights to publish | **Confirmed by company** (2026-11-13; details not in repo) |
| No conflicting third-party paste in these files | **Confirmed by company** (2026-11-13) |
| No customer NDA blocking this snapshot | **Confirmed by company** (2026-11-13) |
| OSS copy matches intended licensed version | **Confirmed for release commit** (see `git rev-parse HEAD` at public push) |

Engineering still cannot reconstruct HR/contract evidence from this repo alone; public documentation records **company assertion only**.

---

## What we do not request in the public repo

Full NDAs, employment agreements, or contractor statements of work. Only **factual** rights confirmations are needed internally.
