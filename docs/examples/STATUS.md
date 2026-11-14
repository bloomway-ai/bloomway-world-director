# Example scenes — verification status

**Checked:** 2026-11-14 · **Release:** v0.1.0 · **Repo:** public `bloomway-ai/bloomway-world-director`

| Example | `verify:examples` | JSON in `apps/studio/public/` | Studio UI load | Previs playback |
| -------- | ----------------- | ----------------------------- | -------------- | ---------------- |
| [`edo-rainy-night`](../examples/edo-rainy-night/) | **Yes** | **Yes** | **Yes** — default with `?example=1`; home preset **Edo**; composer loads plan URL | **Yes** (`verify:studio-e2e`) |
| [`street-drama`](../examples/street-drama/) | **Yes** | **Yes** | **Yes** — composer phrases (e.g. “two rivals meet in the street”) or manual `plan.json` | **Yes** — recorded in `demo-drama.mp4` |
| [`modern-city-street`](../examples/modern-city-street/) | **Yes** | **Yes** | **Partial** — world via presets / keywords; **no** one-click “load this example” tile yet | **Yes** if you paste `plan.json` or add keys in timeline |
| [`mars-base`](../examples/mars-base/) | **Yes** | **Yes** | **Partial** — **Mars base** preset + bundled JSON; **no** dedicated example tile | **Yes** with loaded plan |

**Not the same thing:** “folder exists” ≠ “featured Studio tile.” All four pass core validation; two are easiest for first-time users (Edo, street drama).

Re-check: `npm run verify:examples` · `npm run verify:studio-e2e` · [implementation-audit.md](../implementation-audit.md).