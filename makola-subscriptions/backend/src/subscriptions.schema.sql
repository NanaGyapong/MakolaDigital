-- ============================================================
-- Makola Digital Subscription Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id                   VARCHAR(20) NOT NULL DEFAULT 'free',
    billing_period            VARCHAR(10) DEFAULT 'monthly',  -- monthly | annual
    status                    VARCHAR(20) NOT NULL DEFAULT 'active',
      -- active | trialing | past_due | cancelled | expired | pending
    is_trial                  BOOLEAN DEFAULT false,
    trial_ends_at             TIMESTAMPTZ,
    current_period_start      TIMESTAMPTZ,
    current_period_end        TIMESTAMPTZ,
    cancel_at_period_end      BOOLEAN DEFAULT false,
    payment_reference         VARCHAR(200),
    paystack_subscription_code VARCHAR(200),
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ,
    UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user   ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status, current_period_end);
CREATE INDEX idx_subscriptions_trial  ON subscriptions(is_trial, trial_ends_at)
    WHERE is_trial = true;

CREATE TABLE IF NOT EXISTS subscription_invoices (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id),
    plan_id     VARCHAR(20) NOT NULL,
    amount      NUMERIC(10,2) NOT NULL,
    currency    VARCHAR(5) NOT NULL DEFAULT 'GHS',
    status      VARCHAR(20) NOT NULL DEFAULT 'paid',
    payment_ref VARCHAR(200),
    period_start TIMESTAMPTZ,
    period_end   TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_invoices_user ON subscription_invoices(user_id, created_at DESC);

-- View: current plan per user (use in queries instead of JOIN)
CREATE OR REPLACE VIEW user_plans AS
SELECT
    u.id AS user_id,
    u.email,
    COALESCE(s.plan_id, 'free') AS plan_id,
    s.status,
    s.is_trial,
    s.trial_ends_at,
    s.current_period_end,
    s.cancel_at_period_end
FROM users u
LEFT JOIN subscriptions s ON s.user_id = u.id
    AND s.status IN ('active', 'trialing')
ORDER BY s.created_at DESC;
