#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const failures = [];

const expect = (condition, message) => {
  if (!condition) {
    failures.push(message);
  }
};

const filesWithCsp = [
  "index.html",
  "public/_headers",
  "vite.config.ts",
];

for (const file of filesWithCsp) {
  const content = read(file);
  expect(
    content.includes("https://static.cloudflareinsights.com"),
    `${file} must allow the Cloudflare Insights beacon script in CSP`
  );
  expect(
    content.includes("https://cloudflareinsights.com"),
    `${file} must allow Cloudflare Insights beacon connections in CSP`
  );
}

for (const file of [
  "index.html",
  "public/_headers",
  "vite.config.ts",
]) {
  const content = read(file);
  expect(!content.includes("clarity.ms"), `${file} must not load or allow Microsoft Clarity`);
  expect(!content.includes("vmw9xs81kh"), `${file} must not include the retired Clarity tag ID`);
}

const wranglerConfig = read("wrangler.jsonc");
expect(
  wranglerConfig.includes('"main": "src/worker.ts"'),
  "wrangler must run the canonical redirect Worker before assets"
);
expect(
  wranglerConfig.includes('"binding": "ASSETS"') && wranglerConfig.includes('"run_worker_first": true'),
  "wrangler assets must be exposed to the Worker and routed through it first"
);

const edgeRouting = read("src/edge-routing.js");
expect(
  edgeRouting.includes('const CANONICAL_HOST = "game4git.com"'),
  "edge routing must canonicalize to the apex game4git.com host"
);
expect(
  edgeRouting.includes("FILE_EXTENSION_RE") && edgeRouting.includes("/.well-known/"),
  "edge routing must avoid trailing-slash redirects for static files and well-known URLs"
);

const tailwindConfig = read("tailwind.config.ts");
expect(
  /'orange-brand':\s*'#c43d22'/.test(tailwindConfig),
  "orange-brand must use the AA-compliant #c43d22 value"
);

const enLocale = JSON.parse(read("src/i18n/locales/en.json"));
const esLocale = JSON.parse(read("src/i18n/locales/es.json"));
expect(
  enLocale.seo?.gitBranchPractice?.title?.includes("Git Branch Game"),
  "English git branch SEO title must target the GSC query 'git branch game'"
);
expect(
  enLocale.seo?.gitBranchPractice?.description?.toLowerCase().includes("git branch game"),
  "English git branch SEO description must include 'git branch game'"
);
expect(
  JSON.stringify(esLocale.landingPages?.gitPracticeGame ?? {}).toLowerCase().includes("juego de git"),
  "Spanish git practice landing copy must target the GSC query 'juego de git'"
);

const localizedRoutes = read("src/lib/localizedRoutes.ts");
expect(
  localizedRoutes.includes("ensureTrailingSlash"),
  "localized route generation must expose ensureTrailingSlash"
);
expect(
  /return ensureTrailingSlash\(localized\);/.test(localizedRoutes),
  "getLocalizedPath must return trailing-slash paths for canonical/public URLs"
);

for (const configPath of [
  "generate-sitemap.cjs",
  "prerender-routes.cjs",
]) {
  expect(
    read(configPath).includes("ensureTrailingSlash"),
    `${configPath} must use the shared trailing-slash convention`
  );
}

const seoLandingPage = read("src/components/SeoLandingPage.tsx");
expect(
  seoLandingPage.includes("heroMobileWebpSrc"),
  "SeoLandingPage must emit a mobile hero WebP candidate"
);
expect(
  seoLandingPage.includes("960w") && seoLandingPage.includes("1200w"),
  "SeoLandingPage hero srcSet must include explicit mobile and desktop widths"
);

const prerender = read("prerender-routes.cjs");
expect(
  prerender.includes("960w") && prerender.includes("1200w"),
  "prerendered hero markup must include responsive image widths"
);

expect(
  read("scripts/optimize-hero-images.mjs").includes("const MOBILE_WIDTH = 960"),
  "mobile hero generation must be wide enough for Lighthouse mobile DPR"
);

expect(
  !read("src/pages/Landing.tsx").includes("text-slate-500"),
  "dark playground terminal mock must meet contrast on dark backgrounds"
);

expect(
  !read("src/components/GitBranchScrollAnimation.tsx").includes("text-slate-500"),
  "dark git graph mock must meet contrast on #0f172a"
);

expect(
  !read("src/components/SiteFooter.tsx").includes("bg-primary text-primary-foreground"),
  "footer support CTA must not use the low-contrast primary color pair"
);

for (const asset of [
  "public/hero-git-practice-game-sm.webp",
  "public/hero-git-branch-practice-sm.webp",
  "public/hero-git-merge-conflicts-sm.webp",
  "public/hero-valgrind-memory-leaks-sm.webp",
]) {
  expect(exists(asset), `${asset} must exist`);
}

const pagespeedConfig = JSON.parse(read("pagespeed.config.json"));
for (const url of pagespeedConfig.urls ?? []) {
  const parsed = new URL(url);
  expect(
    parsed.pathname === "/" || parsed.pathname.endsWith("/"),
    `PageSpeed URL must avoid Cloudflare slash redirects: ${url}`
  );
}

for (const sitemapPath of ["public/sitemap.xml", "public/sitemap-simple.xml"]) {
  const locs = [...read(sitemapPath).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  for (const loc of locs) {
    const parsed = new URL(loc);
    expect(
      parsed.pathname === "/" || parsed.pathname.endsWith("/") || /\.[a-z0-9]+$/i.test(parsed.pathname),
      `${sitemapPath} URL must follow trailing-slash canonical convention: ${loc}`
    );
  }
}

if (failures.length > 0) {
  console.error("Performance config check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Performance config check passed.");
