'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, checkPassword, createSessionValue, sessionCookieOptions } from '@/lib/auth';

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '');

  if (!checkPassword(password)) {
    redirect('/login?error=' + encodeURIComponent('That password is not right.'));
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionValue(), sessionCookieOptions);
  redirect('/admin');
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/login');
}
