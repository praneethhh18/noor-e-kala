'use client';

import { useState } from 'react';

/** Shown in place of "Add to cart" when a piece is sold out. */
export function StockAlertForm({ productId }: { productId: string }) {
  const [contact, setContact] = useState('');
  // Honeypot: hidden from people, filled in by automated form-fillers.
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function submit() {
    if (contact.trim().length < 6) {
      setState('error');
      return;
    }
    setState('sending');
    const response = await fetch('/api/stock-alerts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ product_id: productId, contact: contact.trim(), 'nek-website': trap }),
    }).catch(() => null);
    setState(response?.ok ? 'done' : 'error');
  }

  if (state === 'done') {
    return <p className="stock-alert-done">Lovely — I&apos;ll message you the moment this one is back. 💛</p>;
  }

  return (
    <div className="stock-alert">
      <label htmlFor={`alert-${productId}`}>Tell me when it&apos;s back</label>
      <div className="stock-alert-row">
        <input
          id={`alert-${productId}`}
          type="text"
          inputMode="text"
          placeholder="WhatsApp number or email"
          value={contact}
          onChange={(event) => {
            setState('idle');
            setContact(event.target.value);
          }}
        />
        <button type="button" disabled={state === 'sending'} onClick={submit}>
          {state === 'sending' ? 'Saving…' : 'Notify me'}
        </button>
      </div>
      {state === 'error' ? <small>Please add a valid number or email.</small> : null}
      {/* Honeypot, deliberately last. Browser autofill targets the first
          matching field, so a trap placed first can catch a real customer and
          silently discard their submission. The name avoids "website" for the
          same reason — browsers autofill that one. */}
      <input
        className="hp-field"
        type="text"
        name="nek-website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={trap}
        onChange={(event) => setTrap(event.target.value)}
      />
    </div>
  );
}
