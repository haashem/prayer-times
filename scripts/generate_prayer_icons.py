#!/usr/bin/env python3
"""Generate 80×80 prayer-time icons for the Zepp OS shortcut card.

Outputs six PNGs into assets/gt.r/image/ and assets/gt.s/image/:
  ic_fajr_80px.png      — crescent moon + horizon (pre-dawn)
  ic_sunrise_80px.png   — sun rising over horizon
  ic_dhuhr_80px.png     — full sun at zenith
  ic_asr_80px.png       — smaller sun, lower position (afternoon)
  ic_maghrib_80px.png   — sun setting into horizon
  ic_isha_80px.png      — moon + stars (night)

Enhanced with radial/linear gradients, glow effects, and richer detail.
Uses the app's gold palette so they blend with the card UI.
Run:  python3 scripts/generate_prayer_icons.py
"""
from __future__ import annotations

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops

# ── Palette (matches card colors) ──
GOLD = (0xD4, 0xA8, 0x43, 255)        # primary accent
GOLD_BRIGHT = (0xF0, 0xC8, 0x50, 255) # bright gold highlight
GOLD_DIM = (0xA8, 0x86, 0x36, 255)    # softer gold for secondary elements
WARM = (0xA8, 0x98, 0x80, 255)        # warm sandstone
AMBER = (0xE8, 0x8A, 0x20, 255)       # deep amber for sunset/warmth
DEEP_ORANGE = (0xC0, 0x60, 0x10, 255) # sunset horizon tones
PALE_GOLD = (0xF5, 0xE0, 0xA0, 255)  # very light gold for inner glow
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


# ── Gradient helpers ──

def _radial_gradient(size: int, cx: float, cy: float, radius: float,
                     inner_color: tuple, outer_color: tuple) -> Image.Image:
    """Create a radial gradient image using pure PIL."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pixels = img.load()
    for y in range(size):
        dy = y - cy
        for x in range(size):
            dx = x - cx
            dist = math.sqrt(dx * dx + dy * dy)
            t = min(dist / radius, 1.0)
            r = int(inner_color[0] * (1 - t) + outer_color[0] * t)
            g = int(inner_color[1] * (1 - t) + outer_color[1] * t)
            b = int(inner_color[2] * (1 - t) + outer_color[2] * t)
            a = int(inner_color[3] * (1 - t) + outer_color[3] * t)
            pixels[x, y] = (r, g, b, a)
    return img


def _radial_glow(size: int, cx: float, cy: float, radius: float,
                 color: tuple, peak_alpha: int = 120) -> Image.Image:
    """Create a soft radial glow (color fading to transparent)."""
    return _radial_gradient(size, cx, cy, radius,
                            (*color[:3], peak_alpha), (*color[:3], 0))


def _gradient_sun(img: Image.Image, cx: float, cy: float, r: float,
                  core_color: tuple = PALE_GOLD,
                  mid_color: tuple = GOLD_BRIGHT,
                  edge_color: tuple = GOLD):
    """Draw a sun with radial gradient: bright core → gold edge."""
    # Core gradient disc
    grad = _radial_gradient(HI, cx, cy, r,
                            core_color, edge_color)
    # Mask to circle
    mask = Image.new("L", (HI, HI), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    grad.putalpha(mask)
    img.alpha_composite(grad)

    # Inner bright hotspot
    hotspot_r = r * 0.35
    hotspot = _radial_glow(HI, cx, cy, hotspot_r, WHITE, peak_alpha=180)
    mask2 = Image.new("L", (HI, HI), 0)
    md2 = ImageDraw.Draw(mask2)
    md2.ellipse([cx - hotspot_r, cy - hotspot_r, cx + hotspot_r, cy + hotspot_r], fill=255)
    hotspot.putalpha(ImageChops.multiply(hotspot.getchannel("A"), mask2))
    img.alpha_composite(hotspot)


def _gradient_rays(img: Image.Image, cx: float, cy: float, inner_r: float,
                   outer_r: float, count: int, color: tuple,
                   width: int = 0, angle_offset: float = -math.pi / 2,
                   full_circle: bool = True, arc_range: tuple = None):
    """Draw rays that fade from opaque at inner_r to transparent at outer_r."""
    w = width or max(3, HI // 40)
    steps = 12  # segments per ray for gradient fade

    if arc_range:
        angles = [arc_range[0] + (arc_range[1] - arc_range[0]) * i / (count - 1)
                  for i in range(count)]
    else:
        angles = [2 * math.pi * i / count + angle_offset for i in range(count)]

    overlay = Image.new("RGBA", (HI, HI), TRANSPARENT)
    od = ImageDraw.Draw(overlay)

    for angle in angles:
        for s in range(steps):
            t0 = s / steps
            t1 = (s + 1) / steps
            r0 = inner_r + (outer_r - inner_r) * t0
            r1 = inner_r + (outer_r - inner_r) * t1
            alpha = int(color[3] * (1 - t0) * 0.9)
            seg_color = (*color[:3], max(0, alpha))
            x0 = cx + r0 * math.cos(angle)
            y0 = cy + r0 * math.sin(angle)
            x1 = cx + r1 * math.cos(angle)
            y1 = cy + r1 * math.sin(angle)
            od.line([(x0, y0), (x1, y1)], fill=seg_color, width=w)

    img.alpha_composite(overlay)


def _horizon_glow(img: Image.Image, hy: float, color: tuple,
                  glow_height: float = None, peak_alpha: int = 60):
    """Draw a soft horizontal glow band along the horizon."""
    gh = glow_height or HI * 0.15
    glow = Image.new("RGBA", (HI, HI), (0, 0, 0, 0))
    pixels = glow.load()
    margin = int(HI * 0.1)
    for y in range(HI):
        dist = abs(y - hy)
        t = min(dist / gh, 1.0)
        a = int(peak_alpha * (1 - t))
        if a <= 0:
            continue
        for x in range(margin, HI - margin):
            pixels[x, y] = (color[0], color[1], color[2], a)
    img.alpha_composite(glow)


def _horizon(img: Image.Image, draw: ImageDraw.Draw, y: float, color: tuple,
             width: int = 0, glow: bool = True, glow_color: tuple = None):
    """Draw horizon line with optional glow."""
    w = width or max(2, HI // 40)
    margin = HI * 0.15
    if glow:
        gc = glow_color or color
        _horizon_glow(img, y, gc, glow_height=HI * 0.08, peak_alpha=40)
    draw.line([(margin, y), (HI - margin, y)], fill=color, width=w)


def _star_glow(img: Image.Image, cx: float, cy: float, r: float,
               color: tuple, glow_r: float = None):
    """Draw a star with a soft glow halo."""
    gr = glow_r or r * 3
    glow = _radial_glow(HI, cx, cy, gr, color, peak_alpha=60)
    img.alpha_composite(glow)

    draw = ImageDraw.Draw(img)
    # 4-point star with tapered lines
    w = max(2, HI // 60)
    # main cross
    draw.line([(cx - r, cy), (cx + r, cy)], fill=color, width=w)
    draw.line([(cx, cy - r), (cx, cy + r)], fill=color, width=w)
    # diagonal smaller cross for 8-point effect
    d = r * 0.55
    dw = max(1, w - 1)
    draw.line([(cx - d, cy - d), (cx + d, cy + d)], fill=(*color[:3], color[3] // 2), width=dw)
    draw.line([(cx - d, cy + d), (cx + d, cy - d)], fill=(*color[:3], color[3] // 2), width=dw)
    # bright center dot
    dr = r * 0.35
    draw.ellipse([cx - dr, cy - dr, cx + dr, cy + dr], fill=WHITE)


def _gradient_crescent(img: Image.Image, cx: float, cy: float, r: float,
                       outer_color: tuple = GOLD_BRIGHT, inner_color: tuple = GOLD,
                       offset_frac: float = 0.35):
    """Draw a crescent moon with gradient fill and rim highlight."""
    # Build crescent mask
    crescent_mask = Image.new("L", (HI, HI), 0)
    md = ImageDraw.Draw(crescent_mask)
    md.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    offset = r * offset_frac * 2
    md.ellipse([cx - r + offset, cy - r, cx + r + offset, cy + r], fill=0)

    # Gradient fill (light edge on the left, darker inward)
    grad = _radial_gradient(HI, cx - r * 0.3, cy, r * 1.2,
                            outer_color, inner_color)
    grad.putalpha(crescent_mask)
    img.alpha_composite(grad)

    # Rim highlight along outer edge
    rim = Image.new("RGBA", (HI, HI), TRANSPARENT)
    rd = ImageDraw.Draw(rim)
    rim_w = max(3, int(r * 0.12))
    rd.arc([cx - r, cy - r, cx + r, cy + r], start=0, end=360,
           fill=(*PALE_GOLD[:3], 130), width=rim_w)
    # Mask rim to crescent shape
    rim.putalpha(ImageChops.multiply(rim.getchannel("A"), crescent_mask))
    img.alpha_composite(rim)

    # Subtle inner glow
    inner_glow = _radial_glow(HI, cx - r * 0.2, cy, r * 0.6, PALE_GOLD, peak_alpha=50)
    inner_glow.putalpha(ImageChops.multiply(inner_glow.getchannel("A"), crescent_mask))
    img.alpha_composite(inner_glow)


# ── Icon generators ──

def gen_fajr() -> Image.Image:
    """Fajr — crescent moon above horizon, pre-dawn glow."""
    img, draw = _new()
    cx, cy = HI / 2, HI / 2
    hy = HI * 0.72

    # Deep pre-dawn sky glow — soft radial from horizon center
    sky_glow = _radial_glow(HI, cx, hy, HI * 0.55, AMBER, peak_alpha=35)
    img.alpha_composite(sky_glow)

    # Layered glow arcs above horizon
    for i, (alpha, thickness) in enumerate([(55, HI // 18), (40, HI // 22), (25, HI // 28)]):
        glow_r = HI * (0.32 + i * 0.09)
        glow_color = (*GOLD[:3], alpha)
        draw.arc(
            [cx - glow_r, hy - glow_r, cx + glow_r, hy + glow_r],
            start=195, end=345, fill=glow_color, width=thickness,
        )

    # Horizon with glow
    _horizon(img, draw, hy, WARM, width=max(3, HI // 35), glow_color=GOLD_DIM)

    # Gradient crescent moon
    _gradient_crescent(img, cx, HI * 0.33, HI * 0.18)

    # Tiny star accents
    _star_glow(img, HI * 0.78, HI * 0.18, HI * 0.025, GOLD_DIM)
    _star_glow(img, HI * 0.22, HI * 0.25, HI * 0.02, WARM)

    return _finish(img)


def gen_sunrise() -> Image.Image:
    """Sunrise — half sun peaking above horizon with gradient rays."""
    img, draw = _new()
    cx = HI / 2
    hy = HI * 0.62

    # Warm sky glow behind everything
    sky_glow = _radial_glow(HI, cx, hy, HI * 0.50, GOLD, peak_alpha=40)
    img.alpha_composite(sky_glow)

    # Gradient rays (semicircle above horizon)
    _gradient_rays(img, cx, hy, HI * 0.20, HI * 0.38, 9, (*GOLD_DIM[:3], 220),
                   width=max(3, HI // 35), full_circle=False,
                   arc_range=(math.pi, 2 * math.pi))

    # Gradient sun body (half visible)
    _gradient_sun(img, cx, hy, HI * 0.17,
                  core_color=WHITE, mid_color=GOLD_BRIGHT, edge_color=GOLD)

    # Mask below horizon
    mask_box = Image.new("RGBA", (HI, HI), TRANSPARENT)
    md = ImageDraw.Draw(mask_box)
    md.rectangle([0, hy + 1, HI, HI], fill=(0, 0, 0, 255))
    img = ImageChops.subtract(img, mask_box)

    # Horizon with warm glow
    draw2 = ImageDraw.Draw(img)
    _horizon(img, draw2, hy, WARM, width=max(3, HI // 35), glow_color=AMBER)

    return _finish(img)


def gen_dhuhr() -> Image.Image:
    """Dhuhr — full sun at zenith with rich gradient rays and corona."""
    img, draw = _new()
    cx, cy = HI / 2, HI * 0.42

    # Outer corona glow
    corona = _radial_glow(HI, cx, cy, HI * 0.40, GOLD, peak_alpha=50)
    img.alpha_composite(corona)

    # Second corona layer (warmer)
    corona2 = _radial_glow(HI, cx, cy, HI * 0.28, GOLD_BRIGHT, peak_alpha=35)
    img.alpha_composite(corona2)

    # Gradient rays — two layers for richness
    _gradient_rays(img, cx, cy, HI * 0.18, HI * 0.34, 12, (*GOLD[:3], 200),
                   width=max(4, HI // 35))
    _gradient_rays(img, cx, cy, HI * 0.18, HI * 0.28, 12, (*GOLD_BRIGHT[:3], 120),
                   width=max(2, HI // 50), angle_offset=-math.pi / 2 + math.pi / 12)

    # Gradient sun body
    _gradient_sun(img, cx, cy, HI * 0.15,
                  core_color=WHITE, mid_color=PALE_GOLD, edge_color=GOLD)

    return _finish(img)


def gen_asr() -> Image.Image:
    """Asr — warm afternoon sun, slightly lower, with shadow line."""
    img, draw = _new()
    cx = HI * 0.50
    cy = HI * 0.46
    hy = HI * 0.78

    # Subtle warm atmosphere
    atmo = _radial_glow(HI, cx, cy, HI * 0.35, GOLD_DIM, peak_alpha=30)
    img.alpha_composite(atmo)

    # Gradient rays (fewer, warmer tone)
    _gradient_rays(img, cx, cy, HI * 0.16, HI * 0.28, 8, (*GOLD[:3], 180),
                   width=max(3, HI // 40))

    # Gradient sun body (slightly smaller/warmer than dhuhr)
    _gradient_sun(img, cx, cy, HI * 0.13,
                  core_color=PALE_GOLD, mid_color=GOLD_BRIGHT, edge_color=AMBER)

    # Horizon with glow
    _horizon(img, draw, hy, WARM, width=max(3, HI // 35), glow_color=GOLD_DIM)

    # Subtle shadow below sun toward horizon
    shadow = Image.new("RGBA", (HI, HI), TRANSPARENT)
    sd = ImageDraw.Draw(shadow)
    shadow_w = max(2, HI // 60)
    for i in range(5):
        alpha = 25 - i * 5
        y_off = cy + HI * 0.13 + i * HI * 0.04
        if y_off < hy - 5:
            sd.line([(cx - HI * 0.04, y_off), (cx + HI * 0.04, y_off)],
                    fill=(*WARM[:3], max(0, alpha)), width=shadow_w)
    img.alpha_composite(shadow)

    return _finish(img)


def gen_maghrib() -> Image.Image:
    """Maghrib — sun setting behind horizon with layered warm glow."""
    img, draw = _new()
    cx = HI / 2
    hy = HI * 0.60

    # Multi-layered sky glow (warm → amber → deep orange)
    for color, radius, alpha in [
        (DEEP_ORANGE, HI * 0.50, 25),
        (AMBER, HI * 0.40, 35),
        (GOLD, HI * 0.30, 50),
    ]:
        glow = _radial_glow(HI, cx, hy, radius, color, peak_alpha=alpha)
        img.alpha_composite(glow)

    # Glow arcs
    for i, (alpha, thickness) in enumerate([(60, HI // 16), (45, HI // 20), (30, HI // 24)]):
        r = HI * (0.28 + i * 0.09)
        glow_color = (*AMBER[:3], alpha)
        draw.arc(
            [cx - r, hy - r, cx + r, hy + r],
            start=195, end=345, fill=glow_color, width=thickness,
        )

    # Short gradient rays (just tips above horizon)
    _gradient_rays(img, cx, hy, HI * 0.16, HI * 0.30, 7, (*GOLD[:3], 160),
                   width=max(3, HI // 40), full_circle=False,
                   arc_range=(math.pi + 0.3, 2 * math.pi - 0.3))

    # Gradient sun (only top sliver visible)
    _gradient_sun(img, cx, hy, HI * 0.15,
                  core_color=PALE_GOLD, mid_color=GOLD_BRIGHT, edge_color=AMBER)

    # Mask below horizon (show only sliver)
    sun_r = HI * 0.15
    mask_box = Image.new("RGBA", (HI, HI), TRANSPARENT)
    md = ImageDraw.Draw(mask_box)
    md.rectangle([0, hy - sun_r * 0.25 + 1, HI, HI], fill=(0, 0, 0, 255))
    img = ImageChops.subtract(img, mask_box)

    # Horizon
    draw2 = ImageDraw.Draw(img)
    _horizon(img, draw2, hy - sun_r * 0.25, WARM, width=max(3, HI // 35), glow_color=AMBER)

    return _finish(img)


def gen_isha() -> Image.Image:
    """Isha — crescent moon with glowing stars (night)."""
    img, draw = _new()
    cx, cy = HI / 2, HI / 2

    # Subtle night sky ambient glow
    night_glow = _radial_glow(HI, cx * 0.85, cy * 0.85, HI * 0.6, GOLD_DIM, peak_alpha=15)
    img.alpha_composite(night_glow)

    # Gradient crescent moon (centered, slightly larger)
    _gradient_crescent(img, cx - HI * 0.05, cy - HI * 0.05, HI * 0.22,
                       outer_color=PALE_GOLD, inner_color=GOLD)

    # Moon glow halo
    moon_glow = _radial_glow(HI, cx - HI * 0.05, cy - HI * 0.05, HI * 0.32,
                             GOLD, peak_alpha=30)
    img.alpha_composite(moon_glow)

    # Stars with glow halos
    _star_glow(img, HI * 0.76, HI * 0.20, HI * 0.05, GOLD_DIM, glow_r=HI * 0.10)
    _star_glow(img, HI * 0.83, HI * 0.46, HI * 0.035, WARM, glow_r=HI * 0.07)
    _star_glow(img, HI * 0.58, HI * 0.80, HI * 0.04, GOLD_DIM, glow_r=HI * 0.08)
    _star_glow(img, HI * 0.25, HI * 0.70, HI * 0.025, (*WARM[:3], 180), glow_r=HI * 0.05)

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
