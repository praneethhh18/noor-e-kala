import type { Metadata } from 'next';
import Link from 'next/link';
import { Curated } from '@/components/curated';
import { Deals } from '@/components/deals';
import { CustomOrderForm } from '@/components/custom-order-form';
import { Hero, Story, Testimonials, Wave } from '@/components/home-sections';
import { StoreShell } from '@/components/store-shell';
import { getApprovedReviews, getStorefrontData } from '@/lib/store';
import { JsonLd, organisationSchema, websiteSchema } from '@/lib/seo';

export const revalidate = 60;

// Titles lead with what people search for, not the brand — nobody is looking
// for "Noor e Kala" yet, they are looking for resin art and handmade gifts.
export const metadata: Metadata = {
  title: 'Noor e Kala — Handmade Resin Art, Crochet & Personalised Gifts | India',
  description:
    'Handmade resin art, crochet bouquets, fashion jewellery and personalised keepsakes — including varmala and flower preservation. Made to order in India, sent on WhatsApp.',
  keywords: [
    'resin art India', 'varmala preservation', 'personalised gifts India',
    'handmade crochet bouquet', 'resin photo frame', 'fingerprint pendant',
  ],
};

/**
 * Deliberately short. The old homepage ran nine sections deep (marquee, bento
 * collections, featured grid, values, gallery, testimonials…) before it reached
 * a call to action. It is now hero -> shop -> story -> proof -> order, and the
 * gallery and values blocks live on their own pages instead.
 */
export default async function Home() {
  const [{ products, categories, occasions, banner }, reviews] = await Promise.all([
    getStorefrontData(),
    getApprovedReviews(6),
  ]);

  return (
    <StoreShell banner={banner} variant="home">
      <JsonLd data={organisationSchema} />
      <JsonLd data={websiteSchema} />
      <Hero />
      {/* Renders itself only while a discount campaign is running. */}
      <Deals products={products} categories={categories} occasions={occasions} />
      <Curated products={products} categories={categories} occasions={occasions} />
      <Story />

      <Wave />
      <section className="testi">
        <div className="wrap">
          <div className="shead reveal">
            <span className="script">love notes</span>
            <h2>Kind words from lovely people</h2>
          </div>
          <Testimonials limit={3} reviews={reviews} />
          <p className="reveal" style={{ textAlign: 'center', marginTop: 'var(--s7)' }}>
            <Link href="/reviews" className="btn btn-primary">
              Read all reviews &amp; watch reels →
            </Link>
          </p>
        </div>
      </section>
      <Wave flip />

      <CustomOrderForm />
    </StoreShell>
  );
}
