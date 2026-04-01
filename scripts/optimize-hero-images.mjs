#!/usr/bin/env node
/**
 * Redimensiona (máx. 1200px), recompprime PNG y genera WebP para imágenes hero en public/.
 * Uso: npm run optimize:heroes
 */
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const BASE_NAMES = [
  "hero-git-practice-game",
  "hero-git-branch-practice",
  "hero-git-merge-conflicts",
  "hero-valgrind-memory-leaks",
];

const MAX_WIDTH = 1200;

async function main() {
  for (const base of BASE_NAMES) {
    const inputPath = path.join(publicDir, `${base}.png`);
    const pngPath = path.join(publicDir, `${base}.png`);
    const webpPath = path.join(publicDir, `${base}.webp`);
    const tmpPath = path.join(publicDir, `${base}.png.tmp`);

    await fs.access(inputPath);

    const meta = await sharp(inputPath).metadata();
    const resize =
      meta.width && meta.width > MAX_WIDTH ? { width: MAX_WIDTH } : {};

    await sharp(inputPath)
      .resize({ ...resize, withoutEnlargement: true })
      .png({ compressionLevel: 9, effort: 9 })
      .toFile(tmpPath);

    await sharp(inputPath)
      .resize({ ...resize, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(webpPath);

    await fs.rename(tmpPath, pngPath);

    const pngStat = await fs.stat(pngPath);
    const webpStat = await fs.stat(webpPath);
    console.log(
      `${base}: png ${(pngStat.size / 1024).toFixed(1)} KiB, webp ${(webpStat.size / 1024).toFixed(1)} KiB`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
