import type { Metadata } from 'next';
import { OffersView } from '@/components/offers-view';
import { StoreShell } from '@/components/store-shell';
import { getStorefrontData } from '@/lib/store';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Offers & festival sales — Noor e Kala',
  description:
    'Every Noor e Kala piece that is reduced right now, plus any festival or occasion sale currently running.',
};

export default async function Offers() {
  const { products, categories, occasions, banner } = await getStorefrontData();

  return (
    <StoreShell banner={banner}>
      <section className="shop" style={{ paddingTop: 'calc(var(--header-h) + var(--s8))' }}>
        <div className="wrap">
          <div className="shead">
            <span className="script">today&apos;s savings</span>
            <h1>Offers &amp; festival sales</h1>
            <p>Everything currently reduced, biggest saving first.</p>
          </div>
          <OffersView products={products} categories={categories} occasions={occasions} />
        </div>
      </section>
    </StoreShell>
  );
}
