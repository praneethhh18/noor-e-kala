PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE categories (
  key        TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "categories" ("key", "label", "sort_order", "is_active") VALUES ('resin', 'Resin Art', 0, 1);
INSERT INTO "categories" ("key", "label", "sort_order", "is_active") VALUES ('jewel', 'Jewellery', 1, 1);
INSERT INTO "categories" ("key", "label", "sort_order", "is_active") VALUES ('gift', 'Gifts', 2, 1);
INSERT INTO "categories" ("key", "label", "sort_order", "is_active") VALUES ('crochet', 'Crochet', 3, 1);
INSERT INTO "categories" ("key", "label", "sort_order", "is_active") VALUES ('bouquet', 'Bouquets', 4, 1);

CREATE TABLE products (
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
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
, slug TEXT, personalise TEXT);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-green-gold-geode-clock', 'Green & Gold Geode Clock', 3000, NULL, 'resin', '/img/clock-green.jpg', '[]', 'A statement geode wall clock in emerald, cream and gold resin. Every swirl is poured by hand, so no two are ever alike.', NULL, 1, 1, NULL, 0, 0, 1, 0, '2026-08-17 19:30:09', 'green-gold-geode-clock', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-black-silver-geode-clock', 'Black & Silver Geode Clock', 2499, NULL, 'resin', '/img/clock-black.jpg', '[]', 'A bold black, white and silver geode resin wall clock that turns any wall into a piece of art.', NULL, 1, 1, NULL, 0, 0, 1, 1, '2026-08-17 19:30:09', 'black-silver-geode-clock', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-home-sweet-home-key-holder', '"Home Sweet Home" Key Holder', 899, NULL, 'resin', '/img/key-holder.jpg', '[]', 'A pearly resin key holder with gold accents and five sturdy hooks. Lovely by the front door.', NULL, 0, 1, NULL, 0, 0, 1, 2, '2026-08-17 19:30:09', 'home-sweet-home-key-holder', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-personalised-name-tray', 'Personalised Name Tray', 699, NULL, 'resin', '/img/name-tray.jpg', '[]', 'A trinket tray set with real dried flowers, gold flake and your name in gold.', NULL, 0, 1, NULL, 0, 0, 1, 3, '2026-08-17 19:30:09', 'personalised-name-tray', '{"label":"Name to put on the tray","placeholder":"Hafsa","max":16,"style":"script","colours":[{"name":"Gold","value":"#C9A227"},{"name":"Rose gold","value":"#D99A8A"},{"name":"White","value":"#FFFFFF"}],"position":{"x":50,"y":62}}');
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-floral-coaster-set', 'Floral Coaster Set', 599, 699, 'resin', '/img/coasters.jpg', '[]', 'A set of resin coasters with pressed flowers and gold flake. Pretty and practical.', NULL, 0, 1, NULL, 0, 0, 1, 4, '2026-08-17 19:30:09', 'floral-coaster-set', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-couple-name-letters', 'Couple Name Letters', 799, NULL, 'resin', '/img/name-letters.jpg', '[]', 'Your initials cast in resin with real petals. A sweet keepsake for couples.', NULL, 0, 1, NULL, 0, 0, 1, 5, '2026-08-17 19:30:09', 'couple-name-letters', '{"label":"Two initials or short names","placeholder":"S & M","max":20,"style":"letters","colours":[{"name":"Rose gold","value":"#D99A8A"},{"name":"Gold","value":"#C9A227"},{"name":"White","value":"#FFFFFF"}],"position":{"x":50,"y":52}}');
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-preserved-flower-frame', 'Preserved Flower Frame', 999, NULL, 'resin', '/img/preserved-frame.jpg', '[]', 'Your special flowers preserved in resin with a heartfelt message and date.', NULL, 0, 0, NULL, 0, 0, 1, 6, '2026-08-17 19:30:09', 'preserved-flower-frame', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-resin-photo-frame', 'Resin Photo Frame', 699, NULL, 'resin', '/img/photo-frame.jpg', '[]', 'A resin photo frame with dried florals, holding your favourite memory.', NULL, 0, 0, NULL, 0, 0, 1, 7, '2026-08-17 19:30:09', 'resin-photo-frame', '{"label":"Name or short line","placeholder":"Our little family","max":24,"style":"script","colours":[{"name":"Gold","value":"#C9A227"},{"name":"White","value":"#FFFFFF"},{"name":"Rose gold","value":"#D99A8A"}],"position":{"x":50,"y":78},"hint":"Send your photo on WhatsApp after ordering."}');
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-family-photo-frame', 'Family Photo Frame', 749, NULL, 'resin', '/img/family-frame.jpg', '[]', 'A family photo set in resin with flowers and gold, made to treasure.', NULL, 0, 0, NULL, 0, 0, 1, 8, '2026-08-17 19:30:09', 'family-photo-frame', '{"label":"Family name or line","placeholder":"Family","max":24,"style":"script","colours":[{"name":"Gold","value":"#C9A227"},{"name":"White","value":"#FFFFFF"}],"position":{"x":50,"y":80},"hint":"Send your photo on WhatsApp after ordering."}');
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-resin-heart-earrings', 'Resin Heart Earrings', 349, 449, 'jewel', '/img/resin-earrings.jpg', '[]', 'Heart-shaped resin earrings with rose petals and gold flake, on gold hooks.', NULL, 1, 0, NULL, 0, 0, 1, 9, '2026-08-17 19:30:09', 'resin-heart-earrings', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-floral-jewellery-set', 'Floral Jewellery Set', 599, NULL, 'jewel', '/img/resin-jewel-set.jpg', '["/img/pendant.jpg","/img/resin-earrings.jpg"]', 'A matching resin pendant and stud earrings with real flowers set in gold.', NULL, 1, 0, NULL, 0, 0, 1, 10, '2026-08-17 19:30:09', 'floral-jewellery-set', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-fingerprint-memory-pendant', 'Fingerprint Memory Pendant', 899, NULL, 'jewel', '/img/fingerprint-pendant.jpg', '[]', 'A heart pendant carrying a real fingerprint. A deeply personal keepsake.', NULL, 0, 0, NULL, 0, 0, 1, 11, '2026-08-17 19:30:09', 'fingerprint-memory-pendant', '{"label":"Name or word beside the print","placeholder":"Dad","max":12,"style":"engraved","colours":[{"name":"Gold","value":"#C9A227"},{"name":"Silver","value":"#C9CDD2"}],"position":{"x":56,"y":46},"hint":"Send a clear fingerprint photo on WhatsApp and I will guide you."}');
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-floral-resin-pendant', 'Floral Resin Pendant', 399, NULL, 'jewel', '/img/pendant.jpg', '[]', 'A dainty resin pendant with a pressed flower, on a delicate chain.', NULL, 0, 0, NULL, 0, 0, 1, 12, '2026-08-17 19:30:09', 'floral-resin-pendant', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-preserved-flower-jhumkas', 'Preserved Flower Jhumkas', 449, NULL, 'jewel', '/img/jhumka-maroon.jpg', '[]', 'Traditional jhumkas with preserved flowers set in resin and gold beads.', NULL, 0, 0, NULL, 0, 0, 1, 13, '2026-08-17 19:30:09', 'preserved-flower-jhumkas', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-daisy-resin-jhumkas', 'Daisy Resin Jhumkas', 449, NULL, 'jewel', '/img/jhumka-red.jpg', '[]', 'Statement jhumkas with daisies preserved in resin. Ethnic and eye-catching.', NULL, 0, 0, NULL, 0, 0, 1, 14, '2026-08-17 19:30:09', 'daisy-resin-jhumkas', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-wedding-calendar-keepsake', 'Wedding Calendar Keepsake', 1299, NULL, 'gift', '/img/wedding-keepsake.jpg', '[]', 'Your wedding date and names in resin with dried flowers, on a little wooden easel.', NULL, 1, 0, NULL, 0, 0, 1, 15, '2026-08-17 19:30:09', 'wedding-calendar-keepsake', '{"label":"Names and wedding date","placeholder":"Rajat & Priyanka · 24.11.2025","max":40,"style":"engraved","colours":[{"name":"Gold","value":"#C9A227"},{"name":"Deep brown","value":"#3B2C26"}],"position":{"x":50,"y":58},"hint":"I will lay this out beautifully — the exact spacing is up to me."}');
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-photo-memory-keychain', 'Photo Memory Keychain', 299, 399, 'gift', '/img/photo-keychain.jpg', '[]', 'A resin keychain holding mini polaroids and dried flowers.', NULL, 0, 0, NULL, 0, 0, 1, 16, '2026-08-17 19:30:09', 'photo-memory-keychain', '{"label":"Name on the back","placeholder":"Aanya","max":14,"style":"engraved","colours":[{"name":"Gold","value":"#C9A227"},{"name":"Silver","value":"#C9CDD2"}],"position":{"x":50,"y":70},"hint":"Send your photo on WhatsApp after ordering."}');
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-mini-gift-hamper', 'Mini Gift Hamper', 899, NULL, 'gift', '/img/coll-gift.jpg', '[]', 'A curated little hamper of handmade goodies, wrapped and ready to gift.', NULL, 0, 0, NULL, 0, 0, 1, 17, '2026-08-17 19:30:09', 'mini-gift-hamper', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-varmala-preservation-frame', 'Varmala Preservation Frame', 2499, NULL, 'gift', '/img/varmala-frame.jpg', '["/img/varmala-box.jpg"]', 'Preserve your wedding varmala forever in a framed resin keepsake with your photo and date.', '💌 Made to order. Message me first — you''ll post your varmala / flowers to me, then I''ll preserve them into your keepsake by hand.', 1, 0, NULL, 0, 1, 1, 18, '2026-08-17 19:30:09', 'varmala-preservation-frame', '{"label":"Names and date for the frame","placeholder":"Rajat & Priyanka · 24.11.2025","max":40,"style":"engraved","colours":[{"name":"Gold","value":"#C9A227"},{"name":"Deep brown","value":"#3B2C26"}],"position":{"x":50,"y":82},"hint":"Post your varmala to me within a few days of the wedding — I will explain how."}');
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-varmala-preservation-keepsake', 'Varmala Preservation Keepsake', 2299, NULL, 'gift', '/img/varmala-box.jpg', '[]', 'Your wedding varmala and photo preserved beautifully in a resin keepsake.', '💌 Made to order. Message me first — you''ll post your varmala / flowers to me, then I''ll preserve them into your keepsake by hand.', 0, 0, NULL, 0, 1, 1, 19, '2026-08-17 19:30:09', 'varmala-preservation-keepsake', '{"label":"Names and date","placeholder":"Aisha & Omar · 12.02.2026","max":40,"style":"engraved","colours":[{"name":"Gold","value":"#C9A227"},{"name":"Deep brown","value":"#3B2C26"}],"position":{"x":50,"y":80},"hint":"Post your varmala to me within a few days of the wedding — I will explain how."}');
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-resin-feather-bookmark', 'Resin Feather Bookmark', 199, NULL, 'gift', '/img/bookmark.jpg', '[]', 'A translucent resin feather bookmark. A lovely little gift for readers.', NULL, 0, 0, NULL, 0, 0, 1, 20, '2026-08-17 19:30:09', 'resin-feather-bookmark', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-tassel-photo-keychain', 'Tassel Photo Keychain', 299, NULL, 'gift', '/img/keychain-tassel.jpg', '[]', 'A resin photo keychain finished with a soft tassel and charm.', NULL, 0, 0, NULL, 0, 0, 1, 21, '2026-08-17 19:30:09', 'tassel-photo-keychain', '{"label":"Name on the back","placeholder":"Meera","max":14,"style":"engraved","colours":[{"name":"Gold","value":"#C9A227"},{"name":"Rose gold","value":"#D99A8A"}],"position":{"x":50,"y":72},"hint":"Send your photo on WhatsApp after ordering."}');
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-letter-keychain', 'Letter Keychain', 199, NULL, 'gift', '/img/keychain-letter.jpg', '[]', 'Your initial in colourful resin. A cute bag charm or gift.', NULL, 0, 0, NULL, 0, 0, 1, 22, '2026-08-17 19:30:09', 'letter-keychain', '{"label":"Letter or initial","placeholder":"A","max":3,"style":"letters","colours":[{"name":"Gold","value":"#C9A227"},{"name":"Silver","value":"#C9CDD2"},{"name":"Rose gold","value":"#D99A8A"}],"position":{"x":50,"y":50}}');
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-crochet-tulip-bouquet', 'Crochet Tulip Bouquet', 499, NULL, 'crochet', '/img/tulip-bouquet.jpg', '[]', 'A hand-crocheted tulip bouquet that blooms forever.', NULL, 0, 0, NULL, 0, 0, 1, 23, '2026-08-17 19:30:09', 'crochet-tulip-bouquet', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-amigurumi-plushie', 'Amigurumi Plushie', 399, NULL, 'crochet', '/img/gal-1.jpg', '[]', 'A cuddly hand-crocheted plushie, made to order in your colours.', NULL, 0, 0, NULL, 0, 0, 1, 24, '2026-08-17 19:30:09', 'amigurumi-plushie', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-crochet-keychain', 'Crochet Keychain', 149, NULL, 'crochet', '/img/coll-crochet.jpg', '[]', 'A little hand-crocheted keychain charm.', NULL, 0, 0, NULL, 0, 0, 1, 25, '2026-08-17 19:30:09', 'crochet-keychain', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-fresh-flower-bouquet', 'Fresh Flower Bouquet', 599, NULL, 'bouquet', '/img/gal-4.jpg', '[]', 'A hand-tied bouquet of fresh seasonal blooms.', NULL, 0, 0, NULL, 0, 0, 1, 26, '2026-08-17 19:30:09', 'fresh-flower-bouquet', NULL);
INSERT INTO "products" ("id", "name", "price", "mrp", "cat", "img", "images", "description", "note", "featured", "is_new", "stock", "sold_out", "enquiry", "is_active", "sort_order", "created_at", "slug", "personalise") VALUES ('starter-mixed-crochet-bouquet', 'Mixed Crochet Bouquet', 749, NULL, 'bouquet', '/img/mixed-bouquet.jpg', '[]', 'A mixed bouquet of crochet flowers, forever fresh.', NULL, 0, 0, NULL, 0, 0, 1, 27, '2026-08-17 19:30:09', 'mixed-crochet-bouquet', NULL);

CREATE TABLE orders (
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

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL                         -- JSON blob
);
INSERT INTO "settings" ("key", "value") VALUES ('site', '{"banner":{"on":true,"text":"🎁 Grand opening offer — message on WhatsApp for a sweet first-order discount 💛","link":""}}');
INSERT INTO "settings" ("key", "value") VALUES ('tagging_version', '2');
INSERT INTO "settings" ("key", "value") VALUES ('personalise_version', '2');

CREATE TABLE reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  name       TEXT NOT NULL,
  rating     INTEGER NOT NULL DEFAULT 5,
  text       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending',  -- pending | approved
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE TABLE stock_alerts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  contact    TEXT NOT NULL,                    -- phone or email, as typed
  notified   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  UNIQUE (product_id, contact)
);

CREATE TABLE occasions (
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
INSERT INTO "occasions" ("key", "label", "emoji", "headline", "discount_percent", "starts_on", "ends_on", "is_active", "sort_order") VALUES ('wedding', 'Weddings', '💍', NULL, 0, NULL, NULL, 1, 0);
INSERT INTO "occasions" ("key", "label", "emoji", "headline", "discount_percent", "starts_on", "ends_on", "is_active", "sort_order") VALUES ('anniversary', 'Anniversaries', '💛', NULL, 0, NULL, NULL, 1, 1);
INSERT INTO "occasions" ("key", "label", "emoji", "headline", "discount_percent", "starts_on", "ends_on", "is_active", "sort_order") VALUES ('for-mum', 'For Mum', '🌷', NULL, 0, NULL, NULL, 1, 2);
INSERT INTO "occasions" ("key", "label", "emoji", "headline", "discount_percent", "starts_on", "ends_on", "is_active", "sort_order") VALUES ('rakhi', 'Rakhi', '🪢', NULL, 0, NULL, NULL, 1, 3);
INSERT INTO "occasions" ("key", "label", "emoji", "headline", "discount_percent", "starts_on", "ends_on", "is_active", "sort_order") VALUES ('newborn', 'New Baby', '🍼', NULL, 0, NULL, NULL, 1, 4);
INSERT INTO "occasions" ("key", "label", "emoji", "headline", "discount_percent", "starts_on", "ends_on", "is_active", "sort_order") VALUES ('farewell', 'Farewell & Thank You', '🎁', NULL, 0, NULL, NULL, 1, 5);
INSERT INTO "occasions" ("key", "label", "emoji", "headline", "discount_percent", "starts_on", "ends_on", "is_active", "sort_order") VALUES ('new-home', 'New Home', '🏡', NULL, 0, NULL, NULL, 1, 3);

CREATE TABLE product_occasions (
  product_id   TEXT NOT NULL,
  occasion_key TEXT NOT NULL,
  PRIMARY KEY (product_id, occasion_key),
  FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  FOREIGN KEY (occasion_key) REFERENCES occasions (key) ON DELETE CASCADE
);
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-green-gold-geode-clock', 'new-home');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-green-gold-geode-clock', 'wedding');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-black-silver-geode-clock', 'new-home');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-black-silver-geode-clock', 'wedding');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-home-sweet-home-key-holder', 'new-home');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-personalised-name-tray', 'new-home');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-personalised-name-tray', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-floral-coaster-set', 'new-home');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-floral-coaster-set', 'farewell');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-couple-name-letters', 'wedding');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-couple-name-letters', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-preserved-flower-frame', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-preserved-flower-frame', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-resin-photo-frame', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-resin-photo-frame', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-resin-photo-frame', 'farewell');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-family-photo-frame', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-family-photo-frame', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-resin-heart-earrings', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-resin-heart-earrings', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-floral-jewellery-set', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-floral-jewellery-set', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-fingerprint-memory-pendant', 'newborn');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-fingerprint-memory-pendant', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-fingerprint-memory-pendant', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-floral-resin-pendant', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-floral-resin-pendant', 'rakhi');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-preserved-flower-jhumkas', 'wedding');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-preserved-flower-jhumkas', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-daisy-resin-jhumkas', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-daisy-resin-jhumkas', 'rakhi');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-wedding-calendar-keepsake', 'wedding');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-wedding-calendar-keepsake', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-photo-memory-keychain', 'farewell');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-photo-memory-keychain', 'rakhi');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-photo-memory-keychain', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-mini-gift-hamper', 'farewell');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-mini-gift-hamper', 'rakhi');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-mini-gift-hamper', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-varmala-preservation-frame', 'wedding');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-varmala-preservation-frame', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-varmala-preservation-keepsake', 'wedding');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-varmala-preservation-keepsake', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-resin-feather-bookmark', 'farewell');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-resin-feather-bookmark', 'rakhi');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-tassel-photo-keychain', 'farewell');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-tassel-photo-keychain', 'rakhi');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-letter-keychain', 'rakhi');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-letter-keychain', 'farewell');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-crochet-tulip-bouquet', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-crochet-tulip-bouquet', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-crochet-tulip-bouquet', 'farewell');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-amigurumi-plushie', 'newborn');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-amigurumi-plushie', 'rakhi');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-crochet-keychain', 'rakhi');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-crochet-keychain', 'farewell');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-fresh-flower-bouquet', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-fresh-flower-bouquet', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-fresh-flower-bouquet', 'farewell');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-mixed-crochet-bouquet', 'for-mum');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-mixed-crochet-bouquet', 'anniversary');
INSERT INTO "product_occasions" ("product_id", "occasion_key") VALUES ('starter-mixed-crochet-bouquet', 'farewell');

COMMIT;