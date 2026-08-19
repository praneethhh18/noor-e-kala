import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { clientIp, tooManyRequests, trippedHoneypot } from '@/lib/spam-guard';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  // Silently accept and discard bot submissions: telling them they were caught
  // just teaches them to avoid the trap.
  if (trippedHoneypot(body)) return NextResponse.json({ ok: true });
  if (tooManyRequests(`alert:${clientIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 });
  }

  const productId = String(body.product_id ?? '').trim();
  const contact = String(body.contact ?? '').trim().slice(0, 160);

  if (!productId || contact.length < 6) {
    return NextResponse.json({ error: 'A phone number or email is required.' }, { status: 400 });
  }

  const db = await getDb();
  const product = await db.execute({ sql: 'SELECT id FROM products WHERE id = ?', args: [productId] });
  if (!product.rows.length) return NextResponse.json({ error: 'Unknown product.' }, { status: 404 });

  // UNIQUE(product_id, contact) — asking twice is a no-op, not an error.
  await db.execute({
    sql: 'INSERT INTO stock_alerts (product_id, contact) VALUES (?, ?) ON CONFLICT (product_id, contact) DO NOTHING',
    args: [productId, contact],
  });

  return NextResponse.json({ ok: true });
}
