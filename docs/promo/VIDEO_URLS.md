# README inline video URLs

GitHub README **inline players** must use **Release asset** or **user-attachments** URLs—not paths under `media/` in git.

| Demo | Release asset URL (v0.1.0) |
| ---- | -------------------------- |
| City tour | `https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-city-tour.mp4` |
| Street drama | `https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-drama.mp4` |

After re-recording demos, refresh assets:

```bash
gh release upload v0.1.0 media/demo-city-tour.mp4 media/demo-drama.mp4 --clobber
```

Then bump version in README `<video src="...">` if you tag a new release.