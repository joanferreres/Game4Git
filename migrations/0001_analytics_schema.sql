-- Analytics database schema for Game4Git
-- This migration creates tables for storing anonymous analytics data
-- with privacy-first design (no IPs, no full referrer URLs, no personal data)

-- Raw events table (kept for 90 days, then auto-cleaned)
CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL UNIQUE,           -- UUID for deduplication
    session_id TEXT NOT NULL,                -- Anonymous session ID (hashed)
    visitor_id TEXT NOT NULL,                -- Anonymous visitor ID (hashed, persists 90 days)
    timestamp INTEGER NOT NULL,              -- Unix timestamp (ms)
    path TEXT NOT NULL,                      -- Page path (e.g., "/git-practice-game/")
    referrer TEXT,                           -- Referrer domain only (e.g., "google.com", "github.com")
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    country TEXT,                            -- ISO country code (e.g., "ES", "US")
    device_type TEXT,                        -- "desktop" | "mobile" | "tablet"
    browser TEXT,                            -- Browser name (e.g., "Chrome", "Firefox")
    os TEXT,                                 -- OS name (e.g., "Windows", "macOS", "Linux")
    is_admin INTEGER DEFAULT 0,              -- 1 if admin session (excluded from public stats)
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_visitor ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_path ON analytics_events(path);
CREATE INDEX IF NOT EXISTS idx_events_country ON analytics_events(country);
CREATE INDEX IF NOT EXISTS idx_events_device ON analytics_events(device_type);
CREATE INDEX IF NOT EXISTS idx_events_browser ON analytics_events(browser);
CREATE INDEX IF NOT EXISTS idx_events_os ON analytics_events(os);
CREATE INDEX IF NOT EXISTS idx_events_admin ON analytics_events(is_admin);

-- Pre-aggregated daily metrics (for fast dashboard queries)
CREATE TABLE IF NOT EXISTS analytics_daily (
    date TEXT NOT NULL,                      -- YYYY-MM-DD
    path TEXT NOT NULL,
    unique_visitors INTEGER DEFAULT 0,       -- COUNT(DISTINCT visitor_id)
    page_views INTEGER DEFAULT 0,            -- COUNT(*)
    sessions INTEGER DEFAULT 0,              -- COUNT(DISTINCT session_id)
    countries TEXT,                          -- JSON: {"ES": 10, "US": 5, ...}
    devices TEXT,                            -- JSON: {"desktop": 12, "mobile": 3, ...}
    browsers TEXT,                           -- JSON: {"Chrome": 10, "Firefox": 5, ...}
    os TEXT,                                 -- JSON: {"Windows": 8, "macOS": 7, ...}
    referrers TEXT,                          -- JSON: {"google.com": 8, "direct": 7, ...}
    utm_sources TEXT,                        -- JSON: {"google": 5, "github": 3, ...}
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
    PRIMARY KEY (date, path)
);

CREATE INDEX IF NOT EXISTS idx_daily_date ON analytics_daily(date);

-- Admin sessions table (secure, HttpOnly cookies)
CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,                     -- Session token (secure random)
    password_hash TEXT NOT NULL,             -- Argon2id hash of password
    created_at INTEGER NOT NULL,             -- Unix timestamp (ms)
    expires_at INTEGER NOT NULL,             -- Unix timestamp (ms) - 12 hours
    last_activity INTEGER NOT NULL,          -- Unix timestamp (ms)
    ip_hash TEXT,                            -- Hashed IP for rate limiting (not stored in events)
    login_attempts INTEGER DEFAULT 0,        -- Failed login attempts for this session
    locked_until INTEGER DEFAULT 0           -- Unix timestamp (ms) when lock expires
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Login attempts tracking (for rate limiting)
CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_hash TEXT NOT NULL,                   -- Hashed IP
    attempted_at INTEGER NOT NULL,           -- Unix timestamp (ms)
    success INTEGER DEFAULT 0                -- 1 if successful
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_hash);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempted_at);

-- Trigger to auto-clean old events (older than 90 days)
-- Note: In production, use a scheduled Worker/Cron for cleanup
-- This is a helper view for manual cleanup
CREATE VIEW IF NOT EXISTS events_to_cleanup AS
SELECT id FROM analytics_events
WHERE timestamp < (strftime('%s', 'now', '-90 days') * 1000);

-- Trigger to auto-clean old login attempts (older than 24 hours)
CREATE VIEW IF NOT EXISTS login_attempts_to_cleanup AS
SELECT id FROM login_attempts
WHERE attempted_at < (strftime('%s', 'now', '-1 day') * 1000);

-- Trigger to auto-clean expired admin sessions
CREATE VIEW IF NOT EXISTS expired_admin_sessions AS
SELECT id FROM admin_sessions
WHERE expires_at < (strftime('%s', 'now') * 1000);