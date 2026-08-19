import type { Metadata } from 'next';
import { StoreShell } from '@/components/store-shell';
import { WishlistView } from '@/components/wishlist-view';
import { getStorefrontData } from '@/lib/store';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Saved pieces — Noor e Kala',
  description: 'The Noor e Kala pieces you have saved for later.',
  robots: { index: false, follow: true },
};

export default async function Wishlist() {
  const { products, categories, banner } = await getStorefrontData();

  return (
    <StoreShell banner={banner}>
      <section className="shop" style={{ paddingTop: 'calc(var(--header-h) + var(--s8))' }}>
        <div className="wrap">
          <div className="shead">
            <span className="script">kept for later</span>
            <h1>Your saved pieces</h1>
            <p>Saved on this device — no account needed.</p>
          </div>
          <WishlistView products={products} categories={categories} />
        </div>
      </section>
    </StoreShell>
  );
}
