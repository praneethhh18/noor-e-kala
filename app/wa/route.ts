import { NextResponse, type NextRequest } from 'next/server';

/**
 * Hands a visitor over to WhatsApp without ever publishing the number.
 *
 * The number is read from WHATSAPP_NUMBER at request time and attached to the
 * redirect, so it is not in the HTML, not in the client bundle, and not
 * harvestable by the scrapers that trawl for `wa.me/<digits>` links.
 *
 * The checks below are about spam volume, not secrecy — anyone who clicks
 * through legitimately will of course see the number in WhatsApp.
 */

export const dynamic = 'force-dynamic';

const MAX_MESSAGE = 1500;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;

// Per-instance and therefore approximate; it exists to blunt a crawler hammering
// the route, not to be an exact quota.
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 5000) hits.clear(); // crude ceiling so the map cannot grow forever
  return recent.length > MAX_PER_WINDOW;
}

export async function GET(request: NextRequest) {
  const number = process.env.WHATSAPP_NUMBER;
  if (!number) {
    // Never fall back to a hardcoded number — failing loudly is safer than
    // quietly leaking one.
    return NextResponse.redirect(new URL('/faq', request.url));
  }

  // Only follow links that came from our own pages. A scraper hitting /wa
  // directly gets sent to the FAQ instead of a redirect it can log.
  const referer = request.headers.get('referer');
  const sameOrigin = referer ? new URL(referer).origin === new URL(request.url).origin : false;
  if (!sameOrigin) return NextResponse.redirect(new URL('/faq', request.url));

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return new NextResponse('Too many requests — please try again in a minute.', { status: 429 });
  }

  const text = (request.nextUrl.searchParams.get('t') ?? '').slice(0, MAX_MESSAGE);
  const target = text
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${number}`;

  return NextResponse.redirect(target, {
    // Never cached, so the number cannot be picked up from a CDN copy.
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}
