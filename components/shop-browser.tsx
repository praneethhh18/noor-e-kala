'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Category } from '@/lib/catalog';
import { isLive, type Occasion, type PricedProduct } from '@/lib/pricing';
import { ProductCard, discountOf } from './product-card';
import { ProductModal } from './product-modal';

/** Best percentage off a product right now, from an offer or its MRP. */
const savingOf = (product: PricedProduct) =>
  product.salePrice
    ? Math.round((1 - product.salePrice / Number(product.price)) * 100)
    : discountOf(product);

export function ShopBrowser({
  products,
  categories,
  occasions = [],
}: {
  products: PricedProduct[];
  categories: Category[];
  occasions?: Occasion[];
}) {
  const [category, setCategory] = useState('all');
  const [occasion, setOccasion] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [active, setActive] = useState<PricedProduct | null>(null);

  // Links arrive as /shop#resin (a collection) or /shop#occasion-wedding.
  useEffect(() => {
    const fromHash = decodeURIComponent(location.hash.slice(1));
    if (!fromHash) return;
    if (fromHash.startsWith('occasion-')) {
      const key = fromHash.replace('occasion-', '');
      if (occasions.some((item) => item.key === key)) setOccasion(key);
    } else if (categories.some((item) => item.key === fromHash)) {
      setCategory(fromHash);
    }
  }, [categories, occasions]);

  const labelFor = useMemo(
    () => new Map(categories.map((item) => [item.key, item.label])),
    [categories],
  );

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products
      .filter((product) => {
        if (category !== 'all' && product.cat !== category) return false;
        if (occasion !== 'all' && !product.occasions.includes(occasion)) return false;
        if (!term) return true;
        const haystack = [product.name, product.desc ?? '', labelFor.get(product.cat) ?? product.cat]
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      })
      .sort((a, b) => {
        // Sort on what the customer actually pays, so a live offer ranks right.
        if (sort === 'low') return a.effectivePrice - b.effectivePrice;
        if (sort === 'high') return b.effectivePrice - a.effectivePrice;
        if (sort === 'sale') return savingOf(b) - savingOf(a);
        return (
          Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
          (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0)
        );
      });
  }, [category, labelFor, occasion, products, query, sort]);

  /**
   * How many pieces each category would show under the current occasion and
   * search. Drives the counts on the tabs and disables the empty ones, so a
   * customer can never land on "0 pieces".
   */
  const countsByCategory = useMemo(() => {
    const term = query.trim().toLowerCase();
    const pool = products.filter((product) => {
      if (occasion !== 'all' && !product.occasions.includes(occasion)) return false;
      if (!term) return true;
      return [product.name, product.desc ?? '', labelFor.get(product.cat) ?? product.cat]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });

    const counts: Record<string, number> = { all: pool.length };
    for (const item of categories) counts[item.key] = pool.filter((product) => product.cat === item.key).length;
    return counts;
  }, [categories, labelFor, occasion, products, query]);

  // If the chosen category empties out after switching occasion, fall back to All.
  useEffect(() => {
    if (category !== 'all' && (countsByCategory[category] ?? 0) === 0) setCategory('all');
  }, [category, countsByCategory]);

  function clearFilters() {
    setCategory('all');
    setOccasion('all');
    setQuery('');
  }

  return (
    <section className="shop" id="shop" style={{ paddingTop: '150px' }}>
      <div className="wrap">
        <div className="shead reveal">
          <span className="script">the full collection</span>
          <h1>Shop Everything</h1>
          <p>
            Add what you love to your cart, then send it straight to me on WhatsApp. I&apos;ll confirm availability and
            sort out payment with you personally.
          </p>
        </div>

        <div className="shop-tools reveal" aria-label="Shop tools">
          <label className="product-search" htmlFor="productSearch">
            <span aria-hidden="true">⌕</span>
            <input
              id="productSearch"
              type="search"
              placeholder="Search gifts, resin, crochet…"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            className="product-sort"
            aria-label="Sort products"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="featured">Featured first</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="sale">Best offers</option>
          </select>
        </div>

        {occasions.length ? (
          <div className="occasion-row reveal">
            <span className="occasion-label">Shopping for</span>
            <div className="occasion-chips">
              <button
                className={`chip${occasion === 'all' ? ' active' : ''}`}
                onClick={() => setOccasion('all')}
              >
                Any occasion
              </button>
              {occasions.map((item) => (
                <button
                  key={item.key}
                  className={`chip${occasion === item.key ? ' active' : ''}${isLive(item) ? ' chip-offer' : ''}`}
                  onClick={() => setOccasion(item.key)}
                >
                  {item.emoji ? `${item.emoji} ` : ''}
                  {item.label}
                  {isLive(item) ? <em>{Math.round(item.discount_percent)}% off</em> : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="shop-tabs reveal">
          <button className={`shop-tab ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>
            All <em>{countsByCategory.all}</em>
          </button>
          {categories.map((item) => {
            const count = countsByCategory[item.key] ?? 0;
            return (
              <button
                className={`shop-tab ${category === item.key ? 'active' : ''}`}
                key={item.key}
                // Empty under the chosen occasion — disabled rather than a dead end.
                disabled={count === 0}
                title={count === 0 ? `No ${item.label.toLowerCase()} for this occasion` : undefined}
                onClick={() => setCategory(item.key)}
              >
                {item.label} <em>{count}</em>
              </button>
            );
          })}
        </div>

        <p className="product-result" aria-live="polite">
          {visible.length ? (
            `Showing ${visible.length} ${visible.length === 1 ? 'piece' : 'pieces'}`
          ) : (
            <>
              Nothing matches that combination.{' '}
              <button className="link-button" onClick={clearFilters}>
                Clear filters
              </button>
            </>
          )}
        </p>

        <div className="shop-grid">
          {visible.map((product) => (
            <ProductCard product={product} key={product.id} onOpen={setActive} />
          ))}
        </div>

        <p className="reveal" style={{ textAlign: 'center', marginTop: '2.4rem', color: 'var(--ink-soft)', fontSize: '.95rem' }}>
          Want something custom?{' '}
          <Link href="/#order" style={{ color: 'var(--clay)', fontWeight: 600, borderBottom: '1.5px solid var(--clay)' }}>
            Message me your idea
          </Link>{' '}
          and I&apos;ll make it just for you.
        </p>
      </div>

      {active ? <ProductModal product={active} categories={categories} onClose={() => setActive(null)} /> : null}
    </section>
  );
}
