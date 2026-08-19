'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, isValidSession } from '@/lib/auth';
import { getDb, slug } from '@/lib/db';
import { saveImages } from '@/lib/storage';

async function requireOwner() {
  const store = await cookies();
  if (!isValidSession(store.get(SESSION_COOKIE)?.value)) redirect('/login');
  return getDb();
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function money(formData: FormData, key: string) {
  const raw = text(formData, key);
  return raw ? Number(raw) : null;
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === 'on' ? 1 : 0;
}

/**
 * Every cached storefront route. Missing one here means the shop keeps serving
 * a stale page after an edit — /offers was left out and showed the previous
 * campaign's state until its 60s window expired.
 */
const CACHED_ROUTES = ['/', '/shop', '/offers', '/hampers', '/wishlist', '/reviews', '/admin'];

function refresh() {
  for (const route of CACHED_ROUTES) revalidatePath(route);
  // The per-product pages are statically generated, so the route itself has to
  // be revalidated or approved reviews and edits never reach them.
  revalidatePath('/shop/[slug]', 'page');
  revalidatePath('/sitemap.xml');
}

async function productPayload(formData: FormData) {
  const uploaded = await saveImages(formData.getAll('photos') as File[]);
  const typedImage = text(formData, 'img');
  const existingImage = text(formData, 'existing_img');
  const currentImages = text(formData, 'existing_images')
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean);

  const all = [...uploaded, ...currentImages];
  const img = uploaded[0] || typedImage || existingImage || currentImages[0] || '';

  return {
    name: text(formData, 'name'),
    cat: text(formData, 'cat'),
    price: money(formData, 'price') ?? 0,
    mrp: money(formData, 'mrp'),
    img,
    images: JSON.stringify(all.filter((image) => image !== img)),
    description: text(formData, 'desc') || null,
    note: text(formData, 'note') || null,
    stock: text(formData, 'stock') ? Number(text(formData, 'stock')) : null,
    featured: checked(formData, 'featured'),
    is_new: checked(formData, 'new'),
    sold_out: checked(formData, 'sold_out'),
    enquiry: checked(formData, 'enquiry'),
    sort_order: Number(text(formData, 'sort_order') || 0),
  };
}

export async function addProduct(formData: FormData) {
  const db = await requireOwner();
  const p = await productPayload(formData);

  if (!p.name || !p.cat || !p.img) {
    throw new Error('Product name, category, price and an image are all required.');
  }

  await db.execute({
    sql: `INSERT INTO products (id, name, slug, price, mrp, cat, img, images, description, note,
                                featured, is_new, stock, sold_out, enquiry, is_active, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    args: [
      randomUUID(),
      p.name,
      `${slug(p.name)}-${randomUUID().slice(0, 4)}`,
      p.price,
      p.mrp,
      p.cat,
      p.img,
      p.images,
      p.description,
      p.note,
      p.featured,
      p.is_new,
      p.stock,
      p.sold_out,
      p.enquiry,
      p.sort_order,
    ],
  });

  refresh();
}

export async function updateProduct(formData: FormData) {
  const db = await requireOwner();
  const p = await productPayload(formData);

  await db.execute({
    sql: `UPDATE products SET
            name = ?, price = ?, mrp = ?, cat = ?, img = ?, images = ?,
            description = ?, note = ?, featured = ?, is_new = ?,
            stock = ?, sold_out = ?, enquiry = ?, is_active = ?, sort_order = ?
          WHERE id = ?`,
    args: [
      p.name,
      p.price,
      p.mrp,
      p.cat,
      p.img,
      p.images,
      p.description,
      p.note,
      p.featured,
      p.is_new,
      p.stock,
      p.sold_out,
      p.enquiry,
      formData.get('is_active') === 'on' ? 1 : 0,
      p.sort_order,
      text(formData, 'id'),
    ],
  });

  refresh();
}

export async function deleteProduct(formData: FormData) {
  const db = await requireOwner();
  await db.execute({
    sql: 'UPDATE products SET is_active = 0, sold_out = 1 WHERE id = ?',
    args: [text(formData, 'id')],
  });
  refresh();
}

/**
 * Removes a product for good. Only offered once it is already hidden, so it
 * takes two deliberate steps — "Hide from shop" keeps it out of the storefront
 * while preserving it, this erases it. Past orders keep their own copy of the
 * item details, so they are unaffected.
 */
export async function destroyProduct(formData: FormData) {
  const db = await requireOwner();
  const id = text(formData, 'id');
  await db.batch(
    [
      { sql: 'DELETE FROM product_occasions WHERE product_id = ?', args: [id] },
      { sql: 'DELETE FROM reviews WHERE product_id = ?', args: [id] },
      { sql: 'DELETE FROM stock_alerts WHERE product_id = ?', args: [id] },
      { sql: 'DELETE FROM products WHERE id = ? AND is_active = 0', args: [id] },
    ],
    'write',
  );
  refresh();
}

export async function addCategory(formData: FormData) {
  const db = await requireOwner();
  const label = text(formData, 'label');
  if (!label) return;

  const next = await db.execute('SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM categories');
  await db.execute({
    sql: `INSERT INTO categories (key, label, sort_order, is_active) VALUES (?, ?, ?, 1)
          ON CONFLICT(key) DO UPDATE SET label = excluded.label, is_active = 1`,
    args: [slug(label), label, Number(next.rows[0].n)],
  });

  refresh();
}

export async function updateCategory(formData: FormData) {
  const db = await requireOwner();
  await db.execute({
    sql: 'UPDATE categories SET label = ?, sort_order = ?, is_active = ? WHERE key = ?',
    args: [
      text(formData, 'label'),
      Number(text(formData, 'sort_order') || 0),
      checked(formData, 'is_active'),
      text(formData, 'key'),
    ],
  });
  refresh();
}

export async function saveOccasion(formData: FormData) {
  const db = await requireOwner();
  const label = text(formData, 'label');
  if (!label) return;

  await db.execute({
    sql: `INSERT INTO occasions (key, label, emoji, headline, discount_percent, starts_on, ends_on, is_active, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET
            label = excluded.label, emoji = excluded.emoji, headline = excluded.headline,
            discount_percent = excluded.discount_percent, starts_on = excluded.starts_on,
            ends_on = excluded.ends_on, is_active = excluded.is_active, sort_order = excluded.sort_order`,
    args: [
      text(formData, 'key') || slug(label),
      label,
      text(formData, 'emoji') || null,
      text(formData, 'headline') || null,
      Math.max(0, Math.min(90, Number(text(formData, 'discount_percent') || 0))),
      text(formData, 'starts_on') || null,
      text(formData, 'ends_on') || null,
      formData.get('is_active') === 'on' ? 1 : 0,
      Number(text(formData, 'sort_order') || 0),
    ],
  });

  refresh();
}

export async function deleteOccasion(formData: FormData) {
  const db = await requireOwner();
  await db.execute({ sql: 'DELETE FROM occasions WHERE key = ?', args: [text(formData, 'key')] });
  refresh();
}

/** Replaces a product's whole occasion list with whatever was ticked. */
export async function setProductOccasions(formData: FormData) {
  const db = await requireOwner();
  const productId = text(formData, 'id');
  const chosen = formData.getAll('occasions').map((value) => String(value));

  await db.batch(
    [
      { sql: 'DELETE FROM product_occasions WHERE product_id = ?', args: [productId] },
      ...chosen.map((key) => ({
        sql: 'INSERT OR IGNORE INTO product_occasions (product_id, occasion_key) VALUES (?, ?)',
        args: [productId, key],
      })),
    ],
    'write',
  );

  refresh();
}

export async function approveReview(formData: FormData) {
  const db = await requireOwner();
  await db.execute({
    sql: "UPDATE reviews SET status = 'approved' WHERE id = ?",
    args: [Number(text(formData, 'id'))],
  });
  refresh();
}

export async function deleteReview(formData: FormData) {
  const db = await requireOwner();
  await db.execute({ sql: 'DELETE FROM reviews WHERE id = ?', args: [Number(text(formData, 'id'))] });
  refresh();
}

export async function markAlertNotified(formData: FormData) {
  const db = await requireOwner();
  await db.execute({
    sql: 'UPDATE stock_alerts SET notified = 1 WHERE id = ?',
    args: [Number(text(formData, 'id'))],
  });
  revalidatePath('/admin');
}

export async function updateOrderStatus(formData: FormData) {
  const db = await requireOwner();
  await db.execute({
    sql: 'UPDATE orders SET status = ? WHERE id = ?',
    args: [text(formData, 'status'), Number(text(formData, 'id'))],
  });
  revalidatePath('/admin');
}

export async function updateBanner(formData: FormData) {
  const db = await requireOwner();
  const banner = {
    on: formData.get('banner_on') === 'on',
    text: text(formData, 'banner_text'),
    link: text(formData, 'banner_link'),
  };

  await db.execute({
    sql: `INSERT INTO settings (key, value) VALUES ('site', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    args: [JSON.stringify({ banner })],
  });

  refresh();
}
