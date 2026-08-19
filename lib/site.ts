// Single source of truth for the things that used to be hardcoded across
// index.html, shop.html, reviews.html, faq.html and app.js.

/**
 * Canonical origin — used for metadata, Open Graph URLs and the sitemap.
 * Set NEXT_PUBLIC_SITE_URL in .env.local once the real domain exists; this is
 * the only place the address is defined, so nothing else needs touching.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  // Vercel injects this at build time, so a deployment gets correct link
  // previews and sitemap URLs before a custom domain is attached.
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '') ||
  'http://localhost:3000';

/** Gift hamper rules: pick this many pieces to earn this discount. */
export const HAMPER_MIN = 3;
export const HAMPER_DISCOUNT = 0.1;

export const INSTAGRAM = 'https://instagram.com/noor.e.kala';

/**
 * Builds a link to our own /wa redirect rather than a wa.me URL.
 *
 * The number used to be compiled into every page — it appeared 8 times in the
 * HTML of /shop alone — which is exactly what scrapers harvest to spam WhatsApp
 * numbers. It now lives only in the WHATSAPP_NUMBER environment variable on the
 * server; /wa attaches it at redirect time, so it never reaches the browser
 * until a real person actually clicks through.
 */
export function waLink(text?: string) {
  return text ? `/wa?t=${encodeURIComponent(text)}` : '/wa';
}

export const ORDER_NOW_LINK = waLink("Hi Noor e Kala! I'd love to order");

export const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/offers', label: 'Offers' },
  { href: '/hampers', label: 'Hampers' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/faq', label: 'FAQ' },
];

export const footerExplore = [
  { href: '/#story', label: 'Our Story' },
  { href: '/shop', label: 'Shop' },
  { href: '/offers', label: 'Offers' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/reviews', label: 'Reviews' },
];

export const collections = [
  {
    key: 'crochet',
    span: 'span3',
    price: 'from ₹299',
    img: '/img/tulip-bouquet.jpg',
    alt: 'Crochet',
    title: 'Crochet & Cuddles',
    body: 'Flower bouquets that never wilt, plushies, cosy tops, keychains & amigurumi friends, all hand-stitched stitch by stitch.',
  },
  {
    key: 'resin',
    span: 'span3',
    price: 'from ₹399',
    img: '/img/clock-black.jpg',
    alt: 'Resin art',
    title: 'Resin Art',
    body: 'Glossy coasters, name plates, frames & keepsakes. Flowers and memories frozen beautifully in time.',
  },
  {
    key: 'jewel',
    span: '',
    price: 'from ₹299',
    img: '/img/resin-jewel-set.jpg',
    alt: 'Jewellery',
    title: 'Fashion Jewellery',
    body: 'Earrings, bracelets & dainty pieces that finish every look with sparkle.',
  },
  {
    key: 'bouquet',
    span: '',
    price: 'from ₹499',
    img: '/img/mixed-bouquet.jpg',
    alt: 'Crochet bouquet',
    title: 'Bouquets',
    body: 'Hand-tied flower & crochet bouquets for moments that deserve to be remembered.',
  },
];

export const values = [
  { icon: '🧶', title: 'Truly Handmade', body: 'No machines, no mass production. Every stitch and pour is done by hand, with patience and care.' },
  { icon: '🎨', title: 'Made Your Way', body: 'Your colours, your names, your story. Almost everything can be customised just for you.' },
  { icon: '🎁', title: 'Gift-Ready', body: 'Lovingly wrapped and finished, so it arrives feeling as special as the person receiving it.' },
];

export const galleryImages = [
  { src: '/img/clock-black.jpg', alt: 'Resin geode clock', shape: 'tall', delay: '' },
  { src: '/img/resin-earrings.jpg', alt: 'Resin heart earrings', shape: '', delay: 'd1' },
  { src: '/img/jhumka-red.jpg', alt: 'Resin floral jhumkas', shape: '', delay: 'd2' },
  { src: '/img/varmala-frame.jpg', alt: 'Varmala preservation frame', shape: 'wide', delay: 'd1' },
  { src: '/img/keychain-tassel.jpg', alt: 'Resin photo keychain', shape: '', delay: 'd2' },
  { src: '/img/preserved-frame.jpg', alt: 'Preserved flower frame', shape: '', delay: '' },
  { src: '/img/coasters.jpg', alt: 'Resin floral coasters', shape: 'wide', delay: 'd1' },
  { src: '/img/fingerprint-pendant.jpg', alt: 'Fingerprint resin pendant', shape: '', delay: 'd2' },
];

export type Testimonial = {
  text: string;
  name: string;
  meta: string;
  initial: string;
  colour: string;
};

// The first three also appear on the homepage; reviews.html showed all of them.
export const testimonials: Testimonial[] = [
  {
    text: "I received the frame and I'm kind of obsessed with it 💕 It's done with proper perfection and exactly according to my design. Thank youu!",
    name: 'Shriya B.',
    meta: 'Resin frame · via Instagram',
    initial: 'S',
    colour: 'var(--clay)',
  },
  {
    text: 'Got the ring and it was damn cute, aesthetic, bilkul Pinterest-y ekdm! My homies also liked it 💍 Bahut sohni hai 💗 Thank you sooo much!',
    name: 'Kirti',
    meta: 'Resin ring · via Instagram',
    initial: 'K',
    colour: 'var(--gold)',
  },
  {
    text: "Firstly, thank you for this lovely photo frame. I didn't expect something so beautiful. The pink and white combination looks so cute, I'd recommend it to everyone. A perfect gift for your special person ❤️",
    name: 'Harsh',
    meta: 'Photo frame · via Instagram',
    initial: 'H',
    colour: 'var(--clay)',
  },
  {
    text: "Your product is just like I wanted 💗 It'll be the most precious thing for me and my best friend. The pendant is exactly what I wanted, a memory for both of us.",
    name: 'Instagram review',
    meta: 'Best-friend pendant',
    initial: '♡',
    colour: 'var(--plum)',
  },
  {
    text: 'Heyy!! Thank you so much for this beautiful resin frame 💗💗 Keep it up! 🧿',
    name: 'Bhumika',
    meta: 'Resin photo frame · via Instagram',
    initial: 'B',
    colour: 'var(--sage)',
  },
  {
    text: 'The resin was so good, literally I love it. Keep working hard, all the best! 💗🙌',
    name: 'Bhumika',
    meta: 'Repeat customer · via Instagram',
    initial: 'B',
    colour: 'var(--sage)',
  },
  {
    text: 'I really liked it. Very very beautiful! 😍',
    name: 'Tanav K.',
    meta: 'Photo frame · via Instagram',
    initial: 'T',
    colour: 'var(--gold)',
  },
];

export const reels = [
  'https://www.instagram.com/reel/DLIJf3ORG8N/',
  'https://www.instagram.com/reel/DLMQ5kMzRlv/',
  'https://www.instagram.com/reel/DMXIGUISkXO/',
  'https://www.instagram.com/reel/DUF56SzkqO-/',
  'https://www.instagram.com/reel/DX9RWS6xuDW/',
  'https://www.instagram.com/reel/DX_pbRyJPue/',
];

export const howItWorks = [
  { n: '1', title: 'Browse & pick', body: 'Add your favourites to the cart, or fill the custom form with your own idea.' },
  { n: '2', title: 'Send on WhatsApp', body: 'Your order reaches me in one message. I confirm availability and the final price.' },
  { n: '3', title: 'Made & delivered', body: 'I handcraft it with love, share little updates, and pack it safely for you.' },
];

export const faqs = [
  {
    q: 'How long does an order take?',
    a: "Ready pieces are usually dispatched in a few days. Custom & resin pieces take a little longer as each one is made by hand, I'll always share a timeline on WhatsApp.",
  },
  {
    q: 'Do you ship across India?',
    a: 'Yes! Orders are shipped pan-India. Delivery charges depend on your location and are confirmed when you message.',
  },
  {
    q: 'How does payment work?',
    a: "There's no payment on the website. Once you send your order, I confirm the details and share UPI / payment info personally.",
  },
  {
    q: 'Can I personalise my order?',
    a: "Absolutely, that's my favourite part. Names, photos, colours, dried flowers, varmala preservation and more. Use the custom order form and tell me your idea.",
  },
  {
    q: 'How do I care for resin pieces?',
    a: "Keep them away from direct sunlight and harsh heat, and wipe gently with a soft dry cloth. They'll stay beautiful for years.",
  },
  {
    q: 'Can I return or exchange?',
    a: "As each piece is handmade (and often personalised), returns aren't possible, but if anything arrives damaged, message me right away and I'll make it right. 💛",
  },
];
