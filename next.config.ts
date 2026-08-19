import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Uploaded photos live on Vercel Blob, an external host. next/image refuses
    // to optimise a domain that is not listed here, so the main product image
    // rendered broken while the raw <img> thumbnails beside it loaded fine.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },

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
