'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/catalog';
import type { PricedProduct } from '@/lib/pricing';
import { useCart } from './cart-provider';
import { useWishlist } from './wishlist-provider';
import { waLink } from '@/lib/site';

export const imagesOf = (product: Product) => [product.img, ...(product.images ?? [])].filter(Boolean);

export const discountOf = (product: Product) =>
  product.mrp && Number(product.mrp) > Number(product.price)
    ? Math.round((1 - Number(product.price) / Number(product.mrp)) * 100)
    : 0;

export function enquiryLink(product: Product) {
  return waLink(
    `Hi Noor e Kala! I'd like to enquire about: ${product.name} (from ₹${product.price}).\nCould you share the details and how to begin?`,
  );
}

export function ProductCard({
  product,
  onOpen,
}: {
  product: PricedProduct;
  onOpen: (product: PricedProduct) => void;
}) {
  const { add, items, setQty } = useCart();
  const { has, toggle } = useWishlist();
  // The cart is keyed by product name, so the card can show what is already in it.
  const inCart = items[product.name]?.qty ?? 0;
  const saved = has(product.id);
  const off = discountOf(product);
  const onSale = Boolean(product.salePrice && product.salePrice < Number(product.price));
  const sold = Boolean(product.sold_out);
  const stock = Number(product.stock);
  const showStock = !sold && Number.isFinite(stock) && stock > 0 && stock <= 5;

  // A live occasion offer outranks the standing MRP discount on the badge.
  const corner = sold ? (
    <span className="sold-badge">Sold out</span>
  ) : onSale ? (
    <span className="p-sale">{product.saleLabel}</span>
  ) : off ? (
    <span className="p-off">-{off}%</span>
  ) : product.new ? (
    <span className="p-new">New</span>
  ) : null;

  // Deliberately no `reveal` class: these cards re-render on every search/filter
  // change, and the reveal safety-net only runs once on mount, so a freshly
  // rendered card would stay stuck at opacity:0.
  return (
    <article className={`product${sold ? ' sold' : ''}`} onClick={() => onOpen(product)}>
      <div className="p-img">
        {corner}
        <button
          className={`p-heart${saved ? ' on' : ''}`}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={saved}
          onClick={(event) => {
            event.stopPropagation();
            toggle(product.id);
          }}
        >
          {saved ? '♥' : '♡'}
        </button>
        {imagesOf(product).length > 1 ? <span className="p-more">⊕ more</span> : null}
        {/* next/image serves WebP at the size the card actually needs; the
            originals are up to 327KB JPEGs. `sizes` matches the grid columns. */}
        <Image
          src={product.img}
          alt={product.name}
          fill
          sizes="(max-width:480px) 50vw, (max-width:760px) 50vw, (max-width:1024px) 33vw, 25vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="p-body">
        <h3 className="p-name">
          {/* A real link, so the product pages are crawlable from /shop and can
              be opened in a new tab. Clicking the card elsewhere still opens the
              quick-view popup. */}
          {product.slug ? (
            <Link href={`/shop/${product.slug}`} onClick={(event) => event.stopPropagation()}>
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </h3>
        {/* Always rendered so the line's height is reserved on every card and
            the price rows across a row stay aligned. */}
        <span className="p-stock">{showStock ? `Only ${product.stock} left` : ''}</span>
        <div className="p-bottom">
          {product.enquiry ? (
            <span className="p-price">₹{product.price}+</span>
          ) : onSale ? (
            <span className="p-prices">
              <span className="p-price">₹{product.salePrice}</span>
              <span className="p-mrp">₹{product.price}</span>
            </span>
          ) : off ? (
            <span className="p-prices">
              <span className="p-price">₹{product.price}</span>
              <span className="p-mrp">₹{product.mrp}</span>
            </span>
          ) : (
            <span className="p-price">₹{product.price}</span>
          )}

          {sold ? (
            <button className="p-add" disabled>
              Sold out
            </button>
          ) : product.enquiry ? (
            <a
              className="p-enqbtn"
              href={enquiryLink(product)}
              target="_blank"
              rel="noopener"
              onClick={(event) => event.stopPropagation()}
            >
              Enquire
            </a>
          ) : inCart > 0 ? (
            // Once it is in the cart the button becomes a stepper, so the card
            // shows the quantity instead of still inviting a first "Add".
            <span className="p-qty" onClick={(event) => event.stopPropagation()}>
              <button aria-label={`Remove one ${product.name}`} onClick={() => setQty(product.name, inCart - 1)}>
                −
              </button>
              <b aria-live="polite">{inCart}</b>
              <button aria-label={`Add another ${product.name}`} onClick={() => setQty(product.name, inCart + 1)}>
                +
              </button>
            </span>
          ) : (
            <button
              className="p-add"
              onClick={(event) => {
                event.stopPropagation();
                // effectivePrice, so a live offer is what lands in the cart.
                add(product.name, product.effectivePrice, product.img);
              }}
            >
              Add +
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
