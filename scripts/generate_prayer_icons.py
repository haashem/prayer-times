#!/usr/bin/env python3
"""Generate 80×80 prayer-time icons for the Zepp OS shortcut card.

Outputs six PNGs into assets/gt.r/image/ and assets/gt.s/image/:
  ic_fajr_80px.png      — crescent moon + horizon (pre-dawn)
  ic_sunrise_80px.png   — sun rising over horizon
  ic_dhuhr_80px.png     — full sun at zenith
  ic_asr_80px.png       — smaller sun, lower position (afternoon)
  ic_maghrib_80px.png   — sun setting into horizon
  ic_isha_80px.png      — moon + stars (night)

Uses the app's gold palette so they blend with the card UI.
Run:  python3 scripts/generate_prayer_icons.py
"""
from __future__ import annotations

import math
from pathlib import Path
from PIL import Image, ImageDraw

# ── Palette (matches card colors) ──
GOLD = (0xD4, 0xA8, 0x43, 255)        # primary accent
GOLD_DIM = (0xA8, 0x86, 0x36, 255)    # softer gold for secondary elements
WARM = (0xA8, 0x98, 0x80, 255)        # warm sandstone (hijri text color)
WHITE = (0xFF, 0xFF, 0xFF, 255)       # bright highlights
TRANSPARENT = (0, 0, 0, 0)

SIZE = 80          # icon dimension
SCALE = 4          # render at 4× then downsample for anti-aliasing
HI = SIZE * SCALE  # high-res canvas size


def _new() -> tuple[Image.Image, ImageDraw.Draw]:
    img = Image.new("RGBA", (HI, HI), TRANSPARENT)
    return img, ImageDraw.Draw(img)


def _finish(img: Image.Image) -> Image.Image:
    return img.resize((SIZE, SIZE), resample=Image.LANCZOS)


def _horizon(draw: ImageDraw.Draw, y: float, color: tuple, width: int = 0):
    """Draw a horizontal horizon line."""
    margin = HI * 0.15
    draw.line([(margin, y), (HI - margin, y)], fill=color, width=width or max(2, HI // 40))


def _sun(draw: ImageDraw.Draw, cx: float, cy: float, r: float, color: tuple):
    """Draw a filled circle (sun)."""
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)


def _rays(draw: ImageDraw.Draw, cx: float, cy: float, inner_r: float,
          outer_r: float, count: int, color: tuple, width: int = 0):
    """Draw evenly-spaced sun rays."""
    w = width or max(2, HI // 50)
    for i in range(count):
        angle = 2 * math.pi * i / count - math.pi / 2
        x1 = cx + inner_r * math.cos(angle)
        y1 = cy + inner_r * math.sin(angle)
        x2 = cx + outer_r * math.cos(angle)
        y2 = cy + outer_r * math.sin(angle)
        draw.line([(x1, y1), (x2, y2)], fill=color, width=w)


def _star(draw: ImageDraw.Draw, cx: float, cy: float, r: float, color: tuple):
    """Draw a small 4-point star."""
    w = max(2, HI // 60)
    draw.line([(cx - r, cy), (cx + r, cy)], fill=color, width=w)
    draw.line([(cx, cy - r), (cx, cy + r)], fill=color, width=w)
    # small center dot
    dr = r * 0.3
    draw.ellipse([cx - dr, cy - dr, cx + dr, cy + dr], fill=color)


def _crescent(img: Image.Image, cx: float, cy: float, r: float, color: tuple,
              offset_frac: float = 0.35):
    """Draw a crescent moon by compositing two circles."""
    moon = Image.new("RGBA", (HI, HI), TRANSPARENT)
    md = ImageDraw.Draw(moon)
    # full circle
    md.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    # cut-out circle shifted right
    offset = r * offset_frac * 2
    cut = Image.new("RGBA", (HI, HI), TRANSPARENT)
    cd = ImageDraw.Draw(cut)
    cd.ellipse([cx - r + offset, cy - r, cx + r + offset, cy + r], fill=(0, 0, 0, 255))
    # subtract
    from PIL import ImageChops
    moon = ImageChops.subtract(moon, cut)
    img.alpha_composite(moon)


# ── Icon generators ──

def gen_fajr() -> Image.Image:
    """Fajr — crescent moon above horizon, pre-dawn glow."""
    img, draw = _new()
    cx, cy = HI / 2, HI / 2

    # horizon line (lower)
    hy = HI * 0.72
    _horizon(draw, hy, WARM, width=max(3, HI // 35))

    # subtle glow arc above horizon
    glow_r = HI * 0.38
    glow_color = (*GOLD_DIM[:3], 80)
    draw.arc(
        [cx - glow_r, hy - glow_r, cx + glow_r, hy + glow_r],
        start=200, end=340, fill=glow_color,
        width=max(4, HI // 25),
    )

    # crescent moon
    _crescent(img, cx, HI * 0.35, HI * 0.18, GOLD)

    return _finish(img)


def gen_sunrise() -> Image.Image:
    """Sunrise — half sun peaking above horizon with rays."""
    img, draw = _new()
    cx = HI / 2
    hy = HI * 0.62

    # rays first (behind sun body)
    ray_count = 8
    inner_r = HI * 0.18
    outer_r = HI * 0.32
    w = max(3, HI // 40)
    for i in range(ray_count):
        angle = math.pi * i / (ray_count - 1)  # semicircle above horizon
        x1 = cx + inner_r * math.cos(math.pi + angle)
        y1 = hy + inner_r * math.sin(math.pi + angle)
        x2 = cx + outer_r * math.cos(math.pi + angle)
        y2 = hy + outer_r * math.sin(math.pi + angle)
        draw.line([(x1, y1), (x2, y2)], fill=GOLD_DIM, width=w)

    # half sun (upper semicircle above horizon)
    sun_r = HI * 0.16
    # draw full ellipse then mask below horizon
    _sun(draw, cx, hy, sun_r, GOLD)
    # mask: cover below horizon with transparent
    mask_box = Image.new("RGBA", (HI, HI), TRANSPARENT)
    md = ImageDraw.Draw(mask_box)
    md.rectangle([0, hy + 1, HI, HI], fill=(0, 0, 0, 255))
    from PIL import ImageChops
    img = ImageChops.subtract(img, mask_box)

    # redraw horizon on top
    draw2 = ImageDraw.Draw(img)
    _horizon(draw2, hy, WARM, width=max(3, HI // 35))

    return _finish(img)


def gen_dhuhr() -> Image.Image:
    """Dhuhr — full sun at zenith with rays."""
    img, draw = _new()
    cx, cy = HI / 2, HI * 0.42

    # rays
    _rays(draw, cx, cy, HI * 0.17, HI * 0.30, 12, GOLD_DIM, width=max(3, HI // 40))

    # sun body
    _sun(draw, cx, cy, HI * 0.14, GOLD)

    # small zenith dot
    draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=WHITE)

    return _finish(img)


def gen_asr() -> Image.Image:
    """Asr — smaller sun lower in the sky, fewer rays."""
    img, draw = _new()
    cx = HI * 0.50
    cy = HI * 0.48

    # rays (fewer, shorter)
    _rays(draw, cx, cy, HI * 0.15, HI * 0.25, 8, GOLD_DIM, width=max(2, HI // 45))

    # sun body (a bit smaller than dhuhr)
    _sun(draw, cx, cy, HI * 0.12, GOLD)

    # shadow / ground line suggesting afternoon
    hy = HI * 0.78
    _horizon(draw, hy, WARM, width=max(3, HI // 35))

    return _finish(img)


def gen_maghrib() -> Image.Image:
    """Maghrib — sun setting behind horizon with warm glow."""
    img, draw = _new()
    cx = HI / 2
    hy = HI * 0.60

    # warm glow arcs
    for i, alpha in enumerate([50, 35, 20]):
        r = HI * (0.30 + i * 0.08)
        glow = (*GOLD[:3], alpha)
        draw.arc(
            [cx - r, hy - r, cx + r, hy + r],
            start=200, end=340, fill=glow,
            width=max(5, HI // 20),
        )

    # sun peeking (only top sliver)
    sun_r = HI * 0.14
    _sun(draw, cx, hy, sun_r, GOLD)

    # mask below horizon
    mask_box = Image.new("RGBA", (HI, HI), TRANSPARENT)
    md = ImageDraw.Draw(mask_box)
    # cover more of the sun to show only top sliver
    md.rectangle([0, hy - sun_r * 0.3 + 1, HI, HI], fill=(0, 0, 0, 255))
    from PIL import ImageChops
    img = ImageChops.subtract(img, mask_box)

    draw2 = ImageDraw.Draw(img)
    _horizon(draw2, hy - sun_r * 0.3, WARM, width=max(3, HI // 35))

    return _finish(img)


def gen_isha() -> Image.Image:
    """Isha — crescent moon with stars (night)."""
    img, draw = _new()
    cx, cy = HI / 2, HI / 2

    # crescent moon (centered, slightly larger)
    _crescent(img, cx - HI * 0.05, cy - HI * 0.05, HI * 0.22, GOLD)

    draw = ImageDraw.Draw(img)  # refresh draw after composite

    # stars
    _star(draw, HI * 0.75, HI * 0.22, HI * 0.05, GOLD_DIM)
    _star(draw, HI * 0.82, HI * 0.45, HI * 0.035, WARM)
    _star(draw, HI * 0.60, HI * 0.78, HI * 0.04, GOLD_DIM)

    return _finish(img)


# ── Main ──

ICONS = {
    "ic_fajr_80px.png": gen_fajr,
    "ic_sunrise_80px.png": gen_sunrise,
    "ic_dhuhr_80px.png": gen_dhuhr,
    "ic_asr_80px.png": gen_asr,
    "ic_maghrib_80px.png": gen_maghrib,
    "ic_isha_80px.png": gen_isha,
}


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    out_dirs = [
        root / "assets" / "gt.r" / "image",
        root / "assets" / "gt.s" / "image",
    ]

    for d in out_dirs:
        d.mkdir(parents=True, exist_ok=True)

    for name, generator in ICONS.items():
        icon = generator()
        for d in out_dirs:
            dest = d / name
            icon.save(dest, "PNG")
            print(f"  ✓ {dest.relative_to(root)}")

    print(f"\nDone — {len(ICONS)} icons × {len(out_dirs)} targets.")


if __name__ == "__main__":
    main()
