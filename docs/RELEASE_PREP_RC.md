# Release preparation record (technical)

**Purpose:** Bind verification commands and scan scope to a **candidate git SHA** for company approval before public push to **bloomway-ai/bloomway-world-director** and tag **v0.1.0**.

| Field | Value |
| ----- | ----- |
| Candidate SHA | Run `git rev-parse HEAD` on the commit you approve |
| Date (last update) | 2026-11-13 |
| Target remote | [bloomway-ai/bloomway-world-director](https://github.com/bloomway-ai/bloomway-world-director) |
| Public push / visibility | **Company approved (2026-11-13)** — **blocked on GitHub** until `bloomway-ai` org/repo exists ([PUBLIC_PUSH.md](PUBLIC_PUSH.md)) |
| `v0.1.0` tag / GitHub Release | **Not created on remote** — runbook in [PUBLIC_PUSH.md](PUBLIC_PUSH.md) |

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
| Extracted core MIT | **Confirmed (2026-11-13)** — [EXTRACTED_CODE.md](EXTRACTED_CODE.md) |
| Security email | **info@bloomway.ai** — **Confirmed (2026-11-13)** — no SLA |
