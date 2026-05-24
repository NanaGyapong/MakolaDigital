-- ============================================================
-- MAKOLA DIGITAL — PostgreSQL Database Schema v1.0
-- Marketplace: Products · Services · Jobs · Rentals
-- ============================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";       -- location search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- fuzzy text search

-- ── ENUMS ───────────────────────────────────────────────────
CREATE TYPE listing_type   AS ENUM ('product', 'service', 'job', 'rental');
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'paused', 'sold', 'expired', 'flagged');
CREATE TYPE user_role      AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE kyc_status     AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE order_status   AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'disputed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE currency       AS ENUM ('GHS', 'NGN', 'USD', 'GBP', 'EUR', 'KES', 'ZAR');
CREATE TYPE payment_method AS ENUM ('mobile_money', 'card', 'bank_transfer', 'paystack', 'flutterwave', 'stripe');

-- ── USERS ───────────────────────────────────────────────────
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(30) UNIQUE,
    password_hash   TEXT NOT NULL,
    role            user_role NOT NULL DEFAULT 'buyer',
    full_name       VARCHAR(120) NOT NULL,
    username        VARCHAR(60) UNIQUE NOT NULL,
    avatar_url      TEXT,
    bio             TEXT,
    country         CHAR(2) NOT NULL DEFAULT 'GH',   -- ISO 3166-1 alpha-2
    city            VARCHAR(80),
    location        GEOGRAPHY(POINT, 4326),           -- PostGIS lat/lng
    kyc_status      kyc_status NOT NULL DEFAULT 'unverified',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    last_seen_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_country   ON users(country);
CREATE INDEX idx_users_location  ON users USING GIST(location);
CREATE INDEX idx_users_username  ON users(username);

-- ── SELLER PROFILES ─────────────────────────────────────────
CREATE TABLE seller_profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name   VARCHAR(120) NOT NULL,
    business_reg_no VARCHAR(80),
    description     TEXT,
    logo_url        TEXT,
    website         VARCHAR(255),
    social_links    JSONB DEFAULT '{}',   -- { instagram, twitter, whatsapp }
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at     TIMESTAMPTZ,
    plan            VARCHAR(20) NOT NULL DEFAULT 'free',  -- free | pro | enterprise
    plan_expires_at TIMESTAMPTZ,
    total_sales     INTEGER NOT NULL DEFAULT 0,
    response_rate   NUMERIC(5,2),          -- 0-100%
    response_time   INTEGER,               -- avg minutes
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ── CATEGORIES ──────────────────────────────────────────────
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    parent_id   INTEGER REFERENCES categories(id),
    name        VARCHAR(80) NOT NULL,
    slug        VARCHAR(80) UNIQUE NOT NULL,
    icon        VARCHAR(10),
    listing_type listing_type,   -- NULL means any type allowed
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO categories (name, slug, icon, listing_type, sort_order) VALUES
  ('Electronics',       'electronics',      '📱', 'product',  1),
  ('Vehicles',          'vehicles',         '🚗', 'product',  2),
  ('Fashion',           'fashion',          '👗', 'product',  3),
  ('Food & Agriculture','food-agric',        '🌿', 'product',  4),
  ('Home & Garden',     'home-garden',       '🏡', 'product',  5),
  ('Web Development',   'web-development',   '💻', 'service',  6),
  ('Design & Creative', 'design-creative',   '🎨', 'service',  7),
  ('Construction',      'construction',      '🔨', 'service',  8),
  ('Apartments',        'apartments',        '🏠', 'rental',   9),
  ('Car Rentals',       'car-rentals',       '🚘', 'rental',  10),
  ('Tech Jobs',         'tech-jobs',         '📊', 'job',     11),
  ('Sales & Marketing', 'sales-marketing',   '📣', 'job',     12);

-- ── LISTINGS ────────────────────────────────────────────────
CREATE TABLE listings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     INTEGER NOT NULL REFERENCES categories(id),
    type            listing_type NOT NULL,
    status          listing_status NOT NULL DEFAULT 'draft',
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) UNIQUE NOT NULL,
    description     TEXT NOT NULL,
    price           NUMERIC(14,2),
    price_max       NUMERIC(14,2),           -- for ranges (e.g. "GH₵ 500–2000")
    price_currency  currency NOT NULL DEFAULT 'GHS',
    price_label     VARCHAR(40),             -- e.g. "/month", "/hour", "negotiable"
    is_negotiable   BOOLEAN NOT NULL DEFAULT FALSE,
    location_text   VARCHAR(200),
    location        GEOGRAPHY(POINT, 4326),
    country         CHAR(2) NOT NULL DEFAULT 'GH',
    city            VARCHAR(80),
    is_remote       BOOLEAN NOT NULL DEFAULT FALSE,
    views_count     INTEGER NOT NULL DEFAULT 0,
    saves_count     INTEGER NOT NULL DEFAULT 0,
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    featured_until  TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}',      -- type-specific fields (see below)
    tags            TEXT[] DEFAULT '{}',
    search_vector   TSVECTOR,               -- full-text search
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- metadata examples by type:
-- product:  { condition, brand, quantity, sku, weight_kg, shipping_available }
-- service:  { delivery_time_days, revisions, remote_available, experience_years }
-- job:      { job_type[full_time|part_time|contract|remote], salary_min, salary_max, experience_level, skills[] }
-- rental:   { rental_period[daily|weekly|monthly], bedrooms, bathrooms, amenities[], available_from }

CREATE INDEX idx_listings_seller   ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_type     ON listings(type);
CREATE INDEX idx_listings_status   ON listings(status);
CREATE INDEX idx_listings_country  ON listings(country);
CREATE INDEX idx_listings_location ON listings USING GIST(location);
CREATE INDEX idx_listings_search   ON listings USING GIN(search_vector);
CREATE INDEX idx_listings_tags     ON listings USING GIN(tags);
CREATE INDEX idx_listings_featured ON listings(is_featured, featured_until);

-- Auto-update search vector
CREATE OR REPLACE FUNCTION update_listing_search() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.title,'') || ' ' ||
    coalesce(NEW.description,'') || ' ' ||
    coalesce(NEW.location_text,'') || ' ' ||
    coalesce(array_to_string(NEW.tags,' '),'')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listing_search_update
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_listing_search();

-- ── LISTING IMAGES ──────────────────────────────────────────
CREATE TABLE listing_images (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    thumbnail   TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_images ON listing_images(listing_id);

-- ── SAVED LISTINGS (WISHLIST) ───────────────────────────────
CREATE TABLE saved_listings (
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    listing_id  UUID REFERENCES listings(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);

-- ── ORDERS ──────────────────────────────────────────────────
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id      UUID NOT NULL REFERENCES listings(id),
    buyer_id        UUID NOT NULL REFERENCES users(id),
    seller_id       UUID NOT NULL REFERENCES users(id),
    status          order_status NOT NULL DEFAULT 'pending',
    quantity        INTEGER NOT NULL DEFAULT 1,
    unit_price      NUMERIC(14,2) NOT NULL,
    subtotal        NUMERIC(14,2) NOT NULL,
    platform_fee    NUMERIC(14,2) NOT NULL DEFAULT 0,
    total           NUMERIC(14,2) NOT NULL,
    currency        currency NOT NULL DEFAULT 'GHS',
    notes           TEXT,
    delivery_address JSONB,
    completed_at    TIMESTAMPTZ,
    cancelled_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer  ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ── PAYMENTS ────────────────────────────────────────────────
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id),
    payer_id        UUID NOT NULL REFERENCES users(id),
    amount          NUMERIC(14,2) NOT NULL,
    currency        currency NOT NULL DEFAULT 'GHS',
    method          payment_method NOT NULL,
    status          payment_status NOT NULL DEFAULT 'pending',
    provider_ref    VARCHAR(200),    -- Paystack/Flutterwave/Stripe reference
    provider_data   JSONB DEFAULT '{}',
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── REVIEWS ─────────────────────────────────────────────────
CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID NOT NULL REFERENCES orders(id) UNIQUE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    seller_id   UUID NOT NULL REFERENCES users(id),
    listing_id  UUID NOT NULL REFERENCES listings(id),
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title       VARCHAR(120),
    body        TEXT,
    seller_reply TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_seller  ON reviews(seller_id);
CREATE INDEX idx_reviews_listing ON reviews(listing_id);

-- ── MESSAGES ────────────────────────────────────────────────
CREATE TABLE conversations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id  UUID REFERENCES listings(id) ON DELETE SET NULL,
    buyer_id    UUID NOT NULL REFERENCES users(id),
    seller_id   UUID NOT NULL REFERENCES users(id),
    last_msg_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id),
    body            TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conv ON messages(conversation_id, created_at);

-- ── REPORTS / MODERATION ────────────────────────────────────
CREATE TABLE reports (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id),
    listing_id  UUID REFERENCES listings(id),
    user_id     UUID REFERENCES users(id),
    reason      VARCHAR(80) NOT NULL,
    details     TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'open',  -- open | reviewed | resolved
    resolved_by UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── SUBSCRIPTIONS / PLANS ───────────────────────────────────
CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id       UUID NOT NULL REFERENCES users(id),
    plan            VARCHAR(20) NOT NULL,   -- free | pro | enterprise
    price           NUMERIC(10,2) NOT NULL,
    currency        currency NOT NULL DEFAULT 'GHS',
    starts_at       TIMESTAMPTZ NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    payment_id      UUID REFERENCES payments(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── NOTIFICATIONS ───────────────────────────────────────────
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(60) NOT NULL,    -- new_message | order_update | review | etc.
    title       VARCHAR(120) NOT NULL,
    body        TEXT,
    data        JSONB DEFAULT '{}',
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ── USEFUL VIEWS ────────────────────────────────────────────
CREATE VIEW listing_summary AS
SELECT
  l.*,
  u.full_name       AS seller_name,
  sp.business_name  AS business_name,
  sp.is_verified    AS seller_verified,
  sp.plan           AS seller_plan,
  (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary ORDER BY sort_order LIMIT 1) AS primary_image,
  COALESCE(AVG(r.rating), 0)::NUMERIC(3,1)  AS avg_rating,
  COUNT(r.id)                                AS review_count
FROM listings l
JOIN users u         ON u.id = l.seller_id
LEFT JOIN seller_profiles sp ON sp.user_id = l.seller_id
LEFT JOIN reviews r  ON r.listing_id = l.id
WHERE l.status = 'active'
GROUP BY l.id, u.full_name, sp.business_name, sp.is_verified, sp.plan;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
