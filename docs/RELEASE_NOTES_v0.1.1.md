# v0.1.1

**Bloomway World Director** — patch release for OSS 3D Studio interaction.

## Studio

- **Place actors** (toolbar H): click ground; auto-creates empty previs plan when needed.
- **Place blockout objects** (toolbar B): 2×2 m building override; **WASD** moves when selected.
- **Place previs camera** (toolbar C): click ground.
- **Rotate building** (toolbar R): click selected building again for 90°.
- **Pilot mode**: with a character or placed object selected, **WASD** (view-relative, Shift faster) drives selection; free camera **WASD + Q/E** when nothing is piloted.
- Shared keyboard handling in `ossViewportPilot.ts` (layout-independent WASD).
- UI hints (EN; ZH strings in `ds3dI18n` for future locale toggle).

## Verify

```bash
npm ci
npm run verify:example
npm run build
```

## Media

Demo MP4s remain on [Release v0.1.0](https://github.com/bloomway-ai/bloomway-world-director/releases/tag/v0.1.0) (unchanged assets).