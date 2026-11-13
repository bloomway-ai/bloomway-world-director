# Release preparation record (technical)

**Purpose:** Bind verification commands and scan scope to a **candidate git SHA** for company approval before public push.

| Field | Value |
| ----- | ----- |
| Candidate SHA | Run `git rev-parse HEAD` on the approved commit before public push |
| Date | 2026-11-13 |
| Public push / GitHub visibility | **Out of scope** — awaiting company |
| `v0.1.0` git tag | **Not created** — draft notes in [RELEASE_NOTES_v0.1.0_DRAFT.md](RELEASE_NOTES_v0.1.0_DRAFT.md) |

## Commands run (candidate prep)

| Command | Result |
| ------- | ------ |
| `npm run verify:example` | *(see terminal log in deliverable)* |
| `npm run build` | *(see terminal log)* |
| `npm run verify:studio-e2e` | *(see terminal log)* |
| `node scripts/license-audit.mjs` | Informational |
| `gitleaks detect --source .` | *(see deliverable)* |

## Security email

`SECURITY.md` → **info@bloomway.ai** — **等待邮箱管理人员确认** receipt and internal routing (no SLA claimed).

## Media

CC BY 4.0 for `media/*` — **proposed, pending company** ([media/README.md](../media/README.md)).

## Extracted core

[EXTRACTED_CODE.md](EXTRACTED_CODE.md) — diff match ≠权属完毕；需公司确认雇佣/外包权利。
