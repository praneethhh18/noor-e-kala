'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { PricedProduct, Review } from '@/lib/store';
import { useCart } from './cart-provider';
import { PersonalisePanel, type Personalisation } from './personalise-panel';
import { discountOf, enquiryLink, imagesOf } from './product-card';
import { ReviewForm } from './review-form';
import { StockAlertForm } from './stock-alert-form';
import { useWishlist } from './wishlist-provider';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5`}>
      {'★★★★★'.split('').map((star, i) => (
        <span key={i} className={i < rating ? '' : 'dim'}>
          {star}
        </span>
      ))}
    </span>
  );
}

export function ProductDetail({ product, reviews }: { product: PricedProduct; reviews: Review[] }) {
  const { add, items, setQty, openCart } = useCart();
  const { has, toggle } = useWishlist();
  const saved = has(product.id);
  const images = imagesOf(product);
  const [index, setIndex] = useState(0);

  const personalise = product.personalise ?? null;
  const [custom, setCustom] = useState<Personalisation>({
    text: '',
    colour: personalise?.colours[0]?.value ?? '#C9A227',
  });
  /** The one-line summary that travels with the order. */
  const customSummary = () => {
    if (!personalise || !custom.text.trim()) return undefined;
    const finish = personalise.colours.find((colour) => colour.value === custom.colour)?.name;
    return `"${custom.text.trim()}"${finish ? ` · ${finish}` : ''}`;
  };
  const off = discountOf(product);
  // A live occasion offer beats the standing MRP discount.
  const onSale = Boolean(product.salePrice && product.salePrice < Number(product.price));
  const sold = Boolean(product.sold_out);
  const inCart = items[product.name]?.qty ?? 0;
  const stock = Number(product.stock);
  const showStock = !sold && Number.isFinite(stock) && stock > 0 && stock <= 5;

  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <>
      <div className="pdp-grid">
        <div className="pdp-gallery">
          <div className="pdp-stage">
            <Image src={images[index]} alt={product.name} fill priority sizes="(max-width:1024px) 92vw, 46vw" style={{ objectFit: 'cover' }} />
            {onSale ? <span className="p-sale">{product.saleLabel}</span> : off ? <span className="p-off">-{off}%</span> : null}
            {sold ? <span className="sold-badge">Sold out</span> : null}
          </div>
          {images.length > 1 ? (
            <div className="pmodal-thumbs">
              {images.map((image, i) => (
                <img
                  key={image}
                  className={`pmodal-thumb${i === index ? ' active' : ''}`}
                  src={image}
                  alt=""
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="pdp-info">
          <div className="pdp-title">
            <h1>{product.name}</h1>
            <button
              className={`p-heart pdp-heart${saved ? ' on' : ''}`}
              aria-label={saved ? 'Remove from saved' : 'Save for later'}
              aria-pressed={saved}
              onClick={() => toggle(product.id)}
            >
              {saved ? '♥' : '♡'}
            </button>
          </div>

          {reviews.length ? (
            <p className="pdp-rating">
              <Stars rating={Math.round(average)} /> {average.toFixed(1)} · {reviews.length}{' '}
              {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          ) : null}

          <p className="pmodal-price">
            {product.enquiry ? `from ₹${product.price}` : `₹${product.effectivePrice}`}
            {onSale ? (
              <>
                <span className="pmodal-mrp">₹{product.price}</span>
                <span className="pmodal-off">{product.saleLabel}</span>
              </>
            ) : off ? (
              <>
                <span className="pmodal-mrp">₹{product.mrp}</span>
                <span className="pmodal-off">-{off}%</span>
              </>
            ) : null}
          </p>

          {showStock ? <p className="p-stock">Only {product.stock} left</p> : null}
          {product.desc ? <p className="pmodal-desc">{product.desc}</p> : null}

          {personalise && !sold ? (
            <PersonalisePanel image={product.img} config={personalise} value={custom} onChange={setCustom} />
          ) : null}

          {sold ? (
            <>
              <button className="p-add pmodal-add" disabled>
                Sold out
              </button>
              <StockAlertForm productId={product.id} />
            </>
          ) : product.enquiry ? (
            <a className="pmodal-add" href={enquiryLink(product)} target="_blank" rel="noopener">
              💬 Enquire on WhatsApp
            </a>
          ) : inCart > 0 ? (
            <div className="pdp-actions">
              <span className="p-qty pmodal-qty">
                <button aria-label="Remove one" onClick={() => setQty(product.name, inCart - 1)}>
                  −
                </button>
                <b aria-live="polite">{inCart} in cart</b>
                <button aria-label="Add another" onClick={() => setQty(product.name, inCart + 1)}>
                  +
                </button>
              </span>
              <button className="btn btn-ghost" onClick={openCart}>
                View cart →
              </button>
            </div>
          ) : (
            <button
              className="p-add pmodal-add"
              onClick={() => add(product.name, product.effectivePrice, { img: product.img, slug: product.slug ?? undefined, custom: customSummary() })}
            >
              Add to cart
            </button>
          )}

          <p className="pmodal-note">
            {product.note ?? 'Handmade to order — send your cart on WhatsApp and I’ll confirm the details. 💛'}
          </p>
        </div>
      </div>

      <div className="pdp-reviews">
        <h2>Reviews</h2>
        {reviews.length ? (
          <div className="pdp-review-list">
            {reviews.map((review) => (
              <article className="rev-item" key={review.id}>
                <Stars rating={review.rating} />
                <p>{review.text}</p>
                <small>
                  {review.name} · {new Date(review.created_at).toLocaleDateString('en-IN')}
                </small>
              </article>
            ))}
          </div>
        ) : (
          <p className="rev-empty">No reviews yet — be the first to share one.</p>
        )}
        <ReviewForm productId={product.id} />
      </div>
    </>
  );
}
