import type { Metadata } from 'next';
import { InstagramIcon } from '@/components/icons';
import { Testimonials, Wave } from '@/components/home-sections';
import { ReelsGrid } from '@/components/reels-grid';
import { StoreShell } from '@/components/store-shell';
import { INSTAGRAM, waLink } from '@/lib/site';
import { getBanner } from '@/lib/store';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Reviews & Reels — Noor e Kala',
  description: 'Real reviews and reels from happy Noor e Kala customers.',
};

const reviewCta = waLink(
  "Hi Noor e Kala! Here's my review (5 stars):\n\n(what I ordered & how I loved it)\n\n- my name",
);

export default async function Reviews() {
  const banner = await getBanner();

  return (
    <StoreShell banner={banner}>
      <section className="testi" id="love" style={{ paddingTop: '150px' }}>
        <div className="wrap">
          <div className="shead reveal">
            <span className="script">love notes</span>
            <h2>Kind words from lovely people</h2>
            <p>Real messages from happy customers on Instagram. 💛</p>
          </div>
          <Testimonials />
          <div className="reveal" style={{ textAlign: 'center', marginTop: '2.8rem' }}>
            <p style={{ color: 'var(--cream-2)', marginBottom: '1rem' }}>
              Got something from me? I&apos;d love to hear your thoughts 💛
            </p>
            <a className="btn" style={{ background: 'var(--gold)', color: '#3b2c26' }} href={reviewCta} target="_blank" rel="noopener">
              Send a review on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Wave flip />

      <section className="reels" id="reels">
        <div className="wrap">
          <div className="shead reveal">
            <span className="script">see it in real life</span>
            <h2>Watch the Love</h2>
            <p>Real reels from happy customers and little peeks at the making. Tap any to watch on Instagram.</p>
          </div>
          <ReelsGrid />
          <p className="reveal" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href={INSTAGRAM} target="_blank" rel="noopener" className="btn btn-primary">
              <InstagramIcon /> See more on @noor.e.kala →
            </a>
          </p>
        </div>
      </section>
    </StoreShell>
  );
}
