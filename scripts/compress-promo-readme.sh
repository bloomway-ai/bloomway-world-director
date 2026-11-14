#!/usr/bin/env bash
# README inline player (~≤10MB). Source: Release final_v2_cold_open.mp4 (full 1080p stays on Release).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-}"
OUT="$ROOT/media/promo-full-demo-readme.mp4"
if [[ -z "$SRC" ]]; then
  SRC="$(mktemp -t final_v2_cold_open.XXXXXX.mp4)"
  curl -fsSL -o "$SRC" \
    "https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/final_v2_cold_open.mp4"
  trap 'rm -f "$SRC"' EXIT
fi
ffmpeg -y -i "$SRC" \
  -vf "scale=1280:-2:flags=lanczos" \
  -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -b:v 1050k -maxrate 1150k -bufsize 2300k \
  -c:a aac -b:a 96k -ac 2 -ar 44100 \
  -movflags +faststart \
  "$OUT"
ls -lh "$OUT"