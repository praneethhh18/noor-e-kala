'use client';

import { useEffect, useState } from 'react';
import type { Banner } from '@/lib/store';

const DISMISS_KEY = 'nek_ann_dismissed';

// Dismissal is remembered per message, so changing the banner text in the admin
// brings it back for everyone — same rule the static site used.
export function AnnouncementBar({ banner }: { banner: Banner }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!banner?.on || !banner.text) return;
    let dismissed: string | null = null;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY);
    } catch {
      // storage blocked — always show
    }
    if (dismissed === banner.text) return;
    setVisible(true);
  }, [banner]);

  useEffect(() => {
    document.body.classList.toggle('has-annbar', visible);
    return () => document.body.classList.remove('has-annbar');
  }, [visible]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, banner.text);
    } catch {
      // nothing to do
    }
  };

  const content = <span>{banner.text}</span>;

  return (
    <div className="annbar" style={banner.link ? { cursor: 'pointer' } : undefined}>
      {banner.link ? (
        <a href={banner.link} target="_blank" rel="noopener" style={{ color: 'inherit' }}>
          {content}
        </a>
      ) : (
        content
      )}
      <button className="annclose" aria-label="Dismiss" onClick={dismiss}>
        ✕
      </button>
    </div>
  );
}
