import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { getProducts } from '@/lib/store';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ['', '/shop', '/reviews', '/faq'].map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: 'weekly' as const,
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
