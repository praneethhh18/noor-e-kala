'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { Category } from '@/lib/catalog';
import type { PricedProduct } from '@/lib/pricing';
import { useCart } from './cart-provider';
import { discountOf, enquiryLink, imagesOf } from './product-card';

const REVIEWS_KEY = 'nek_reviews';

type Review = { name: string; rating: number; text: string };

const clampRating = (value: number) => Math.max(1, Math.min(5, Math.round(value) || 5));

function readStoredReviews(productName: string): Review[] {
  try {
    return (JSON.parse(localStorage.getItem(REVIEWS_KEY) ?? '{}') as Record<string, Review[]>)[productName] ?? [];
  } catch {
    return [];
  }
}

function storeReview(productName: string, review: Review) {
  try {
    const all = JSON.parse(localStorage.getItem(REVIEWS_KEY) ?? '{}') as Record<string, Review[]>;
    all[productName] = [...(all[productName] ?? []), review];
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
  } catch {
    // storage blocked — the review just won't persist
  }
}

export function ProductModal({
  product,
  categories,
  onClose,
  allProducts,
  onOpen,
}: {
  product: PricedProduct;
  categories: Category[];
  onClose: () => void;
  /** Optional: enables the "you may also like" rail. */
  allProducts?: PricedProduct[];
  onOpen?: (product: PricedProduct) => void;
}) {
  const { add, items, setQty } = useCart();
  const inCart = items[product.name]?.qty ?? 0;
  const images = imagesOf(product);

  // Same collection first, then anything else in a similar price band.
  const related = (allProducts ?? [])
    .filter((item) => item.id !== product.id && !item.sold_out)
    .sort((a, b) => {
      const sameCat = Number(b.cat === product.cat) - Number(a.cat === product.cat);
      if (sameCat) return sameCat;
      return Math.abs(a.price - product.price) - Math.abs(b.price - product.price);
    })
    .slice(0, 6);
  const [index, setIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState({ name: '', text: '', rating: 5 });
  const [draftError, setDraftError] = useState(false);

  const step = useCallback(
    (delta: number) => setIndex((current) => (current + delta + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    setIndex(0);
    setWriting(false);
    setDraft({ name: '', text: '', rating: 5 });
    setReviews(readStoredReviews(product.name));
  }, [product]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'ArrowRight') step(1);
    };
    addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, step]);

  const off = discountOf(product);
  const sold = Boolean(product.sold_out);
  const categoryLabel = categories.find((item) => item.key === product.cat)?.label ?? product.cat;

  function submitReview() {
    const text = draft.text.trim();
    if (!text) {
      setDraftError(true);
      return;
    }
    const review: Review = { name: draft.name.trim() || 'Customer', rating: clampRating(draft.rating), text };
    storeReview(product.name, review);
    setReviews((current) => [...current, review]);
    setWriting(false);
    setDraft({ name: '', text: '', rating: 5 });
    setDraftError(false);
  }

  return (
    <div className="pmodal">
      <div className="pmodal-overlay" onClick={onClose} />
      <div className="pmodal-box" role="dialog" aria-modal="true" aria-label={product.name}>
        <button className="pmodal-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>

        <div className="pmodal-gallery">
          <div className="pmodal-stage">
            {images.length > 1 ? (
              <button className="pmodal-nav prev" aria-label="Previous image" onClick={() => step(-1)}>
                ‹
              </button>
            ) : null}
            <Image className="pmodal-main" src={images[index]} alt={product.name} fill sizes="(max-width:1024px) 90vw, 45vw" style={{ objectFit: 'cover' }} />
            {images.length > 1 ? (
              <button className="pmodal-nav next" aria-label="Next image" onClick={() => step(1)}>
                ›
              </button>
            ) : null}
            {images.length > 1 ? (
              <span className="pmodal-count">
                {index + 1} / {images.length}
              </span>
            ) : null}
          </div>
          {images.length > 1 ? (
            <div className="pmodal-thumbs">
              {images.map((src, i) => (
                <img
                  className={`pmodal-thumb ${i === index ? 'active' : ''}`}
                  src={src}
                  alt=""
                  key={src}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="pmodal-info">
          <span className="pmodal-cat">{categoryLabel}</span>
          <h3 className="pmodal-name">{product.name}</h3>
          <div className="pmodal-price">
            {product.enquiry ? (
              <>from ₹{product.price}</>
            ) : off ? (
              <>
                ₹{product.price} <span className="pmodal-mrp">₹{product.mrp}</span>{' '}
                <span className="pmodal-off">{off}% off</span>
              </>
            ) : (
              <>₹{product.price}</>
            )}
          </div>
          <p className="pmodal-desc">{product.desc}</p>

          {sold ? (
            <>
              <button className="p-add pmodal-add" disabled>
                Sold out
              </button>
              <p className="pmodal-note">Currently sold out — message me to ask when it&apos;s back. 💛</p>
            </>
          ) : product.enquiry ? (
            <>
              <a className="pmodal-add" href={enquiryLink(product)} target="_blank" rel="noopener">
                💬 Enquire on WhatsApp
              </a>
              <p className="pmodal-note">{product.note ?? 'Made to order — message me to begin. 💌'}</p>
            </>
          ) : (
            <>
              {inCart > 0 ? (
                // Matches the card: once it is in the cart, show and adjust the
                // quantity rather than offering "Add to cart" again.
                <span className="p-qty pmodal-qty">
                  <button aria-label="Remove one" onClick={() => setQty(product.name, inCart - 1)}>
                    −
                  </button>
                  <b aria-live="polite">{inCart} in cart</b>
                  <button aria-label="Add another" onClick={() => setQty(product.name, inCart + 1)}>
                    +
                  </button>
                </span>
              ) : (
                <button
                  className="p-add pmodal-add"
                  onClick={() => add(product.name, Number(product.price), product.img)}
                >
                  Add to cart
                </button>
              )}
              <p className="pmodal-note">
                Want it personalised? Add it, then tell me the details on WhatsApp. 💛
              </p>
            </>
          )}

          {/* The shareable, indexable version of this product. */}
          {product.slug ? (
            <Link className="pmodal-permalink" href={`/shop/${product.slug}`}>
              View full details &amp; reviews →
            </Link>
          ) : null}
        </div>

        <div className="pmodal-reviews">
          <h4>Reviews{reviews.length ? ` (${reviews.length})` : ''}</h4>
          {reviews.length ? (
            reviews.map((review, i) => (
              <div className="rev-item" key={`${review.name}-${i}`}>
                <div className="stars">
                  {'★'.repeat(review.rating)}
                  <span className="dim">{'★'.repeat(5 - review.rating)}</span>
                </div>
                <p>{review.text}</p>
                <small>— {review.name}</small>
              </div>
            ))
          ) : (
            <p className="rev-empty">No reviews yet — be the first to share yours! 💛</p>
          )}

          {writing ? (
            <form className="rev-form" onSubmit={(event) => event.preventDefault()}>
              <div className="rev-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={n <= draft.rating ? 'on' : ''}
                    aria-label={`${n} stars`}
                    onClick={() => setDraft((d) => ({ ...d, rating: n }))}
                  >
                    ★
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Your name"
                value={draft.name}
                onChange={(event) => setDraft((d) => ({ ...d, name: event.target.value }))}
              />
              <textarea
                placeholder="How did you like it?"
                value={draft.text}
                style={draftError ? { borderColor: '#b00020' } : undefined}
                onChange={(event) => {
                  setDraftError(false);
                  setDraft((d) => ({ ...d, text: event.target.value }));
                }}
              />
              <button type="button" className="rev-submit" onClick={submitReview}>
                Post review
              </button>
            </form>
          ) : (
            <button className="rev-add" onClick={() => setWriting(true)}>
              ✍ Write a review
            </button>
          )}
        </div>

        {related.length ? (
          <div className="pmodal-related">
            <h4>You may also like</h4>
            <div className="recent-rail">
              {related.map((item) => (
                <button className="recent-item" key={item.id} onClick={() => onOpen?.(item)}>
                  <Image src={item.img} alt="" width={132} height={132} sizes="132px" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
