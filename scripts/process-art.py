"""Convert the generated dish images in art-src/ into the WebP files the app uses.

Usage: python3 scripts/process-art.py

Reads art-src/<name>.png (1024 px, sand backdrop) and writes
public/dishes/512/<name>.webp and public/dishes/256/<name>.webp.
<name> is the dish id, optionally followed by -raw or -burnt.
"""
from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parent.parent
for src in sorted((root / 'art-src').glob('*.png')):
    image = Image.open(src).convert('RGB')
    for size in (512, 256):
        target = root / 'public' / 'dishes' / str(size) / f'{src.stem}.webp'
        target.parent.mkdir(parents=True, exist_ok=True)
        image.resize((size, size), Image.LANCZOS).save(target, 'WEBP', quality=84, method=6)
print(len(list((root / 'public' / 'dishes' / '512').glob('*.webp'))), 'dishes processed')
