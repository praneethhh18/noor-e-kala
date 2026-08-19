-- Noor e Kala local store database.
-- Column names avoid SQL keywords (`desc`), so reads alias them back to the
-- names the app types use.

CREATE TABLE IF NOT EXISTS categories (
  key        TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  price       REAL NOT NULL DEFAULT 0,
  mrp         REAL,
  cat         TEXT NOT NULL,
  img         TEXT NOT NULL,
  images      TEXT NOT NULL DEFAULT '[]',   -- JSON array of extra image URLs
  description TEXT,
  note        TEXT,
  featured    INTEGER NOT NULL DEFAULT 0,
  is_new      INTEGER NOT NULL DEFAULT 0,
  stock       INTEGER,
  sold_out    INTEGER NOT NULL DEFAULT 0,
  enquiry     INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  -- JSON describing what the customer can put on this piece; NULL = nothing.
  -- See lib/personalise.ts for the shape.
  personalise TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  address       TEXT,
  customer_note TEXT,
  items         TEXT NOT NULL,                -- JSON array of line items
  total         REAL NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'new',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL                         -- JSON blob
);

-- Customer reviews. Held as pending until the owner approves them in the studio,
-- so nothing appears on the shop without being read first.
CREATE TABLE IF NOT EXISTS reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  name       TEXT NOT NULL,
  rating     INTEGER NOT NULL DEFAULT 5,
  text       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending',  -- pending | approved
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id, status);

-- "Tell me when this is back" requests on sold-out pieces.
CREATE TABLE IF NOT EXISTS stock_alerts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  contact    TEXT NOT NULL,                    -- phone or email, as typed
  notified   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  UNIQUE (product_id, contact)
);

CREATE INDEX IF NOT EXISTS idx_alerts_product ON stock_alerts (product_id, notified);

-- Occasions double as browse tags ("Wedding", "For Mum") and as sale campaigns.
-- discount_percent = 0 means it is only a tag; above 0 makes it a live offer for
-- the pieces tagged with it, between starts_on and ends_on.
CREATE TABLE IF NOT EXISTS occasions (
  key              TEXT PRIMARY KEY,
  label            TEXT NOT NULL,
  emoji            TEXT,
  headline         TEXT,              -- "Rakhi Special — 15% off everything for siblings"
  discount_percent REAL NOT NULL DEFAULT 0,
  starts_on        TEXT,              -- YYYY-MM-DD, inclusive; NULL = always
  ends_on          TEXT,              -- YYYY-MM-DD, inclusive; NULL = no end
  is_active        INTEGER NOT NULL DEFAULT 1,
  sort_order       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_occasions (
  product_id   TEXT NOT NULL,
  occasion_key TEXT NOT NULL,
  PRIMARY KEY (product_id, occasion_key),
  FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  FOREIGN KEY (occasion_key) REFERENCES occasions (key) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_occasions ON product_occasions (occasion_key);

CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_orders_created  ON orders (created_at DESC);
