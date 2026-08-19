'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { Category, Product } from '@/lib/catalog';
import { HAMPER_DISCOUNT, HAMPER_MIN, waLink } from '@/lib/site';

const money = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

export function HamperBuilder({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [cat, setCat] = useState('all');

  const choosable = useMemo(
    () => products.filter((product) => !product.sold_out && !product.enquiry),
    [products],
  );

  const shown = cat === 'all' ? choosable : choosable.filter((product) => product.cat === cat);
  const byId = new Map(choosable.map((product) => [product.id, product]));
  const chosen = picked.map((id) => byId.get(id)).filter((product): product is Product => Boolean(product));

  const subtotal = chosen.reduce((sum, product) => sum + Number(product.price), 0);
  const qualifies = chosen.length >= HAMPER_MIN;
  const discount = qualifies ? subtotal * HAMPER_DISCOUNT : 0;
  const total = subtotal - discount;

  function toggle(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  const message = waLink(
    [
      "Hi Noor e Kala! I'd like to order this gift hamper:",
      '',
      ...chosen.map((product) => `• ${product.name} — ${money(Number(product.price))}`),
      '',
      `Subtotal: ${money(subtotal)}`,
      ...(qualifies ? [`Hamper discount (${Math.round(HAMPER_DISCOUNT * 100)}%): -${money(discount)}`] : []),
      `Total: ${money(total)}`,
      '',
      '(Built with the hamper builder on the website)',
    ].join('\n'),
  );

  const usable = categories.filter((category) => choosable.some((product) => product.cat === category.key));

  return (
    <div className="hamper">
      <div className="hamper-picker">
        <div className="chips">
          <button className={`chip${cat === 'all' ? ' active' : ''}`} onClick={() => setCat('all')}>
            Everything
          </button>
          {usable.map((category) => (
            <button
              key={category.key}
              className={`chip${cat === category.key ? ' active' : ''}`}
              onClick={() => setCat(category.key)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="hamper-grid">
          {shown.map((product) => {
            const on = picked.includes(product.id);
            return (
              <button
                key={product.id}
                className={`hamper-item${on ? ' on' : ''}`}
                aria-pressed={on}
                onClick={() => toggle(product.id)}
              >
                <span className="hamper-thumb">
                  <Image src={product.img} alt="" fill sizes="(max-width:760px) 33vw, 150px" style={{ objectFit: 'cover' }} />
                  <span className="hamper-tick">{on ? '✓' : '+'}</span>
                </span>
                <span className="hamper-name">{product.name}</span>
                <span className="hamper-price">{money(Number(product.price))}</span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="hamper-summary">
        <h3>Your hamper</h3>

        {chosen.length ? (
          <ul className="hamper-list">
            {chosen.map((product) => (
              <li key={product.id}>
                <span>{product.name}</span>
                <span>{money(Number(product.price))}</span>
                <button aria-label={`Remove ${product.name}`} onClick={() => toggle(product.id)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hamper-empty">Pick pieces on the left to build a hamper.</p>
        )}

        <div className="hamper-totals">
          <div>
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          {qualifies ? (
            <div className="hamper-saving">
              <span>Hamper discount ({Math.round(HAMPER_DISCOUNT * 100)}%)</span>
              <span>−{money(discount)}</span>
            </div>
          ) : (
            <p className="hamper-hint">
              Add {HAMPER_MIN - chosen.length} more{' '}
              {HAMPER_MIN - chosen.length === 1 ? 'piece' : 'pieces'} to unlock{' '}
              {Math.round(HAMPER_DISCOUNT * 100)}% off.
            </p>
          )}
          <div className="hamper-total">
            <span>Total</span>
            <b>{money(total)}</b>
          </div>
        </div>

        <a
          className={`btn btn-primary hamper-send${chosen.length ? '' : ' disabled'}`}
          href={chosen.length ? message : undefined}
          target="_blank"
          rel="noopener"
          aria-disabled={!chosen.length}
        >
          Send hamper on WhatsApp
        </a>
        <p className="hamper-note">
          No payment here — I&apos;ll confirm availability and the final price with you personally. 💛
        </p>
      </aside>
    </div>
  );
}
