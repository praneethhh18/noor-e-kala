'use client';

import { useState } from 'react';
import { InstagramIcon, WhatsappIcon } from './icons';
import { INSTAGRAM, waLink } from '@/lib/site';

const blank = { want: '', size: '', when: '', budget: '', name: '' };

export function CustomOrderForm() {
  const [form, setForm] = useState(blank);
  const [showError, setShowError] = useState(false);

  const field = (key: keyof typeof blank) => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (key === 'want') setShowError(false);
      setForm((current) => ({ ...current, [key]: event.target.value }));
    },
  });

  function send() {
    const want = form.want.trim();
    if (!want) {
      setShowError(true);
      return;
    }

    const optional = [
      form.size.trim() && `Size: ${form.size.trim()}`,
      form.when.trim() && `Occasion / needed by: ${form.when.trim()}`,
      form.budget.trim() && `Budget: ${form.budget.trim()}`,
      form.name.trim() && `Name: ${form.name.trim()}`,
    ].filter(Boolean);

    const message = [
      "Hi Noor e Kala! I'd like a custom order:",
      '',
      `What I'd like: ${want}`,
      ...optional,
      '',
      '(Sent from the website)',
    ].join('\n');

    window.open(waLink(message), '_blank', 'noopener');
  }

  return (
    <section className="order" id="order">
      <div className="wrap">
        <div className="order-card reveal">
          <div className="blob b1" style={{ top: '-120px', right: '-80px' }} />
          <div className="blob b2" style={{ bottom: '-140px', left: '-60px' }} />
          <span className="script" style={{ fontSize: '2rem', color: 'var(--clay)', position: 'relative', zIndex: 2 }}>
            made just for you
          </span>
          <h2>
            Request a <em>custom order</em>
          </h2>
          <p>
            Tell me exactly what you have in mind, the size, colours and occasion, and I&apos;ll bring it to life by
            hand. Fill this in and it comes straight to my WhatsApp. ♡
          </p>

          <form className={`cform ${showError ? 'show-err' : ''}`} onSubmit={(event) => event.preventDefault()}>
            <div>
              <label htmlFor="cf-want">
                What would you like made? <span style={{ color: 'var(--clay)' }}>*</span>
              </label>
              <textarea
                id="cf-want"
                placeholder="e.g. A resin photo frame for my parents' 25th anniversary, with dried roses and gold flakes"
                {...field('want')}
              />
              <small className="cform-err">Please tell me what you&apos;d like 🌸</small>
            </div>
            <div className="row">
              <div>
                <label htmlFor="cf-size">Size / dimensions</label>
                <input id="cf-size" type="text" placeholder="e.g. 8x8 inches, or not sure" {...field('size')} />
              </div>
              <div>
                <label htmlFor="cf-when">Occasion / needed by</label>
                <input id="cf-when" type="text" placeholder="e.g. birthday, 20 Aug" {...field('when')} />
              </div>
            </div>
            <div className="row">
              <div>
                <label htmlFor="cf-budget">Budget (optional)</label>
                <input id="cf-budget" type="text" placeholder="e.g. ₹800–1200" {...field('budget')} />
              </div>
              <div>
                <label htmlFor="cf-name">Your name</label>
                <input id="cf-name" type="text" placeholder="e.g. Aanya" {...field('name')} />
              </div>
            </div>
            <button className="cform-send" type="button" onClick={send}>
              <WhatsappIcon /> Send my request on WhatsApp
            </button>
            <p className="cform-note">No payment now. I&apos;ll reply on WhatsApp to confirm the details &amp; price. 💛</p>
          </form>

          <p style={{ position: 'relative', zIndex: 2, marginTop: '1.2rem', fontSize: '.92rem', color: 'var(--ink-soft)' }}>
            Prefer to chat?{' '}
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener"
              style={{ color: 'var(--clay)', fontWeight: 600, borderBottom: '1.5px solid var(--clay)' }}
            >
              <InstagramIcon /> Message on Instagram
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
