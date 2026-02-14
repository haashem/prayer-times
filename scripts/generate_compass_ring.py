#!/usr/bin/env python3
"""Generate the compass ring assets (current style).

This outputs ring backgrounds with ticks + labels for both round and square.
Modify constants below to tweak the design.
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# Palette
PRIMARY = (0xD4, 0xA8, 0x43, 255)      # cardinal ticks + N
RING = (0xC7, 0xA2, 0x5A, 255)         # rings + diagonals
RING_FADE = (0xC7, 0xA2, 0x5A, 140)    # inner ring lower opacity
TERTIARY = (0xE8, 0xDC, 0xC8, 255)     # E/S/W

LABEL_COLORS = {
    "N": PRIMARY,
    "E": TERTIARY,
    "S": TERTIARY,
    "W": TERTIARY,
    "NE": (0xA8, 0x98, 0x80, 255),
    "SE": (0xA8, 0x98, 0x80, 255),
    "SW": (0xA8, 0x98, 0x80, 255),
    "NW": (0xA8, 0x98, 0x80, 255),
}

FONT_CARDINAL = "/Library/Fonts/SF-Compact-Display-Regular.otf"
FONT_DIAGONAL = "/Library/Fonts/SF-Compact-Display-Regular.otf"

CONFIGS = [
    {
        "path": "assets/gt.r/image/compass_ring.png",
        "size": 460,
        "font_cardinal": 46,
        "font_diag": 30,
        "outer_width": 3,
        "inner_width": 1,
        "label_margin": 58,
        "tick_margin": 8,
        "tick_len_major": 21,  # increased a bit
        "tick_len_mid": 15,
        "tick_len_minor": 9,
        "tick_len_micro": 4,
    },
    {
        "path": "assets/gt.s/image/compass_ring.png",
        "size": 370,
        "font_cardinal": 38,
        "font_diag": 24,
        "outer_width": 3,
        "inner_width": 1,
        "label_margin": 50,
        "tick_margin": 6,
        "tick_len_major": 17,  # increased a bit
        "tick_len_mid": 11,
        "tick_len_minor": 7,
        "tick_len_micro": 3,
    },
]

LABELS = [
    ("N", 0), ("NE", 45), ("E", 90), ("SE", 135),
    ("S", 180), ("SW", 225), ("W", 270), ("NW", 315),
]


def render(cfg: dict) -> Image.Image:
    size = cfg["size"]
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx = cy = size / 2

    # Outer ring
    inset = cfg["outer_width"] // 2 + 1
    outer_bbox = [inset, inset, size - inset - 1, size - inset - 1]
    draw.ellipse(outer_bbox, outline=RING, width=cfg["outer_width"])

    # Ticks
    r_outer = size / 2 - cfg["tick_margin"]
    for deg in range(0, 360, 5):
        if deg % 90 == 0:
            length = cfg["tick_len_major"]
            width = 3  # cardinal ticks thicker
            color = PRIMARY
        elif deg % 45 == 0:
            length = cfg["tick_len_mid"]
            width = 2
            color = RING
        elif deg % 10 == 0:
            length = cfg["tick_len_minor"]
            width = 1
            color = RING
        else:
            length = cfg["tick_len_micro"]
            width = 1
            color = RING
        r0 = r_outer - length
        rad = math.radians(deg)
        x1 = cx + r0 * math.sin(rad)
        y1 = cy - r0 * math.cos(rad)
        x2 = cx + r_outer * math.sin(rad)
        y2 = cy - r_outer * math.cos(rad)
        draw.line([(x1, y1), (x2, y2)], fill=color, width=width)

    # Inner ring positioned to tip of cardinal ticks
    inner_radius = r_outer - cfg["tick_len_major"]
    inner_inset = (size / 2) - inner_radius
    inner_bbox = [inner_inset, inner_inset, size - inner_inset - 1, size - inner_inset - 1]
    draw.ellipse(inner_bbox, outline=RING_FADE, width=cfg["inner_width"])

    # Labels
    font_card = ImageFont.truetype(FONT_CARDINAL, cfg["font_cardinal"])
    font_diag = ImageFont.truetype(FONT_DIAGONAL, cfg["font_diag"])
    radius = size / 2 - cfg["label_margin"]
    for text, deg in LABELS:
        rad = math.radians(deg)
        x = cx + radius * math.sin(rad)
        y = cy - radius * math.cos(rad)
        font = font_card if text in ("N", "E", "S", "W") else font_diag
        draw.text((x, y), text, font=font, fill=LABEL_COLORS[text], anchor="mm")

    return img


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    for cfg in CONFIGS:
        out_path = root / cfg["path"]
        out_path.parent.mkdir(parents=True, exist_ok=True)
        img = render(cfg)
        img.save(out_path)
        print(f"Wrote: {out_path}")


if __name__ == "__main__":
    main()
