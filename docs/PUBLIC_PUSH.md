# Public push runbook (after company approval)

**Approved release commit (company, 2026-11-13):** use `git rev-parse HEAD` on the commit tagged `v0.1.0` immediately before push (prefer the doc commit that records approval if it is the tip).

**Target:** `https://github.com/bloomway-ai/bloomway-world-director`  
**First tag:** `v0.1.0`

## Prerequisite

The GitHub org or user **`bloomway-ai` must exist**, and the pushing account needs **`repo` write** access. As of prep on 2026-11-13, `gh repo create bloomway-ai/bloomway-world-director` returned **HTTP 404** (org not found on GitHub for the automation account).

## Commands

```bash
cd bloomway-world-director
git remote add origin https://github.com/bloomway-ai/bloomway-world-director.git   # if missing
git push -u origin main
git tag -a v0.1.0 -m "Bloomway World Director v0.1.0"
git push origin v0.1.0
gh release create v0.1.0 \
  --repo bloomway-ai/bloomway-world-director \
  --title "v0.1.0" \
  --notes-file docs/RELEASE_NOTES_v0.1.0_DRAFT.md
```

If the approved commit changes after tagging, delete the local tag, re-approve SHA, and retag.
