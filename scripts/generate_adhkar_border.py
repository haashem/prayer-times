#!/usr/bin/env python3
"""Render the approved Woven Ribbon alert border for round and square screens.

Two continuous strands share a regular rhythm around the perimeter. The center
stays pure black; all ornament uses the app’s warm gold accent, without animation.
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BORDER_COLOR = (0xD4, 0xA8, 0x43)
SUPERSAMPLE = 4
PERIODS = 12


def perimeter(size: int, square: bool):
    """Return evenly spaced positions and outward normals on a closed path."""
    if not square:
        radius = size / 2 - 16
        length = math.tau * radius
        for index in range(6001):
            distance = length * index / 6000
            angle = distance / radius - math.pi / 2
            nx, ny = math.cos(angle), math.sin(angle)
            yield distance, length, size / 2 + radius * nx, size / 2 + radius * ny, nx, ny
        return

    inset, radius = 16, 40
    straight = size - 2 * inset - 2 * radius
    quarter = math.pi * radius / 2
    length = 4 * (straight + quarter)
    # One top edge followed by a rounded corner, repeated around the center.
    for index in range(6001):
        distance = length * index / 6000
        side = min(3, int(distance / (straight + quarter)))
        offset = distance - side * (straight + quarter)
        if offset <= straight:
            x, y, nx, ny = inset + radius + offset, inset, 0, -1
        else:
            angle = -math.pi / 2 + (offset - straight) / radius
            nx, ny = math.cos(angle), math.sin(angle)
            x = size - inset - radius + radius * nx
            y = inset + radius + radius * ny
        for _ in range(side):
            x, y = size - y, x
            nx, ny = -ny, nx
        yield distance, length, x, y, nx, ny


def render(size: int, square: bool, target: Path) -> None:
    image = Image.new('RGB', (size * SUPERSAMPLE, size * SUPERSAMPLE), 'black')
    draw = ImageDraw.Draw(image)
    amplitude = 4 if square else 5
    samples = list(perimeter(size, square))
    for sign in (1, -1):
        points = []
        for distance, length, x, y, nx, ny in samples:
            offset = sign * amplitude * math.sin(math.tau * PERIODS * distance / length)
            points.append(((x + nx * offset) * SUPERSAMPLE, (y + ny * offset) * SUPERSAMPLE))
        draw.line(points, fill=BORDER_COLOR, width=6, joint='curve')
    image = image.resize((size, size), Image.Resampling.LANCZOS)
    image.save(target, optimize=True)


if __name__ == '__main__':
    for shape, size in [('r', 480), ('s', 390)]:
        render(size, shape == 's', ROOT / f'assets/gt.{shape}/image/adhkar_border.png')
