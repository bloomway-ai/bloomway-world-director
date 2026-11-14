#!/usr/bin/env bash
# README hero: 1280px JPEG (~180KB) from source key art. Pass source JPG path as $1.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-}"
if [[ -z "$SRC" || ! -f "$SRC" ]]; then
  echo "Usage: $0 /path/to/key-art.jpg" >&2
  exit 1
fi
OUT="$ROOT/media/promo-hero-direct-rainy-streets.jpg"
ffmpeg -y -i "$SRC" \
  -vf "scale=1280:-2:flags=lanczos" \
  -q:v 3 \
  -pix_fmt yuvj420p \
  -map_metadata -1 \
  -frames:v 1 -update 1 \
  "$OUT"
cp "$OUT" "$ROOT/apps/studio/public/promo-hero-direct-rainy-streets.jpg"
ls -lh "$OUT"