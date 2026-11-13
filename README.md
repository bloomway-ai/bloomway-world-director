# Bloomway World Director

**Your words. Your world. Your camera.**

Build 3D worlds and direct camera moves for cinematic **previsualization** (low-poly blockout)—not a general-purpose AI video generation model. Turning previs into final footage is an optional workflow on [Bloomway](https://bloomway.ai).

[中文说明](README.zh-CN.md)

---

## Quick start

**Requirements:** Node.js ≥ 20, npm ≥ 10. No Bloomway account or API keys for the bundled example.

```bash
git clone <repository-url>   # when public
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

This clip is recorded from **this repository’s** lightweight Studio (not the full Bloomway app UI).

[Demo video](media/demo.mp4) · [Poster](media/poster.png) · [Media notes](media/README.md)

Full Director Studio on Bloomway: [bloomway.ai](https://bloomway.ai)

---

## What runs locally (summary)

| Status | Capability |
| ------ | ---------- |
| **Verified** | `plan.json` + `world-ref.json`, `validatePrevisPlan`, `generatePrevisWorld`, `samplePrevisCamera` (`npm run verify:example`) |
| **Verified** | Minimal WebGL Studio: play + timeline scrub + camera motion (`verify:studio-e2e`, `media/demo.mp4`) |
| **Experimental** | Keyword/rule world hints without LLM (not required for the example) |
| **Planned** | Extra examples, MCP Director tools, full product Director UI port |

Natural-language “describe any sentence → plan” assistants are **hosted on Bloomway only** (not in this repo).

---

## Limitations

1. Marketing lines describe product vision; the OSS example uses **checked-in JSON**.
2. Visual fidelity is **blockout** only—not Bloomway final renders.
3. Studio UI is English-only and a **subset** of the commercial product.
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

MIT — see [LICENSE](LICENSE). Copyright holder is listed there (**confirm legal entity before public release**).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Public release acceptance checklist: [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md).
