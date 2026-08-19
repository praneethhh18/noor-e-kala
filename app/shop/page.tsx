import type { Metadata } from 'next';
import { ShopBrowser } from '@/components/shop-browser';
import { StoreShell } from '@/components/store-shell';
import { getStorefrontData } from '@/lib/store';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Buy Handmade Resin Art, Jewellery & Gifts Online | Noor e Kala',
  description:
    'Shop handmade resin art, crochet bouquets, fashion jewellery and personalised gifts. Every piece made by hand in India — order on WhatsApp, pan-India delivery.',
};

export default async function Shop() {
  const { products, categories, occasions, banner } = await getStorefrontData();

  return (
    <StoreShell banner={banner}>
      <ShopBrowser products={products} categories={categories} occasions={occasions} />
    </StoreShell>
  );
}
