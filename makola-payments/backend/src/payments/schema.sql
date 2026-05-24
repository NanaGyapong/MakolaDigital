-- ============================================================
-- Makola Digital — Payments Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS webhook_logs (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider     VARCHAR(20) NOT NULL,   -- paystack | flutterwave | stripe
    event_type   VARCHAR(80) NOT NULL,
    status       VARCHAR(20) NOT NULL,   -- received | processed | error | rejected
    payload      JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_webhook_logs_provider ON webhook_logs(provider, created_at DESC);
CREATE INDEX idx_webhook_logs_event    ON webhook_logs(event_type, created_at DESC);

-- refresh_tokens for auth
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- seller_payouts (for tracking platform payouts to sellers)
CREATE TABLE IF NOT EXISTS seller_payouts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id       UUID NOT NULL REFERENCES users(id),
    amount          NUMERIC(14,2) NOT NULL,
    currency        VARCHAR(5) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    provider        VARCHAR(20),
    provider_ref    VARCHAR(200),
    orders          UUID[] DEFAULT '{}',
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_seller_payouts ON seller_payouts(seller_id, status);
