'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Category } from '@/lib/catalog';
import type { Occasion, PricedProduct } from '@/lib/pricing';
import { ProductCard } from './product-card';
import { ProductModal } from './product-modal';

const RECENT_KEY = 'nek_recent';
const SHOWN = 6;

/**
 * The homepage's single shopping section. It replaces the old separate
 * "Collections" bento and "Featured" grid — one section that lets you pivot
 * between collections in place rather than scrolling past two static blocks.
 */
export function Curated({
  products,
  categories,
  occasions = [],
}: {
  products: PricedProduct[];
  categories: Category[];
  occasions?: Occasion[];
}) {
  const [active, setActive] = useState<PricedProduct | null>(null);
  const [cat, setCat] = useState('all');
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      setRecentIds(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'));
    } catch {
      setRecentIds([]);
    }
  }, []);

  function open(product: PricedProduct) {
    setActive(product);
    setRecentIds((previous) => {
      const next = [product.id, ...previous.filter((id) => id !== product.id)].slice(0, 8);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* private mode — recently-viewed is a nicety, never a failure */
      }
      return next;
    });
  }

  const inStock = useMemo(() => products.filter((product) => !product.sold_out), [products]);

  const shown = useMemo(() => {
    const pool = cat === 'all' ? inStock : inStock.filter((product) => product.cat === cat);
    // Featured first, then the rest, so a thin category still fills the row.
    return [...pool].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))).slice(0, SHOWN);
  }, [inStock, cat]);

  const recent = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    return recentIds.map((id) => byId.get(id)).filter((product): product is PricedProduct => Boolean(product));
  }, [recentIds, products]);

  // Only offer a chip if it actually has something behind it.
  const usable = categories.filter((category) => inStock.some((product) => product.cat === category.key));

  return (
    <section className="curated" id="shop">
      <div className="wrap">
        <div className="shead reveal">
          <span className="script">a few favourites</span>
          <h2>Find something you love</h2>
        </div>

        <div className="chips reveal" role="tablist" aria-label="Collections">
          <button
            role="tab"
            aria-selected={cat === 'all'}
            className={`chip${cat === 'all' ? ' active' : ''}`}
            onClick={() => setCat('all')}
          >
            Everything
          </button>
          {usable.map((category) => (
            <button
              key={category.key}
              role="tab"
              aria-selected={cat === category.key}
              className={`chip${cat === category.key ? ' active' : ''}`}
              onClick={() => setCat(category.key)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="curated-grid" key={cat}>
          {shown.map((product, index) => (
            <div className="curated-cell" style={{ ['--i' as string]: index }} key={product.id}>
              <ProductCard product={product} onOpen={open} />
            </div>
          ))}
        </div>

        {recent.length > 1 ? (
          <div className="recent">
            <h3>Recently viewed</h3>
            <div className="recent-rail">
              {recent.map((product) => (
                <button className="recent-item" key={product.id} onClick={() => open(product)}>
                  <Image src={product.img} alt="" width={132} height={132} sizes="132px" />
                  <span>{product.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="curated-foot reveal">
          <Link href="/shop" className="btn btn-primary">
            Browse the full shop →
          </Link>
        </div>
      </div>

      {active ? (
        <ProductModal product={active} categories={categories} onClose={() => setActive(null)} allProducts={products} onOpen={open} />
      ) : null}
    </section>
  );
}
