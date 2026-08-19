import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { getProducts } from '@/lib/store';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // /wishlist is deliberately absent — it is per-device and marked noindex.
  const pages = ['', '/shop', '/offers', '/hampers', '/reviews', '/faq'].map((route) => ({
    url: `${SITE_URL}${route}`,
    // Offers change as campaigns start and stop, so crawl that one more often.
    changeFrequency: (route === '/offers' ? 'daily' : 'weekly') as 'daily' | 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  const catalogue = await getProducts();
  const products = catalogue
    .filter((product) => product.slug)
    .map((product) => ({
      url: `${SITE_URL}/shop/${product.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [...pages, ...products];
}
