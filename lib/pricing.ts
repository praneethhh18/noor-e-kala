import type { Product } from './catalog';

export type Occasion = {
  key: string;
  label: string;
  emoji: string | null;
  headline: string | null;
  discount_percent: number;
  starts_on: string | null;
  ends_on: string | null;
  is_active: boolean;
  sort_order: number;
};

/** A product with any live occasion offer already worked out. */
export type PricedProduct = Product & {
  occasions: string[];
  /** Price after the best live occasion discount, or null when none applies. */
  salePrice: number | null;
  /** e.g. "RAKHI 15% OFF" — for the badge on the card. */
  saleLabel: string | null;
  /** What the customer actually pays. Always use this, never `price`, at checkout. */
  effectivePrice: number;
};

const today = () => new Date().toISOString().slice(0, 10);

/** Is the campaign switched on and inside its date window right now? */
export function isLive(occasion: Occasion, on = today()) {
  if (!occasion.is_active || occasion.discount_percent <= 0) return false;
  if (occasion.starts_on && on < occasion.starts_on) return false;
  if (occasion.ends_on && on > occasion.ends_on) return false;
  return true;
}

export function liveOccasions(occasions: Occasion[], on = today()) {
  return occasions.filter((occasion) => isLive(occasion, on));
}

/**
 * Applies the single best live offer a product qualifies for. Offers never
 * stack — the customer gets the largest discount, not the sum of them.
 */
export function priceProduct(
  product: Product & { occasions?: string[] },
  occasions: Occasion[],
  on = today(),
): PricedProduct {
  const tags = product.occasions ?? [];
  const applicable = occasions.filter((occasion) => isLive(occasion, on) && tags.includes(occasion.key));

  const best = applicable.reduce<Occasion | null>(
    (winner, occasion) => (!winner || occasion.discount_percent > winner.discount_percent ? occasion : winner),
    null,
  );

  if (!best) {
    return { ...product, occasions: tags, salePrice: null, saleLabel: null, effectivePrice: Number(product.price) };
  }

  const salePrice = Math.round(Number(product.price) * (1 - best.discount_percent / 100));
  return {
    ...product,
    occasions: tags,
    salePrice,
    saleLabel: `${best.label} · ${Math.round(best.discount_percent)}% off`,
    effectivePrice: salePrice,
  };
}

export function priceAll(products: (Product & { occasions?: string[] })[], occasions: Occasion[], on = today()) {
  return products.map((product) => priceProduct(product, occasions, on));
}
