import { createClient, type Client, type InValue } from '@libsql/client';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import starterProducts from '@/data/products.json';
import starterSite from '@/data/site.json';
import { OCCASION_SEEDS, PRODUCT_OCCASIONS, TAGGING_VERSION } from './occasion-tags';
import { PERSONALISE_SEEDS, PERSONALISE_VERSION } from '../personalise';

/**
 * One libSQL client per process, created lazily.
 *
 * Local development points at a plain SQLite file; production points at Turso
 * (hosted libSQL) via TURSO_DATABASE_URL. Same SQL either way — the only
 * difference is the connection string, which is why the storefront can move to
 * a serverless host without the queries changing.
 */
const globalForDb = globalThis as unknown as { nekDb?: Promise<Client> };

/**
 * Serverless hosts ship a read-only filesystem, so on Vercel without Turso the
 * database is built in /tmp from data/seed.sql on first use. That is enough for
 * a demo — the shop, cart and WhatsApp ordering all work — but /tmp is per
 * instance and is wiped on redeploy, so nothing written there is durable.
 * Setting TURSO_DATABASE_URL takes over and makes everything persistent.
 */
export const isEphemeral = () => Boolean(process.env.VERCEL) && !process.env.TURSO_DATABASE_URL;

function connection() {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) return { url, authToken: process.env.TURSO_AUTH_TOKEN };

  if (isEphemeral()) return { url: 'file:/tmp/noor-e-kala.db' };

  const file = process.env.DATABASE_PATH || path.join('data', 'store.db');
  const absolute = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  return { url: `file:${absolute}` };
}

export function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Turso is remote, so prefer one batch round-trip over a loop of queries. */
type Statement = { sql: string; args: InValue[] };

async function seed(db: Client) {
  const existing = await db.execute('SELECT COUNT(*) AS count FROM products');
  if (Number(existing.rows[0].count) > 0) return;

  const statements: Statement[] = [];

  starterSite.categories.forEach((category, index) =>
    statements.push({
      sql: 'INSERT INTO categories (key, label, sort_order, is_active) VALUES (?, ?, ?, 1)',
      args: [category.key, category.label, index],
    }),
  );

  starterProducts.products.forEach((product, index) => {
    const extras = 'images' in product && Array.isArray(product.images) ? product.images : [];
    statements.push({
      sql: `INSERT INTO products (id, name, slug, price, mrp, cat, img, images, description, note,
                                  featured, is_new, stock, sold_out, enquiry, is_active, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      args: [
        `starter-${slug(product.name)}`,
        product.name,
        slug(product.name),
        Number(product.price),
        'mrp' in product ? Number(product.mrp) : null,
        product.cat,
        product.img,
        JSON.stringify(extras),
        product.desc ?? null,
        'note' in product ? (product.note as string) : null,
        product.featured ? 1 : 0,
        index < 6 ? 1 : 0,
        null,
        product.sold_out ? 1 : 0,
        product.enquiry ? 1 : 0,
        index,
      ],
    });
  });

  statements.push({
    sql: 'INSERT INTO settings (key, value) VALUES (?, ?)',
    args: ['site', JSON.stringify({ banner: starterSite.banner })],
  });

  await db.batch(statements, 'write');
}

/** Adds columns to databases created before those columns existed. */
async function migrate(db: Client) {
  const columns = (await db.execute('PRAGMA table_info(products)')).rows.map((row) => String(row.name));

  if (!columns.includes('slug')) {
    await db.execute('ALTER TABLE products ADD COLUMN slug TEXT');
    const rows = (await db.execute('SELECT id, name FROM products ORDER BY sort_order, rowid')).rows;
    const seen = new Set<string>();
    const updates: Statement[] = [];
    for (const row of rows) {
      const base = slug(String(row.name)) || 'item';
      let candidate = base;
      let n = 2;
      while (seen.has(candidate)) candidate = `${base}-${n++}`;
      seen.add(candidate);
      updates.push({ sql: 'UPDATE products SET slug = ? WHERE id = ?', args: [candidate, String(row.id)] });
    }
    if (updates.length) await db.batch(updates, 'write');
  }

  await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products (slug)');

  if (!columns.includes('personalise')) {
    await db.execute('ALTER TABLE products ADD COLUMN personalise TEXT');
  }

  await seedOccasions(db);
  await seedPersonalisation(db);
}

/**
 * Creates the starting occasions and applies the curated tags in
 * occasion-tags.ts. Re-runs once per TAGGING_VERSION so a bad set of tags can be
 * corrected in an existing database; the owner's own edits survive after that.
 */
async function seedOccasions(db: Client) {
  const stored = await db.execute({
    sql: "SELECT value FROM settings WHERE key = 'tagging_version'",
    args: [],
  });
  if (Number(stored.rows[0]?.value ?? 0) >= TAGGING_VERSION) return;

  const statements: Statement[] = OCCASION_SEEDS.map((occasion, index) => ({
    sql: `INSERT INTO occasions (key, label, emoji, discount_percent, is_active, sort_order)
          VALUES (?, ?, ?, 0, 1, ?)
          ON CONFLICT(key) DO UPDATE SET label = excluded.label, emoji = excluded.emoji`,
    args: [occasion.key, occasion.label, occasion.emoji, index],
  }));

  const products = (await db.execute('SELECT id, name FROM products')).rows;
  const valid = new Set(OCCASION_SEEDS.map((occasion) => occasion.key));

  for (const product of products) {
    const keys = PRODUCT_OCCASIONS[String(product.name)];
    if (!keys) continue; // a piece the owner added themselves — leave it alone
    statements.push({ sql: 'DELETE FROM product_occasions WHERE product_id = ?', args: [String(product.id)] });
    for (const key of keys) {
      if (valid.has(key)) {
        statements.push({
          sql: 'INSERT OR IGNORE INTO product_occasions (product_id, occasion_key) VALUES (?, ?)',
          args: [String(product.id), key],
        });
      }
    }
  }

  statements.push({
    sql: `INSERT INTO settings (key, value) VALUES ('tagging_version', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    args: [String(TAGGING_VERSION)],
  });

  await db.batch(statements, 'write');
}

/**
 * Fills in the personalisation config for the pieces that ship with the site.
 * Only touches rows that have none, so anything the owner edits in the studio
 * is never overwritten.
 */
async function seedPersonalisation(db: Client) {
  const stored = await db.execute({
    sql: "SELECT value FROM settings WHERE key = 'personalise_version'",
    args: [],
  });
  if (Number(stored.rows[0]?.value ?? 0) >= PERSONALISE_VERSION) return;

  const products = (await db.execute('SELECT id, name, personalise FROM products')).rows;
  const statements: Statement[] = [];

  for (const product of products) {
    // Only the pieces that ship with the site are re-seeded; anything the owner
    // added herself has no entry here and is left alone.
    const config = PERSONALISE_SEEDS[String(product.name)];
    if (!config) continue;
    statements.push({
      sql: 'UPDATE products SET personalise = ? WHERE id = ?',
      args: [JSON.stringify(config), String(product.id)],
    });
  }

  statements.push({
    sql: `INSERT INTO settings (key, value) VALUES ('personalise_version', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    args: [String(PERSONALISE_VERSION)],
  });

  await db.batch(statements, 'write');
}

async function open() {
  const db = createClient(connection());

  if (isEphemeral()) {
    // Fresh /tmp database: load the committed dump, which already contains the
    // schema and every row, then stop. No migration needed — the dump is current.
    const existing = await db
      .execute("SELECT name FROM sqlite_master WHERE type='table' AND name='products'")
      .catch(() => ({ rows: [] }));
    if (!existing.rows.length) {
      await db.executeMultiple(readFileSync(path.join(process.cwd(), 'data', 'seed.sql'), 'utf8'));
    }
    return db;
  }

  await db.executeMultiple(readFileSync(path.join(process.cwd(), 'lib', 'db', 'schema.sql'), 'utf8'));
  await seed(db);
  await migrate(db);
  return db;
}

export function getDb(): Promise<Client> {
  if (!globalForDb.nekDb) globalForDb.nekDb = open();
  return globalForDb.nekDb;
}
