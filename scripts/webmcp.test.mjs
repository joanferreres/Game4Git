#!/usr/bin/env node

import assert from "node:assert/strict";

import { registerGame4GitTools } from "../src/lib/webmcp.js";

const registeredTools = [];
const modelContext = {
  async registerTool(tool) {
    registeredTools.push(tool);
  },
};
const navigatedTo = [];

await registerGame4GitTools({
  modelContext,
  navigate: (pathname) => navigatedTo.push(pathname),
});

assert.deepEqual(
  registeredTools.map((tool) => tool.name),
  ["open-game4git-playground", "open-game4git-guide"],
  "agents must be able to discover the playground and guided-practice tools"
);

await registeredTools[0].execute({ locale: "es" });
assert.deepEqual(navigatedTo, ["/es/playground/"], "the playground tool must retain the requested locale");

await registeredTools[1].execute({ guide: "merge-conflicts", locale: "fr" });
assert.deepEqual(
  navigatedTo,
  ["/es/playground/", "/fr/git-merge-conflicts/"],
  "the guide tool must open the matching localized practice page"
);

await assert.rejects(
  () => registeredTools[1].execute({ guide: "not-a-guide", locale: "en" }),
  /Unknown guide/,
  "invalid guide requests must not navigate to an arbitrary route"
);

console.log("WebMCP tools register real Game4Git navigation actions");
