#!/usr/bin/env python3
"""Generate app icon (248x248) for Zepp OS.

Outputs to assets/gt.r/icon.png and assets/gt.s/icon.png.
"""
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageChops

# Colors (gold palette)
PRIMARY = (0xD4, 0xA8, 0x43, 255)
TERTIARY = (0xE8, 0xDC, 0xC8, 255)
BG = (0, 0, 0, 255)

SIZE = 248


def draw_icon(size: int) -> Image.Image:
    # Gradient background (masked to circle)
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    top = (0x2A, 0x2A, 0x3E, 255)
    bottom = (0x3A, 0x3A, 0x52, 255)
    for y in range(size):
        t = y / (size - 1)
        r = int(top[0] * (1 - t) + bottom[0] * t)
        g = int(top[1] * (1 - t) + bottom[1] * t)
        b = int(top[2] * (1 - t) + bottom[2] * t)
        bg.putpixel((0, y), (r, g, b, 255))
    bg = bg.resize((size, size))
    # Expand gradient line to full image
    for x in range(1, size):
        bg.paste(bg.crop((0, 0, 1, size)), (x, 0))

    # Apply circular mask so icon is round
    mask = Image.new("L", (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.ellipse([0, 0, size - 1, size - 1], fill=255)
    bg.putalpha(mask)

    img = bg
    draw = ImageDraw.Draw(img)

    cx = cy = size / 2

    # Crescent moon (primary) — large, touching edge
    crescent = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(crescent)
    r = size * 0.34
    cdraw.ellipse([
        cx - r, cy - r,
        cx + r, cy + r,
    ], fill=PRIMARY)
    # subtract circle to form crescent
    offset = size * 0.10
    cut = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cut_draw = ImageDraw.Draw(cut)
    cut_draw.ellipse([
        cx - r + offset, cy - r,
        cx + r + offset, cy + r,
    ], fill=BG)
    crescent = ImageChops.subtract(crescent, cut)
    img.alpha_composite(crescent)

    # Clock hands — larger to reach toward edge
    hand_len = size * 0.22
    hand_w = max(5, size // 55)
    # minute hand
    draw.line([(cx, cy), (cx, cy - hand_len)], fill=TERTIARY, width=hand_w)
    # hour hand
    draw.line([(cx, cy), (cx + hand_len * 0.55, cy + hand_len * 0.2)], fill=TERTIARY, width=hand_w)

    # Center dot
    dot_r = max(3, size // 50)
    draw.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=TERTIARY)

    return img


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    out_r = root / 'assets/gt.r/icon.png'
    out_s = root / 'assets/gt.s/icon.png'
    out_r.parent.mkdir(parents=True, exist_ok=True)
    out_s.parent.mkdir(parents=True, exist_ok=True)

    icon = draw_icon(SIZE)
    icon.save(out_r)
    icon.save(out_s)
    print(f"Wrote: {out_r}")
    print(f"Wrote: {out_s}")


if __name__ == '__main__':
    main()
