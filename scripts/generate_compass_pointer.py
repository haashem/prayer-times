#!/usr/bin/env python3
"""Rasterize the compass's geometric pointer and fixed reference marker."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SCALE = 4


def render(size, points, color):
    image = Image.new('RGBA', (size[0] * SCALE, size[1] * SCALE))
    draw = ImageDraw.Draw(image)
    draw.polygon([(round(x * SCALE), round(y * SCALE)) for x, y in points],
                 fill=color)
    return image.resize(size, Image.Resampling.LANCZOS)


def main():
    for shape, size in [('r', 100), ('s', 80)]:
        directory = ROOT / f'assets/gt.{shape}/image'
        for suffix, color in [('', '#d4a843'), ('_aligned', '#66bb6a')]:
            # Slender chevron with transparent padding for arbitrary rotation.
            points = [(size*.5, size*.08), (size*.76, size*.77),
                      (size*.5, size*.64), (size*.24, size*.77)]
            render((size, size), points, color).save(
                directory / f'qibla_pointer{suffix}.png')
            tip = 44 if shape == "r" else 40
            render((24, 52), [(7, 3), (17, 3), (17, tip - 10), (12, tip), (7, tip - 10)], color).save(
                directory / f'compass_top{suffix}.png')


if __name__ == '__main__':
    main()
