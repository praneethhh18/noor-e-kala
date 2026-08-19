import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getPriceByName } from '@/lib/store';
import { clientIp, tooManyRequests, trippedHoneypot } from '@/lib/spam-guard';

type OrderItem = { id?: string; name: string; price: number; qty: number; image?: string };

function cleanText(value: unknown, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid order.' }, { status: 400 });

  // Silently accept and drop bot submissions rather than teaching them the trap.
  if (trippedHoneypot(body)) return NextResponse.json({ ok: true });
  // This writes straight into the owner's studio, so cap how fast one source can
  // fill it. Six is generous for a person and useless for a script.
  if (tooManyRequests(`order:${clientIp(request)}`, 6, 60_000)) {
    return NextResponse.json({ error: 'Too many orders just now. Please try again shortly.' }, { status: 429 });
  }

  const items = Array.isArray(body.items) ? (body.items as OrderItem[]) : [];
  const safeItems = (
    await Promise.all(
      items.map(async (item) => {
        const name = cleanText(item.name, 160);
        // Price comes from the database, not the request: a discount campaign
        // makes prices vary, and the browser must not be able to name its own.
        const serverPrice = await getPriceByName(name);
        return {
          name,
          price: serverPrice ?? (Number(item.price) || 0),
          qty: Math.max(1, Math.min(99, Number(item.qty) || 1)),
          image: cleanText(item.image, 400),
        };
      }),
    )
  ).filter((item) => item.name && item.price >= 0);

  const customer_name = cleanText(body.customer_name, 120);
  const phone = cleanText(body.phone, 40);
  if (!customer_name || !phone || safeItems.length === 0) {
    return NextResponse.json({ error: 'Name, phone and cart are required.' }, { status: 400 });
  }

  // A real order needs a real number: the whole flow ends in a WhatsApp
  // conversation, so a phone that cannot exist is either a typo or a bot.
  if (phone.replace(/\D/g, '').length < 8) {
    return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 });
  }

  // Total is recomputed here; never trust the number the browser sent.
  const total = safeItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO orders (customer_name, phone, email, address, customer_note, items, total, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
    args: [
      customer_name,
      phone,
      cleanText(body.email, 160) || null,
      cleanText(body.address, 800) || null,
      cleanText(body.customer_note, 1000) || null,
      JSON.stringify(safeItems),
      total,
    ],
  });

  revalidatePath('/admin');
  return NextResponse.json({ ok: true, total });
}
