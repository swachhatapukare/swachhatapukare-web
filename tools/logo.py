#!/usr/bin/env python3
"""Regenerate the web-ready logo files from the high-res master.

Master (kept untouched):  assets/SPF Logo - Highres.png   (1920x1920, transparent)
Generated:
  assets/logo.png       - the circular emblem, 512px square (site header + footer)
  assets/logo-full.png  - full lock-up incl. the caption line, 768px tall

Run from the repo root:  python tools/logo.py
Requires Pillow:  python -m pip install pillow
"""

import io
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER = os.path.join(ROOT, "assets", "SPF Logo - Highres.png")
OUT_EMBLEM = os.path.join(ROOT, "assets", "logo.png")
OUT_FULL = os.path.join(ROOT, "assets", "logo-full.png")

EMBLEM_SIZE = 512      # displayed at ~40px, so this is ~12x retina headroom
FULL_HEIGHT = 768
PAD = 0.03             # transparent margin around the emblem
COLORS = 256           # PNG-8 palette; the logo is flat vector-style art


def opaque_box(im):
    return im.getchannel("A").getbbox()


def split_emblem(im, box):
    """Cut the circular emblem off the top of the artwork, dropping the
    caption line underneath it. Falls back to the whole artwork when no
    clear horizontal gap is found."""
    alpha = im.getchannel("A")
    rows = alpha.crop((0, box[1], im.width, box[3]))
    px = rows.load()
    empty = []
    run_start = None
    for y in range(rows.height):
        solid = any(px[x, y] > 16 for x in range(0, rows.width, 3))
        if not solid and run_start is None:
            run_start = y
        elif solid and run_start is not None:
            if y - run_start >= 20:
                empty.append((run_start, y))
            run_start = None
    if not empty:
        return box
    gap = max(empty, key=lambda g: g[1] - g[0])
    return (box[0], box[1], box[2], box[1] + gap[0])


def padded_square(im, box):
    """Crop to box, centre it on a square transparent canvas with a small margin."""
    art = im.crop(box)
    side = max(art.width, art.height)
    side = int(round(side * (1 + PAD * 2)))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(art, ((side - art.width) // 2, (side - art.height) // 2), art)
    return canvas


def encode(im, colors):
    if colors:
        im = im.quantize(colors=colors, method=Image.FASTOCTREE)
    buf = io.BytesIO()
    im.save(buf, format="PNG", optimize=True)
    return buf.getvalue(), im


def save(im, path, size=None):
    """Write the smaller of full RGBA vs. a 256-colour palette PNG."""
    if size:
        im = im.resize(size, Image.LANCZOS)
    plain, _ = encode(im, 0)
    indexed, palette = encode(im, COLORS)
    data, mode = (indexed, "PNG-8") if len(indexed) < len(plain) else (plain, "PNG-32")
    with open(path, "wb") as fh:
        fh.write(data)
    print("%s  %sx%s  %d KB  %s" % (os.path.relpath(path, ROOT), im.width, im.height,
                                    len(data) // 1024, mode))


def main():
    im = Image.open(MASTER).convert("RGBA")
    full_box = opaque_box(im)
    emblem_box = split_emblem(im, full_box)

    save(padded_square(im, emblem_box), OUT_EMBLEM, (EMBLEM_SIZE, EMBLEM_SIZE))

    full = im.crop(full_box)
    w = int(round(FULL_HEIGHT * full.width / full.height))
    save(full, OUT_FULL, (w, FULL_HEIGHT))


if __name__ == "__main__":
    main()
