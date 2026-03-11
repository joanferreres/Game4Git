#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const API_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const DEFAULT_CONFIG_PATH = path.join(process.cwd(), "pagespeed.config.json");
const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), "reports", "pagespeed");
const DEFAULT_STRATEGIES = ["mobile", "desktop"];
const DEFAULT_CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

const CATEGORY_LABELS = {
  performance: "Performance",
  accessibility: "Accessibility",
  "best-practices": "Best Practices",
  seo: "SEO",
};

const LAB_METRIC_AUDITS = [
  ["first-contentful-paint", "FCP"],
  ["largest-contentful-paint", "LCP"],
  ["speed-index", "Speed Index"],
  ["total-blocking-time", "TBT"],
  ["cumulative-layout-shift", "CLS"],
  ["interaction-to-next-paint", "INP"],
];

const FIELD_METRIC_KEYS = [
  ["LARGEST_CONTENTFUL_PAINT_MS", "LCP"],
  ["INTERACTION_TO_NEXT_PAINT", "INP"],
  ["CUMULATIVE_LAYOUT_SHIFT_SCORE", "CLS"],
  ["FIRST_CONTENTFUL_PAINT_MS", "FCP"],
  ["FIRST_INPUT_DELAY_MS", "FID"],
];

function printHelp() {
  console.log(`
Usage: npm run analyze:pagespeed -- [options]

Options:
  --config <path>      Path to config JSON. Default: pagespeed.config.json
  --output <dir>       Output directory. Default: reports/pagespeed
  --strategy <value>   mobile, desktop or all. Default: config value or all
  --locale <value>     Override locale passed to PageSpeed API
  --help               Show this message

Environment:
  PAGESPEED_API_KEY    Optional Google PageSpeed Insights API key

Output:
  reports/pagespeed/latest.json
  reports/pagespeed/latest.md
  reports/pagespeed/<timestamp>/report.json
  reports/pagespeed/<timestamp>/summary.md
`);
}

function parseArgs(argv) {
  const args = {
    config: DEFAULT_CONFIG_PATH,
    output: DEFAULT_OUTPUT_DIR,
    strategy: null,
    locale: null,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }

    if (token === "--config" && argv[index + 1]) {
      args.config = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
      continue;
    }

    if (token.startsWith("--config=")) {
      args.config = path.resolve(process.cwd(), token.split("=")[1]);
      continue;
    }

    if (token === "--output" && argv[index + 1]) {
      args.output = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
      continue;
    }

    if (token.startsWith("--output=")) {
      args.output = path.resolve(process.cwd(), token.split("=")[1]);
      continue;
    }

    if (token === "--strategy" && argv[index + 1]) {
      args.strategy = argv[index + 1];
      index += 1;
      continue;
    }

    if (token.startsWith("--strategy=")) {
      args.strategy = token.split("=")[1];
      continue;
    }

    if (token === "--locale" && argv[index + 1]) {
      args.locale = argv[index + 1];
      index += 1;
      continue;
    }

    if (token.startsWith("--locale=")) {
      args.locale = token.split("=")[1];
    }
  }

  return args;
}

function readConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing config file: ${configPath}`);
  }

  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeStrategies(rawStrategy, configStrategies) {
  if (rawStrategy && rawStrategy !== "all") {
    return rawStrategy
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (Array.isArray(configStrategies) && configStrategies.length > 0) {
    return configStrategies;
  }

  return DEFAULT_STRATEGIES;
}

function normalizeCategories(configCategories) {
  if (Array.isArray(configCategories) && configCategories.length > 0) {
    return configCategories;
  }

  return DEFAULT_CATEGORIES;
}

function scoreToPercent(score) {
  if (typeof score !== "number") {
    return null;
  }

  return Math.round(score * 100);
}

function getAuditMetric(audits, auditId) {
  const audit = audits?.[auditId];

  if (!audit) {
    return null;
  }

  return {
    label: audit.title ?? auditId,
    displayValue: audit.displayValue ?? "n/a",
    numericValue: typeof audit.numericValue === "number" ? audit.numericValue : null,
    score: typeof audit.score === "number" ? audit.score : null,
  };
}

function getFieldMetric(metrics, key) {
  const metric = metrics?.[key];

  if (!metric) {
    return null;
  }

  return {
    percentile: metric.percentile ?? null,
    category: metric.category ?? null,
  };
}

function formatFieldMetric(metric) {
  if (!metric) {
    return "n/a";
  }

  return `${metric.percentile ?? "n/a"} (${metric.category ?? "n/a"})`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractResult(data, requestedUrl, strategy) {
  const lighthouse = data.lighthouseResult ?? {};
  const categories = lighthouse.categories ?? {};
  const audits = lighthouse.audits ?? {};
  const seoAuditRefs = categories.seo?.auditRefs ?? [];

  const scores = {
    performance: scoreToPercent(categories.performance?.score),
    accessibility: scoreToPercent(categories.accessibility?.score),
    bestPractices: scoreToPercent(categories["best-practices"]?.score),
    seo: scoreToPercent(categories.seo?.score),
  };

  const labMetrics = Object.fromEntries(
    LAB_METRIC_AUDITS.map(([auditId, label]) => [label, getAuditMetric(audits, auditId)])
  );

  const topOpportunities = Object.entries(audits)
    .filter(([, audit]) => audit?.details?.type === "opportunity" && typeof audit.numericValue === "number")
    .sort(([, left], [, right]) => right.numericValue - left.numericValue)
    .slice(0, 5)
    .map(([auditId, audit]) => ({
      id: auditId,
      title: audit.title ?? auditId,
      displayValue: audit.displayValue ?? "n/a",
      numericValue: audit.numericValue ?? null,
    }));

  const failedSeoAudits = seoAuditRefs
    .map((reference) => audits[reference.id])
    .filter((audit) => audit && typeof audit.score === "number" && audit.score < 1 && audit.scoreDisplayMode !== "notApplicable")
    .map((audit) => ({
      title: audit.title,
      description: audit.description ?? "",
      displayValue: audit.displayValue ?? "n/a",
      score: audit.score,
    }));

  return {
    status: "ok",
    requestedUrl,
    finalUrl: lighthouse.finalDisplayedUrl ?? requestedUrl,
    strategy,
    fetchedAt: new Date().toISOString(),
    lighthouseVersion: lighthouse.lighthouseVersion ?? null,
    scores,
    labMetrics,
    fieldData: {
      overallCategory: data.loadingExperience?.overall_category ?? null,
      metrics: Object.fromEntries(
        FIELD_METRIC_KEYS.map(([key, label]) => [label, getFieldMetric(data.loadingExperience?.metrics, key)])
      ),
    },
    originFieldData: {
      overallCategory: data.originLoadingExperience?.overall_category ?? null,
      metrics: Object.fromEntries(
        FIELD_METRIC_KEYS.map(([key, label]) => [label, getFieldMetric(data.originLoadingExperience?.metrics, key)])
      ),
    },
    topOpportunities,
    failedSeoAudits,
  };
}

async function runPageSpeed({ url, strategy, categories, locale, apiKey }) {
  const params = new URLSearchParams({
    url,
    strategy,
  });

  for (const category of categories) {
    params.append("category", category);
  }

  if (locale) {
    params.set("locale", locale);
  }

  if (apiKey) {
    params.set("key", apiKey);
  }

  const response = await fetch(`${API_ENDPOINT}?${params.toString()}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PageSpeed API ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  return extractResult(data, url, strategy);
}

function buildMarkdown(summary) {
  const lines = [
    "# PageSpeed Report",
    "",
    `Generated at: ${summary.generatedAt}`,
    `Config: ${summary.configPath}`,
    `Strategies: ${summary.strategies.join(", ")}`,
    `Categories: ${summary.categories.join(", ")}`,
    "",
  ];

  for (const result of summary.results) {
    lines.push(`## ${result.requestedUrl} | ${result.strategy}`);
    lines.push("");

    if (result.status === "error") {
      lines.push(`Error: ${result.error}`);
      lines.push("");
      continue;
    }

    lines.push(
      `Scores: Performance ${result.scores.performance ?? "n/a"} | Accessibility ${result.scores.accessibility ?? "n/a"} | Best Practices ${result.scores.bestPractices ?? "n/a"} | SEO ${result.scores.seo ?? "n/a"}`
    );
    lines.push("");
    lines.push("Lab metrics:");

    for (const [, label] of LAB_METRIC_AUDITS) {
      const metric = result.labMetrics[label];
      lines.push(`- ${label}: ${metric?.displayValue ?? "n/a"}`);
    }

    lines.push("");
    lines.push(
      `Field data: URL ${result.fieldData.overallCategory ?? "n/a"} | Origin ${result.originFieldData.overallCategory ?? "n/a"}`
    );
    lines.push(
      `Field metrics: LCP ${formatFieldMetric(result.fieldData.metrics.LCP)} | INP ${formatFieldMetric(result.fieldData.metrics.INP)} | CLS ${formatFieldMetric(result.fieldData.metrics.CLS)}`
    );
    lines.push("");

    if (result.topOpportunities.length > 0) {
      lines.push("Top opportunities:");

      for (const opportunity of result.topOpportunities) {
        lines.push(`- ${opportunity.title}: ${opportunity.displayValue}`);
      }

      lines.push("");
    }

    if (result.failedSeoAudits.length > 0) {
      lines.push("SEO audits to review:");

      for (const audit of result.failedSeoAudits) {
        lines.push(`- ${audit.title}: ${audit.displayValue}`);
      }

      lines.push("");
    }
  }

  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const config = readConfig(args.config);
  const urls = Array.isArray(config.urls) ? config.urls : [];
  const strategies = normalizeStrategies(args.strategy, config.strategies);
  const categories = normalizeCategories(config.categories);
  const locale = args.locale ?? config.locale ?? "en_US";
  const apiKey = process.env.PAGESPEED_API_KEY ?? "";

  if (urls.length === 0) {
    throw new Error("No URLs configured in pagespeed.config.json");
  }

  ensureDir(args.output);

  const results = [];
  let hasErrors = false;

  for (const url of urls) {
    for (const strategy of strategies) {
      process.stdout.write(`Running PageSpeed for ${url} [${strategy}]...\n`);

      try {
        const result = await runPageSpeed({
          url,
          strategy,
          categories,
          locale,
          apiKey,
        });

        results.push(result);
      } catch (error) {
        hasErrors = true;
        results.push({
          status: "error",
          requestedUrl: url,
          strategy,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  const timestamp = new Date().toISOString().replace(/[:]/g, "-");
  const batchDir = path.join(args.output, timestamp);
  const summary = {
    generatedAt: new Date().toISOString(),
    configPath: args.config,
    outputDir: args.output,
    strategies,
    categories,
    locale,
    urls,
    results,
  };

  ensureDir(batchDir);

  fs.writeFileSync(path.join(batchDir, "report.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(batchDir, "summary.md"), buildMarkdown(summary));
  fs.writeFileSync(path.join(args.output, "latest.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(args.output, "latest.md"), buildMarkdown(summary));

  process.stdout.write(`Saved report to ${path.join(batchDir, "report.json")}\n`);
  process.stdout.write(`Saved summary to ${path.join(batchDir, "summary.md")}\n`);
  process.stdout.write(`Updated latest files in ${args.output}\n`);

  if (hasErrors) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
