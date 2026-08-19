import type { Banner } from '@/lib/store';
import { AnnouncementBar } from './announcement-bar';
import { CartDrawer } from './cart-drawer';
import { CartProvider } from './cart-provider';
import { MobileBar, WhatsappFab } from './mobile-bar';
import { SiteChrome } from './site-chrome';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { WishlistProvider } from './wishlist-provider';

// The shared page shell: everything that used to be copy-pasted into the top and
// bottom of index.html, shop.html, reviews.html and faq.html.
export function StoreShell({
  banner,
  children,
  variant = 'inner',
}: {
  banner: Banner;
  children: React.ReactNode;
  variant?: 'home' | 'inner';
}) {
  return (
    <CartProvider>
      <WishlistProvider>
        <SiteChrome preloader={variant === 'home'} />
        <AnnouncementBar banner={banner} />
        <SiteHeader transparent={variant === 'home'} />
        {children}
        <SiteFooter />
        <WhatsappFab />
        <MobileBar variant={variant} />
        <CartDrawer />
      </WishlistProvider>
    </CartProvider>
  );
}
