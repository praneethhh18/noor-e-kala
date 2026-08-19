'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Category } from '@/lib/catalog';
import type { PricedProduct } from '@/lib/pricing';
import { ProductCard } from './product-card';
import { ProductModal } from './product-modal';
import { useWishlist } from './wishlist-provider';

export function WishlistView({ products, categories }: { products: PricedProduct[]; categories: Category[] }) {
  const { ids, ready } = useWishlist();
  const [active, setActive] = useState<PricedProduct | null>(null);

  // Keep the order the customer saved them in.
  const byId = new Map(products.map((product) => [product.id, product]));
  const saved = ids.map((id) => byId.get(id)).filter((product): product is PricedProduct => Boolean(product));

  if (!ready) return <p className="rev-empty">Loading your saved pieces…</p>;

  if (!saved.length) {
    return (
      <div className="empty-state">
        <h3>Nothing saved yet</h3>
        <p>Tap the ♡ on any piece to keep it here for later.</p>
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
      <p className="product-result">
        {saved.length} saved {saved.length === 1 ? 'piece' : 'pieces'}
      </p>
      <div className="shop-grid">
        {saved.map((product) => (
          <ProductCard product={product} key={product.id} onOpen={setActive} />
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
