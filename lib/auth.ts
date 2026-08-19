import { createHmac, timingSafeEqual } from 'node:crypto';

// Single-owner auth. The password and secret live in .env.local; the session is
// a signed cookie, so there is no session table to keep.
export const SESSION_COOKIE = 'nek_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // two weeks

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error('ADMIN_SESSION_SECRET is not set. Add it to .env.local.');
  return value;
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function checkPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('ADMIN_PASSWORD is not set. Add it to .env.local.');
  return safeEqual(candidate, expected);
}

/** Cookie value: "<expiry-ms>.<signature>" */
export function createSessionValue() {
  const expiresAt = String(Date.now() + MAX_AGE_SECONDS * 1000);
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function isValidSession(value: string | undefined) {
  if (!value) return false;
  const [expiresAt, signature] = value.split('.');
  if (!expiresAt || !signature) return false;
  if (!safeEqual(signature, sign(expiresAt))) return false;
  return Number(expiresAt) > Date.now();
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE_SECONDS,
};
