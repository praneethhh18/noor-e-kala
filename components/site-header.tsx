'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from './cart-provider';
import { navLinks } from '@/lib/site';

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  // Stop the page scrolling behind an open menu.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // `hdr-solid` is a permanent state for inner pages, unlike `scrolled` which
  // the scroll handler removes at the top of the page — that is what left the
  // header unreadable over the dark Reviews section.
  //
  // `menu-open` disables the header's backdrop-filter. A filtered element
  // becomes the containing block for its position:fixed children, so once the
  // scroll handler added the blur, the open menu collapsed from full-screen
  // into the 78px header and scrolled away with the page.
  return (
    <header id="hdr" className={`${transparent ? '' : 'hdr-solid'}${menuOpen ? ' menu-open' : ''}`.trim()}>
      <nav className="wrap">
        <Link href="/" className="brand">
          <Image className="mark" src="/logo.jpg" alt="Noor e Kala logo" width={46} height={46} sizes="46px" priority /> Noor e Kala
        </Link>
        <div className="nav-right">
          <button
            className={`nav-overlay${menuOpen ? ' open' : ''}`}
            aria-label="Close menu"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
          />
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <button className="nav-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              ✕
            </button>
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
