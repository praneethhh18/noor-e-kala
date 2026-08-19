'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Category } from '@/lib/catalog';
import { collectOffers, liveOccasions, type Occasion, type PricedProduct } from '@/lib/pricing';
import { Countdown } from './countdown';
import { ProductCard } from './product-card';
import { ProductModal } from './product-modal';

const rupees = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

export function OffersView({
  products,
  categories,
  occasions,
}: {
  products: PricedProduct[];
  categories: Category[];
  occasions: Occasion[];
}) {
  const [active, setActive] = useState<PricedProduct | null>(null);

  const offers = collectOffers(products);
  const live = liveOccasions(occasions);
  const totalSaving = offers.reduce((sum, offer) => sum + (offer.was - offer.now), 0);

  if (!offers.length) {
    return (
      <div className="empty-state">
        <h3>No offers running right now</h3>
        <p>Everything is at its usual price. New offers appear here first.</p>
        <p style={{ marginTop: 'var(--s5)' }}>
          <Link href="/shop" className="btn btn-primary">
            Browse the shop →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      {live.length ? (
        <div className="offer-banners">
          {live.map((occasion) => (
            <article className="offer-banner" key={occasion.key}>
              <div>
                <span className="deals-flag">{Math.round(occasion.discount_percent)}% off</span>
                <h2>
                  {occasion.emoji ?? ''} {occasion.label}
                </h2>
                {occasion.headline ? <p>{occasion.headline}</p> : null}
                {occasion.ends_on ? <Countdown endsAt={occasion.ends_on} /> : null}
              </div>
              <Link href={`/shop#occasion-${occasion.key}`} className="btn btn-primary">
                Shop this occasion →
              </Link>
            </article>
          ))}
        </div>
      ) : null}

      <p className="offers-summary">
        <b>{offers.length}</b> {offers.length === 1 ? 'piece is' : 'pieces are'} reduced right now — save up to{' '}
        <b>{rupees(Math.max(...offers.map((offer) => offer.was - offer.now)))}</b> on a single piece, or{' '}
        <b>{rupees(totalSaving)}</b> across all of them.
      </p>

      <div className="shop-grid">
        {offers.map((offer) => (
          <ProductCard product={offer.product} key={offer.product.id} onOpen={setActive} />
        ))}
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
    </>
  );
}
