import Link from 'next/link';
import { InstagramIcon, WhatsappIcon } from './icons';
import { INSTAGRAM, ORDER_NOW_LINK } from '@/lib/site';

// The sticky bottom bar. On the homepage the first slot points at the shop; on
// every other page it points home, matching the old per-page markup.
export function MobileBar({ variant = 'home' }: { variant?: 'home' | 'inner' }) {
  return (
    <div className="mobar">
      {variant === 'home' ? (
        <Link href="/shop" className="m-shop">
          🛍️ Shop
        </Link>
      ) : (
        <Link href="/" className="m-shop">
          🏠 Home
        </Link>
      )}
      {variant === 'home' ? (
        <a href={INSTAGRAM} target="_blank" rel="noopener" className="m-ig">
          <InstagramIcon /> Insta
        </a>
      ) : (
        <Link href="/shop" className="m-ig" style={{ background: 'var(--clay)' }}>
          🛍️ Shop
        </Link>
      )}
      <a href={ORDER_NOW_LINK} target="_blank" rel="noopener" className="m-wa">
        <WhatsappIcon /> Order
      </a>
    </div>
  );
}

export function WhatsappFab() {
  return (
    <a className="fab" href={ORDER_NOW_LINK} target="_blank" rel="noopener" aria-label="WhatsApp">
      <WhatsappIcon />
    </a>
  );
}
