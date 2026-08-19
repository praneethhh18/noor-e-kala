'use client';

import { useEffect, useState } from 'react';

// Everything the old app.js did to the page shell: scroll progress, the cursor
// glow, the scroll-reveal pass, and the back-to-top heart.
export function SiteChrome({ preloader = false }: { preloader?: boolean }) {
  const [preDone, setPreDone] = useState(!preloader);

  // The `js` class is set by an inline script in the layout so the reveal
  // animations are armed before first paint.

  useEffect(() => {
    if (!preloader) return;
    const hide = () => setPreDone(true);
    if (document.readyState === 'complete') hide();
    else addEventListener('load', hide);
    const safety = setTimeout(hide, 2500);
    return () => {
      removeEventListener('load', hide);
      clearTimeout(safety);
    };
  }, [preloader]);

  // Progress bar + sticky header state.
  useEffect(() => {
    const header = document.getElementById('hdr');
    const bar = document.getElementById('progress');
    const onScroll = () => {
      header?.classList.toggle('scrolled', scrollY > 30);
      if (bar) {
        const scrollable = document.documentElement.scrollHeight - innerHeight;
        bar.style.width = `${scrollable > 0 ? (scrollY / scrollable) * 100 : 0}%`;
      }
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  }, []);

  // Scroll reveal. Queried fresh each pass so client-rendered cards are covered,
  // with the same "nothing stays invisible" safety net the static site had.
  useEffect(() => {
    const check = () => {
      const viewport = innerHeight || document.documentElement.clientHeight;
      document.querySelectorAll<HTMLElement>('.reveal:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < viewport * 0.92) el.classList.add('in');
      });
    };
    check();
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    const safety = setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => el.classList.add('in'));
    }, 3000);
    return () => {
      removeEventListener('scroll', check);
      removeEventListener('resize', check);
      clearTimeout(safety);
    };
  }, []);

  // Cursor glow — pointer devices only.
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return;
    const glow = document.getElementById('glow');
    if (!glow) return;
    const onMove = (event: MouseEvent) => {
      glow.style.transform = `translate(${event.clientX}px,${event.clientY}px) translate(-50%,-50%)`;
    };
    addEventListener('mousemove', onMove);
    return () => removeEventListener('mousemove', onMove);
  }, []);

  return (
    <>
      <div id="progress" />
      <div className="cursor-glow" id="glow" />
      {preloader ? (
        <div id="pre" className={preDone ? 'done' : ''}>
          <img className="pre-mark" src="/logo.jpg" alt="Noor e Kala" />
          <div className="pre-txt">Handmade with love</div>
        </div>
      ) : null}
      <BackToTop />
    </>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(scrollY > 600);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      className={`totop ${show ? 'show' : ''}`}
      aria-label="Back to top"
      onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ♥
    </button>
  );
}
