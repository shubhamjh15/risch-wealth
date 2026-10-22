import { useEffect, useRef } from 'react';
import { gsap, hasFinePointer, prefersReducedMotion } from '../motion/gsap';

// A small inverting dot that replaces the pointer on the v2 page (mouse and
// trackpad only). It swells over links and buttons, and anything marked
// data-cursor="Label" shows that word inside it. The native cursor is only
// hidden once this has mounted (.v2-has-cursor), so it's never lost.
export default function Cursor() {
  const dot = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return undefined;
    const el = dot.current;
    const root = document.documentElement;
    root.classList.add('v2-has-cursor');
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });

    let shown = false;
    const move = (e) => {
      if (!shown) {
        gsap.set(el, { x: e.clientX, y: e.clientY });
        el.classList.add('is-on');
        shown = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };
    const over = (e) => {
      const tagged = e.target.closest?.('[data-cursor]');
      const link = e.target.closest?.('a, button, summary, [role="button"]');
      el.classList.toggle('is-link', !!link && !tagged);
      el.classList.toggle('is-label', !!tagged);
      if (label.current) label.current.textContent = tagged ? tagged.dataset.cursor : '';
    };
    const leave = () => { el.classList.remove('is-on'); shown = false; };
    const down = () => el.classList.add('is-down');
    const up = () => el.classList.remove('is-down');

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over);
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      root.classList.remove('v2-has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  return (
    <div ref={dot} className="v2-cursor" aria-hidden="true">
      <span ref={label} />
    </div>
  );
}
