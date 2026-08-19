import type { Row } from '@libsql/client';
import { getDb } from './db';
import type { Category, Product } from './catalog';
import { priceAll, priceProduct, type Occasion, type PricedProduct } from './pricing';
import { parsePersonalise } from './personalise';

export type { Occasion, PricedProduct };

export type Banner = { on: boolean; text: string; link?: string };

export type Order = {
  id: number;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  customer_note: string | null;
  items: { name: string; qty: number; price: number; image?: string }[];
  total: number;
  status: string;
  created_at: string;
};

export type Review = {
  id: number;
  product_id: string;
  name: string;
  rating: number;
  text: string;
  status: string;
  created_at: string;
  product_name?: string;
};

export type StockAlert = {
  id: number;
  product_id: string;
  contact: string;
  notified: number;
  created_at: string;
  product_name?: string;
  back_in_stock?: number;
};

const PRODUCT_COLUMNS = `
  id, name, slug, price, mrp, cat, img, images,
  description AS "desc", note,
  featured, is_new AS "new", stock, sold_out, enquiry, is_active, sort_order, personalise, created_at
`;

const bool = (value: unknown) => Boolean(Number(value));
const str = (value: unknown) => (value === null || value === undefined ? null : String(value));

function toProduct(row: Row): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: str(row.slug),
    price: Number(row.price),
    mrp: row.mrp === null ? null : Number(row.mrp),
    cat: String(row.cat),
    img: String(row.img),
    images: JSON.parse(String(row.images || '[]')),
    desc: str(row.desc),
    note: str(row.note),
    featured: bool(row.featured),
    new: bool(row.new),
    stock: row.stock === null ? null : Number(row.stock),
    sold_out: bool(row.sold_out),
    enquiry: bool(row.enquiry),
    is_active: bool(row.is_active),
    sort_order: Number(row.sort_order),
    personalise: parsePersonalise(row.personalise),
    created_at: str(row.created_at),
  };
}

/** product_id -> occasion keys, fetched in one query. */
async function occasionMap() {
  const db = await getDb();
  const { rows } = await db.execute('SELECT product_id, occasion_key FROM product_occasions');
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const id = String(row.product_id);
    map.set(id, [...(map.get(id) ?? []), String(row.occasion_key)]);
  }
  return map;
}

export async function getOccasions(includeHidden = false): Promise<Occasion[]> {
  const db = await getDb();
  const where = includeHidden ? '' : 'WHERE is_active = 1';
  const { rows } = await db.execute(`SELECT * FROM occasions ${where} ORDER BY sort_order ASC, label ASC`);
  return rows.map((row) => ({
    key: String(row.key),
    label: String(row.label),
    emoji: str(row.emoji),
    headline: str(row.headline),
    discount_percent: Number(row.discount_percent),
    starts_on: str(row.starts_on),
    ends_on: str(row.ends_on),
    is_active: bool(row.is_active),
    sort_order: Number(row.sort_order),
  }));
}

export async function getProducts(): Promise<PricedProduct[]> {
  const db = await getDb();
  const [{ rows }, tags, occasions] = await Promise.all([
    db.execute(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC`),
    occasionMap(),
    getOccasions(),
  ]);
  const withTags = rows.map((row) => ({ ...toProduct(row), occasions: tags.get(String(row.id)) ?? [] }));
  return priceAll(withTags, occasions);
}

export async function getAllProducts(): Promise<(Product & { occasions: string[] })[]> {
  const db = await getDb();
  const [{ rows }, tags] = await Promise.all([
    db.execute(`SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY sort_order ASC, created_at DESC`),
    occasionMap(),
  ]);
  return rows.map((row) => ({ ...toProduct(row), occasions: tags.get(String(row.id)) ?? [] }));
}

export async function getCategories(includeHidden = false): Promise<Category[]> {
  const db = await getDb();
  const where = includeHidden ? '' : 'WHERE is_active = 1';
  const { rows } = await db.execute(
    `SELECT key, label, sort_order, is_active FROM categories ${where} ORDER BY sort_order ASC`,
  );
  return rows.map((row) => ({
    key: String(row.key),
    label: String(row.label),
    sort_order: Number(row.sort_order),
    is_active: bool(row.is_active),
  }));
}

export async function getBanner(): Promise<Banner> {
  const fallback: Banner = { on: false, text: '', link: '' };
  const db = await getDb();
  const { rows } = await db.execute("SELECT value FROM settings WHERE key = 'site'");
  if (!rows.length) return fallback;
  try {
    return (JSON.parse(String(rows[0].value)) as { banner?: Banner }).banner ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getProductBySlug(slug: string): Promise<PricedProduct | null> {
  const db = await getDb();
  const { rows } = await db.execute({
    sql: `SELECT ${PRODUCT_COLUMNS} FROM products WHERE slug = ? AND is_active = 1`,
    args: [slug],
  });
  if (!rows.length) return null;

  const [tagRows, occasions] = await Promise.all([
    db.execute({ sql: 'SELECT occasion_key FROM product_occasions WHERE product_id = ?', args: [String(rows[0].id)] }),
    getOccasions(),
  ]);
  const tags = tagRows.rows.map((row) => String(row.occasion_key));
  return priceProduct({ ...toProduct(rows[0]), occasions: tags }, occasions);
}

/** One product's real server-side price. Never trust the browser's. */
export async function getPriceByName(name: string): Promise<number | null> {
  const db = await getDb();
  const { rows } = await db.execute({
    sql: 'SELECT slug FROM products WHERE name = ? AND is_active = 1',
    args: [name],
  });
  if (!rows.length) return null;
  const product = await getProductBySlug(String(rows[0].slug));
  return product?.effectivePrice ?? null;
}

export async function getOrders(): Promise<Order[]> {
  const db = await getDb();
  const { rows } = await db.execute('SELECT * FROM orders ORDER BY created_at DESC, id DESC');
  return rows.map((row) => ({
    id: Number(row.id),
    customer_name: String(row.customer_name),
    phone: String(row.phone),
    email: str(row.email),
    address: str(row.address),
    customer_note: str(row.customer_note),
    items: JSON.parse(String(row.items || '[]')),
    total: Number(row.total),
    status: String(row.status),
    created_at: String(row.created_at),
  }));
}

function toReview(row: Row): Review {
  return {
    id: Number(row.id),
    product_id: String(row.product_id),
    name: String(row.name),
    rating: Number(row.rating),
    text: String(row.text),
    status: String(row.status),
    created_at: String(row.created_at),
    product_name: row.product_name ? String(row.product_name) : undefined,
  };
}

/** Approved reviews for one product, newest first. */
export async function getReviews(productId: string): Promise<Review[]> {
  const db = await getDb();
  const { rows } = await db.execute({
    sql: "SELECT * FROM reviews WHERE product_id = ? AND status = 'approved' ORDER BY created_at DESC, id DESC",
    args: [productId],
  });
  return rows.map(toReview);
}

/** Everything, including pending — for the owner studio. */
export async function getAllReviews(): Promise<Review[]> {
  const db = await getDb();
  const { rows } = await db.execute(`
    SELECT r.*, p.name AS product_name FROM reviews r
    LEFT JOIN products p ON p.id = r.product_id
    ORDER BY (r.status = 'pending') DESC, r.created_at DESC, r.id DESC
  `);
  return rows.map(toReview);
}

/** Waiting "notify me" requests, with whether the piece is back yet. */
export async function getStockAlerts(): Promise<StockAlert[]> {
  const db = await getDb();
  const { rows } = await db.execute(`
    SELECT a.*, p.name AS product_name,
           CASE WHEN p.sold_out = 0 AND p.is_active = 1 THEN 1 ELSE 0 END AS back_in_stock
    FROM stock_alerts a
    LEFT JOIN products p ON p.id = a.product_id
    WHERE a.notified = 0
    ORDER BY back_in_stock DESC, a.created_at DESC
  `);
  return rows.map((row) => ({
    id: Number(row.id),
    product_id: String(row.product_id),
    contact: String(row.contact),
    notified: Number(row.notified),
    created_at: String(row.created_at),
    product_name: row.product_name ? String(row.product_name) : undefined,
    back_in_stock: Number(row.back_in_stock),
  }));
}

// Every storefront page needs these.
export async function getStorefrontData() {
  const [products, categories, occasions, banner] = await Promise.all([
    getProducts(),
    getCategories(),
    getOccasions(),
    getBanner(),
  ]);
  return { products, categories, occasions, banner };
}

/** Approved reviews across all products, newest first — for the homepage. */
export async function getApprovedReviews(limit = 6): Promise<Review[]> {
  const db = await getDb();
  const { rows } = await db.execute({
    sql: `SELECT r.*, p.name AS product_name FROM reviews r
          LEFT JOIN products p ON p.id = r.product_id
          WHERE r.status = 'approved'
          ORDER BY r.created_at DESC, r.id DESC LIMIT ?`,
    args: [limit],
  });
  return rows.map(toReview);
}
