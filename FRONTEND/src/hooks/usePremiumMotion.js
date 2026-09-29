import { useEffect } from 'react';

export function usePremiumMotion(page, enabled) {
  useEffect(() => {
    const main = document.getElementById('main');
    if (!main) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed');
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.06 }
    );
    const prepared = new WeakSet();
    const prepareReveals = () => {
      main.querySelectorAll('[data-reveal]').forEach((el, i) => {
        if (prepared.has(el)) return;
        prepared.add(el);
        el.style.setProperty('--reveal-delay', `${Math.min((i % 4) * 65, 195)}ms`);
        if (!enabled || reduced) el.classList.add('is-revealed');
        else {
          el.classList.add('reveal-ready');
          observer.observe(el);
        }
      });
    };
    prepareReveals();
    // Search and pagination insert cards after the page's initial render.
    const changes = new MutationObserver(prepareReveals);
    changes.observe(main, { childList: true, subtree: true });
    let frame;
    const onMove = (e) => {
      if (!enabled || reduced || e.pointerType === 'touch') return;
      const el = e.target.closest('[data-spotlight],.content-card,.universe-tile,.panel,.stat');
      if (!el || !main.contains(el)) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
        el.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
        if (el.hasAttribute('data-tilt')) {
          el.style.setProperty(
            '--tilt-x',
            `${(-(e.clientY - r.top - r.height / 2) / r.height) * 5}deg`
          );
          el.style.setProperty(
            '--tilt-y',
            `${((e.clientX - r.left - r.width / 2) / r.width) * 5}deg`
          );
        }
      });
    };
    const resetTilt = (event) => {
      const card = event.target.closest('[data-tilt]');
      if (card && !card.contains(event.relatedTarget)) {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      }
    };
    main.addEventListener('pointermove', onMove, { passive: true });
    main.addEventListener('pointerout', resetTilt, { passive: true });
    return () => {
      observer.disconnect();
      changes.disconnect();
      main.removeEventListener('pointermove', onMove);
      main.removeEventListener('pointerout', resetTilt);
      cancelAnimationFrame(frame);
    };
  }, [page, enabled]);
}
