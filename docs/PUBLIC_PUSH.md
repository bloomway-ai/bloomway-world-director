# Public push runbook (after company approval)

**Approved release commit (company, 2026-11-13):** use `git rev-parse HEAD` on the commit tagged `v0.1.0` immediately before push (prefer the doc commit that records approval if it is the tip).

**Planned home:** `https://github.com/bloomway-ai/bloomway-world-director` (when the org exists)

**Published (2026-11-13):** `https://github.com/josuke0123/bloomway-world-director` — created because `bloomway-ai` was not on GitHub yet. Transfer the repository to the org when ready (Settings → Danger zone → Transfer).

| Ref | SHA (at publish) |
| --- | ---------------- |
| `main` @ push | `f23f995a6c27beeecbb27cd9a20c68a34d350638` |
| Tag `v0.1.0` | same commit |

## After transfer to `bloomway-ai`

```bash
git remote set-url origin https://github.com/bloomway-ai/bloomway-world-director.git
git push -u origin main --tags
```

Update media attribution links in `media/README.md` and `media/LICENSE` to the new URL if the repo path changes.
