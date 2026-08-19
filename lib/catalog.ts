// Shared shapes for the catalogue. The rows themselves come from SQLite
// (lib/store.ts); data/products.json and data/site.json are only used to seed an
// empty database on first run (lib/db/index.ts).

export type Category = {
  key: string;
  label: string;
  sort_order?: number | null;
  /** What the buyer can put on this piece, if anything. */
  personalise?: import('./personalise').Personalise | null;
  is_active?: boolean | null;
};

export type Product = {
  id: string;
  name: string;
  /** URL segment for /shop/<slug>. */
  slug?: string | null;
  price: number;
  mrp?: number | null;
  cat: string;
  img: string;
  images?: string[] | null;
  desc?: string | null;
  featured?: boolean | null;
  new?: boolean | null;
  stock?: number | null;
  sold_out?: boolean | null;
  enquiry?: boolean | null;
  note?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
  /** What the buyer can put on this piece, if anything. */
  personalise?: import('./personalise').Personalise | null;
  created_at?: string | null;
};
