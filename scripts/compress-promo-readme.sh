#!/usr/bin/env bash
# README inline player (~≤10MB). Source: Release final_v2_cold_open.mp4 (full 1080p stays on Release).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-}"
OUT="$ROOT/media/promo-full-demo-readme.mp4"
HERO="$ROOT/media/promo-hero-direct-rainy-streets.jpg"
TMP="$(mktemp "${TMPDIR:-/tmp}/promo-readme-stage.XXXXXX.mp4")"
DOWNLOADED_SRC=""
if [[ -z "$SRC" ]]; then
  SRC="$(mktemp "${TMPDIR:-/tmp}/final_v2_cold_open.XXXXXX.mp4")"
  DOWNLOADED_SRC="$SRC"
  curl -fsSL -o "$SRC" \
    "https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/final_v2_cold_open.mp4"
fi
cleanup() {
  rm -f "$TMP"
  [[ -n "$DOWNLOADED_SRC" ]] && rm -f "$DOWNLOADED_SRC"
}
trap cleanup EXIT
ffmpeg -y -i "$SRC" \
  -vf "scale=1280:-2:flags=lanczos" \
  -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -b:v 1050k -maxrate 1150k -bufsize 2300k \
  -c:a aac -b:a 96k -ac 2 -ar 44100 \
  -movflags +faststart \
  "$TMP"
# GitHub user-attachments has no poster attribute; use hero JPG as ~2 frames at t=0 for the player thumbnail.
if [[ -f "$HERO" ]]; then
  ffmpeg -y \
    -loop 1 -framerate 30 -t 0.067 -i "$HERO" \
    -i "$TMP" \
    -filter_complex "[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p[v0];[1:v]fps=30,format=yuv420p,setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0[outv]" \
    -map "[outv]" -map 1:a? \
    -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
    -b:v 1050k -maxrate 1150k -bufsize 2300k \
    -c:a aac -b:a 96k -ac 2 -ar 44100 \
    -movflags +faststart \
    "$OUT"
else
  mv "$TMP" "$OUT"
  TMP=""
fi
ls -lh "$OUT"