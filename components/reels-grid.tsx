'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { reels } from '@/lib/site';

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

// The old site got a full page load every time, so embed.js always ran against
// fresh blockquotes. With client-side navigation the script is already loaded
// and won't notice these, so ask it to re-scan on mount.
export function ReelsGrid() {
  useEffect(() => {
    window.instgrm?.Embeds.process();
  }, []);

  return (
    <>
      <div className="reels-grid">
        {reels.map((url) => (
          <div className="reel-card reveal" key={url}>
            <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14">
              <a href={url} target="_blank" rel="noopener">
                Watch on Instagram
              </a>
            </blockquote>
          </div>
        ))}
      </div>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onReady={() => window.instgrm?.Embeds.process()}
      />
    </>
  );
}
