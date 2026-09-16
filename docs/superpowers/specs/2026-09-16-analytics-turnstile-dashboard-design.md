# Analytics Turnstile + Professional Dashboard

**Date:** 2026-09-16  
**Status:** Approved  
**Approach:** Turnstile invisible + `verified` flag (fail-open suave) + dashboard analytics completo

---

## Context

Game4Git already has first-party analytics on Cloudflare Workers + D1:

- Client: `useAnalytics` → `POST /api/analytics/track`
- Server: `handleAnalyticsTrack` / `handleAdminStats` in `src/worker.ts`
- UI: `src/pages/AdminStats.tsx` with CSS bars + simple SVG polyline (no chart library)
- Schema: `migrations/0001_analytics_schema.sql` (`analytics_events`, `analytics_daily`, admin sessions)

Gaps:

1. Track endpoint accepts any POST — crawlers/bots inflate metrics; no Turnstile.
2. Dashboard charts are basic; user wants a serious professional analytics UI (map, period compare, filters).

Existing Cloudflare Turnstile widget `joanferreres-visit` is for `joanferreres.com` only — **not** usable for `game4git.com`. A new widget is required.

---

## Goals

1. Background (invisible) Turnstile gates verification of pageviews without blocking UX.
2. Persist all events; mark verified vs unverified; historical data treated as unverified.
3. Admin dashboard defaults to verified-only, with toggle to include unverified.
4. Upgrade dashboard UX: Recharts + country map + period comparison + path/country filters + weekly heatmap.

## Non-goals

- Cloudflare Bot Management / WAF-only filtering as the primary bot signal.
- Fail-closed tracking (dropping events when Turnstile fails).
- Reworking `analytics_daily` aggregation pipeline.
- Making analytics cookies HttpOnly (follow-up).
- Google Analytics / third-party analytics.
- Realtime websocket live updates.
- Retention/funnel product analytics.

---

## Decisions (confirmed)

| Topic | Choice |
|-------|--------|
| Turnstile widget | Create new invisible widget for Game4Git domains |
| Historical events | `verified = 0`; dashboard default excludes them |
| Unverified visibility | Toggle “include unverified” |
| Turnstile failure | Fail-open: still store event as `verified = 0` |
| Chart scope | Full: dual timeline, hourly 24h, donuts, heatmap, country map, period compare, path/country filters |
| Chart stack | Recharts + lightweight choropleth map |

---

## Architecture

### Turnstile widget

- **Name:** `game4git-analytics`
- **Mode:** `invisible`
- **Domains:** `localhost`, `127.0.0.1`, `game4git.com`, `www.game4git.com`, plus the Worker preview hostname if used for staging
- **Public:** `VITE_TURNSTILE_SITE_KEY` (build / client)
- **Secret:** `TURNSTILE_SECRET` (Worker secret only)
- **Hostname allowlist (server):**
  - Production: `game4git.com`, `www.game4git.com` (no localhost)
  - Local `.dev.vars`: include `localhost`, `127.0.0.1`
- **Action:** `analytics` (1–32 chars; validated in siteverify)

### Client flow

1. Load Turnstile script once (app shell / `AnalyticsTracker`).
2. Render invisible widget with `data-action="analytics"`.
3. On route change (existing `useAnalyticsTracking`):
   - Request token (with short timeout ~3–5s).
   - `POST /api/analytics/track` with `{ path, referrer, utm, turnstileToken? }`.
   - If no token in time → send without token.
4. After each attempt, `turnstile.reset(widgetId)` so the next pageview gets a fresh single-use token.

### Worker flow (`handleAnalyticsTrack`)

1. Parse body as today (path, referrer, utm) + optional `turnstileToken`.
2. If token present and well-formed (string, length ≤ 2048):
   - `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` with secret, response, remoteip.
   - Require `success === true`, `action === "analytics"`, hostname in allowlist.
   - Network / non-2xx / JSON errors → treat as unverified (do **not** reject the track with 403).
3. Set `verified = 1` only on full siteverify success; otherwise `verified = 0`.
4. Continue existing insert + cookie + daily aggregate logic.
5. Always return success for accepted track payloads (same as today for valid JSON); verification status is a data attribute, not an HTTP gate.

### Env (`Env` in worker)

```ts
TURNSTILE_SECRET: string;
TURNSTILE_HOSTNAMES: string; // comma-separated
```

---

## Data model

### Migration `0002_analytics_verified.sql`

```sql
ALTER TABLE analytics_events ADD COLUMN verified INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_events_verified ON analytics_events(verified);
```

- Existing rows remain `0` (DEFAULT).
- No rewrite of `analytics_daily` in this pass; dashboard continues to query `analytics_events`.

### Stats query contract

`GET /api/admin/stats`

| Param | Default | Behavior |
|-------|---------|----------|
| `range` | `7d` | `24h` \| `7d` \| `30d` \| `90d` (existing) |
| `includeUnverified` | `0` | `1` includes `verified = 0` |
| `path` | — | optional exact or prefix filter on `path` |
| `country` | — | optional ISO country code |
| `compare` | `0` | `1` returns previous-period series for overlay |

Response extensions:

- `overview` / breakdowns filtered by verified (+ path/country).
- `timeline`: dual series `page_views` + `unique_visitors`; for `24h`, hourly buckets.
- `comparison` (when `compare=1`): parallel timeline + overview for previous window.
- `verification`: `{ verifiedEvents, totalEvents, verifiedRate }` for the selected range (before includeUnverified filter is applied to the main series, or computed over the same filtered path/country window — prefer: rate over path/country filter, ignoring the verified toggle so the badge stays meaningful).
- `heatmap`: `{ dayOfWeek, hour, count }[]` for weekly heatmap.
- Existing: paths, referrers, utmSources, countries, devices, browsers, os.

---

## Dashboard UI

### Header controls

- Time range select
- Toggle: **Solo verificadas** (on by default) ↔ sets `includeUnverified`
- Filters: path, country (clearable)
- Compare period toggle
- Refresh, Export CSV (respect current filters)
- Small badge: verified rate

### KPI row

Visitors, Page views, Sessions, Active now + delta % vs previous (or vs compared period when compare on).

### Charts / panels

1. Dual timeline (Recharts area/line) — views + visitors; tooltips; hourly if 24h
2. Period comparison overlay/split when compare enabled
3. Top pages table — views, visitors, % of total, bar
4. Audience — donuts for device/browser/OS + country bars
5. Country choropleth — click applies country filter; `XX` → Unknown bucket
6. Acquisition — referrers + UTM
7. Weekly heatmap — day × hour

### Visual language

- Keep shadcn + existing admin auth shell
- Dense, professional analytics look: neutral grays, 1–2 accents (prefer existing product orange `#f05133` sparingly — not purple-glow AI defaults)
- Explicit loading / empty / error states
- New copy in i18n: `es`, `en`, `ca`, `fr`

### Dependencies

- Add `recharts`
- Add a small geo JSON / map component suitable for ISO country choropleth (prefer a lightweight approach; avoid heavy unused map SDKs)

---

## Error handling

| Case | Behavior |
|------|----------|
| Turnstile script blocked / timeout | Track without token → `verified=0` |
| siteverify down / timeout | `verified=0`, event stored |
| Invalid / replayed token / wrong action / bad hostname | `verified=0`, event stored |
| Admin stats unauthenticated | 401 (unchanged) |
| Filters yield no rows | Empty states |
| Unknown country codes | Map “Unknown”; still appear in country list |

Track endpoint must **not** become a hard captcha wall (no 403 for missing Turnstile).

---

## Testing

- Extend `scripts/analytics-contract.test.mjs`: track body may include `turnstileToken`; worker references siteverify / verified.
- Extend `scripts/admin-stats-data.test.mjs`: `includeUnverified`, filters, heatmap/comparison keys or UI hooks.
- Unit-style helper tests for verified decision logic if extracted.
- Manual: local widget + `.dev.vars` hostnames; one verified event; one unverified; dashboard toggle.

---

## Implementation units (bounded)

1. **Turnstile provisioning** — create widget; store secret; expose sitekey
2. **Schema migration** — `verified` column + index
3. **Client Turnstile + track wiring** — invisible widget, token, reset
4. **Worker siteverify + verified persist** — fail-open
5. **Stats API** — filters, compare, hourly, heatmap, verification badge data
6. **AdminStats UI** — Recharts + map + controls + i18n
7. **Contract tests + deploy notes** — secrets, build env

---

## Follow-ups (out of scope)

- HttpOnly / server-issued visitor cookies
- Fix / use `analytics_daily` for faster queries
- Bot Management as secondary signal
- Purge job for old unverified noise (optional ops)

---

## Success criteria

1. Real browsers with Turnstile succeed → events with `verified=1` dominate clean dashboard view.
2. Bots / failed challenges still don’t block the site; their events stay out of default stats.
3. Historical pre-migration traffic does not inflate default KPIs.
4. Admin can filter by path/country, compare periods, and read dual series + map + heatmap without leaving `/admin/`.
