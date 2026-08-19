'use client';

import { useEffect, useState } from 'react';

/**
 * Time left on a limited offer. Rendered only after mount, because the server
 * and the browser would otherwise disagree on "now" and React would warn about
 * a hydration mismatch.
 */
export function Countdown({ endsAt }: { endsAt: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(`${endsAt}T23:59:59`).getTime();
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (left === null || left <= 0) return null;

  const days = Math.floor(left / 86_400_000);
  const hours = Math.floor((left % 86_400_000) / 3_600_000);
  const minutes = Math.floor((left % 3_600_000) / 60_000);
  const seconds = Math.floor((left % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span className="countdown" aria-label={`Offer ends in ${days} days ${hours} hours`}>
      <b>Ends in</b>
      {days > 0 ? <em>{days}d</em> : null}
      <em>{pad(hours)}h</em>
      <em>{pad(minutes)}m</em>
      <em>{pad(seconds)}s</em>
    </span>
  );
}
