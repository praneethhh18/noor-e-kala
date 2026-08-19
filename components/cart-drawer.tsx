'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useCart } from './cart-provider';
import { WhatsappIcon } from './icons';
import { waLink } from '@/lib/site';

const rupees = (value: number) => `₹${value}`;

export function CartDrawer() {
  const { items, details, open, count, total, setQty, setDetails, closeCart, toast } = useCart();
  const [infoOpen, setInfoOpen] = useState(false);
  const [missing, setMissing] = useState({ name: false, phone: false });
  const [sending, setSending] = useState(false);

  const entries = Object.entries(items);

  function whatsappLink() {
    if (!count) return '#';
    const lines = entries.flatMap(([name, item]) => {
      const line = `- ${item.qty} x ${name} (₹${item.price}) = ₹${item.qty * item.price}`;
      // The personalisation is the whole point of these pieces, so it travels
      // with the order rather than being asked for afterwards.
      return item.custom ? [line, `    ↳ ${item.custom}`] : [line];
    });
    const optional = [
      details.email && `Email: ${details.email}`,
      details.addr && `Address: ${details.addr}`,
      details.note && `Order note: ${details.note}`,
    ].filter(Boolean);

    const message = [
      "Hi Noor e Kala! I'd love to order:",
      '',
      ...lines,
      '',
      `Total: ₹${total}`,
      '',
      `Name: ${details.name}`,
      `Phone: ${details.phone}`,
      ...optional,
      '',
      '(Please confirm availability & payment)',
    ].join('\n');
    return waLink(message);
  }

  async function send(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (!count) {
      toast('Add something first 🌸');
      return;
    }

    const nameMissing = !details.name.trim();
    const phoneMissing = !details.phone.trim();
    setMissing({ name: nameMissing, phone: phoneMissing });
    if (nameMissing || phoneMissing) {
      toast('Please add your name & phone 🌸');
      return;
    }

    setSending(true);
    // Recording the order is best-effort: WhatsApp must open either way.
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: details.name,
        phone: details.phone,
        email: details.email,
        address: details.addr,
        customer_note: details.note,
        items: entries.map(([name, item]) => ({ id: name, name, price: item.price, qty: item.qty, image: item.img, custom: item.custom })),
      }),
    }).catch(() => null);
    setSending(false);

    window.open(whatsappLink(), '_blank', 'noopener');
  }

  return (
    <>
      <div className={`cart-overlay ${open ? 'open' : ''}`} onClick={closeCart} />
      <aside className={`cart-drawer ${open ? 'open' : ''}`} aria-label="Your order" aria-hidden={!open}>
        <div className="cart-head">
          <h3>Your Order 🧺</h3>
          <button className="cart-close" aria-label="Close cart" onClick={closeCart}>
            ✕
          </button>
        </div>

        <div className="cart-items">
          {count ? (
            entries.map(([name, item]) => (
              <div className="ci" key={name}>
                {item.img ? <Image className="ci-img" src={item.img} alt="" width={52} height={52} sizes="52px" /> : null}
                <div className="ci-info">
                  <b>{name}</b>
                  <span>{rupees(item.price)} each</span>
                  {item.custom ? <em className="ci-custom">{item.custom}</em> : null}
                </div>
                <div className="ci-qty">
                  <button onClick={() => setQty(name, item.qty - 1)} aria-label={`Remove one ${name}`}>
                    −
                  </button>
                  <span>{item.qty}</span>
                  <button onClick={() => setQty(name, item.qty + 1)} aria-label={`Add one ${name}`}>
                    +
                  </button>
                </div>
                <div className="ci-sum">{rupees(item.qty * item.price)}</div>
              </div>
            ))
          ) : (
            <div className="cart-empty">
              Your cart is empty.
              <br />
              Add something pretty 🌸
            </div>
          )}
        </div>

        <div className="cart-foot" style={{ display: count ? undefined : 'none' }}>
          <div className="cart-total">
            <span>Total</span>
            <b>{rupees(total)}</b>
          </div>
          <div className="cart-fields">
            <div className="cf2">
              <input
                className={missing.name ? 'miss' : ''}
                type="text"
                placeholder="Your name *"
                value={details.name}
                onChange={(event) => {
                  setMissing((m) => ({ ...m, name: false }));
                  setDetails({ name: event.target.value });
                }}
              />
              <input
                className={missing.phone ? 'miss' : ''}
                type="tel"
                placeholder="Phone number *"
                value={details.phone}
                onChange={(event) => {
                  setMissing((m) => ({ ...m, phone: false }));
                  setDetails({ phone: event.target.value });
                }}
              />
            </div>
            <input
              type="email"
              placeholder="Email (optional)"
              value={details.email}
              onChange={(event) => setDetails({ email: event.target.value })}
            />
            <textarea
              placeholder="Delivery address (house, area, city, pincode)"
              value={details.addr}
              onChange={(event) => setDetails({ addr: event.target.value })}
            />
            <textarea
              placeholder="Personalisation or order note (optional)"
              value={details.note}
              onChange={(event) => setDetails({ note: event.target.value })}
            />
          </div>

          <button type="button" className="cart-info-toggle" aria-expanded={infoOpen} onClick={() => setInfoOpen((v) => !v)}>
            ⓘ How ordering works
          </button>
          {infoOpen ? (
            <div className="cart-info">
              <ol>
                <li>You send this order to me on WhatsApp.</li>
                <li>I confirm availability &amp; the final price.</li>
                <li>Pay easily via UPI, then I handcraft &amp; ship it. 💛</li>
              </ol>
            </div>
          ) : null}

          <p className="cart-note">
            No payment here. I&apos;ll confirm availability and share UPI/payment details after you send your order. 💛
          </p>
          <a className="cart-send" href={whatsappLink()} target="_blank" rel="noopener" onClick={send}>
            <WhatsappIcon />
            {sending ? 'Preparing…' : 'Send my order on WhatsApp'}
          </a>
        </div>
      </aside>
    </>
  );
}
