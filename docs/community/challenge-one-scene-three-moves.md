# Discussion draft — “One scene. Three camera moves. What would you shoot?”

**Status:** Draft (post manually to [Discussions](https://github.com/bloomway-ai/bloomway-world-director/discussions) when ready).

---

## Title

**One scene. Three camera moves. What would you shoot?**

## Body

We’re using the bundled **Edo rainy night** scene as a shared starting point—the same low-poly blockout you get from this repo (not a final render).

### The scene

- Files: [`examples/edo-rainy-night/plan.json`](../../examples/edo-rainy-night/plan.json) + [`world-ref.json`](../../examples/edo-rainy-night/world-ref.json)
- Local: `npm run dev` → open http://localhost:5173/?example=1&autoplay=1
- What you’ll see: rainy-night street blockout, capsule blocking actors, camera path on the timeline

### Three camera moves you can try (all supported in OSS v0.1)

1. **Static master** — one wide keyframe; actors play through blocking.
2. **Push-in** — add a second camera key later on the timeline; scrub to feel the move.
3. **Orbit / pan** — use **Select** + timeline keys (or WASD in explore mode before you commit keys).

These are **blocking rehearsal** moves—low-poly, no AI camera.

### How to submit

Reply with:

- **Intent** — what story beat are you selling in one sentence?
- **Move list** — which of the three (or your variant) and why
- **Evidence** — short screen recording **or** export of your `plan.json` diff (gist link is fine)

Official reference clips (CC BY): [`media/demo-drama.mp4`](../../media/demo-drama.mp4) · [`media/demo.mp4`](../../media/demo.mp4).

Gallery rules: [docs/gallery/README.md](../gallery/README.md).

---

*Tag suggestions when posting: `show-and-tell`, `help-wanted`, `previs`*