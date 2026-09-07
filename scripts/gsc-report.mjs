#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const API_ROOT = "https://www.googleapis.com/webmasters/v3";
const URL_INSPECTION_ENDPOINT = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const DEFAULT_SITE_URL = "sc-domain:game4git.com";
const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), "reports", "gsc");
const DEFAULT_DAYS = 28;
const DEFAULT_DATA_LAG_DAYS = 2;
const DEFAULT_ROW_LIMIT = 250;
const DEFAULT_LANGUAGE_CODE = "en-US";
const DAY_MS = 24 * 60 * 60 * 1000;

const DEFAULT_FOCUS_PAGES = [
  "https://game4git.com/",
  "https://game4git.com/git-practice-game/",
  "https://game4git.com/git-branch-practice/",
  "https://game4git.com/git-merge-conflicts/",
  "https://game4git.com/gdb/",
  "https://game4git.com/valgrind/",
  "https://game4git.com/valgrind-memory-leaks/",
];

class GoogleApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = "GoogleApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function normalizeSiteUrl(value) {
  const input = String(value ?? "").trim();

  if (!input) {
    return DEFAULT_SITE_URL;
  }

  if (input.startsWith("sc-domain:")) {
    return input;
  }

  if (!/^https?:\/\//i.test(input) && !input.includes("/")) {
    return `sc-domain:${input}`;
  }

  const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  url.hash = "";
  url.search = "";

  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }

  return url.toString();
}

function parseDateOnly(value) {
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error(`Expected YYYY-MM-DD date, got: ${value}`);
  }

  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

function getPacificToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

export function getDateWindows({
  today = getPacificToday(),
  days = DEFAULT_DAYS,
  dataLagDays = DEFAULT_DATA_LAG_DAYS,
} = {}) {
  const todayDate = parseDateOnly(today);
  const endDate = addDays(todayDate, -Number(dataLagDays));
  const startDate = addDays(endDate, -(Number(days) - 1));
  const previousEndDate = addDays(startDate, -1);
  const previousStartDate = addDays(previousEndDate, -(Number(days) - 1));

  return {
    current: {
      startDate: formatDateOnly(startDate),
      endDate: formatDateOnly(endDate),
    },
    previous: {
      startDate: formatDateOnly(previousStartDate),
      endDate: formatDateOnly(previousEndDate),
    },
  };
}

export function buildSearchAnalyticsRequest({
  startDate,
  endDate,
  dimensions = [],
  rowLimit = DEFAULT_ROW_LIMIT,
  pageFilter,
  queryFilter,
  countryFilter,
  deviceFilter,
  dataState = "final",
  type = "web",
}) {
  const filters = [];

  if (pageFilter) {
    filters.push({
      dimension: "page",
      operator: "equals",
      expression: pageFilter,
    });
  }

  if (queryFilter) {
    filters.push({
      dimension: "query",
      operator: "contains",
      expression: queryFilter,
    });
  }

  if (countryFilter) {
    filters.push({
      dimension: "country",
      operator: "equals",
      expression: countryFilter,
    });
  }

  if (deviceFilter) {
    filters.push({
      dimension: "device",
      operator: "equals",
      expression: deviceFilter,
    });
  }

  return {
    startDate,
    endDate,
    dimensions,
    rowLimit: Number(rowLimit),
    type,
    dataState,
    ...(filters.length
      ? {
          dimensionFilterGroups: [
            {
              groupType: "and",
              filters,
            },
          ],
        }
      : {}),
  };
}

export function classifyQueryOpportunity(row) {
  const impressions = Number(row?.impressions ?? 0);
  const ctr = Number(row?.ctr ?? 0);
  const position = Number(row?.position ?? 0);

  if (position > 0 && position <= 5 && impressions >= 1) {
    return "protect";
  }

  if (impressions >= 3 && position > 5 && position <= 20 && ctr < 0.05) {
    return "striking-distance-low-ctr";
  }

  if (impressions >= 3 && position > 20 && position <= 50) {
    return "content-gap";
  }

  if (impressions >= 3 && ctr < 0.005) {
    return "snippet-gap";
  }

  return "monitor";
}

export function getQuotaProjectFromConfigValues(rawQuotaProject, rawCoreProject) {
  const quotaProject = String(rawQuotaProject ?? "").trim();
  const coreProject = String(rawCoreProject ?? "").trim();
  const unsetValues = new Set(["", "(unset)", "None", "null"]);

  if (quotaProject === "CURRENT_PROJECT") {
    return unsetValues.has(coreProject) ? "" : coreProject;
  }

  if (!unsetValues.has(quotaProject)) {
    return quotaProject;
  }

  return unsetValues.has(coreProject) ? "" : coreProject;
}

export function buildSetupHint(message = "", quotaProject = "") {
  const reason = message ? `\n\nGoogle responded: ${message}` : "";
  const project = String(quotaProject || "YOUR_PROJECT_ID").trim();

  return `Search Console private data needs an OAuth token with the webmasters.readonly scope.${reason}

Run this once from the project machine, approve the browser prompt, set the quota project, then rerun the report:

gcloud auth application-default login --scopes=https://www.googleapis.com/auth/webmasters.readonly,https://www.googleapis.com/auth/cloud-platform
gcloud auth application-default set-quota-project ${project}
gcloud services enable searchconsole.googleapis.com --project=${project}
npm run analyze:gsc

The quota project must have Search Console API enabled and your Google account must have the serviceusage.services.use permission on it.
If the property still does not appear, make sure the same Google account has access to sc-domain:game4git.com in Search Console.`;
}

function parseArgs(argv) {
  const args = {
    siteUrl: process.env.GSC_SITE_URL || DEFAULT_SITE_URL,
    quotaProject: process.env.GSC_QUOTA_PROJECT || process.env.GOOGLE_CLOUD_QUOTA_PROJECT || "",
    outputDir: DEFAULT_OUTPUT_DIR,
    days: DEFAULT_DAYS,
    dataLagDays: DEFAULT_DATA_LAG_DAYS,
    rowLimit: DEFAULT_ROW_LIMIT,
    languageCode: DEFAULT_LANGUAGE_CODE,
    listSites: false,
    skipInspection: false,
    help: false,
    focusPages: [...DEFAULT_FOCUS_PAGES],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }

    if (token === "--site" && next) {
      args.siteUrl = next;
      index += 1;
      continue;
    }

    if (token.startsWith("--site=")) {
      args.siteUrl = token.split("=").slice(1).join("=");
      continue;
    }

    if (token === "--quota-project" && next) {
      args.quotaProject = next;
      index += 1;
      continue;
    }

    if (token.startsWith("--quota-project=")) {
      args.quotaProject = token.split("=").slice(1).join("=");
      continue;
    }

    if (token === "--output" && next) {
      args.outputDir = path.resolve(process.cwd(), next);
      index += 1;
      continue;
    }

    if (token.startsWith("--output=")) {
      args.outputDir = path.resolve(process.cwd(), token.split("=").slice(1).join("="));
      continue;
    }

    if (token === "--days" && next) {
      args.days = Number(next);
      index += 1;
      continue;
    }

    if (token.startsWith("--days=")) {
      args.days = Number(token.split("=")[1]);
      continue;
    }

    if (token === "--data-lag-days" && next) {
      args.dataLagDays = Number(next);
      index += 1;
      continue;
    }

    if (token.startsWith("--data-lag-days=")) {
      args.dataLagDays = Number(token.split("=")[1]);
      continue;
    }

    if (token === "--row-limit" && next) {
      args.rowLimit = Number(next);
      index += 1;
      continue;
    }

    if (token.startsWith("--row-limit=")) {
      args.rowLimit = Number(token.split("=")[1]);
      continue;
    }

    if (token === "--pages" && next) {
      args.focusPages = next.split(",").map(normalizeSiteUrl);
      index += 1;
      continue;
    }

    if (token.startsWith("--pages=")) {
      args.focusPages = token
        .split("=")
        .slice(1)
        .join("=")
        .split(",")
        .map(normalizeSiteUrl);
      continue;
    }

    if (token === "--list-sites") {
      args.listSites = true;
      continue;
    }

    if (token === "--skip-inspection") {
      args.skipInspection = true;
      continue;
    }
  }

  return args;
}

function printHelp() {
  console.log(`
Usage: npm run analyze:gsc -- [options]

Options:
  --site <siteUrl>        Search Console property. Default: ${DEFAULT_SITE_URL}
  --quota-project <id>    Google Cloud project for quota/billing attribution.
  --days <n>              Current and previous comparison window. Default: ${DEFAULT_DAYS}
  --data-lag-days <n>     Days to exclude for finalized GSC data. Default: ${DEFAULT_DATA_LAG_DAYS}
  --row-limit <n>         Row limit per Search Analytics query. Default: ${DEFAULT_ROW_LIMIT}
  --pages <csv>           Comma-separated canonical URLs to inspect and profile.
  --output <dir>          Output directory. Default: reports/gsc
  --list-sites            Only list Search Console properties visible to the token.
  --skip-inspection       Skip URL Inspection API calls.
  --help                  Show this message.

Environment:
  GSC_SITE_URL            Override default Search Console property.
  GSC_QUOTA_PROJECT       Override Google Cloud quota project.
  GOOGLE_CLOUD_QUOTA_PROJECT
                          Standard Google env var for quota project.
  GSC_ACCESS_TOKEN        Optional short-lived OAuth token with webmasters.readonly.

Auth setup:
  gcloud auth application-default login --scopes=https://www.googleapis.com/auth/webmasters.readonly,https://www.googleapis.com/auth/cloud-platform
  gcloud auth application-default set-quota-project YOUR_PROJECT_ID
  gcloud services enable searchconsole.googleapis.com --project=YOUR_PROJECT_ID
`);
}

function readGcloudConfigValue(name) {
  try {
    return execFileSync("gcloud", ["config", "get-value", name], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 10000,
    }).trim();
  } catch {
    return "";
  }
}

function getQuotaProject(explicitQuotaProject = "") {
  if (explicitQuotaProject) {
    return explicitQuotaProject.trim();
  }

  return getQuotaProjectFromConfigValues(
    readGcloudConfigValue("billing/quota_project"),
    readGcloudConfigValue("project")
  );
}

function getAccessToken(explicitQuotaProject = "") {
  const quotaProject = getQuotaProject(explicitQuotaProject);

  if (process.env.GSC_ACCESS_TOKEN) {
    return {
      source: "GSC_ACCESS_TOKEN",
      token: process.env.GSC_ACCESS_TOKEN.trim(),
      quotaProject,
    };
  }

  const attempts = [
    {
      source: "gcloud ADC",
      args: ["auth", "application-default", "print-access-token"],
    },
    {
      source: "gcloud user",
      args: ["auth", "print-access-token"],
    },
  ];

  const failures = [];

  for (const attempt of attempts) {
    try {
      const token = execFileSync("gcloud", attempt.args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 15000,
      }).trim();

      if (token) {
        return {
          source: attempt.source,
          token,
          quotaProject,
        };
      }
    } catch (error) {
      failures.push(`${attempt.source}: ${error.stderr?.toString().trim() || error.message}`);
    }
  }

  throw new Error(buildSetupHint(failures.join("\n"), quotaProject));
}

async function googleRequest(auth, url, { method = "GET", body } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${auth.token}`,
      ...(auth.quotaProject ? { "x-goog-user-project": auth.quotaProject } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    const message = payload?.error?.message || payload?.raw || `${response.status} ${response.statusText}`;
    throw new GoogleApiError(message, {
      status: response.status,
      payload,
    });
  }

  return payload ?? {};
}

function endpointFor(siteUrl, suffix) {
  return `${API_ROOT}/sites/${encodeURIComponent(siteUrl)}${suffix}`;
}

async function listSites(auth) {
  return googleRequest(auth, `${API_ROOT}/sites`);
}

async function querySearchAnalytics(auth, siteUrl, request) {
  return googleRequest(auth, endpointFor(siteUrl, "/searchAnalytics/query"), {
    method: "POST",
    body: request,
  });
}

async function listSitemaps(auth, siteUrl) {
  return googleRequest(auth, endpointFor(siteUrl, "/sitemaps"));
}

async function inspectUrl(auth, siteUrl, inspectionUrl, languageCode) {
  return googleRequest(auth, URL_INSPECTION_ENDPOINT, {
    method: "POST",
    body: {
      inspectionUrl,
      siteUrl,
      languageCode,
    },
  });
}

function firstRow(response) {
  return response?.rows?.[0] ?? {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
  };
}

function round(value, digits = 2) {
  if (!Number.isFinite(Number(value))) {
    return 0;
  }

  return Number(Number(value).toFixed(digits));
}

function percent(value) {
  return `${round(Number(value) * 100, 2)}%`;
}

function metricSummary(current, previous) {
  const currentRow = firstRow(current);
  const previousRow = firstRow(previous);

  return {
    clicks: round(currentRow.clicks, 0),
    clicksDelta: round(currentRow.clicks - previousRow.clicks, 0),
    impressions: round(currentRow.impressions, 0),
    impressionsDelta: round(currentRow.impressions - previousRow.impressions, 0),
    ctr: round(currentRow.ctr, 4),
    ctrDelta: round(currentRow.ctr - previousRow.ctr, 4),
    position: round(currentRow.position, 2),
    positionDelta: round(currentRow.position - previousRow.position, 2),
  };
}

function rowToRecord(row, dimensions) {
  const record = {
    clicks: round(row.clicks, 0),
    impressions: round(row.impressions, 0),
    ctr: round(row.ctr, 4),
    position: round(row.position, 2),
  };

  for (const [index, dimension] of dimensions.entries()) {
    record[dimension] = row.keys?.[index] ?? "";
  }

  if (dimensions.includes("query")) {
    record.opportunity = classifyQueryOpportunity(record);
  }

  return record;
}

function responseRows(response, dimensions) {
  return (response?.rows ?? []).map((row) => rowToRecord(row, dimensions));
}

function topRows(rows, limit = 10) {
  return rows.slice(0, limit);
}

function getOpportunityRows(rows) {
  return rows
    .filter((row) => ["striking-distance-low-ctr", "content-gap", "snippet-gap"].includes(row.opportunity))
    .sort((a, b) => {
      const aScore = Number(a.impressions) / Math.max(Number(a.position), 1);
      const bScore = Number(b.impressions) / Math.max(Number(b.position), 1);
      return bScore - aScore;
    })
    .slice(0, 25);
}

function getIndexStatus(inspection) {
  const result = inspection?.inspectionResult?.indexStatusResult;

  if (!result) {
    return {
      verdict: "UNKNOWN",
      coverageState: "No index status returned",
    };
  }

  return {
    verdict: result.verdict ?? "UNKNOWN",
    coverageState: result.coverageState ?? "UNKNOWN",
    indexingState: result.indexingState ?? "UNKNOWN",
    robotsTxtState: result.robotsTxtState ?? "UNKNOWN",
    pageFetchState: result.pageFetchState ?? "UNKNOWN",
    googleCanonical: result.googleCanonical ?? "",
    userCanonical: result.userCanonical ?? "",
    lastCrawlTime: result.lastCrawlTime ?? "",
  };
}

function buildRecommendations(report) {
  const recommendations = [];
  const overview = report.summary;

  if (overview.impressions > 0 && overview.ctr < 0.01) {
    recommendations.push("CTR total por debajo de 1%: priorizar titles/metas de las paginas con mas impresiones.");
  }

  if (overview.position > 10) {
    recommendations.push("Posicion media fuera del top 10: reforzar contenido principal, enlaces internos y bloques FAQ en queries con posicion 8-20.");
  }

  const lowCtrPages = report.pages
    .filter((page) => page.impressions >= 100 && page.ctr < 0.01)
    .slice(0, 5);

  for (const page of lowCtrPages) {
    recommendations.push(`Bajo CTR en ${page.page}: revisar title, description y primer H1 segun la query dominante.`);
  }

  for (const item of report.indexInspection) {
    const status = item.status;
    if (!["PASS", "VERDICT_UNSPECIFIED"].includes(status.verdict)) {
      recommendations.push(`Inspeccion ${item.url}: ${status.coverageState}. Revisar canonical, robots y pedir recrawl si ya esta corregido.`);
    }
  }

  if (report.opportunities.length > 0) {
    recommendations.push("Crear una cola semanal con las queries 'striking-distance-low-ctr': son las mas cercanas a ganar clicks con cambios de snippet/contenido.");
  }

  return [...new Set(recommendations)].slice(0, 12);
}

function table(headers, rows) {
  if (!rows.length) {
    return "_No data._";
  }

  const header = `| ${headers.join(" |")} |`;
  const separator = `| ${headers.map(() => "---").join(" |")} |`;
  const body = rows.map((row) => `| ${row.join(" |")} |`);
  return [header, separator, ...body].join("\n");
}

function renderMarkdown(report) {
  const overviewRows = [
    ["Clicks", report.summary.clicks, signed(report.summary.clicksDelta)],
    ["Impressions", report.summary.impressions, signed(report.summary.impressionsDelta)],
    ["CTR", percent(report.summary.ctr), signedPercent(report.summary.ctrDelta)],
    ["Avg position", report.summary.position, signed(report.summary.positionDelta, true)],
  ];

  const deviceRows = topRows(report.devices, 10).map((row) => [
    row.device,
    row.clicks,
    row.impressions,
    percent(row.ctr),
    row.position,
  ]);

  const pageRows = topRows(report.pages, 20).map((row) => [
    row.page,
    row.clicks,
    row.impressions,
    percent(row.ctr),
    row.position,
  ]);

  const queryRows = topRows(report.queries, 30).map((row) => [
    escapeCell(row.query),
    row.clicks,
    row.impressions,
    percent(row.ctr),
    row.position,
    row.opportunity,
  ]);

  const opportunityRows = report.opportunities.map((row) => [
    escapeCell(row.query),
    row.clicks,
    row.impressions,
    percent(row.ctr),
    row.position,
    row.opportunity,
  ]);

  const inspectionRows = report.indexInspection.map((item) => [
    item.url,
    item.status.verdict,
    escapeCell(item.status.coverageState),
    item.status.indexingState,
    item.status.robotsTxtState,
    item.status.lastCrawlTime || "-",
  ]);

  return `# Google Search Console Report

- Site: \`${report.siteUrl}\`
- Current window: ${report.windows.current.startDate} to ${report.windows.current.endDate}
- Previous window: ${report.windows.previous.startDate} to ${report.windows.previous.endDate}
- Generated: ${report.generatedAt}
- Auth source: ${report.authSource}
- Quota project: ${report.quotaProject || "not set"}

## Overview

${table(["Metric", "Current", "Delta"], overviewRows)}

## Devices

${table(["Device", "Clicks", "Impressions", "CTR", "Position"], deviceRows)}

## Top Pages

${table(["Page", "Clicks", "Impressions", "CTR", "Position"], pageRows)}

## Top Queries

${table(["Query", "Clicks", "Impressions", "CTR", "Position", "Opportunity"], queryRows)}

## Opportunities

${table(["Query", "Clicks", "Impressions", "CTR", "Position", "Opportunity"], opportunityRows)}

## URL Inspection

${table(["URL", "Verdict", "Coverage", "Indexing", "Robots", "Last crawl"], inspectionRows)}

## Recommendations

${report.recommendations.length ? report.recommendations.map((item) => `- ${item}`).join("\n") : "_No prioritized recommendations._"}
`;
}

function escapeCell(value) {
  return String(value ?? "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function signed(value, lowerIsBetter = false) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric === 0) {
    return "0";
  }

  const prefix = numeric > 0 ? "+" : "";
  const suffix = lowerIsBetter ? (numeric < 0 ? " (better)" : " (worse)") : "";
  return `${prefix}${round(numeric, 2)}${suffix}`;
}

function signedPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric === 0) {
    return "0%";
  }

  const prefix = numeric > 0 ? "+" : "";
  return `${prefix}${round(numeric * 100, 2)}%`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function buildReport({ auth, args }) {
  const siteUrl = normalizeSiteUrl(args.siteUrl);
  const windows = getDateWindows({
    days: args.days,
    dataLagDays: args.dataLagDays,
  });

  const currentBase = {
    startDate: windows.current.startDate,
    endDate: windows.current.endDate,
    rowLimit: args.rowLimit,
  };
  const previousBase = {
    startDate: windows.previous.startDate,
    endDate: windows.previous.endDate,
    rowLimit: args.rowLimit,
  };

  const [
    sites,
    overviewCurrent,
    overviewPrevious,
    byDate,
    byPage,
    byQuery,
    byDevice,
    byCountry,
    byAppearance,
    pageQuery,
    sitemaps,
  ] = await Promise.all([
    listSites(auth),
    querySearchAnalytics(auth, siteUrl, buildSearchAnalyticsRequest(currentBase)),
    querySearchAnalytics(auth, siteUrl, buildSearchAnalyticsRequest(previousBase)),
    querySearchAnalytics(auth, siteUrl, buildSearchAnalyticsRequest({ ...currentBase, dimensions: ["date"], rowLimit: args.days })),
    querySearchAnalytics(auth, siteUrl, buildSearchAnalyticsRequest({ ...currentBase, dimensions: ["page"] })),
    querySearchAnalytics(auth, siteUrl, buildSearchAnalyticsRequest({ ...currentBase, dimensions: ["query"] })),
    querySearchAnalytics(auth, siteUrl, buildSearchAnalyticsRequest({ ...currentBase, dimensions: ["device"] })),
    querySearchAnalytics(auth, siteUrl, buildSearchAnalyticsRequest({ ...currentBase, dimensions: ["country"] })),
    querySearchAnalytics(auth, siteUrl, buildSearchAnalyticsRequest({ ...currentBase, dimensions: ["searchAppearance"] })),
    querySearchAnalytics(auth, siteUrl, buildSearchAnalyticsRequest({ ...currentBase, dimensions: ["page", "query"], rowLimit: Math.max(args.rowLimit, 1000) })),
    listSitemaps(auth, siteUrl).catch((error) => ({
      error: error.message,
    })),
  ]);

  const focusPageReports = [];
  for (const page of args.focusPages) {
    const normalizedPage = normalizeSiteUrl(page);
    const queries = await querySearchAnalytics(
      auth,
      siteUrl,
      buildSearchAnalyticsRequest({
        ...currentBase,
        dimensions: ["query"],
        pageFilter: normalizedPage,
        rowLimit: 50,
      })
    );

    focusPageReports.push({
      page: normalizedPage,
      queries: responseRows(queries, ["query"]),
    });
  }

  const indexInspection = [];
  if (!args.skipInspection) {
    for (const page of args.focusPages) {
      const url = normalizeSiteUrl(page);
      try {
        const inspection = await inspectUrl(auth, siteUrl, url, args.languageCode);
        indexInspection.push({
          url,
          status: getIndexStatus(inspection),
          raw: inspection,
        });
      } catch (error) {
        indexInspection.push({
          url,
          status: {
            verdict: "ERROR",
            coverageState: error.message,
          },
          raw: error.payload ?? null,
        });
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    siteUrl,
    authSource: auth.source,
    quotaProject: auth.quotaProject || "",
    windows,
    visibleSites: sites.siteEntry ?? [],
    sitemaps,
    summary: metricSummary(overviewCurrent, overviewPrevious),
    daily: responseRows(byDate, ["date"]),
    pages: responseRows(byPage, ["page"]),
    queries: responseRows(byQuery, ["query"]),
    devices: responseRows(byDevice, ["device"]),
    countries: responseRows(byCountry, ["country"]),
    appearances: responseRows(byAppearance, ["searchAppearance"]),
    pageQueries: responseRows(pageQuery, ["page", "query"]),
    focusPages: focusPageReports,
    indexInspection,
    opportunities: getOpportunityRows(responseRows(byQuery, ["query"])),
  };

  report.recommendations = buildRecommendations(report);
  return report;
}

function writeReport(report, outputDir) {
  ensureDir(outputDir);
  const timestamp = report.generatedAt.replace(/[:.]/g, "-");
  const runDir = path.join(outputDir, timestamp);
  ensureDir(runDir);

  const json = JSON.stringify(report, null, 2);
  const markdown = renderMarkdown(report);

  fs.writeFileSync(path.join(runDir, "report.json"), json);
  fs.writeFileSync(path.join(runDir, "summary.md"), markdown);
  fs.writeFileSync(path.join(outputDir, "latest.json"), json);
  fs.writeFileSync(path.join(outputDir, "latest.md"), markdown);

  return {
    runDir,
    latestJson: path.join(outputDir, "latest.json"),
    latestMarkdown: path.join(outputDir, "latest.md"),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const auth = getAccessToken(args.quotaProject);

  try {
    if (args.listSites) {
      const sites = await listSites(auth);
      const entries = sites.siteEntry ?? [];
      if (!entries.length) {
        console.log("No Search Console properties visible to this token.");
        return;
      }

      for (const entry of entries) {
        console.log(`${entry.siteUrl}\t${entry.permissionLevel}`);
      }
      return;
    }

    const report = await buildReport({
      auth,
      args,
    });
    const paths = writeReport(report, args.outputDir);

    console.log(`GSC report written: ${paths.latestMarkdown}`);
    console.log(
      `Clicks ${report.summary.clicks} (${signed(report.summary.clicksDelta)}), impressions ${report.summary.impressions} (${signed(report.summary.impressionsDelta)}), CTR ${percent(report.summary.ctr)}, position ${report.summary.position}`
    );
    console.log(`Opportunities: ${report.opportunities.length}`);
  } catch (error) {
    if (error instanceof GoogleApiError && [401, 403].includes(error.status)) {
      throw new Error(buildSetupHint(error.message, auth.quotaProject));
    }

    throw error;
  }
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
