# Release notes draft — v0.1.0 (do not publish tag yet)

**Target:** First public OSS drop of Bloomway World Director  
**Code license:** MIT ([LICENSE](../LICENSE)), Copyright (c) 2026 Bloomway AI Inc.

## Highlights

- Deterministic previs core (`packages/core`) — plan validation, world generation, camera sampling
- OSS Studio (`apps/studio`) — blockout viewport, timeline, local composer rules, world presets
- Examples: `edo-rainy-night`, `street-drama`
- Demo media: `media/demo-city-tour.mp4`, `media/demo-drama.mp4`

## Verify locally

```bash
npm ci
npm run verify:example
npm run build
npm run verify:studio-e2e
```

## Not included

Hosted LLM composer, full commercial Director UI, Bloomway account billing, MCP tools.

---

*Create git tag `v0.1.0` only after company approves public push and media/trademark licenses.*
