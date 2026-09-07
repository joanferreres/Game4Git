import { getCanonicalRedirectUrl } from "./edge-routing.js";

type AssetBinding = {
  fetch(request: Request): Response | Promise<Response>;
};

type D1Database = {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1ExecResult>;
  dump(): Promise<ArrayBuffer>;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
};

type D1Result<T = unknown> = {
  results: T[];
  success: boolean;
  error?: string;
  meta: {
    duration: number;
    changes: number;
    last_row_id: number;
    changed_db: boolean;
    rows_read: number;
    rows_written: number;
  };
};

type D1ExecResult = {
  count: number;
  duration: number;
};

type Env = {
  ASSETS: AssetBinding;
  ANALYTICS_DB: D1Database;
  ADMIN_PASSWORD_HASH: string;
  SESSION_SECRET: string;
};

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const EVENT_RETENTION_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

function generateEventId(): string {
  return crypto.randomUUID();
}

function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hashIp(ip: string, secret: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + secret);
  const hashBuffer = crypto.subtle.digest("SHA-256", data);
  return hashBuffer.then((buf) =>
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

function parseReferrerDomain(referrer: string | null): string | null {
  if (!referrer) return "direct";
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.replace(/^www\./, "");
    return hostname;
  } catch {
    return "unknown";
  }
}

function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
  const uaLower = ua.toLowerCase();
  let browser = "Unknown";
  let os = "Unknown";
  let device = "desktop";

  if (uaLower.includes("mobile") || uaLower.includes("android") || uaLower.includes("iphone")) {
    device = "mobile";
  } else if (uaLower.includes("tablet") || uaLower.includes("ipad")) {
    device = "tablet";
  }

  if (uaLower.includes("edg/")) browser = "Edge";
  else if (uaLower.includes("chrome/") || uaLower.includes("crios/")) browser = "Chrome";
  else if (uaLower.includes("firefox/") || uaLower.includes("fxios/")) browser = "Firefox";
  else if (uaLower.includes("safari/") && !uaLower.includes("chrome")) browser = "Safari";
  else if (uaLower.includes("opera/") || uaLower.includes("opr/")) browser = "Opera";

  if (uaLower.includes("windows")) os = "Windows";
  else if (uaLower.includes("ios") || uaLower.includes("iphone") || uaLower.includes("ipad")) os = "iOS";
  else if (uaLower.includes("android")) os = "Android";
  else if (uaLower.includes("mac os") || uaLower.includes("macos")) os = "macOS";
  else if (uaLower.includes("linux")) os = "Linux";

  return { browser, os, device };
}

function getCountryFromHeaders(headers: Headers): string {
  const cfIpCountry = headers.get("cf-ipcountry");
  if (cfIpCountry) return cfIpCountry;
  return "XX";
}

function extractUtmParams(url: URL): Record<string, string | null> {
  return {
    utm_source: url.searchParams.get("utm_source"),
    utm_medium: url.searchParams.get("utm_medium"),
    utm_campaign: url.searchParams.get("utm_campaign"),
    utm_content: url.searchParams.get("utm_content"),
    utm_term: url.searchParams.get("utm_term"),
  };
}

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin/");
}

function isAnalyticsApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/admin/") || pathname === "/api/analytics/track";
}

async function logAnalyticsEvent(
  db: D1Database,
  event: {
    sessionId: string;
    visitorId: string;
    path: string;
    referrer: string | null;
    utm: Record<string, string | null>;
    country: string;
    browser: string;
    os: string;
    device: string;
    isAdmin: boolean;
  }
): Promise<void> {
  const timestamp = Date.now();
  const eventId = generateEventId();

  try {
    await db
      .prepare(
        `INSERT INTO analytics_events 
         (event_id, session_id, visitor_id, timestamp, path, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term, country, device_type, browser, os, is_admin)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        eventId,
        event.sessionId,
        event.visitorId,
        timestamp,
        event.path,
        event.referrer,
        event.utm.utm_source,
        event.utm.utm_medium,
        event.utm.utm_campaign,
        event.utm.utm_content,
        event.utm.utm_term,
        event.country,
        event.device,
        event.browser,
        event.os,
        event.isAdmin ? 1 : 0
      )
      .run();
  } catch (e) {
    console.error("Failed to log analytics event:", e);
  }
}

async function updateDailyAggregates(
  db: D1Database,
  event: {
    date: string;
    path: string;
    visitorId: string;
    sessionId: string;
    country: string;
    device: string;
    browser: string;
    os: string;
    referrer: string;
    utmSource: string | null;
  }
): Promise<void> {
  try {
    const existing = await db
      .prepare(
        `SELECT unique_visitors, page_views, sessions, countries, devices, browsers, os, referrers, utm_sources
         FROM analytics_daily WHERE date = ? AND path = ?`
      )
      .bind(event.date, event.path)
      .first<{
        unique_visitors: number;
        page_views: number;
        sessions: number;
        countries: string | null;
        devices: string | null;
        browsers: string | null;
        os: string | null;
        referrers: string | null;
        utm_sources: string | null;
      }>();

    const countries = existing ? JSON.parse(existing.countries || "{}") : {};
    const devices = existing ? JSON.parse(existing.devices || "{}") : {};
    const browsers = existing ? JSON.parse(existing.browsers || "{}") : {};
    const osMap = existing ? JSON.parse(existing.os || "{}") : {};
    const referrers = existing ? JSON.parse(existing.referrers || "{}") : {};
    const utmSources = existing ? JSON.parse(existing.utm_sources || "{}") : {};

    countries[event.country] = (countries[event.country] || 0) + 1;
    devices[event.device] = (devices[event.device] || 0) + 1;
    browsers[event.browser] = (browsers[event.browser] || 0) + 1;
    osMap[event.os] = (osMap[event.os] || 0) + 1;
    referrers[event.referrer] = (referrers[event.referrer] || 0) + 1;
    if (event.utmSource) {
      utmSources[event.utmSource] = (utmSources[event.utmSource] || 0) + 1;
    }

    if (existing) {
      await db
        .prepare(
          `UPDATE analytics_daily SET
           page_views = page_views + 1,
           sessions = sessions + ?,
           countries = ?,
           devices = ?,
           browsers = ?,
           os = ?,
           referrers = ?,
           utm_sources = ?,
           updated_at = ?
           WHERE date = ? AND path = ?`
        )
        .bind(
          1,
          JSON.stringify(countries),
          JSON.stringify(devices),
          JSON.stringify(browsers),
          JSON.stringify(osMap),
          JSON.stringify(referrers),
          JSON.stringify(utmSources),
          Date.now(),
          event.date,
          event.path
        )
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO analytics_daily 
           (date, path, unique_visitors, page_views, sessions, countries, devices, browsers, os, referrers, utm_sources, updated_at)
           VALUES (?, ?, 1, 1, 1, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          event.date,
          event.path,
          JSON.stringify(countries),
          JSON.stringify(devices),
          JSON.stringify(browsers),
          JSON.stringify(osMap),
          JSON.stringify(referrers),
          JSON.stringify(utmSources),
          Date.now()
        )
        .run();
    }
  } catch (e) {
    console.error("Failed to update daily aggregates:", e);
  }
}

async function getOrCreateVisitorId(request: Request, db: D1Database): Promise<string> {
  const cookieHeader = request.headers.get("Cookie") || "";
  const visitorCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("analytics_visitor="));

  if (visitorCookie) {
    const visitorId = visitorCookie.split("=")[1];
    return visitorId;
  }

  const visitorId = generateSessionToken();
  return visitorId;
}

function getSessionId(request: Request): string {
  const cookieHeader = request.headers.get("Cookie") || "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("analytics_session="));

  if (sessionCookie) {
    return sessionCookie.split("=")[1];
  }

  return generateSessionToken();
}

function setAnalyticsCookies(response: Response, visitorId: string, sessionId: string): void {
  const visitorCookie = `analytics_visitor=${visitorId}; Path=/; Max-Age=${60 * 60 * 24 * 90}; SameSite=Lax; Secure`;
  const sessionCookie = `analytics_session=${sessionId}; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax; Secure`;

  const existingCookies = response.headers.get("Set-Cookie");
  if (existingCookies) {
    response.headers.append("Set-Cookie", visitorCookie);
    response.headers.append("Set-Cookie", sessionCookie);
  } else {
    response.headers.set("Set-Cookie", visitorCookie);
    response.headers.append("Set-Cookie", sessionCookie);
  }
}

function setAdminSessionCookie(response: Response, sessionToken: string): void {
  const cookie = `${SESSION_COOKIE_NAME}=${sessionToken}; Path=/; Max-Age=${Math.floor(
    SESSION_DURATION_MS / 1000
  )}; SameSite=Strict; Secure; HttpOnly`;
  response.headers.append("Set-Cookie", cookie);
}

function clearAdminSessionCookie(response: Response): void {
  const cookie = `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Strict; Secure; HttpOnly`;
  response.headers.append("Set-Cookie", cookie);
}

function parseAdminSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie") || "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (sessionCookie) {
    return sessionCookie.split("=")[1];
  }
  return null;
}

async function validateAdminSession(
  db: D1Database,
  sessionToken: string,
  ipHash: string
): Promise<{ valid: boolean; session?: { id: string; expires_at: number } }> {
  const now = Date.now();

  const session = await db
    .prepare(
      `SELECT id, expires_at, last_activity, ip_hash, locked_until
       FROM admin_sessions WHERE id = ?`
    )
    .bind(sessionToken)
    .first<{ id: string; expires_at: number; last_activity: number; ip_hash: string; locked_until: number }>();

  if (!session) {
    return { valid: false };
  }

  if (session.expires_at < now) {
    await db.prepare(`DELETE FROM admin_sessions WHERE id = ?`).bind(sessionToken).run();
    return { valid: false };
  }

  if (session.locked_until > now) {
    return { valid: false };
  }

  if (session.ip_hash !== ipHash) {
    return { valid: false };
  }

  await db
    .prepare(`UPDATE admin_sessions SET last_activity = ? WHERE id = ?`)
    .bind(now, sessionToken)
    .run();

  return { valid: true, session: { id: session.id, expires_at: session.expires_at } };
}

async function checkLoginRateLimit(db: D1Database, ipHash: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = Date.now();
  const windowStart = now - LOGIN_LOCKOUT_MS;

  const attempts = await db
    .prepare(
      `SELECT COUNT(*) as count FROM login_attempts WHERE ip_hash = ? AND attempted_at > ? AND success = 0`
    )
    .bind(ipHash, windowStart)
    .first<{ count: number }>();

  if (attempts && attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const oldestAttempt = await db
      .prepare(
        `SELECT attempted_at FROM login_attempts WHERE ip_hash = ? AND success = 0 ORDER BY attempted_at ASC LIMIT 1`
      )
      .bind(ipHash)
      .first<{ attempted_at: number }>();

    if (oldestAttempt) {
      const retryAfter = oldestAttempt.attempted_at + LOGIN_LOCKOUT_MS - now;
      return { allowed: false, retryAfter: Math.max(0, retryAfter) };
    }
    return { allowed: false, retryAfter: LOGIN_LOCKOUT_MS };
  }

  return { allowed: true };
}

async function recordLoginAttempt(db: D1Database, ipHash: string, success: boolean): Promise<void> {
  await db
    .prepare(`INSERT INTO login_attempts (ip_hash, attempted_at, success) VALUES (?, ?, ?)`)
    .bind(ipHash, Date.now(), success ? 1 : 0)
    .run();
}

async function cleanupOldData(db: D1Database): Promise<void> {
  const now = Date.now();
  const cutoff = now - EVENT_RETENTION_MS;

  try {
    await db
      .prepare(`DELETE FROM analytics_events WHERE timestamp < ?`)
      .bind(cutoff)
      .run();

    await db
      .prepare(`DELETE FROM login_attempts WHERE attempted_at < ?`)
      .bind(now - 24 * 60 * 60 * 1000)
      .run();

    await db
      .prepare(`DELETE FROM admin_sessions WHERE expires_at < ?`)
      .bind(now)
      .run();

    const oldDates = now - EVENT_RETENTION_MS;
    const oldDateStr = new Date(oldDates).toISOString().split("T")[0];
    await db
      .prepare(`DELETE FROM analytics_daily WHERE date < ?`)
      .bind(oldDateStr)
      .run();
  } catch (e) {
    console.error("Cleanup failed:", e);
  }
}

async function handleAdminLogin(
  request: Request,
  env: Env,
  ipHash: string
): Promise<Response> {
  const rateLimit = await checkLoginRateLimit(env.ANALYTICS_DB, ipHash);
  if (!rateLimit.allowed) {
    const retryMinutes = Math.ceil((rateLimit.retryAfter || LOGIN_LOCKOUT_MS) / 60000);
    return new Response(
      JSON.stringify({ error: `Too many attempts. Try again in ${retryMinutes} minutes.`, retryAfter: rateLimit.retryAfter }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { password: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { password } = body;
  if (!password) {
    return new Response(JSON.stringify({ error: "Password required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const isValid = await verifyPassword(password, env.ADMIN_PASSWORD_HASH);
  await recordLoginAttempt(env.ANALYTICS_DB, ipHash, isValid);

  if (!isValid) {
    return new Response(JSON.stringify({ error: "Invalid password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sessionToken = generateSessionToken();
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;

  await env.ANALYTICS_DB
    .prepare(
      `INSERT INTO admin_sessions (id, password_hash, created_at, expires_at, last_activity, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(sessionToken, env.ADMIN_PASSWORD_HASH, now, expiresAt, now, ipHash)
    .run();

  const response = new Response(JSON.stringify({ success: true, expiresAt }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  setAdminSessionCookie(response, sessionToken);
  return response;
}

async function handleAdminLogout(
  request: Request,
  env: Env
): Promise<Response> {
  const sessionToken = parseAdminSessionCookie(request);
  if (sessionToken) {
    await env.ANALYTICS_DB.prepare(`DELETE FROM admin_sessions WHERE id = ?`).bind(sessionToken).run();
  }

  const response = new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  clearAdminSessionCookie(response);
  return response;
}

async function handleAdminCheckSession(
  request: Request,
  env: Env,
  ipHash: string
): Promise<Response> {
  const sessionToken = parseAdminSessionCookie(request);
  if (!sessionToken) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validation = await validateAdminSession(env.ANALYTICS_DB, sessionToken, ipHash);
  return new Response(JSON.stringify({ authenticated: validation.valid, expiresAt: validation.session?.expires_at }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleAdminStats(
  request: Request,
  env: Env,
  ipHash: string
): Promise<Response> {
  const sessionToken = parseAdminSessionCookie(request);
  if (!sessionToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validation = await validateAdminSession(env.ANALYTICS_DB, sessionToken, ipHash);
  if (!validation.valid) {
    return new Response(JSON.stringify({ error: "Session expired" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const requestedRange = url.searchParams.get("range") || "7d";
  const range = ["24h", "7d", "30d", "90d"].includes(requestedRange) ? requestedRange : "7d";
  const now = Date.now();

  let startTime: number;
  switch (range) {
    case "24h":
      startTime = now - 24 * 60 * 60 * 1000;
      break;
    case "7d":
      startTime = now - 7 * 24 * 60 * 60 * 1000;
      break;
    case "30d":
      startTime = now - 30 * 24 * 60 * 60 * 1000;
      break;
    case "90d":
      startTime = now - 90 * 24 * 60 * 60 * 1000;
      break;
    default:
      startTime = now - 7 * 24 * 60 * 60 * 1000;
  }

  const periodLength = now - startTime;
  const previousStartTime = startTime - periodLength;

  const percentageChange = (current: number, previous: number) => {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  };

  try {
    const [
      overview,
      previousOverview,
      timeline,
      paths,
      referrers,
      utmSources,
      countries,
      devices,
      browsers,
      os,
      activeNow,
    ] = await Promise.all([
      env.ANALYTICS_DB
        .prepare(
          `SELECT 
            COUNT(DISTINCT visitor_id) as unique_visitors,
            COUNT(*) as page_views,
            COUNT(DISTINCT session_id) as sessions
           FROM analytics_events 
           WHERE timestamp >= ? AND is_admin = 0`
        )
        .bind(startTime)
        .first<{ unique_visitors: number; page_views: number; sessions: number }>(),

      env.ANALYTICS_DB
        .prepare(
          `SELECT
            COUNT(DISTINCT visitor_id) as unique_visitors,
            COUNT(*) as page_views,
            COUNT(DISTINCT session_id) as sessions
           FROM analytics_events
           WHERE timestamp >= ? AND timestamp < ? AND is_admin = 0`
        )
        .bind(previousStartTime, startTime)
        .first<{ unique_visitors: number; page_views: number; sessions: number }>(),

      env.ANALYTICS_DB
        .prepare(
          `SELECT
            strftime('%Y-%m-%d', timestamp / 1000, 'unixepoch') as date,
            COUNT(*) as page_views,
            COUNT(DISTINCT visitor_id) as unique_visitors
           FROM analytics_events
           WHERE timestamp >= ? AND timestamp < ? AND is_admin = 0
           GROUP BY date
           ORDER BY date ASC`
        )
        .bind(startTime, now)
        .all<{ date: string; page_views: number; unique_visitors: number }>(),

      env.ANALYTICS_DB
        .prepare(
          `SELECT path, COUNT(*) as views, COUNT(DISTINCT visitor_id) as visitors
           FROM analytics_events
           WHERE timestamp >= ? AND is_admin = 0
           GROUP BY path
           ORDER BY views DESC
           LIMIT 20`
        )
        .bind(startTime)
        .all<{ path: string; views: number; visitors: number }>(),

      env.ANALYTICS_DB
        .prepare(
          `SELECT referrer, COUNT(*) as count
           FROM analytics_events
           WHERE timestamp >= ? AND is_admin = 0 AND referrer IS NOT NULL
           GROUP BY referrer
           ORDER BY count DESC
           LIMIT 20`
        )
        .bind(startTime)
        .all<{ referrer: string; count: number }>(),

      env.ANALYTICS_DB
        .prepare(
          `SELECT utm_source, COUNT(*) as count
           FROM analytics_events
           WHERE timestamp >= ? AND is_admin = 0 AND utm_source IS NOT NULL
           GROUP BY utm_source
           ORDER BY count DESC
           LIMIT 20`
        )
        .bind(startTime)
        .all<{ utm_source: string; count: number }>(),

      env.ANALYTICS_DB
        .prepare(
          `SELECT country, COUNT(*) as count
           FROM analytics_events
           WHERE timestamp >= ? AND is_admin = 0 AND country IS NOT NULL
           GROUP BY country
           ORDER BY count DESC
           LIMIT 20`
        )
        .bind(startTime)
        .all<{ country: string; count: number }>(),

      env.ANALYTICS_DB
        .prepare(
          `SELECT device_type, COUNT(*) as count
           FROM analytics_events
           WHERE timestamp >= ? AND is_admin = 0 AND device_type IS NOT NULL
           GROUP BY device_type
           ORDER BY count DESC`
        )
        .bind(startTime)
        .all<{ device_type: string; count: number }>(),

      env.ANALYTICS_DB
        .prepare(
          `SELECT browser, COUNT(*) as count
           FROM analytics_events
           WHERE timestamp >= ? AND is_admin = 0 AND browser IS NOT NULL
           GROUP BY browser
           ORDER BY count DESC
           LIMIT 15`
        )
        .bind(startTime)
        .all<{ browser: string; count: number }>(),

      env.ANALYTICS_DB
        .prepare(
          `SELECT os, COUNT(*) as count
           FROM analytics_events
           WHERE timestamp >= ? AND is_admin = 0 AND os IS NOT NULL
           GROUP BY os
           ORDER BY count DESC
           LIMIT 15`
        )
        .bind(startTime)
        .all<{ os: string; count: number }>(),

      env.ANALYTICS_DB
        .prepare(
          `SELECT COUNT(DISTINCT visitor_id) as active_visitors
           FROM analytics_events
           WHERE timestamp >= ? AND is_admin = 0`
        )
        .bind(now - 5 * 60 * 1000)
        .first<{ active_visitors: number }>(),
    ]);

    return new Response(
      JSON.stringify({
        range,
        overview: {
          uniqueVisitors: overview?.unique_visitors || 0,
          pageViews: overview?.page_views || 0,
          sessions: overview?.sessions || 0,
          activeNow: activeNow?.active_visitors || 0,
        },
        previous: {
          uniqueVisitors: previousOverview?.unique_visitors || 0,
          pageViews: previousOverview?.page_views || 0,
          sessions: previousOverview?.sessions || 0,
        },
        changes: {
          uniqueVisitors: percentageChange(overview?.unique_visitors || 0, previousOverview?.unique_visitors || 0),
          pageViews: percentageChange(overview?.page_views || 0, previousOverview?.page_views || 0),
          sessions: percentageChange(overview?.sessions || 0, previousOverview?.sessions || 0),
        },
        timeline: timeline.results || [],
        paths: paths.results || [],
        referrers: referrers.results || [],
        utmSources: utmSources.results || [],
        countries: countries.results || [],
        devices: devices.results || [],
        browsers: browsers.results || [],
        os: os.results || [],
      }),
      { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("Stats query failed:", e);
    return new Response(JSON.stringify({ error: "Failed to fetch stats" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleAnalyticsTrack(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: {
    path: string;
    referrer?: string;
    utm?: Record<string, string | null>;
  };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { path, referrer, utm } = body;
  if (!path) {
    return new Response(JSON.stringify({ error: "Path required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ua = request.headers.get("User-Agent") || "";
  const { browser, os, device } = parseUserAgent(ua);
  const country = getCountryFromHeaders(request.headers);
  const referrerDomain = parseReferrerDomain(referrer || null);
  const utmParams = utm || { utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null, utm_term: null };

  const isAdmin = isAdminPath(path);
  const visitorId = await getOrCreateVisitorId(request, env.ANALYTICS_DB);
  const sessionId = getSessionId(request);

  await Promise.all([
    logAnalyticsEvent(env.ANALYTICS_DB, {
      sessionId,
      visitorId,
      path,
      referrer: referrerDomain,
      utm: utmParams,
      country,
      browser,
      os,
      device,
      isAdmin,
    }),
    updateDailyAggregates(env.ANALYTICS_DB, {
      date: new Date().toISOString().split("T")[0],
      path,
      visitorId,
      sessionId,
      country,
      device,
      browser,
      os,
      referrer: referrerDomain,
      utmSource: utmParams.utm_source,
    }),
  ]);

  const response = new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  setAnalyticsCookies(response, visitorId, sessionId);
  return response;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const ipHash = await hashIp(ip, env.SESSION_SECRET);

    if (isAnalyticsApiPath(pathname)) {
      if (pathname === "/api/admin/login" && request.method === "POST") {
        return handleAdminLogin(request, env, ipHash);
      }
      if (pathname === "/api/admin/logout" && request.method === "POST") {
        return handleAdminLogout(request, env);
      }
      if (pathname === "/api/admin/check-session" && request.method === "GET") {
        return handleAdminCheckSession(request, env, ipHash);
      }
      if (pathname === "/api/admin/stats" && request.method === "GET") {
        return handleAdminStats(request, env, ipHash);
      }
      if (pathname === "/api/analytics/track" && request.method === "POST") {
        return handleAnalyticsTrack(request, env);
      }

      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const redirectUrl = getCanonicalRedirectUrl(request.url, request.headers);
    if (redirectUrl) {
      return Response.redirect(redirectUrl, 301);
    }

    if (pathname === "/admin/stats/") {
      return Response.redirect(new URL("/admin/", request.url), 301);
    }

    const response = await env.ASSETS.fetch(request);

    if (isAdminPath(pathname)) {
      const sessionToken = parseAdminSessionCookie(request);
      if (sessionToken) {
        const validation = await validateAdminSession(env.ANALYTICS_DB, sessionToken, ipHash);
        if (!validation.valid) {
          return Response.redirect("/admin/", 302);
        }
      } else if (!pathname.endsWith("/")) {
        return Response.redirect("/admin/", 302);
      }
    }

    await cleanupOldData(env.ANALYTICS_DB);

    return response;
  },
};
