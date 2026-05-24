-- ============================================================
-- Makola Digital ML / Recommendations Schema
-- ============================================================

-- Listing views (powers all recommendation signals)
CREATE TABLE IF NOT EXISTS listing_views (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id  VARCHAR(100),
    source      VARCHAR(40),   -- search | recommendation | home | direct | trending
    position    INTEGER,       -- position in list when clicked (for CTR analysis)
    duration_s  INTEGER,       -- time spent on page
    viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_views_listing ON listing_views(listing_id, viewed_at DESC);
CREATE INDEX idx_views_user    ON listing_views(user_id, viewed_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_views_session ON listing_views(session_id, viewed_at DESC);

-- A/B test events
CREATE TABLE IF NOT EXISTS ab_events (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id),
    experiment_id VARCHAR(80) NOT NULL,
    variant       VARCHAR(20) NOT NULL,
    event         VARCHAR(40) NOT NULL,
    value         NUMERIC DEFAULT 1,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ab_events ON ab_events(experiment_id, variant, event, created_at DESC);

-- Experiments registry
CREATE TABLE IF NOT EXISTS experiments (
    id          VARCHAR(80) PRIMARY KEY,
    description TEXT,
    start_date  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date    TIMESTAMPTZ,
    status      VARCHAR(20) DEFAULT 'active'
);

-- Recommendation impressions log (for offline analysis)
CREATE TABLE IF NOT EXISTS rec_impressions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id),
    session_id  VARCHAR(100),
    listing_id  UUID REFERENCES listings(id),
    rec_type    VARCHAR(40),  -- cf | cb | trending | cold_start | hybrid
    position    INTEGER,
    was_clicked BOOLEAN DEFAULT false,
    was_saved   BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_rec_impressions ON rec_impressions(user_id, created_at DESC);

-- Pre-computed similarity scores (nightly batch job)
CREATE TABLE IF NOT EXISTS listing_similarities (
    listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    similar_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    similarity      FLOAT NOT NULL,
    computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (listing_id, similar_id)
);
CREATE INDEX idx_similarities ON listing_similarities(listing_id, similarity DESC);
