import Link from 'next/link';
import { InstagramIcon } from './icons';
import { INSTAGRAM, collections, testimonials, values } from '@/lib/site';

const heroWords = ['Little', 'pieces', 'of'];
const heroWords2 = ['made', 'just', 'for', 'you.'];

// Keeps 0.1 + 0.05 from rendering as 0.15000000000000002s in the style attribute.
const delay = (seconds: number) => `${seconds.toFixed(2)}s`;

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1>
            {/* The space must sit between the spans, not inside them: .w is
                inline-block, which collapses any whitespace it contains. */}
            {heroWords.map((word, i) => (
              <span key={word}>
                <span className="w" style={{ animationDelay: delay(0.05 + i * 0.1) }}>
                  {word}
                </span>{' '}
              </span>
            ))}
            <em className="w" style={{ animationDelay: '.35s' }}>
              art
            </em>
            ,<br />
            {heroWords2.map((word, i) => (
              <span key={word}>
                <span className="w" style={{ animationDelay: delay(0.5 + i * 0.1) }}>
                  {word}
                </span>
                {i < heroWords2.length - 1 ? ' ' : null}
              </span>
            ))}
          </h1>
          <p className="lede">
            From soft crochet cuddles to glossy resin keepsakes, dainty jewellery and blooms that never fade. Every{' '}
            <em>Noor e Kala</em> creation is handcrafted, one stitch and one pour at a time.
          </p>
          <div className="hero-cta">
            <Link href="/shop" className="btn btn-primary">
              Explore the collections →
            </Link>
            <a href={INSTAGRAM} target="_blank" rel="noopener" className="btn btn-ghost">
              <InstagramIcon /> See on Instagram
            </a>
          </div>
          <div className="hero-meta">
            <div>
              <div className="n">100%</div>
              <div className="l">Handmade</div>
            </div>
            <div>
              <div className="n">★★★★★</div>
              <div className="l">Loved by many</div>
            </div>
            <div>
              <div className="n">∞</div>
              <div className="l">Made with love</div>
            </div>
          </div>
        </div>

        <div className="collage">
          <div className="frame f1">
            <img src="/img/clock-green.jpg" alt="Resin geode wall clock" />
          </div>
          <div className="frame f2">
            <img src="/img/resin-earrings.jpg" alt="Resin heart earrings" />
          </div>
          <div className="frame f3">
            <img src="/img/resin-jewel-set.jpg" alt="Resin jewellery set" />
          </div>
          <div className="sticker">
            made
            <br />
            with
            <br />♡ &amp; care
          </div>
        </div>
      </div>
    </section>
  );
}

export function Marquee() {
  const words = ['Crochet', 'Resin Art', 'Fashion Jewellery', 'Bouquets', 'Gift Hampers', 'Keepsakes'];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {[...words, ...words].map((word, i) => (
          <span key={`${word}-${i}`}>{word}</span>
        ))}
      </div>
    </div>
  );
}

export function Story() {
  return (
    <section className="story" id="story">
      <div className="wrap story-grid">
        <div className="story-imgs reveal">
          <div className="a">
            <img loading="lazy" src="/img/coasters.jpg" alt="Resin floral coasters" />
          </div>
          <div className="b">
            <img loading="lazy" src="/img/name-tray.jpg" alt="Personalised resin tray" />
          </div>
        </div>
        <div className="reveal d1">
          <span className="script" style={{ fontSize: '1.9rem', color: 'var(--clay)' }}>
            our little story
          </span>
          <h2>
            Where <em>everyday things</em> become little heirlooms.
          </h2>
          <p>
            Noor e Kala began with my own two hands, a ball of yarn, and a heart that couldn&apos;t sit still. What
            started as a quiet hobby slowly bloomed into my tiny studio full of colour, with yarn baskets, resin
            moulds, beads and ribbons everywhere.
          </p>
          <p>
            Every piece is made slowly and on purpose. No factory, no shortcuts. Just real hands, real time, and a whole
            lot of love poured into things meant to be kept, gifted and adored for years.
          </p>
          <p>
            When you choose something from here, you&apos;re not just buying an object. You&apos;re holding a little
            piece of my heart.
          </p>
          <div className="sig">with love, Noor e Kala ♡</div>
        </div>
      </div>
    </section>
  );
}

export function Collections() {
  return (
    <section className="collections" id="collections">
      <div className="wrap">
        <div className="shead reveal">
          <span className="script">what I make</span>
          <h2>The Collections</h2>
          <p>Five little worlds of craft. Pick the one calling your name, or mix &amp; match for the perfect gift.</p>
        </div>
        <div className="coll-grid">
          {collections.map((item, index) => (
            <Link
              href={`/shop#${item.key}`}
              className={`card ${item.span} reveal ${index === 1 || index === 3 ? 'd1' : ''}`.replace(/\s+/g, ' ').trim()}
              key={item.key}
            >
              <div className="ph">
                <span className="price">{item.price}</span>
                <img loading="lazy" src={item.img} alt={item.alt} />
              </div>
              <div className="body">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </Link>
          ))}
          <Link href="/#order" className="card reveal d2 card-custom">
            <div className="ph">
              <span className="custom-badge" aria-hidden="true">
                ✦
              </span>
              <span className="price">made to order</span>
              <img loading="lazy" src="/img/wedding-keepsake.jpg" alt="Personalised keepsake" />
            </div>
            <div className="body">
              <h3>Custom &amp; Personalised</h3>
              <p>Names, photos, varmala preservation, hampers — tell me your idea and I&apos;ll make it just for you.</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Values() {
  return (
    <section className="values">
      <div className="wrap">
        <div className="shead reveal">
          <span className="script">why people fall in love</span>
          <h2>Made the slow, lovely way</h2>
        </div>
        <div className="val-grid">
          {values.map((value, index) => (
            <div className={`val reveal ${index ? `d${index}` : ''}`.trim()} key={value.title}>
              <div className="ic">{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Wave({ flip = false }: { flip?: boolean }) {
  return (
    <div className="wave" style={flip ? { background: 'var(--cream)', marginTop: '-1px' } : { background: 'var(--cream)', marginBottom: '-1px' }}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path
          d={
            flip
              ? 'M0,30 C240,-10 480,60 720,30 C960,0 1200,55 1440,30 L1440,0 L0,0 Z'
              : 'M0,30 C240,70 480,0 720,30 C960,60 1200,5 1440,30 L1440,60 L0,60 Z'
          }
          fill="#5E2A3B"
        />
      </svg>
    </div>
  );
}

export function Testimonials({ limit }: { limit?: number }) {
  const shown = limit ? testimonials.slice(0, limit) : testimonials;

  return (
    <div className="t-grid">
      {shown.map((quote, index) => (
        <div className={`quote reveal ${index % 3 ? `d${index % 3}` : ''}`.trim()} key={`${quote.name}-${index}`}>
          <div className="stars">★★★★★</div>
          <p>&ldquo;{quote.text}&rdquo;</p>
          <div className="who">
            <span className="av" style={{ background: quote.colour }}>
              {quote.initial}
            </span>
            <div>
              <b>{quote.name}</b>
              <small>{quote.meta}</small>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
