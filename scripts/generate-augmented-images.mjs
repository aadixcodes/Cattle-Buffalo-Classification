/**
 * Generate a large, diverse augmented dataset from the 24 base images per class.
 *
 * Target: 200 images per class (24 base + 176 augmented). The augmentations are
 * intentionally strong and varied so the downstream model cannot simply memorize
 * a handful of source photos — it has to learn generalizable cattle-vs-buffalo
 * visual features (body shape, horn shape, coat, proportions).
 *
 * Usage: node scripts/generate-augmented-images.mjs
 */
import { Jimp } from 'jimp';
import { existsSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

const BASE_DIR = join(process.cwd(), 'public', 'dataset');
const TARGET_PER_CLASS = 200; // 24 base + 176 augmented
const IMG_SIZE = 400;

let rngState = 1337;
function rand() {
  rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
  return rngState / 0x7fffffff;
}
function randRange(min, max) { return min + rand() * (max - min); }
function randInt(min, max) { return Math.floor(randRange(min, max + 1)); }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

async function loadImage(path) {
  const img = await Jimp.read(path);
  img.cover({ w: IMG_SIZE, h: IMG_SIZE });
  return img;
}

// Strong, diverse augmentation pipeline. Each call composes a random subset of
// transforms so two augmentations of the same base image rarely look alike.
function augment(img) {
  const result = img.clone();

  // Rotation: wider range for pose diversity
  const angle = randRange(-35, 35);
  result.rotate({ deg: angle });

  // Horizontal flip (50%)
  if (rand() < 0.5) {
    result.flip({ horizontal: true });
  }

  // Random crop / zoom (70-98% then resize back) — multiple scales
  if (rand() < 0.8) {
    const cropRatio = randRange(0.70, 0.98);
    const cw = Math.floor(IMG_SIZE * cropRatio);
    const ch = Math.floor(IMG_SIZE * cropRatio);
    const x1 = randInt(0, IMG_SIZE - cw);
    const y1 = randInt(0, IMG_SIZE - ch);
    result.crop({ x: x1, y: y1, w: cw, h: ch });
    result.cover({ w: IMG_SIZE, h: IMG_SIZE });
  }

  // Brightness variation — wider
  if (rand() < 0.8) {
    result.brightness(randRange(-0.35, 0.35));
  }

  // Contrast variation — wider
  if (rand() < 0.8) {
    result.contrast(randRange(-0.30, 0.40));
  }

  // Color/saturation variation
  if (rand() < 0.7) {
    const factor = randInt(-40, 40);
    if (factor >= 0) {
      result.color([{ apply: 'saturate', params: [factor] }]);
    } else {
      result.color([{ apply: 'desaturate', params: [-factor] }]);
    }
  }

  // Occasional posterize for style/texture variation
  if (rand() < 0.2) {
    result.posterize(randInt(3, 7));
  }

  // Occasional horizontal/vertical stretch for proportion variation
  if (rand() < 0.3) {
    const scale = pick([0.85, 0.9, 1.1, 1.15]);
    const newW = Math.round(IMG_SIZE * scale);
    result.cover({ w: newW, h: IMG_SIZE });
    result.cover({ w: IMG_SIZE, h: IMG_SIZE });
  }

  return result;
}

async function processClass(className) {
  const classDir = join(BASE_DIR, className);
  if (!existsSync(classDir)) {
    console.log(`  Skipping ${className} — directory not found`);
    return;
  }

  // Remove any previously generated augmented images (index >= 25) so we can
  // regenerate cleanly with the new pipeline.
  const existing = readdirSync(classDir).filter((f) => f.endsWith('.jpg'));
  for (const f of existing) {
    const m = f.match(/_(\d+)\.jpg$/);
    if (m && parseInt(m[1], 10) >= 25) {
      unlinkSync(join(classDir, f));
    }
  }

  const baseImages = [];
  for (let i = 1; i <= 24; i++) {
    const p = join(classDir, `${className}_${i}.jpg`);
    if (existsSync(p)) {
      try {
        const img = await loadImage(p);
        baseImages.push(img);
      } catch (e) {
        console.log(`  Warning: could not load ${p}: ${e.message}`);
      }
    }
  }

  if (baseImages.length === 0) {
    console.log(`  No base images found for ${className}`);
    return;
  }

  console.log(`  ${className}: ${baseImages.length} base images loaded`);

  let nextIdx = 25;
  let generated = 0;
  while (nextIdx <= TARGET_PER_CLASS) {
    const baseIdx = randInt(0, baseImages.length - 1);
    const aug = augment(baseImages[baseIdx]);
    const buf = await aug.getBuffer('image/jpeg');
    const outPath = join(classDir, `${className}_${nextIdx}.jpg`);
    writeFileSync(outPath, buf);
    nextIdx++;
    generated++;
  }

  const total = readdirSync(classDir).filter((f) => f.endsWith('.jpg')).length;
  console.log(`  ${className}: generated ${generated} new, ${total} total`);
}

async function main() {
  console.log('Generating augmented training images...');
  console.log(`  Target: ${TARGET_PER_CLASS} images per class`);
  await processClass('cattle');
  await processClass('buffalo');
  console.log('Done.');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
