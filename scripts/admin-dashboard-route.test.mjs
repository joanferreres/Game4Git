#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
const dashboard = await readFile(new URL("../src/pages/AdminStats.tsx", import.meta.url), "utf8");

assert.match(app, /path: "\/admin\/"[\s\S]*<AdminStats \/>/, "the canonical admin route must render the stats dashboard");
assert.doesNotMatch(app, /const Admin = lazy\(/, "the legacy admin page must no longer be part of the router");
assert.match(await readFile(new URL("../src/worker.ts", import.meta.url), "utf8"), /pathname === "\/admin\/stats\/"[\s\S]*Response\.redirect/, "the legacy stats URL must redirect at the edge");
assert.match(dashboard, /bg-white/, "the dashboard must use the light surface");
assert.match(dashboard, /text-gray-900|text-black/, "the dashboard must use dark text on light surfaces");

console.log("Admin dashboard route contract passed");
