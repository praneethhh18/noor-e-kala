'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Category } from '@/lib/catalog';
import { liveOccasions, type Occasion, type PricedProduct } from '@/lib/pricing';
import { ProductCard } from './product-card';
import { ProductModal } from './product-modal';

/**
 * Only rendered while a discount campaign is live. Nothing here is hard-coded —
 * the owner creates occasions in the studio and this appears on its own.
 */
export function Deals({
  products,
  categories,
  occasions,
}: {
  products: PricedProduct[];
  categories: Category[];
  occasions: Occasion[];
}) {
  const [active, setActive] = useState<PricedProduct | null>(null);

  const live = liveOccasions(occasions);
  if (!live.length) return null;

  const onOffer = products
    .filter((product) => product.salePrice && !product.sold_out)
    .sort((a, b) => b.price - a.price - (b.salePrice ?? 0) + (a.salePrice ?? 0))
    .slice(0, 8);

  if (!onOffer.length) return null;

  const headline = live.find((occasion) => occasion.headline)?.headline;
  const best = Math.max(...live.map((occasion) => occasion.discount_percent));

  return (
    <section className="deals" id="deals">
      <div className="wrap">
        <div className="deals-head">
          <div>
            <span className="deals-flag">Limited time · up to {Math.round(best)}% off</span>
            <h2>
              {live.map((occasion) => `${occasion.emoji ?? ''} ${occasion.label}`.trim()).join(' · ')}
            </h2>
            {headline ? <p>{headline}</p> : null}
          </div>
          <Link href={`/shop#occasion-${live[0].key}`} className="btn btn-ghost">
            See everything →
          </Link>
        </div>

        <div className="deals-rail">
          {onOffer.map((product) => (
            <div className="deals-cell" key={product.id}>
              <ProductCard product={product} onOpen={setActive} />
            </div>
          ))}
        </div>
      </div>

      {active ? (
        <ProductModal
          product={active}
          categories={categories}
          onClose={() => setActive(null)}
          allProducts={products}
          onOpen={setActive}
        />
      ) : null}
    </section>
  );
}
