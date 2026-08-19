import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { clientIp, tooManyRequests, trippedHoneypot } from '@/lib/spam-guard';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid review.' }, { status: 400 });

  if (trippedHoneypot(body)) return NextResponse.json({ ok: true, pending: true });
  if (tooManyRequests(`review:${clientIp(request)}`, 4, 60_000)) {
    return NextResponse.json({ error: 'Too many reviews just now. Try again shortly.' }, { status: 429 });
  }

  const productId = String(body.product_id ?? '').trim();
  const name = String(body.name ?? '').trim().slice(0, 80);
  const text = String(body.text ?? '').trim().slice(0, 1200);
  const rating = Math.max(1, Math.min(5, Number(body.rating) || 5));

  if (!productId || !name || !text) {
    return NextResponse.json({ error: 'Name, rating and review text are required.' }, { status: 400 });
  }

  const db = await getDb();
  const product = await db.execute({ sql: 'SELECT id FROM products WHERE id = ?', args: [productId] });
  if (!product.rows.length) return NextResponse.json({ error: 'Unknown product.' }, { status: 404 });

  // Always 'pending': nothing reaches the shop without the owner approving it.
  await db.execute({
    sql: "INSERT INTO reviews (product_id, name, rating, text, status) VALUES (?, ?, ?, ?, 'pending')",
    args: [productId, name, rating, text],
  });

  return NextResponse.json({ ok: true, pending: true });
}
