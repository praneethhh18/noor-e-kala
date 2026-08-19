'use client';

import { useState } from 'react';

export function ReviewForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  // Honeypot: hidden from people, filled in by automated form-fillers.
  const [trap, setTrap] = useState('');
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function submit() {
    if (!text.trim() || !name.trim()) {
      setState('error');
      return;
    }
    setState('sending');
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ 'nek-website': trap, product_id: productId, name, rating, text }),
    }).catch(() => null);

    setState(response?.ok ? 'done' : 'error');
  }

  if (state === 'done') {
    return (
      <p className="rev-empty">
        Thank you! 💛 Your review has been sent and will appear once Noor e Kala approves it.
      </p>
    );
  }

  if (!open) {
    return (
      <button className="rev-add" onClick={() => setOpen(true)}>
        ✍ Write a review
      </button>
    );
  }

  return (
    <div className="rev-form">
      <div className="rev-stars">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} star${value > 1 ? 's' : ''}`}
            className={value <= rating ? 'on' : ''}
            onClick={() => setRating(value)}
          >
            ★
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(event) => {
          setState('idle');
          setName(event.target.value);
        }}
      />
      <textarea
        placeholder="How did you like it?"
        value={text}
        onChange={(event) => {
          setState('idle');
          setText(event.target.value);
        }}
      />
      {state === 'error' ? <small style={{ color: '#b00020' }}>Please add your name and a few words.</small> : null}
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
      <button type="button" className="rev-submit" disabled={state === 'sending'} onClick={submit}>
        {state === 'sending' ? 'Sending…' : 'Post review'}
      </button>
    </div>
  );
}
