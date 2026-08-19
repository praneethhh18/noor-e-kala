import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // These are read at runtime, so Next has to trace them into the serverless
  // bundle or they are missing once deployed.
  outputFileTracingIncludes: {
    '/**': ['./data/seed.sql', './lib/db/schema.sql'],
  },

  // The old site lived at /index.html, /shop.html, etc. Keep those URLs working
  // for anyone with a bookmark or an old link in a WhatsApp thread.
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/shop.html', destination: '/shop', permanent: true },
      { source: '/reviews.html', destination: '/reviews', permanent: true },
      { source: '/faq.html', destination: '/faq', permanent: true },
      { source: '/admin.html', destination: '/admin', permanent: true },
    ];
  },
};

export default nextConfig;
