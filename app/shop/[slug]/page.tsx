import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product-detail';
import { StoreShell } from '@/components/store-shell';
import { getBanner, getCategories, getProductBySlug, getProducts, getReviews } from '@/lib/store';
import { JsonLd, breadcrumbSchema } from '@/lib/seo';

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

/**
 * Per-product metadata. This is what makes a pasted link unfurl into a photo,
 * title and price in WhatsApp and Instagram, which is how most of this shop's
 * customers arrive.
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Not found — Noor e Kala' };

  const title = `${product.name} — ₹${product.price} — Noor e Kala`;
  const description =
    product.desc?.slice(0, 200) ??
    `${product.name}, handmade by Noor e Kala. Order on WhatsApp.`;

  return {
    title,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: product.img, alt: product.name }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [product.img] },
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.filter((product) => product.slug).map((product) => ({ slug: product.slug as string }));
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [all, categories, reviews, banner] = await Promise.all([
    getProducts(),
    getCategories(),
    getReviews(product.id),
    getBanner(),
  ]);
  const category = categories.find((item) => item.key === product.cat);

  const related = all
    .filter((item) => item.id !== product.id && !item.sold_out)
    .sort((a, b) => {
      const sameCat = Number(b.cat === product.cat) - Number(a.cat === product.cat);
      return sameCat || Math.abs(a.price - product.price) - Math.abs(b.price - product.price);
    })
    .slice(0, 4);

  // Tells Google the price and availability so they can show in search results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.img, ...(product.images ?? [])],
    description: product.desc ?? undefined,
    category: category?.label,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: product.sold_out ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
    ...(reviews.length
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  return (
    <StoreShell banner={banner}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Shows the Shop > Category > Product trail under the search result. */}
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Shop', url: '/shop' },
          ...(category ? [{ name: category.label, url: `/shop#${category.key}` }] : []),
          { name: product.name, url: `/shop/${product.slug}` },
        ])}
      />

      <section className="pdp">
        <div className="wrap">
          <nav className="crumbs">
            <Link href="/shop">Shop</Link>
            <span>/</span>
            {category ? <span>{category.label}</span> : null}
          </nav>

          <ProductDetail product={product} reviews={reviews} />

          {related.length ? (
            <div className="pdp-related">
              <h2>You may also like</h2>
              <div className="related-grid">
                {related.map((item) => (
                  <Link className="related-card" href={`/shop/${item.slug}`} key={item.id}>
                    <Image src={item.img} alt={item.name} width={132} height={132} sizes="132px" />
                    <span className="related-name">{item.name}</span>
                    <span className="related-price">₹{item.price}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </StoreShell>
  );
}
