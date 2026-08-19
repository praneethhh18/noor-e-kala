/**
 * Shared throttling for the public write endpoints (reviews, stock alerts).
 *
 * These save straight into the owner's studio, so without a limit a bot could
 * fill it with hundreds of junk entries. Counts are per server instance and
 * reset on redeploy — enough to stop a flood, not an exact quota.
 */
const buckets = new Map<string, number[]>();

export function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export function tooManyRequests(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);
  recent.push(now);
  buckets.set(key, recent);

  if (buckets.size > 5000) buckets.clear();
  return recent.length > max;
}

/**
 * True when a hidden field was filled in. Real people never see it; automated
 * form-fillers complete every input they find.
 */
export function trippedHoneypot(body: Record<string, unknown>) {
  return Boolean(String(body.website ?? '').trim());
}
