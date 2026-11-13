# Extracted core modules — provenance and rights checklist

Bloomway AI Inc. **agrees** to release these files under the repository **MIT License**, to the extent the company has the right to do so.

**Employment, contractor, and customer agreements allowing publication are not marked verified in this document.** A byte-level match to an internal monorepo path does **not** establish ownership or publication rights.

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

- **License intent:** MIT for these three files as part of the repo (company confirmation received 2026-11-13).
- **Contract / employment verification:** **Outstanding** — see questions below.

---

## Questions requiring company confirmation (do not close without answers)

1. **Work for hire / assignment:** For each file, confirm that contributors who authored the matching internal versions were employees or contractors whose agreements **assign or license** publication under MIT to Bloomway AI Inc.
2. **Third-party dependencies inside logic:** Confirm no portion was copied from Stack Overflow, vendor SDKs, or client deliverables under conflicting terms (even if not labeled in source).
3. **Customer or product confidentiality:** Confirm the algorithms and constants in these files are not subject to customer NDAs or restricted interface specs.
4. **Parallel internal copies:** If `bloomway-launch-step1/.../_shared/` diverges after 2026-03-26, confirm the **OSS SHA** is still the version the company intends to license (not an obsolete or mixed snapshot).

Until items 1–3 are confirmed internally, treat **employment/外包 contract 允许公开** as **unverified** in release sign-off checklists.

---

## What we do not request in the public repo

Full NDAs, employment agreements, or contractor statements of work. Only **factual** rights confirmations are needed internally.
