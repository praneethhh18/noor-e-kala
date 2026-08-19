import type { Metadata } from 'next';
import Link from 'next/link';
import { StoreShell } from '@/components/store-shell';
import { faqs, howItWorks } from '@/lib/site';
import { getBanner } from '@/lib/store';
import { JsonLd, faqSchema } from '@/lib/seo';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'How to Order Handmade Gifts Online — Delivery, Payment & Resin Care | Noor e Kala',
  description: 'How ordering works at Noor e Kala, plus answers about delivery, payment, customisation and resin care.',
};

export default async function Faq() {
  const banner = await getBanner();

  return (
    <StoreShell banner={banner}>
      <JsonLd data={faqSchema} />
      <section className="howto" style={{ paddingTop: '150px' }}>
        <div className="wrap">
          <div className="shead reveal">
            <span className="script">simple &amp; sweet</span>
            <h1>How ordering works</h1>
            <p>Ordering a handmade piece is easy and personal, here&apos;s exactly how it goes.</p>
          </div>

          <div className="steps">
            {howItWorks.map((step, index) => (
              <div className={`step reveal ${index ? `d${index}` : ''}`.trim()} key={step.n}>
                <span className="step-n">{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>

          <div className="faq reveal">
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>

          <p className="reveal" style={{ textAlign: 'center', marginTop: '2.4rem' }}>
            <Link href="/#order" className="btn btn-primary">
              Start a custom order →
            </Link>
          </p>
        </div>
      </section>
    </StoreShell>
  );
}
