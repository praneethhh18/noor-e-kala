import type { Metadata } from 'next';
import { HamperBuilder } from '@/components/hamper-builder';
import { StoreShell } from '@/components/store-shell';
import { HAMPER_DISCOUNT, HAMPER_MIN } from '@/lib/site';
import { getStorefrontData } from '@/lib/store';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Build a gift hamper — Noor e Kala',
  description: `Pick any ${HAMPER_MIN} or more handmade pieces and get ${Math.round(
    HAMPER_DISCOUNT * 100,
  )}% off as a gift hamper, sent straight to WhatsApp.`,
};

export default async function Hampers() {
  const { products, categories, banner } = await getStorefrontData();

  return (
    <StoreShell banner={banner}>
      <section className="shop" style={{ paddingTop: 'calc(var(--header-h) + var(--s8))' }}>
        <div className="wrap">
          <div className="shead">
            <span className="script">put it together</span>
            <h1>Build a gift hamper</h1>
            <p>
              Pick any {HAMPER_MIN} pieces or more and {Math.round(HAMPER_DISCOUNT * 100)}% comes off the total. I&apos;ll
              wrap them together beautifully.
            </p>
          </div>
          <HamperBuilder products={products} categories={categories} />
        </div>
      </section>
    </StoreShell>
  );
}
