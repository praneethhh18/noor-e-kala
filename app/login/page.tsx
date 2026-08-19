import type { Metadata } from 'next';
import { login } from './actions';

export const metadata: Metadata = {
  title: 'Owner sign in — Noor e Kala',
  robots: { index: false, follow: false },
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="login">
      <small>NOOR E KALA · OWNER STUDIO</small>
      <h1>Welcome back.</h1>
      <p>Manage products, collections and orders.</p>

      <form action={login} className="form">
        <input name="password" type="password" placeholder="Owner password" autoComplete="current-password" required autoFocus />
        <button>Sign in</button>
        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      </form>
    </main>
  );
}
