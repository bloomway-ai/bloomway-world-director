#!/usr/bin/env python3
"""Build README try-in-browser cover: world (1/3) + camera/timeline (2/3) + tagline."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "media"
SHOT = MEDIA / "screenshots"

W, H = 1200, 504
LEFT_W = W // 3
RIGHT_W = W - LEFT_W
TAGLINE = "Build the scene. Rehearse the shot."


def font(size: int):
    for path in (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
    ):
        p = Path(path)
        if p.exists():
            try:
                return ImageFont.truetype(str(p), size)
            except OSError:
                continue
    return ImageFont.load_default()


def main() -> None:
    world = Image.open(SHOT / "world.png").convert("RGB")
    cam = Image.open(SHOT / "camera-timeline.png").convert("RGB")

    # Left: wide blockout (crop center, less UI chrome)
    wc = int(world.width * 0.62)
    wh = int(world.height * 0.88)
    wx = (world.width - wc) // 2
    wy = int(world.height * 0.06)
    world_panel = world.crop((wx, wy, wx + wc, wy + wh)).resize((LEFT_W, H), Image.Resampling.LANCZOS)

    # Right: viewport + timeline (crop below top bar, zoom slightly)
    cy0 = 72
    cam_crop = cam.crop((0, cy0, cam.width, cam.height))
    cam_panel = cam_crop.resize((RIGHT_W, H), Image.Resampling.LANCZOS)

    out = Image.new("RGB", (W, H), (14, 16, 20))
    out.paste(world_panel, (0, 0))
    out.paste(cam_panel, (LEFT_W, 0))

    # subtle divider
    draw = ImageDraw.Draw(out)
    draw.line([(LEFT_W, 0), (LEFT_W, H)], fill=(255, 255, 255), width=2)

    bar_h = 52
    overlay = Image.new("RGBA", (W, bar_h), (8, 10, 14, 210))
    out.paste(overlay, (0, H - bar_h), overlay)
    draw = ImageDraw.Draw(out)
    f = font(26)
    draw.text((20, H - bar_h + 12), TAGLINE, fill=(240, 245, 250), font=f)

    out_path = MEDIA / "try-in-browser-cover.png"
    out.save(out_path, optimize=True)
    print("Wrote", out_path, out_path.stat().st_size)


if __name__ == "__main__":
    main()