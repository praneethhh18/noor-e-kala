import type { Metadata } from 'next';
import { ShopBrowser } from '@/components/shop-browser';
import { StoreShell } from '@/components/store-shell';
import { getStorefrontData } from '@/lib/store';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Shop — Noor e Kala',
  description:
    'Shop handcrafted resin art, jewellery, crochet, bouquets & gifts from Noor e Kala. Add to cart and order on WhatsApp.',
};

export default async function Shop() {
  const { products, categories, occasions, banner } = await getStorefrontData();

  return (
    <StoreShell banner={banner}>
      <ShopBrowser products={products} categories={categories} occasions={occasions} />
    </StoreShell>
  );
}
