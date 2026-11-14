# OSS Studio — browser hosting (GitHub Pages & Vercel)

The Studio app is a **static** Vite build (`apps/studio/dist`): WebGL blockout, bundled example JSON under `public/examples/`, **no** API keys.

| Host | URL (default) | Build |
| ---- | ------------- | ----- |
| **GitHub Pages** (recommended) | https://bloomway-ai.github.io/bloomway-world-director/ | `npm run build:pages` (CI on `main`) |
| **Vercel** (optional) | Project root after import | `npm run build` (no repo subpath) |

## One-time: enable GitHub Pages

In the repository on GitHub:

1. **Settings → Pages**
2. **Build and deployment → Source:** **GitHub Actions**
3. Push to `main` (or run workflow **Deploy Studio (GitHub Pages)** manually)

The workflow [`.github/workflows/deploy-studio-pages.yml`](../../.github/workflows/deploy-studio-pages.yml) uploads `apps/studio/dist`.

## Vercel

1. Import `bloomway-ai/bloomway-world-director` in Vercel (root directory = repo root).
2. Use the committed [`vercel.json`](../../vercel.json) (build output `apps/studio/dist`).
3. Do **not** set `VITE_BASE_PATH` on Vercel.

## Local parity

```bash
npm run build:pages
npx vite preview --config apps/studio/vite.config.ts --outDir apps/studio/dist
# open http://localhost:4173/bloomway-world-director/  (preview respects base)
```

## What this is / is not

- **Is:** the same open-source Studio as `npm run dev` — low-poly previs, checked-in plans.
- **Is not:** full Bloomway product (NL director, LLM, final video) → [bloomway.ai](https://bloomway.ai).

See [implementation-audit.md](../implementation-audit.md).