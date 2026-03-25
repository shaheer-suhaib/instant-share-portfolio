-- ─────────────────────────────────────────────────────────────────────────────
-- Portfolio Share — PostgreSQL Schema
-- Run once:  psql $DATABASE_URL -f src/db/schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- provides gen_random_uuid()

-- ── portfolios (root table) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolios (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  code         VARCHAR(8)   UNIQUE NOT NULL,           -- public shareable code
  template_id  SMALLINT     NOT NULL CHECK (template_id BETWEEN 1 AND 3),
  name         VARCHAR(255) NOT NULL,
  title        VARCHAR(255),                           -- e.g. "Full Stack Dev"
  bio          TEXT,
  email        VARCHAR(255),
  phone        VARCHAR(50),
  location     VARCHAR(255),
  avatar_url   TEXT,                                   -- Cloudinary image URL
  resume_url   TEXT,                                   -- Cloudinary PDF URL
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,     -- soft delete
  views        INTEGER      NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── projects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id   UUID         NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  tech_stack     TEXT[]       NOT NULL DEFAULT '{}',   -- ["React","Node.js"]
  live_url       TEXT,
  repo_url       TEXT,
  display_order  SMALLINT     NOT NULL DEFAULT 0
);

-- ── project_images ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_images (
  id             UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID      NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url            TEXT      NOT NULL,
  is_thumbnail   BOOLEAN   NOT NULL DEFAULT FALSE,
  display_order  SMALLINT  NOT NULL DEFAULT 0
);

-- ── skills ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id   UUID         NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  level          VARCHAR(50)  CHECK (level IN ('beginner','intermediate','advanced','expert')),
  category       VARCHAR(100),                         -- "frontend", "backend", "tools"
  display_order  SMALLINT     NOT NULL DEFAULT 0
);

-- ── services ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id   UUID         NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  price_range    VARCHAR(100),                         -- "$50–$200 / hr"
  display_order  SMALLINT     NOT NULL DEFAULT 0
);

-- ── social_links ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_links (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id  UUID        NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  platform      VARCHAR(50) NOT NULL,                  -- "github", "linkedin"
  url           TEXT        NOT NULL
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_portfolios_code     ON portfolios(code);
CREATE INDEX IF NOT EXISTS idx_portfolios_active   ON portfolios(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_portfolio  ON projects(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_skills_portfolio    ON skills(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_services_portfolio  ON services(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_social_portfolio    ON social_links(portfolio_id);

-- ── Auto-update updated_at on portfolios ──────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_portfolios_updated_at ON portfolios;
CREATE TRIGGER trg_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
