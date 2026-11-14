# Bloomway World Director

**Build a world. Block a scene. Rehearse the camera.**

An open-source 3D previs studio for exploring scenes, character blocking, and camera movement.

Free to use · MIT licensed · No sign-up required

[中文](README.zh-CN.md) · [English details](README.en.md) · [Melayu](README.ms.md) · [Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![CI](https://github.com/bloomway-ai/bloomway-world-director/actions/workflows/verify.yml/badge.svg)](https://github.com/bloomway-ai/bloomway-world-director/actions/workflows/verify.yml) [![Release](https://img.shields.io/github/v/release/bloomway-ai/bloomway-world-director)](https://github.com/bloomway-ai/bloomway-world-director/releases/tag/v0.1.0)

**[Try in browser](https://bloomway-ai.github.io/bloomway-world-director/)** · [Run locally](#run-locally) · [Watch demos](#watch-demos)

No sign-up or API key required. Desktop browser recommended.

---

## Try it

### Try in browser

**Live —** [Open the browser Studio](https://bloomway-ai.github.io/bloomway-world-director/)

- Jump in with blocking + timeline: [`?example=1&autoplay=1`](https://bloomway-ai.github.io/bloomway-world-director/?example=1&autoplay=1)
- Pick a **preset** on the home screen, or type a short line in the **text input** (e.g. `Snowy daytime Tokyo urban city`, `two rivals meet in the street`)
- Press **Play** on the timeline to rehearse camera moves and blocking

Same OSS app as this repo — not the full [Bloomway](https://bloomway.ai) product (optional account / billing there).

### Run locally

| Requirement | Value |
| ----------- | ----- |
| Node.js | **≥ 20** |
| npm | **≥ 10** |
| Bloomway account / API keys | **Not required** for bundled examples |

```bash
git clone https://github.com/bloomway-ai/bloomway-world-director.git
cd bloomway-world-director
npm install
npm run dev
```

Then open **http://localhost:5173/** (same steps as browser above). Default scene: [`examples/edo-rainy-night`](examples/edo-rainy-night/).

---

## Watch demos

Silent loops from **this repo’s OSS Studio** (~12s each). Real-time capture—not sped up.

<p align="center"><strong>City tour</strong> · <strong>Street drama</strong></p>

<table>
  <tr>
    <td width="50%">
      <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-city-tour.mp4">
        <img src="media/demo-city-tour.gif" alt="City tour: text input → snowy Tokyo → explore with WASD" width="100%">
      </a>
      <br><sub><code>Snowy daytime Tokyo urban city</code> → orbit / WASD · <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-city-tour.mp4">▶ Full MP4 (~20s)</a></sub>
    </td>
    <td width="50%">
      <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-drama.mp4">
        <img src="media/demo-drama.gif" alt="Street drama: rivals on a rainy street → timeline play" width="100%">
      </a>
      <br><sub><code>two rivals meet in the street</code> → blocking + timeline · <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-drama.mp4">▶ Full MP4 (~22s)</a></sub>
    </td>
  </tr>
</table>

| Demo | What you try | What you see |
| ---- | ------------ | ------------ |
| **City tour** | `Snowy daytime Tokyo urban city` | Presets/keywords → explore the blockout |
| **Street drama** | Rivals meet on a rainy street | [`street-drama`](examples/street-drama/) blocking → **Play** |

Also: Edo autoplay [`media/demo.mp4`](media/demo.mp4) · [`?example=1`](https://bloomway-ai.github.io/bloomway-world-director/?example=1&autoplay=1).

If this helps you plan a shot—or you want to follow what we ship—give the project a ⭐.

---

## What you can do

- Build a **street / city / themed** layout from presets and world refs
- Place **stand-in characters** and blocking paths
- Preview **camera paths** and timing on a timeline
- Tweak plans as JSON or short **local text rules** (not cloud LLM)

| In this OSS repo | Not included here |
| ---------------- | ----------------- |
| Low-poly **blockout** previs | Final footage or a general **AI video** model |
| Offline presets + keyword text | “Any sentence → full storyboard” (hosted product) |
| MIT source you can run or fork | Free cloud render credits |

*Your words. Your world. Your camera.* — Bloomway product line tagline; **here**, text maps to **rules and presets** (see below).

Commercial use under [MIT](LICENSE): no registration or revenue share — [docs/commercial-use.md](docs/commercial-use.md).

Capability details: [docs/implementation-audit.md](docs/implementation-audit.md).

---

## Example scenes

| Example | Good first pick? | Notes |
| ------- | ---------------- | ----- |
| **Edo rainy night** | **Yes** | `?example=1` · [folder](examples/edo-rainy-night/) |
| **Street drama** | **Yes** | Text input + demo above · [folder](examples/street-drama/) |
| **Modern city street** | JSON + presets | [folder](examples/modern-city-street/) |
| **Mars base** | Mars preset + JSON | [folder](examples/mars-base/) |

More detail: [docs/examples/STATUS.md](docs/examples/STATUS.md) · official clips: [docs/gallery/README.md](docs/gallery/README.md).

---

## Current limitations

1. **Look** — blockout only; not Bloomway final renders.
2. **Studio UI** — English in v0.1.
3. **Text input** — short phrases → presets/patches or bundled plans; **no** open-ended LLM in OSS.
4. **WebGL** — desktop browser recommended.

### Natural language (local only)

The Studio text field applies **keyword rules** (weather, time of day, Tokyo, Edo, drama loaders, etc.). It does **not** call Bloomway servers.

---

## From previs to finished footage

Optional product montage (~63s with audio) — vision for world → screen, **not** a substitute for trying the OSS Studio.

<p align="center">
  <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/final_v2_cold_open.mp4">
    <img src="media/promo-cold-open.gif" alt="Brand film preview" width="100%">
  </a>
  <br><sub><a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/final_v2_cold_open.mp4">▶ Watch full film (~63s)</a></sub>
</p>

*Want finished footage from your previs? Explore the optional workflow at [Bloomway](https://bloomway.ai) (separate terms; account may apply).*

---

## Community and contributing

**Share your first shot in [Discussions](https://github.com/bloomway-ai/bloomway-world-director/discussions).**

[CONTRIBUTING.md](CONTRIBUTING.md) · optional contact **info@bloomway.ai** for collaboration (not required for MIT use).

---

## Roadmap

| Item | Status |
| ---- | ------ |
| Director **MCP** in this repo | **Planned** — [docs/mcp/README.md](docs/mcp/README.md) |
| One-click tiles for all four examples | **Planned** |
| Studio UI translations | **Planned** |

---

## License and acknowledgments

Source: [MIT](LICENSE) · demo media: [CC BY 4.0](media/LICENSE) · [TRADEMARKS.md](TRADEMARKS.md) · [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md)

---

<p align="center"><sub>Docs for hosting, media, and audits: <a href="docs/deploy/studio-hosting.md">deploy</a> · <a href="docs/verification-log.md">verification</a> · <a href="docs/promo/VIDEO_URLS.md">video URLs</a></sub></p>