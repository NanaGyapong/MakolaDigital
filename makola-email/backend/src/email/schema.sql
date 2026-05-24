-- ============================================================
-- Email & Notification Schema additions for Makola Digital
-- Run: psql $DATABASE_URL -f schema.sql
-- ============================================================

-- Email logs table (tracks every email sent)
CREATE TABLE IF NOT EXISTS email_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient   VARCHAR(255) NOT NULL,
    template    VARCHAR(80) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'queued',
      -- queued | sent | failed | retrying | bounced
    sent_at     TIMESTAMPTZ,
    error       TEXT,
    queued_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_logs_template ON email_logs(template, queued_at DESC);
CREATE INDEX idx_email_logs_status   ON email_logs(status, queued_at DESC);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient, queued_at DESC);

-- Add email_preferences to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT
  jsonb_build_object(
    ''messages'',       true,
    ''order_updates'',  true,
    ''listing_alerts'', true,
    ''marketing'',      true,
    ''analytics'',      true
  );

-- Unsubscribe tokens
CREATE TABLE IF NOT EXISTS unsubscribe_tokens (
    token       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category    VARCHAR(40), -- NULL = all emails
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    used_at     TIMESTAMPTZ
);

-- Scheduled jobs log
CREATE TABLE IF NOT EXISTS scheduled_email_jobs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_name    VARCHAR(80) NOT NULL,
    run_at      TIMESTAMPTZ NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT ''pending'',
    emails_sent INTEGER NOT NULL DEFAULT 0,
    error       TEXT,
    completed_at TIMESTAMPTZ
);

-- Notification events view (useful for analytics)
CREATE OR REPLACE VIEW email_stats AS
SELECT
  template,
  status,
  COUNT(*)                              AS count,
  COUNT(*) FILTER (WHERE status=''sent'') AS delivered,
  COUNT(*) FILTER (WHERE status=''failed'') AS failed,
  DATE_TRUNC(''day'', queued_at)         AS day
FROM email_logs
GROUP BY template, status, DATE_TRUNC(''day'', queued_at)
ORDER BY day DESC, count DESC;
