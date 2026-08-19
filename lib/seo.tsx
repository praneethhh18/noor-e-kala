import { INSTAGRAM, SITE_URL, faqs } from './site';

/**
 * Structured data — the machine-readable summary Google reads to understand
 * what this site is and to build rich results.
 *
 * Only product pages had any. Without an Organization block Google has no way
 * to connect the shop to its Instagram, and without FAQPage the FAQ answers
 * cannot appear expanded in search results.
 */

export const organisationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Noor e Kala',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.jpg`,
  description:
    'Handmade resin art, crochet, fashion jewellery, bouquets and personalised keepsakes, made to order in India.',
  // Tells Google this site and that Instagram account are the same business.
  sameAs: [INSTAGRAM],
  areaServed: { '@type': 'Country', name: 'India' },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    availableLanguage: ['en', 'hi'],
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Noor e Kala',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/shop?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

/** Lets the FAQ answers show directly in search results. */
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export function breadcrumbSchema(trail: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      item: `${SITE_URL}${step.url}`,
    })),
  };
}

/** Renders a schema block. Kept in one place so the markup stays consistent. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
