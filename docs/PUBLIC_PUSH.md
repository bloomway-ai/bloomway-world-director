# Public push runbook (after company approval)

**Approved release commit (company, 2026-11-13):** use `git rev-parse HEAD` on the commit tagged `v0.1.0` immediately before push (prefer the doc commit that records approval if it is the tip).

**Company org (2026-11-13):** https://github.com/zhouguojun311-gmail-com/bloomway-world-director  
Display name on GitHub: **Bloomway AI Inc.**

**Target slug (optional):** `bloomway-ai` — GitHub org login rename did not apply via API (needs org owner in browser). After rename:

`https://github.com/bloomway-ai/bloomway-world-director`

Org owner: **Settings → Profile** → organization account name → `bloomway-ai` → update repositories.

| Ref | Note |
| --- | ---- |
| `main` | Latest on org remote |
| `v0.1.0` | Carried with repository transfer |

```bash
git remote set-url origin https://github.com/zhouguojun311-gmail-com/bloomway-world-director.git
git push origin main --tags
```
