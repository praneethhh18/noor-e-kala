'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Keyed by product name and persisted under the same localStorage keys the old
// static site used, so carts and saved details survive the migration.
const CART_KEY = 'nek_cart';
const DETAILS_KEY = 'nek_details';

/** `custom` carries the buyer's personalisation, e.g. "Aanya & Rohan · Gold". */
export type CartItem = { price: number; qty: number; img?: string; custom?: string };
export type CartItems = Record<string, CartItem>;
export type Details = { name: string; phone: string; email: string; addr: string; note: string };

const emptyDetails: Details = { name: '', phone: '', email: '', addr: '', note: '' };

type CartContextValue = {
  items: CartItems;
  details: Details;
  open: boolean;
  count: number;
  total: number;
  add: (name: string, price: number, img?: string, custom?: string) => void;
  setQty: (name: string, qty: number) => void;
  clear: () => void;
  setDetails: (patch: Partial<Details>) => void;
  openCart: () => void;
  closeCart: () => void;
  toast: (message: string) => void;
  toastMessage: string;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItems>({});
  const [details, setDetailsState] = useState<Details>(emptyDetails);
  const [open, setOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read persisted state after mount so server and client markup match.
  useEffect(() => {
    setItems(readJson<CartItems>(CART_KEY, {}));
    setDetailsState(readJson<Details>(DETAILS_KEY, emptyDetails));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // private mode / quota — the cart just won't persist
    }
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DETAILS_KEY, JSON.stringify(details));
    } catch {
      // as above
    }
  }, [details, hydrated]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const toast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(''), 1700);
  }, []);

  const add = useCallback(
    (name: string, price: number, img?: string, custom?: string) => {
      setItems((current) => {
        const existing = current[name];
        return {
          ...current,
          [name]: {
            price,
            img: img ?? existing?.img,
            // A newly typed personalisation replaces whatever was there before.
            custom: custom ?? existing?.custom,
            qty: (existing?.qty ?? 0) + 1,
          },
        };
      });
      toast(`${name} added to cart 🌸`);
    },
    [toast],
  );

  const setQty = useCallback((name: string, qty: number) => {
    setItems((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      if (qty <= 0) delete next[name];
      else next[name] = { ...next[name], qty };
      return next;
    });
  }, []);

  const clear = useCallback(() => setItems({}), []);

  const setDetails = useCallback((patch: Partial<Details>) => {
    setDetailsState((current) => ({ ...current, ...patch }));
  }, []);

  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);

  const { count, total } = useMemo(() => {
    const entries = Object.values(items);
    return {
      count: entries.reduce((sum, item) => sum + item.qty, 0),
      total: entries.reduce((sum, item) => sum + item.qty * item.price, 0),
    };
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, details, open, count, total, add, setQty, clear, setDetails, openCart, closeCart, toast, toastMessage }),
    [items, details, open, count, total, add, setQty, clear, setDetails, openCart, closeCart, toast, toastMessage],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>{toastMessage}</div>
    </CartContext.Provider>
  );
}
