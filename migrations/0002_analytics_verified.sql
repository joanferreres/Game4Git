-- migrations/0002_analytics_verified.sql
ALTER TABLE analytics_events ADD COLUMN verified INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_events_verified ON analytics_events(verified);
