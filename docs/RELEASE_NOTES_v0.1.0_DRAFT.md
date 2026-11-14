# v0.1.0

**Bloomway World Director** — open-source 3D previsualization (blockout worlds, camera paths, local Studio).

**License:** MIT ([LICENSE](../LICENSE)), Copyright (c) 2026 Bloomway AI Inc.  
**Demo media:** [CC BY 4.0](../media/README.md)

## Highlights

- Core library (`packages/core`) — plan validation, procedural world generation, camera sampling
- OSS Studio (`apps/studio`) — WebGL viewport, timeline, offline composer rules, world presets
- Examples: `edo-rainy-night`, `street-drama`, `modern-city-street`, `mars-base` (`npm run verify:examples`)
- Demo recordings + README posters: `media/demo-city-tour.mp4`, `media/demo-drama.mp4`, legacy `media/demo.mp4`; UI stills in `media/screenshots/`

## Verify locally

```bash
npm ci
npm run verify:example
npm run build
npm run verify:studio-e2e
```

## Not in this repository

Hosted LLM composer, full commercial Director UI, Bloomway cloud accounts/billing, MCP Director tools.

## Links

- [Contributing](../CONTRIBUTING.md) · [Security](../SECURITY.md) · [Third-party notices](THIRD_PARTY_NOTICES.md)
