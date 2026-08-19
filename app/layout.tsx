import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Noor e Kala, handmade with love',
    template: '%s',
  },
  description: 'Handcrafted resin art, jewellery, crochet, bouquets and gifts.',
  icons: { icon: [{ url: '/logo.jpg', type: 'image/jpeg' }] },
  openGraph: {
    type: 'website',
    siteName: 'Noor e Kala',
    title: 'Noor e Kala — handmade with love',
    description: 'Handcrafted resin art, jewellery, keepsakes & gifts. Made by hand, loved by many.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Enables the reveal animations before first paint, exactly as the old
          inline head script did. Without it the page renders visible and then
          snaps to opacity:0 once React hydrates. The timeout is the failsafe:
          if hydration never happens, nothing stays hidden.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.className+=' js';setTimeout(function(){var e=document.querySelectorAll('.reveal');for(var i=0;i<e.length;i++)e[i].classList.add('in')},3500)",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400..600&family=Caveat:wght@500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
