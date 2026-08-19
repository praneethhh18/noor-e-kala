'use client';

import { useState } from 'react';
import { galleryImages } from '@/lib/site';

export function Gallery() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section className="gallery" id="gallery">
      <div className="wrap">
        <div className="shead reveal">
          <span className="script">a peek inside</span>
          <h2>The Pretty Corner</h2>
          <p>A little glimpse of the colours, textures and tiny details that make each piece special.</p>
        </div>
        <div className="gal-grid">
          {galleryImages.map((image) => (
            <figure className={`${image.shape} reveal ${image.delay}`.trim()} key={image.src}>
              <img loading="lazy" src={image.src} alt={image.alt} onClick={() => setLightbox(image.src)} />
            </figure>
          ))}
        </div>
      </div>

      {/* Only render the img once there is a real source: src="" makes the
          browser re-request the whole page. */}
      <div id="lightbox" className={lightbox ? 'open' : ''} onClick={() => setLightbox(null)}>
        {lightbox ? <img src={lightbox} alt="" /> : null}
      </div>
    </section>
  );
}
