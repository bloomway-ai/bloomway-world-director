# Bloomway World Director

**Your words. Your world. Your camera.**

Build 3D worlds and direct camera moves for cinematic **previsualization** (low-poly blockout)—not a general-purpose AI video generation model. Turning previs into final footage is an optional workflow on [Bloomway](https://bloomway.ai).

[中文说明](README.zh-CN.md)

---

## Quick start

**Requirements:** Node.js ≥ 20, npm ≥ 10. No Bloomway account or API keys for the bundled example.

```bash
git clone https://github.com/zhouguojun311-gmail-com/bloomway-world-director.git
cd bloomway-world-director
npm install
npm run verify:example       # validates plan + world + camera motion (deterministic)
npm run dev                  # Studio preview at http://localhost:5173/
```

The default Studio loads [`examples/edo-rainy-night`](examples/edo-rainy-night/) (checked-in JSON, not live natural-language inference).

**Implementation truth source:** [docs/implementation-audit.md](docs/implementation-audit.md)  
**Last verification run:** [docs/verification-log.md](docs/verification-log.md)

Optional checks: `npm run verify:studio-e2e` (Playwright timeline), `npm run record:demo` (regenerate `media/demo.mp4`).

---

## See it in action

These clips are recorded from **this repository’s** lightweight Studio (not the full Bloomway app UI).

| Demo | One-line prompt | File |
| ---- | --------------- | ---- |
| City tour | `Snowy daytime Tokyo urban city` → explore with WASD | [demo-city-tour.mp4](media/demo-city-tour.mp4) |
| Street drama | `Rainy night — two rivals meet in the street` → play blocking | [demo-drama.mp4](media/demo-drama.mp4) |

Regenerate: `npm run record:demos`. Legacy: [demo.mp4](media/demo.mp4) · [Media notes](media/README.md)

Full Director Studio on Bloomway: [bloomway.ai](https://bloomway.ai)

---

## What runs locally (summary)

| Status | Capability |
| ------ | ---------- |
| **Verified** | `plan.json` + `world-ref.json`, `validatePrevisPlan`, `generatePrevisWorld`, `samplePrevisCamera` (`npm run verify:example`) |
| **Verified** | V2 Director viewport + product-style timeline (`verify:studio-e2e`); legacy blockout via `?legacy=1` |
| **Experimental** | Keyword/rule world hints without LLM (not required for the example) |
| **In progress** | V2 viewport + timeline + settings + presets (see [docs/product-parity.md](docs/product-parity.md)) |
| **Planned** | Composer/LLM, record-export UI, camera dock, MCP Director tools, extra examples |

Natural-language “describe any sentence → plan” assistants are **hosted on Bloomway only** (not in this repo).

---

## Limitations

1. Marketing lines describe product vision; the OSS example uses **checked-in JSON**.
2. Visual fidelity is **blockout** only—not Bloomway final renders.
3. Studio UI is a **subset** of the commercial product (no cloud Composer); see [docs/product-parity.md](docs/product-parity.md).
4. Only `edo-rainy-night` is fully wired; other demo scenes are **planned**.

Details: [docs/implementation-audit.md](docs/implementation-audit.md) §6.

---

## Roadmap

- `modern-city-street` and `mars-base` examples (planned)
- MCP integration docs and tools (planned)
- Richer Studio (timeline scrub, import) (planned)

---

## Commercial use

Commercial use is welcome under the MIT License. No registration, notification, or separate permission is required.

Optional contact: **info@bloomway.ai** for collaboration, deployment support, or showcase—**not** a license condition.

MIT applies to code in this repository. Third-party components and separately licensed assets keep their own terms. Hosted Bloomway services use separate terms. See [docs/commercial-use.md](docs/commercial-use.md).

### Attribution

Retain MIT copyright and license notices when redistributing. Linking back to this repo or mentioning Bloomway AI is **voluntary**.

### Branding

See [TRADEMARKS.md](TRADEMARKS.md). Do not imply official endorsement without authorization.

---

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Bloomway AI Inc.

Demo videos and posters in [`media/`](media/) are **[CC BY 4.0](media/README.md)** (separate from source MIT). Third-party dependency notices: [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Public release acceptance checklist: [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md).
