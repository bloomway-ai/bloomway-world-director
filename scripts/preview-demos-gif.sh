#!/usr/bin/env bash
# README looping previews from media/demo-*.mp4 (first 12s, 8fps, 520px wide)
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root/media"
filter='fps=8,scale=520:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer'
for name in demo-city-tour demo-drama; do
  ffmpeg -y -i "${name}.mp4" -t 12 -vf "$filter" "${name}.gif"
  echo "Wrote ${name}.gif"
done