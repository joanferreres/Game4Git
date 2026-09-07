#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  buildSearchAnalyticsRequest,
  buildSetupHint,
  getQuotaProjectFromConfigValues,
  classifyQueryOpportunity,
  getDateWindows,
  normalizeSiteUrl,
} from "./gsc-report.mjs";

assert.equal(normalizeSiteUrl("game4git.com"), "sc-domain:game4git.com");
assert.equal(normalizeSiteUrl("sc-domain:game4git.com"), "sc-domain:game4git.com");
assert.equal(normalizeSiteUrl("https://game4git.com"), "https://game4git.com/");
assert.equal(normalizeSiteUrl("https://game4git.com/git-practice-game"), "https://game4git.com/git-practice-game/");

assert.deepEqual(getDateWindows({ today: "2026-08-18", days: 28, dataLagDays: 2 }), {
  current: {
    startDate: "2026-07-20",
    endDate: "2026-08-16",
  },
  previous: {
    startDate: "2026-06-22",
    endDate: "2026-07-19",
  },
});

assert.deepEqual(
  buildSearchAnalyticsRequest({
    startDate: "2026-07-20",
    endDate: "2026-08-16",
    dimensions: ["query", "page"],
    rowLimit: 250,
    pageFilter: "https://game4git.com/git-practice-game/",
  }),
  {
    startDate: "2026-07-20",
    endDate: "2026-08-16",
    dimensions: ["query", "page"],
    rowLimit: 250,
    type: "web",
    dataState: "final",
    dimensionFilterGroups: [
      {
        groupType: "and",
        filters: [
          {
            dimension: "page",
            operator: "equals",
            expression: "https://game4git.com/git-practice-game/",
          },
        ],
      },
    ],
  }
);

assert.equal(
  classifyQueryOpportunity({
    clicks: 1,
    impressions: 640,
    ctr: 0.003,
    position: 12.4,
  }),
  "striking-distance-low-ctr"
);

assert.equal(
  classifyQueryOpportunity({
    clicks: 0,
    impressions: 5,
    ctr: 0,
    position: 8.8,
  }),
  "striking-distance-low-ctr"
);

assert.equal(
  classifyQueryOpportunity({
    clicks: 0,
    impressions: 3,
    ctr: 0,
    position: 48.33,
  }),
  "content-gap"
);

assert.equal(
  classifyQueryOpportunity({
    clicks: 12,
    impressions: 500,
    ctr: 0.024,
    position: 4.2,
  }),
  "protect"
);

assert.match(buildSetupHint("Request had insufficient authentication scopes."), /webmasters\.readonly/);
assert.match(buildSetupHint("Request had insufficient authentication scopes."), /gcloud auth application-default login/);
assert.match(
  buildSetupHint("requires a quota project", "sonrie-canguro"),
  /gcloud auth application-default set-quota-project sonrie-canguro/
);
assert.match(buildSetupHint("API has not been used", "sonrie-canguro"), /gcloud services enable searchconsole\.googleapis\.com --project=sonrie-canguro/);
assert.equal(getQuotaProjectFromConfigValues("CURRENT_PROJECT", "sonrie-canguro"), "sonrie-canguro");
assert.equal(getQuotaProjectFromConfigValues("seo-quota", "sonrie-canguro"), "seo-quota");
assert.equal(getQuotaProjectFromConfigValues("(unset)", "sonrie-canguro"), "sonrie-canguro");
assert.equal(getQuotaProjectFromConfigValues("", ""), "");

console.log("GSC report helpers passed");
