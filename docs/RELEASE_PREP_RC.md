# Release preparation record (technical)

**Purpose:** Bind verification commands and scan scope to a **candidate git SHA** for company approval before public push to **bloomway-ai/bloomway-world-director** and tag **v0.1.0**.

| Field | Value |
| ----- | ----- |
| Candidate SHA | Run `git rev-parse HEAD` on the commit you approve |
| Date (last update) | 2026-11-13 |
| Target remote | `https://github.com/bloomway-ai/bloomway-world-director` (not pushed yet) |
| Public push / visibility | **Awaiting approval of candidate SHA** |
| `v0.1.0` tag / GitHub Release | **Not created** — draft [RELEASE_NOTES_v0.1.0_DRAFT.md](RELEASE_NOTES_v0.1.0_DRAFT.md) |

## After company approves a SHA

1. Confirm org/repo permissions and branch/ref to push.
2. Push approved commit to default branch.
3. Create annotated or lightweight tag `v0.1.0` on **that same commit** (re-report SHA if code changes after approval).
4. Publish GitHub Release from `v0.1.0`.

## Commands run (candidate prep)

| Command | Result |
| ------- | ------ |
| `npm run verify:example` | Pass (see commit-era CI / local log) |
| `npm run build` | Pass |
| `npm run verify:studio-e2e` | Pass |
| `node scripts/license-audit.mjs` | Informational |
| `gitleaks detect --source .` | See deliverable / commit message era |

## Policy snapshots (confirmed)

| Topic | Status |
| ----- | ------ |
| Copyright | `Copyright (c) 2026 Bloomway AI Inc.` + root MIT |
| Media CC BY 4.0 | Approved — [media/README.md](../media/README.md), [media/LICENSE](../media/LICENSE) |
| Third-party notices | [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) |
| Extracted core MIT | Company agrees; **employment/contract 核实 — 未完成** — [EXTRACTED_CODE.md](EXTRACTED_CODE.md) |
| Security email | **info@bloomway.ai** — **等待邮箱管理人员确认** |
