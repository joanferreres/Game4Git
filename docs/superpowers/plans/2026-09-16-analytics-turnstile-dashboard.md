# Analytics Turnstile + Professional Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify pageviews with invisible Cloudflare Turnstile (fail-open → `verified` flag) and rebuild `/admin/` into a professional analytics dashboard with dual timelines, map, period compare, and filters.

**Architecture:** New Turnstile widget for Game4Git domains; client obtains tokens before `POST /api/analytics/track`; Worker siteverify sets `analytics_events.verified`; stats API filters verified-by-default and adds compare/heatmap/hourly; AdminStats uses Recharts + a lightweight country choropleth.

**Tech Stack:** Cloudflare Workers + D1, React 18 + TypeScript + Vite, Turnstile invisible widget, Recharts, compact TopoJSON choropleth (`world-atlas` + `topojson-client`), existing shadcn/ui + i18n.

## Global Constraints

- Fail-open: missing/invalid Turnstile never blocks track HTTP success; store `verified=0`.
- Track must NOT return 403 for Turnstile failures.
- Historical rows stay `verified=0` (DEFAULT after migration).
- Dashboard default: verified-only (`includeUnverified` off).
- Do not rework `analytics_daily` aggregation in this plan.
- Do not use the existing `joanferreres-visit` widget (wrong domains).
- Production `TURNSTILE_HOSTNAMES` must not include `localhost` / `127.0.0.1`.
- Siteverify action must equal `analytics`.
- Visual language: dense professional analytics; accent sparingly with `#f05133`; avoid purple-glow AI defaults.
- Prefer contract tests in `scripts/*.test.mjs` (project pattern); run with `node scripts/<file>.mjs`.
- Never print Turnstile secrets in chat/logs; store via `wrangler secret put` / `.dev.vars` (gitignored).
- Spec: `docs/superpowers/specs/2026-09-16-analytics-turnstile-dashboard-design.md`.

---

## File Map

| File | Responsibility |
|------|----------------|
| `migrations/0002_analytics_verified.sql` | Add `verified` column + index |
| `src/lib/turnstile.ts` | Client: load script, render invisible widget, getToken, reset |
| `src/hooks/useAnalytics.ts` | Attach token to track payload; timeout fail-open |
| `src/components/AnalyticsTracker.tsx` | Mount Turnstile host + tracking hook |
| `src/worker.ts` | Env, siteverify helper, verified insert, stats query filters |
| `src/pages/AdminStats.tsx` | Dashboard UI + fetch query params |
| `src/components/admin/stats/*` | Chart/map subcomponents (split from giant page) |
| `src/i18n/locales/{es,en,ca,fr}.json` | New adminStats strings |
| `scripts/analytics-contract.test.mjs` | Track + Turnstile + verified contracts |
| `scripts/admin-stats-data.test.mjs` | Stats API + UI contracts |
| `scripts/turnstile-verify.test.mjs` | Pure helper logic for siteverify decision (optional extract) |
| `.dev.vars` / Worker secrets | `TURNSTILE_SECRET`, `TURNSTILE_HOSTNAMES` |
| `.env` / build env | `VITE_TURNSTILE_SITE_KEY` |
| `package.json` | Add `recharts`, `topojson-client`, `world-atlas` |

---

### Task 1: Provision Turnstile widget + local/prod secrets

**Files:**
- Modify: `.dev.vars` (gitignored)
- Modify: `.env` (gitignored) — add `VITE_TURNSTILE_SITE_KEY`
- Create if missing: `.env.example` with placeholder keys only (no secrets)
- Cloudflare: new widget via API/dashboard

**Interfaces:**
- Consumes: Cloudflare account with Turnstile edit permission
- Produces: sitekey string for client; `TURNSTILE_SECRET` in Worker; `TURNSTILE_HOSTNAMES` string

- [ ] **Step 1: Create invisible widget**

Create widget named `game4git-analytics`, mode `invisible`, domains:
`localhost`, `127.0.0.1`, `game4git.com`, `www.game4git.com`.

Prefer Cloudflare MCP `execute` against `POST /accounts/{account_id}/challenges/widgets` or Turnstile Spin scripts. Record **sitekey only** in the PR/docs notes — never paste the secret into chat.

- [ ] **Step 2: Write local secrets**

Append to `.dev.vars` (do not commit):

```bash
TURNSTILE_SECRET=<from widget>
TURNSTILE_HOSTNAMES=localhost,127.0.0.1,game4git.com,www.game4git.com
```

Append to `.env`:

```bash
VITE_TURNSTILE_SITE_KEY=<sitekey>
```

Ensure `.gitignore` already ignores `.dev.vars` and `.env`.

- [ ] **Step 3: Create `.env.example` placeholders**

```bash
# SHA-256 hash of the admin panel password (optional local notes)
VITE_ADMIN_PASSWORD_HASH=

# Turnstile sitekey (public)
VITE_TURNSTILE_SITE_KEY=

# Optional Sentry
VITE_SENTRY_DSN=
```

- [ ] **Step 4: Put production Worker secrets**

```bash
printf '%s' "$TURNSTILE_SECRET" | npx wrangler secret put TURNSTILE_SECRET
printf '%s' 'game4git.com,www.game4git.com' | npx wrangler secret put TURNSTILE_HOSTNAMES
```

(Or set `TURNSTILE_HOSTNAMES` as a plain var in `wrangler.jsonc` `vars` if preferred — secret still required for `TURNSTILE_SECRET`.)

- [ ] **Step 5: Smoke-check siteverify with dummy token**

```bash
curl -sS https://challenges.cloudflare.com/turnstile/v0/siteverify \
  -d "secret=$TURNSTILE_SECRET" \
  -d "response=XXXX.DUMMY.TOKEN.XXXX" | head -c 400
```

Expected JSON includes `"success":false` and `"invalid-input-response"` (proves secret accepted).

- [ ] **Step 6: Commit only tracked non-secret files**

```bash
git add .env.example
git commit -m "$(cat <<'EOF'
chore: document Turnstile sitekey env placeholder

EOF
)"
```

---

### Task 2: D1 migration for `verified`

**Files:**
- Create: `migrations/0002_analytics_verified.sql`
- Test: `scripts/analytics-contract.test.mjs` (extend in Task 3; here add migration file assert)

**Interfaces:**
- Produces: column `analytics_events.verified INTEGER NOT NULL DEFAULT 0` + index `idx_events_verified`

- [ ] **Step 1: Write migration**

```sql
-- migrations/0002_analytics_verified.sql
ALTER TABLE analytics_events ADD COLUMN verified INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_events_verified ON analytics_events(verified);
```

- [ ] **Step 2: Apply locally and remotely**

```bash
npx wrangler d1 migrations apply game4git-analytics --local
npx wrangler d1 migrations apply game4git-analytics --remote
```

Expected: migration applied; existing rows remain `verified=0`.

- [ ] **Step 3: Commit**

```bash
git add migrations/0002_analytics_verified.sql
git commit -m "$(cat <<'EOF'
feat(analytics): add verified column for Turnstile-backed events

EOF
)"
```

---

### Task 3: Worker siteverify helper + persist `verified`

**Files:**
- Modify: `src/worker.ts` (`Env`, `logAnalyticsEvent`, `handleAnalyticsTrack`)
- Create: `scripts/turnstile-verify.test.mjs` (string-contract / pure logic if helper exported — prefer inline helper + contract asserts in analytics test)
- Modify: `scripts/analytics-contract.test.mjs`

**Interfaces:**
- Consumes: `env.TURNSTILE_SECRET`, `env.TURNSTILE_HOSTNAMES`
- Produces:
  - `async function verifyTurnstileToken(opts: { token: string | undefined; secret: string; hostnames: string; ip: string | null; expectedAction: string }): Promise<boolean>`
  - `logAnalyticsEvent(..., verified: boolean)`
  - Track body may include `turnstileToken?: string`

- [ ] **Step 1: Extend failing contract tests**

Append to `scripts/analytics-contract.test.mjs`:

```js
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
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
node scripts/analytics-contract.test.mjs
```

Expected: FAIL on missing Turnstile / verified markers.

- [ ] **Step 3: Extend `Env` and add helper in `src/worker.ts`**

```ts
type Env = {
  ASSETS: AssetBinding;
  ANALYTICS_DB: D1Database;
  ADMIN_PASSWORD_HASH: string;
  SESSION_SECRET: string;
  TURNSTILE_SECRET: string;
  TURNSTILE_HOSTNAMES: string;
};

async function verifyTurnstileToken(opts: {
  token: string | undefined;
  secret: string;
  hostnamesCsv: string;
  ip: string | null;
  expectedAction: string;
}): Promise<boolean> {
  const { token, secret, hostnamesCsv, ip, expectedAction } = opts;
  if (!secret) return false;
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) return false;

  const expectedHostnames = new Set(
    hostnamesCsv.split(",").map((h) => h.trim()).filter(Boolean)
  );
  if (expectedHostnames.size === 0) return false;

  let result: {
    success?: boolean;
    action?: string;
    hostname?: string;
  };
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) return false;
    result = await r.json();
  } catch {
    return false;
  }

  return (
    result.success === true &&
    result.action === expectedAction &&
    typeof result.hostname === "string" &&
    expectedHostnames.has(result.hostname)
  );
}
```

- [ ] **Step 4: Persist `verified` in `logAnalyticsEvent`**

Update INSERT to include `verified` column and bind `event.verified ? 1 : 0`.

- [ ] **Step 5: Wire `handleAnalyticsTrack`**

```ts
let body: {
  path: string;
  referrer?: string;
  utm?: Record<string, string | null>;
  turnstileToken?: string;
};
// ...parse...

const clientIp =
  request.headers.get("CF-Connecting-IP") ||
  request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
  null;

const verified = await verifyTurnstileToken({
  token: body.turnstileToken,
  secret: env.TURNSTILE_SECRET,
  hostnamesCsv: env.TURNSTILE_HOSTNAMES || "",
  ip: clientIp,
  expectedAction: "analytics",
});

await logAnalyticsEvent(env.ANALYTICS_DB, { ..., isAdmin, verified });
```

Do **not** change the success Response on failed verification.

- [ ] **Step 6: Re-run contract test — expect PASS**

```bash
node scripts/analytics-contract.test.mjs
```

- [ ] **Step 7: Commit**

```bash
git add src/worker.ts scripts/analytics-contract.test.mjs
git commit -m "$(cat <<'EOF'
feat(analytics): verify Turnstile tokens and store verified flag

EOF
)"
```

---

### Task 4: Client invisible Turnstile + track token

**Files:**
- Create: `src/lib/turnstile.ts`
- Modify: `src/hooks/useAnalytics.ts`
- Modify: `src/components/AnalyticsTracker.tsx`
- Modify: `index.html` or load script dynamically in `turnstile.ts` (prefer dynamic load)

**Interfaces:**
- Consumes: `import.meta.env.VITE_TURNSTILE_SITE_KEY`
- Produces:
  - `ensureTurnstile(): Promise<void>`
  - `getTurnstileToken(action: string, timeoutMs?: number): Promise<string | null>`
  - `resetTurnstile(): void`
  - `sendAnalyticsEvent` body includes `turnstileToken` when available

- [ ] **Step 1: Implement `src/lib/turnstile.ts`**

```ts
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      execute: (widgetId: string, opts?: Record<string, unknown>) => void;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      ready: (cb: () => void) => void;
    };
  }
}

let widgetId: string | null = null;
let hostEl: HTMLDivElement | null = null;
let scriptPromise: Promise<void> | null = null;

function siteKey(): string {
  return (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) || "";
}

export function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src^="https://challenges.cloudflare.com/turnstile"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile script")));
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile script"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export async function ensureTurnstileWidget(): Promise<void> {
  const key = siteKey();
  if (!key) return;
  try {
    await loadTurnstileScript();
  } catch {
    return;
  }
  if (!window.turnstile || widgetId) return;
  hostEl = document.createElement("div");
  hostEl.style.display = "none";
  document.body.appendChild(hostEl);
  widgetId = window.turnstile.render(hostEl, {
    sitekey: key,
    size: "invisible",
    appearance: "interaction-only",
  });
}

export function getTurnstileToken(action = "analytics", timeoutMs = 4000): Promise<string | null> {
  return new Promise((resolve) => {
    const key = siteKey();
    if (!key || !window.turnstile || !widgetId) {
      resolve(null);
      return;
    }
    let settled = false;
    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, timeoutMs);

    window.turnstile.execute(widgetId, {
      action,
      callback: (token: string) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(token || null);
      },
      "error-callback": () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(null);
      },
      "timeout-callback": () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(null);
      },
    });
  });
}

export function resetTurnstile(): void {
  if (window.turnstile && widgetId) {
    try {
      window.turnstile.reset(widgetId);
    } catch {
      /* ignore */
    }
  }
}
```

Adjust exact Turnstile execute/render API to match current invisible/explicit docs if the runtime differs — keep timeout fail-open.

- [ ] **Step 2: Update `sendAnalyticsEvent` in `useAnalytics.ts`**

```ts
import { ensureTurnstileWidget, getTurnstileToken, resetTurnstile } from "@/lib/turnstile";

async function sendAnalyticsEvent(path: string): Promise<void> {
  try {
    await ensureTurnstileWidget();
    const turnstileToken = await getTurnstileToken("analytics", 4000);
    const utm = extractUtmParams();
    const referrer = getReferrer();
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, referrer, utm, turnstileToken }),
      credentials: "include",
    });
  } catch (e) {
    console.debug("Analytics tracking failed:", e);
  } finally {
    resetTurnstile();
  }
}
```

- [ ] **Step 3: Mount ensure on `AnalyticsTracker`**

```tsx
import { useEffect } from "react";
import { useAnalyticsTracking } from "@/hooks/useAnalytics";
import { ensureTurnstileWidget } from "@/lib/turnstile";

export function AnalyticsTracker() {
  useAnalyticsTracking();
  useEffect(() => {
    void ensureTurnstileWidget();
  }, []);
  return null;
}
```

- [ ] **Step 4: Manual local check**

```bash
npm run cf:dev
# open site, navigate pages, confirm Network POST /api/analytics/track includes turnstileToken when sitekey set
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/turnstile.ts src/hooks/useAnalytics.ts src/components/AnalyticsTracker.tsx
git commit -m "$(cat <<'EOF'
feat(analytics): attach invisible Turnstile tokens to pageview tracking

EOF
)"
```

---

### Task 5: Extend `/api/admin/stats` (filters, hourly, compare, heatmap, verification)

**Files:**
- Modify: `src/worker.ts` (`handleAdminStats`)
- Modify: `scripts/admin-stats-data.test.mjs`

**Interfaces:**
- Query params: `range`, `includeUnverified`, `path`, `country`, `compare`
- Response adds: `verification`, `heatmap`, optional `comparison`, timeline supports hourly labels for `24h`

- [ ] **Step 1: Failing contracts in `scripts/admin-stats-data.test.mjs`**

```js
assert.match(worker, /includeUnverified/);
assert.match(worker, /verified\s*=\s*1|AND verified = 1|verified = \?/);
assert.match(worker, /heatmap/);
assert.match(worker, /verification/);
assert.match(worker, /strftime\('\%Y-\%m-\%d \%H'|\%Y-\%m-%dT\%H|hour/);
assert.match(dashboard, /includeUnverified|Solo verificadas|verifiedOnly/);
assert.match(dashboard, /heatmap|Heatmap|CountryMap|recharts|AreaChart|LineChart/);
```

(Tune dashboard asserts after Task 6 if needed; for this task focus on worker asserts first.)

- [ ] **Step 2: Run — expect FAIL**

```bash
node scripts/admin-stats-data.test.mjs
```

- [ ] **Step 3: Refactor filter builder inside `handleAdminStats`**

```ts
const includeUnverified = url.searchParams.get("includeUnverified") === "1";
const pathFilter = url.searchParams.get("path");
const countryFilter = url.searchParams.get("country");
const compare = url.searchParams.get("compare") === "1";

const filters: string[] = ["timestamp >= ?", "is_admin = 0"];
const binds: unknown[] = [startTime];
if (!includeUnverified) {
  filters.push("verified = 1");
}
if (pathFilter) {
  filters.push("path = ?");
  binds.push(pathFilter);
}
if (countryFilter) {
  filters.push("country = ?");
  binds.push(countryFilter);
}
const where = filters.join(" AND ");
```

Apply the same verified/path/country clauses to overview, timeline, breakdowns, activeNow (activeNow still last 5 minutes + same verified/path/country).

For **verification badge** (ignore verified toggle, keep path/country):

```sql
SELECT
  SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as verified_events,
  COUNT(*) as total_events
FROM analytics_events
WHERE timestamp >= ? AND is_admin = 0
  -- + optional path/country
```

- [ ] **Step 4: Timeline granularity**

- If `range === "24h"`: `strftime('%Y-%m-%dT%H:00:00Z', timestamp/1000, 'unixepoch')` as `date`
- Else: keep daily `strftime('%Y-%m-%d', ...)`

Always select `page_views` and `unique_visitors`.

- [ ] **Step 5: Heatmap query**

```sql
SELECT
  CAST(strftime('%w', timestamp/1000, 'unixepoch') AS INTEGER) as dow,
  CAST(strftime('%H', timestamp/1000, 'unixepoch') AS INTEGER) as hour,
  COUNT(*) as count
FROM analytics_events
WHERE ${where}
GROUP BY dow, hour
```

- [ ] **Step 6: Comparison block**

When `compare=1`, run timeline + overview for `[previousStartTime, startTime)` with same verified/path/country filters; attach:

```ts
comparison: {
  overview: { uniqueVisitors, pageViews, sessions },
  timeline: [...]
}
```

- [ ] **Step 7: Return payload fields**

```ts
verification: {
  verifiedEvents: Number(v?.verified_events || 0),
  totalEvents: Number(v?.total_events || 0),
  verifiedRate: total === 0 ? 0 : Math.round((verified / total) * 1000) / 10,
},
heatmap: heatmap.results || [],
comparison: compare ? comparisonPayload : undefined,
```

- [ ] **Step 8: Run worker-focused asserts — PASS for worker portion**

Split dashboard asserts to Task 6 if still failing.

- [ ] **Step 9: Commit**

```bash
git add src/worker.ts scripts/admin-stats-data.test.mjs
git commit -m "$(cat <<'EOF'
feat(analytics): filter stats by verified and add compare/heatmap series

EOF
)"
```

---

### Task 6: Dashboard UI — controls, KPIs, Recharts, map, heatmap

**Files:**
- Modify: `src/pages/AdminStats.tsx`
- Create: `src/components/admin/stats/DualTimelineChart.tsx`
- Create: `src/components/admin/stats/BreakdownDonut.tsx`
- Create: `src/components/admin/stats/CountryChoropleth.tsx`
- Create: `src/components/admin/stats/WeeklyHeatmap.tsx`
- Create: `src/components/admin/stats/TopPagesTable.tsx`
- Modify: `package.json` / lockfile — add deps
- Modify: `scripts/admin-stats-data.test.mjs` (dashboard asserts)
- Modify: `src/i18n/locales/es.json`, `en.json`, `ca.json`, `fr.json`

**Interfaces:**
- Consumes stats JSON from Task 5
- Fetch: `/api/admin/stats?range=&includeUnverified=&path=&country=&compare=`

- [ ] **Step 1: Install deps**

```bash
npm install recharts topojson-client world-atlas
npm install -D @types/topojson-client @types/topojson-specification
```

- [ ] **Step 2: Extend `StatsData` type and fetch**

```ts
interface StatsData {
  // existing fields...
  verification: { verifiedEvents: number; totalEvents: number; verifiedRate: number };
  heatmap: Array<{ dow: number; hour: number; count: number }>;
  comparison?: {
    overview: { uniqueVisitors: number; pageViews: number; sessions: number };
    timeline: Array<{ date: string; page_views: number; unique_visitors: number }>;
  };
}

const [includeUnverified, setIncludeUnverified] = useState(false);
const [pathFilter, setPathFilter] = useState("");
const [countryFilter, setCountryFilter] = useState("");
const [compare, setCompare] = useState(false);

const fetchStats = useCallback(async () => {
  const qs = new URLSearchParams({ range: timeRange });
  if (includeUnverified) qs.set("includeUnverified", "1");
  if (pathFilter) qs.set("path", pathFilter);
  if (countryFilter) qs.set("country", countryFilter);
  if (compare) qs.set("compare", "1");
  const res = await fetch(`/api/admin/stats?${qs}`, { credentials: "include" });
  // ...existing handling
}, [timeRange, includeUnverified, pathFilter, countryFilter, compare, t]);
```

- [ ] **Step 3: Header controls UI**

Add toggle “Solo verificadas” (checked when `!includeUnverified`), path input, country select (from `stats.countries`), compare switch, verified-rate badge.

- [ ] **Step 4: Dual timeline with Recharts**

`DualTimelineChart`: `AreaChart`/`LineChart` with two series (`page_views`, `unique_visitors`); if `comparison` present, overlay previous period with muted stroke/dash.

- [ ] **Step 5: Donuts + top pages + acquisition**

Replace CSS `BarChart` progress rows for devices/browsers/OS with `PieChart` donuts; keep ranked lists beside them. `TopPagesTable` with % of total.

- [ ] **Step 6: Country choropleth**

`CountryChoropleth` loads `world-atlas/countries/110m.json`, maps numeric id → ISO via `world-atlas` properties (or a small `id→ISO` map), colors by `countries` counts, `onSelectCountry(code)` sets `countryFilter`. Bucket `XX` as Unknown in the side list, not on the map.

- [ ] **Step 7: Weekly heatmap**

7×24 grid from `heatmap` counts; tooltip with dow/hour/count.

- [ ] **Step 8: i18n keys**

Under `adminStats` add at least:

```json
"verifiedOnly": "...",
"includeUnverified": "...",
"verifiedRate": "...",
"comparePeriod": "...",
"filterPath": "...",
"filterCountry": "...",
"heatmap": "...",
"map": "...",
"noData": "...",
"pageViewsSeries": "...",
"visitorsSeries": "..."
```

Mirror in `es`, `en`, `ca`, `fr`.

- [ ] **Step 9: Professional styling pass**

Neutral slate surfaces, thin borders, `#f05133` for primary series only, remove playful blue/purple icon blobs on KPI cards where easy.

- [ ] **Step 10: Run contracts**

```bash
node scripts/admin-stats-data.test.mjs
node scripts/analytics-contract.test.mjs
```

Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json src/pages/AdminStats.tsx src/components/admin/stats src/i18n/locales scripts/admin-stats-data.test.mjs
git commit -m "$(cat <<'EOF'
feat(admin): professional analytics charts with verified filters

EOF
)"
```

---

### Task 7: End-to-end validation + deploy checklist

**Files:**
- Modify: `deploy/README.md` — document `TURNSTILE_*` and `VITE_TURNSTILE_SITE_KEY`
- Update spec status line to Approved/Implemented when done

- [ ] **Step 1: Local E2E**

1. `npm run cf:dev` with `.dev.vars` secrets.
2. Visit public pages → D1 row `verified=1` when Turnstile succeeds.
3. Block Turnstile script (devtools) → still 200 track, `verified=0`.
4. `/admin/` default shows only verified; toggle includes unverified; path/country/compare/map click work.

- [ ] **Step 2: Production checklist**

- [ ] Migration applied remote
- [ ] `TURNSTILE_SECRET` + `TURNSTILE_HOSTNAMES` on Worker
- [ ] Build env has `VITE_TURNSTILE_SITE_KEY`
- [ ] Widget domains include production hosts
- [ ] Deploy Worker + assets

- [ ] **Step 3: Document in `deploy/README.md`**

Add short Spanish/English bullets for Turnstile env vars under Cloudflare Workers notes.

- [ ] **Step 4: Commit docs**

```bash
git add deploy/README.md docs/superpowers/specs/2026-09-16-analytics-turnstile-dashboard-design.md
git commit -m "$(cat <<'EOF'
docs: Turnstile analytics env and mark design approved

EOF
)"
```

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| New invisible widget for Game4Git domains | Task 1 |
| Sitekey + secret storage | Task 1 |
| `verified` column + historical default 0 | Task 2 |
| Client invisible token + fail-open timeout | Task 4 |
| Worker siteverify action/hostname; fail-open store | Task 3 |
| Stats `includeUnverified`, path, country, compare | Task 5 |
| Hourly 24h, heatmap, verification badge | Task 5 |
| Recharts dual series, donuts, map, heatmap, filters UI | Task 6 |
| i18n | Task 6 |
| Contract tests | Tasks 3–6 |
| Deploy notes | Task 7 |
| Non-goals (daily rewrite, HttpOnly, Bot Management) | Explicitly omitted |

No TBD placeholders remain after this review.
