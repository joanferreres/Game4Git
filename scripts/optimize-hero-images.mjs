#!/usr/bin/env node
/**
 * Redimensiona (máx. 1200px), recompprime PNG y genera WebP para imágenes hero en public/.
 * Uso: npm run optimize:heroes
 */
import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
import { promisify } from "util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const run = promisify(execFile);

const BASE_NAMES = [
  "hero-git-practice-game",
  "hero-git-branch-practice",
  "hero-git-merge-conflicts",
  "hero-valgrind-memory-leaks",
];

const MAX_WIDTH = 1200;
const MOBILE_WIDTH = 960;

async function logSizes(base, pngPath, webpPath, mobileWebpPath) {
  const pngStat = await fs.stat(pngPath);
  const webpStat = await fs.stat(webpPath);
  const mobileWebpStat = await fs.stat(mobileWebpPath);
  console.log(
    `${base}: png ${(pngStat.size / 1024).toFixed(1)} KiB, webp ${(webpStat.size / 1024).toFixed(1)} KiB, mobile webp ${(mobileWebpStat.size / 1024).toFixed(1)} KiB`
  );
}

async function optimizeWithSharp(sharp) {
  for (const base of BASE_NAMES) {
    const inputPath = path.join(publicDir, `${base}.png`);
    const pngPath = path.join(publicDir, `${base}.png`);
    const webpPath = path.join(publicDir, `${base}.webp`);
    const mobileWebpPath = path.join(publicDir, `${base}-sm.webp`);
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

    await sharp(inputPath)
      .resize({ width: MOBILE_WIDTH, withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(mobileWebpPath);

    await fs.rename(tmpPath, pngPath);

    await logSizes(base, pngPath, webpPath, mobileWebpPath);
  }
}

async function optimizeWithSystemTools() {
  for (const base of BASE_NAMES) {
    const inputPath = path.join(publicDir, `${base}.png`);
    const pngPath = path.join(publicDir, `${base}.png`);
    const webpPath = path.join(publicDir, `${base}.webp`);
    const mobileWebpPath = path.join(publicDir, `${base}-sm.webp`);
    const tmpDir = await fs.mkdtemp(path.join("/tmp", `${base}-`));
    const tmpPng = path.join(tmpDir, `${base}.png`);
    const tmpMobilePng = path.join(tmpDir, `${base}-sm.png`);

    await fs.access(inputPath);
    await run("sips", ["-Z", String(MAX_WIDTH), inputPath, "--out", tmpPng]);
    await run("cwebp", ["-quiet", "-q", "82", tmpPng, "-o", webpPath]);
    await fs.rename(tmpPng, pngPath);
    await run("sips", ["-Z", String(MOBILE_WIDTH), pngPath, "--out", tmpMobilePng]);
    await run("cwebp", ["-quiet", "-q", "78", tmpMobilePng, "-o", mobileWebpPath]);
    await fs.rm(tmpDir, { recursive: true, force: true });

    await logSizes(base, pngPath, webpPath, mobileWebpPath);
  }
}

async function main() {
  try {
    const { default: sharp } = await import("sharp");
    await optimizeWithSharp(sharp);
  } catch (error) {
    const message = error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.warn(`sharp unavailable, falling back to sips+cwebp: ${message}`);
    await optimizeWithSystemTools();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
