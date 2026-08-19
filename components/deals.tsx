'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Category } from '@/lib/catalog';
import { collectOffers, liveOccasions, type Occasion, type PricedProduct } from '@/lib/pricing';
import { Countdown } from './countdown';
import { ProductCard } from './product-card';
import { ProductModal } from './product-modal';

/**
 * The offers strip on the homepage.
 *
 * It used to render only while an occasion campaign was running, so with no
 * campaign live the homepage showed no offers at all — even though three pieces
 * are permanently discounted. It now appears whenever anything is cheaper than
 * usual, and simply changes its heading when a campaign is on.
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

  const offers = collectOffers(products).slice(0, 8);
  if (!offers.length) return null;

  const live = liveOccasions(occasions);
  const headline = live.find((occasion) => occasion.headline)?.headline;
  const ending = live.find((occasion) => occasion.ends_on);
  const best = Math.max(...offers.map((offer) => offer.percent));

  return (
    <section className="deals" id="deals">
      <div className="wrap">
        <div className="deals-head">
          <div>
            <span className="deals-flag">
              {live.length ? 'Limited time' : 'Offers'} · up to {best}% off
            </span>
            <h2>
              {live.length
                ? live.map((occasion) => `${occasion.emoji ?? ''} ${occasion.label}`.trim()).join(' · ')
                : 'Special offers'}
            </h2>
            {headline ? <p>{headline}</p> : <p>Pieces that are cheaper than usual right now.</p>}
            {ending?.ends_on ? <Countdown endsAt={ending.ends_on} /> : null}
          </div>
          <Link href="/offers" className="btn btn-ghost">
            See all offers →
          </Link>
        </div>

        <div className="deals-rail">
          {offers.map((offer) => (
            <div className="deals-cell" key={offer.product.id}>
              <ProductCard product={offer.product} onOpen={setActive} />
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
