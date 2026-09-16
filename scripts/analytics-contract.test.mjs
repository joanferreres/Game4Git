#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../src/worker.ts", import.meta.url), "utf8");
const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

assert.match(
  worker,
  /function isAnalyticsApiPath\(pathname: string\): boolean \{\s*return pathname\.startsWith\("\/api\/admin\/"\) \|\| pathname === "\/api\/analytics\/track";/s,
  "the Worker must route public analytics events as API requests"
);

assert.match(
  worker,
  /\$\{SESSION_COOKIE_NAME\}=\$\{sessionToken\}; Path=\//,
  "the admin session cookie must be sent to /api/admin endpoints"
);

assert.match(
  worker,
  /pathname === "\/api\/analytics\/track" && request\.method === "POST"/,
  "the Worker must dispatch tracking requests to the event handler"
);

assert.ok(
  worker.indexOf('uaLower.includes("ios") || uaLower.includes("iphone") || uaLower.includes("ipad")') < worker.indexOf('uaLower.includes("mac os") || uaLower.includes("macos")'),
  "iPhone and iPad user agents must be classified as iOS before macOS"
);

assert.match(
  app,
  /path: "\/admin\/stats\/"/,
  "the analytics dashboard must be reachable from the router"
);

assert.match(worker, /TURNSTILE_SECRET/);
assert.match(worker, /TURNSTILE_HOSTNAMES/);
assert.match(
  worker,
  /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/
);
assert.match(worker, /expectedAction|action === ["']analytics["']|action !== ["']analytics["']/);
assert.match(worker, /verified/);
assert.match(
  worker,
  /turnstileToken/
);
assert.doesNotMatch(
  worker,
  /\/api\/analytics\/track[\s\S]{0,800}status:\s*403/,
  "track must not 403 on Turnstile failure within the handler body window"
);

console.log("Analytics routing contract passed");
