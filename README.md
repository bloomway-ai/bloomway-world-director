# Bloomway World Director

**Your words. Your world. Your camera.**

Build a 3D world from a sentence. Describe the action. Direct the camera.

An open-source toolkit for **cinematic previsualization** by Bloomway AI—not a general-purpose AI video generation model. It focuses on 3D world layout, character blocking, and camera previs; turning previs into final footage is an optional workflow on [Bloomway](https://bloomway.ai).

[中文说明](README.zh-CN.md)

---

## Run locally

Local previs works **without** a Bloomway account or hosted API. See [docs/implementation-audit.md](docs/implementation-audit.md) (when available) for what runs offline vs on the platform.

```bash
# Commands will be verified when apps/studio is wired in this repo.
npm install
npm run dev --workspace=@bloomway/studio
```

---

## See it in action

Preview media lives under `media/` once examples are recorded. Demos use **real** low-poly blockout (simple buildings, capsule figures, camera paths)—not AI-upscaled marketing stills.

---

### Commercial use

Commercial use is welcome under the MIT License. No registration, notification, or separate permission is required.

Building something with Bloomway World Director? We’d love to hear about it. Contact **info@bloomway.ai** to share your project, discuss collaboration, or request deployment support and custom development.

With your permission, we may feature your project in our community showcase.

Bloomway AI welcomes more developers and filmmaking enthusiasts to build together—reach out at the same email if you want to co-create integrations, shot libraries, or teaching materials.

The MIT License applies to code explicitly covered by it. Third-party components and separately licensed assets remain subject to their respective terms. Access to Bloomway hosted services is governed by separate service terms. Details: [docs/commercial-use.md](docs/commercial-use.md).

### Attribution

Please retain the copyright and license notices required by the MIT License.

If you find this project useful, we’d appreciate a link back to the original repository or a mention of Bloomway AI. This additional acknowledgment is voluntary and is not a condition of use.

### Branding

You may accurately describe your use of this project. Do not imply that your product, deployment, training program, or service is operated, endorsed, or certified by Bloomway AI without authorization. See [TRADEMARKS.md](TRADEMARKS.md).

---

## What runs locally

| Local (MIT code) | Hosted / optional |
| ---------------- | ----------------- |
| World & plan JSON, deterministic low-poly worlds | Full natural-language plan/world assistants (LLM) |
| 3D blockout previs playback | Sparks billing, team projects |
| Example scenes | MCP Director tools (planned) |

---

## Optional Bloomway integration

Want to turn your previs into finished footage? Explore the connected workflow at [https://bloomway.ai](https://bloomway.ai). MCP is **optional**, not required to run examples.

---

## License

This repository is distributed under the **MIT License** (see `LICENSE`). Copyright holder is listed there; confirm legal entity before public release if needed.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). We will keep updating this project—watch releases and [CHANGELOG.md](CHANGELOG.md).

If this helps you explore a shot—or you want to follow what we build next—give the project a ⭐.
