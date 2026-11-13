# Third-party licenses and assets

This file will list **direct dependencies** and **bundled assets** once the monorepo `package-lock.json` / `pnpm-lock.yaml` is generated. Until then, treat it as a living checklist.

## Expected runtime dependencies (to verify on install)

| Component | License (typical) | Notes |
| --------- | ----------------- | ----- |
| [three](https://github.com/mrdoob/three.js) | MIT | 3D rendering in `apps/studio` |
| React / Vite toolchain | MIT | Dev and UI shell |

Run `npm license-checker` or equivalent after `npm install` and update this file before public release.

## Example scenes and media

Each folder under `examples/` must include a `README.md` stating:

- Who authored the scene configuration
- Whether preview images or videos are CC0, self-created, or subject to other terms

Do not commit third-party fonts, trademarked logos, or stock media without a clear redistribution right.

## Bloomway platform assets

Assets from the commercial Bloomway Studio product are **not** included in this repository unless explicitly listed here with permission.
