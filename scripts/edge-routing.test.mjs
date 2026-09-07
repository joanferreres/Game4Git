#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  getCanonicalRedirectUrl,
  isHtmlRoutePath,
} from "../src/edge-routing.js";

assert.equal(isHtmlRoutePath("/"), true);
assert.equal(isHtmlRoutePath("/git-practice-game"), true);
assert.equal(isHtmlRoutePath("/es/git-practice-game"), true);
assert.equal(isHtmlRoutePath("/assets/index.abc123.js"), false);
assert.equal(isHtmlRoutePath("/sitemap.xml"), false);
assert.equal(isHtmlRoutePath("/robots.txt"), false);
assert.equal(isHtmlRoutePath("/google804e7e0b58ae3eb8.html"), false);
assert.equal(isHtmlRoutePath("/.well-known/security.txt"), false);

assert.equal(
  getCanonicalRedirectUrl("http://game4git.com/"),
  "https://game4git.com/"
);
assert.equal(
  getCanonicalRedirectUrl("https://www.game4git.com/git-practice-game"),
  "https://game4git.com/git-practice-game/"
);
assert.equal(
  getCanonicalRedirectUrl("http://www.game4git.com:8787/git-practice-game"),
  "https://game4git.com/git-practice-game/"
);
assert.equal(
  getCanonicalRedirectUrl("https://game4git.com/git-practice-game"),
  "https://game4git.com/git-practice-game/"
);
assert.equal(
  getCanonicalRedirectUrl("https://game4git.com/git-practice-game?utm_source=test"),
  "https://game4git.com/git-practice-game/?utm_source=test"
);
assert.equal(
  getCanonicalRedirectUrl("https://www.game4git.com/robots.txt"),
  "https://game4git.com/robots.txt"
);
assert.equal(
  getCanonicalRedirectUrl("https://game4git.com/assets/index.abc123.js"),
  null
);
assert.equal(
  getCanonicalRedirectUrl("http://localhost:8787/git-practice-game"),
  null
);
assert.equal(
  getCanonicalRedirectUrl("http://127.0.0.1:8787/git-practice-game"),
  null
);
assert.equal(
  getCanonicalRedirectUrl("http://127.0.0.1:8787/git-practice-game", new Headers({ host: "game4git.com" })),
  "https://game4git.com/git-practice-game/"
);
assert.equal(
  getCanonicalRedirectUrl("http://127.0.0.1:8787/robots.txt", new Headers({ host: "www.game4git.com" })),
  "https://game4git.com/robots.txt"
);
assert.equal(
  getCanonicalRedirectUrl("https://game4git.com/git-practice-game/"),
  null
);

console.log("Edge routing helpers passed");
