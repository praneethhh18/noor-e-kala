'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'nek_wishlist';

type WishlistValue = {
  ids: string[];
  ready: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
};

const WishlistContext = createContext<WishlistValue | null>(null);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used inside WishlistProvider');
  return context;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  // `ready` guards against a hydration mismatch: the server renders no saved
  // items, so hearts must stay empty until localStorage has been read.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(stored)) setIds(stored.filter((id) => typeof id === 'string'));
    } catch {
      /* corrupt or unavailable storage — start empty */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* private mode — the wishlist is a nicety, not a failure */
    }
  }, []);

  const toggle = useCallback(
    (id: string) => persist(ids.includes(id) ? ids.filter((item) => item !== id) : [id, ...ids]),
    [ids, persist],
  );

  const remove = useCallback((id: string) => persist(ids.filter((item) => item !== id)), [ids, persist]);

  const value = useMemo<WishlistValue>(
    () => ({ ids, ready, has: (id) => ready && ids.includes(id), toggle, remove }),
    [ids, ready, toggle, remove],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
