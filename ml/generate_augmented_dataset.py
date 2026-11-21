"""
Generate a large, diverse augmented dataset from the 24 base images per class.

Target: 200 images per class (24 base + 176 augmented). The augmentations are
intentionally strong and varied so the downstream model cannot simply memorize
a handful of source photos — it has to learn generalizable cattle-vs-buffalo
visual features (body shape, horn shape, coat, proportions).

Usage:
    python ml/generate_augmented_dataset.py

Output:
    public/dataset/cattle/cattle_25.jpg ... cattle_200.jpg
    public/dataset/buffalo/buffalo_25.jpg ... buffalo_200.jpg
"""
import random
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps, ImageFilter

BASE_DIR = Path(__file__).resolve().parent.parent / "public" / "dataset"
TARGET_PER_CLASS = 200  # 24 original + 176 augmented
IMG_SIZE = 400

random.seed(1337)


def augment(img: Image.Image) -> Image.Image:
    """Apply a random, strong combination of augmentations to one image."""
    # Rotation: wider range for pose diversity
    angle = random.uniform(-35, 35)
    img = img.rotate(angle, expand=False, fillcolor=(128, 128, 128))

    # Horizontal flip (50%)
    if random.random() < 0.5:
        img = ImageOps.mirror(img)

    # Random crop / zoom (70-98% then resize back) — multiple scales
    if random.random() < 0.8:
        w, h = img.size
        crop_ratio = random.uniform(0.70, 0.98)
        cw, ch = int(w * crop_ratio), int(h * crop_ratio)
        x1 = random.randint(0, w - cw)
        y1 = random.randint(0, h - ch)
        img = img.crop((x1, y1, x1 + cw, y1 + ch)).resize((w, h), Image.LANCZOS)

    # Brightness variation — wider
    if random.random() < 0.8:
        factor = random.uniform(0.65, 1.35)
        img = ImageEnhance.Brightness(img).enhance(factor)

    # Contrast variation — wider
    if random.random() < 0.8:
        factor = random.uniform(0.70, 1.40)
        img = ImageEnhance.Contrast(img).enhance(factor)

    # Color/saturation variation
    if random.random() < 0.7:
        factor = random.uniform(0.60, 1.40)
        img = ImageEnhance.Color(img).enhance(factor)

    # Occasional slight blur or sharpen — texture variation
    if random.random() < 0.2:
        img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.5, 1.5)))
    elif random.random() < 0.2:
        img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=150))

    # Occasional posterize for style/texture variation
    if random.random() < 0.2:
        img = img.quantize(colors=random.randint(3, 7)).convert("RGB")

    return img


def process_class(class_name: str):
    class_dir = BASE_DIR / class_name
    if not class_dir.exists():
        print(f"  Skipping {class_name} — directory not found")
        return

    # Remove any previously generated augmented images (index >= 25).
    for p in class_dir.glob("*.jpg"):
        import re
        m = re.search(r"_(\d+)\.jpg$", p.name)
        if m and int(m.group(1)) >= 25:
            p.unlink()

    # Load all base images (1-24)
    base_images = []
    for i in range(1, 25):
        p = class_dir / f"{class_name}_{i}.jpg"
        if p.exists():
            base_images.append(
                Image.open(p).convert("RGB").resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS)
            )

    if not base_images:
        print(f"  No base images found for {class_name}")
        return

    print(f"  {class_name}: {len(base_images)} base images loaded")

    next_idx = 25
    while next_idx <= TARGET_PER_CLASS:
        base = random.choice(base_images)
        aug = augment(base)
        out_path = class_dir / f"{class_name}_{next_idx}.jpg"
        aug.save(out_path, "JPEG", quality=85)
        next_idx += 1

    total = len(list(class_dir.glob("*.jpg")))
    print(f"  {class_name}: {total} total images now")


def main():
    print("Generating augmented training images...")
    print(f"  Target: {TARGET_PER_CLASS} images per class")
    process_class("cattle")
    process_class("buffalo")
    print("Done.")


if __name__ == "__main__":
    main()
