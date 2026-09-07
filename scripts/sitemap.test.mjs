#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

execFileSync(process.execPath, ["generate-sitemap.cjs"], {
  cwd: projectRoot,
  stdio: "pipe",
});

const sitemap = fs.readFileSync(path.join(projectRoot, "public", "sitemap.xml"), "utf8");
const simpleSitemap = fs.readFileSync(path.join(projectRoot, "public", "sitemap-simple.xml"), "utf8");

assert.ok(!sitemap.includes("/playground/"), "noindex playground URLs must not be submitted in the sitemap");
assert.ok(!simpleSitemap.includes("/playground/"), "the legacy sitemap must not submit noindex playground URLs");
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 36, "only the 9 indexable routes in 4 locales belong in the sitemap");

console.log("Sitemap excludes noindex routes");
