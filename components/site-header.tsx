'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './cart-provider';
import { navLinks } from '@/lib/site';

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  // `hdr-solid` is a permanent state for inner pages, unlike `scrolled` which
  // the scroll handler removes at the top of the page — that is what left the
  // header unreadable over the dark Reviews section.
  return (
    <header id="hdr" className={transparent ? '' : 'hdr-solid'}>
      <nav className="wrap">
        <Link href="/" className="brand">
          <img className="mark" src="/logo.jpg" alt="Noor e Kala logo" /> Noor e Kala
        </Link>
        <div className="nav-right">
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <Link href={link.href} key={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/#order" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
              Order Now
            </Link>
          </div>
          <Link className="wish-btn" href="/wishlist" aria-label="Saved pieces">
            ♡
          </Link>
          <button className="cart-btn" aria-label="Open cart" onClick={openCart}>
            🛒<span className={`cart-count ${count ? 'has' : ''}`}>{count}</span>
          </button>
          <button className="burger" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
    </header>
  );
}
