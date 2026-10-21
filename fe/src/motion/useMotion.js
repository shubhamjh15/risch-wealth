import { useLayoutEffect, useEffect } from 'react';
import { gsap, ScrollTrigger, SplitText, EASE, prefersReducedMotion, hasFinePointer } from './gsap';

// useLayoutEffect warns during prerendering; the effect never runs there anyway.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Declarative scroll motion. A page marks elements with data attributes
// and calls useMotion(ref) once; everything is scoped to that ref and
// reverted on unmount (gsap.context), so route changes leave nothing behind.
//
//   data-split            heading: lines rise out of a mask as it enters
//   data-reveal           fades and lifts in; ="stagger" does each child in turn
//   data-words            paragraph: words go from faint to ink as you scroll through
//   data-count="20"       counts up to the number (keeps any prefix/suffix text)
//   data-parallax="0.2"   drifts against the scroll (fraction of its height)
//   data-scrub-line       a vertical rule that fills as its parent scrolls through
//   data-draw             SVG paths inside draw on as it enters
//   data-magnetic         leans toward the pointer (fine pointers only)
//   data-tilt             3D tilt toward the pointer, and sets --mx/--my for a spotlight
//
// Before this runs, CSS keeps [data-reveal] and [data-split] invisible
// (only when html has .js-motion, set in index.html, with a fallback timer),
// so nothing flashes in and then disappears again.
export function useMotion(scopeRef, deps = []) {
  useIsoLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return undefined;
    if (prefersReducedMotion()) {
      window.__motionReady = true;
      return undefined;
    }

    const cleanups = [];
    const ctx = gsap.context(() => {
      const q = (sel) => gsap.utils.toArray(scope.querySelectorAll(sel));

      q('[data-split]').forEach((el) => {
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { visibility: 'visible' });
            return gsap.from(self.lines, {
              yPercent: 112,
              rotate: 2.5,
              transformOrigin: '0% 100%',
              duration: 1.25,
              ease: EASE,
              stagger: 0.09,
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            });
          },
        });
      });

      q('[data-reveal]').forEach((el) => {
        const items = el.dataset.reveal === 'stagger' ? el.children : el;
        gsap.set(el, { visibility: 'visible' });
        gsap.fromTo(items, { autoAlpha: 0, y: 42 }, {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: EASE,
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });

      q('[data-words]').forEach((el) => {
        const split = SplitText.create(el, { type: 'words', wordsClass: 'w' });
        gsap.fromTo(split.words, { opacity: 0.14 }, {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: 0.6 },
        });
      });

      q('[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count);
        const node = [...el.childNodes].find((n) => n.nodeType === 3 && /\d/.test(n.textContent));
        if (!node || Number.isNaN(target)) return;
        // Remember the real text once: a second run (StrictMode, a remount)
        // must not mistake the "0" we write below for the original.
        if (el.dataset.countText === undefined) el.dataset.countText = node.textContent;
        const original = el.dataset.countText;
        cleanups.push(() => { node.textContent = original; });
        const counter = { v: 0 };
        gsap.to(counter, {
          v: target,
          duration: 2.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => { node.textContent = original.replace(/[\d.]+/, Math.round(counter.v)); },
          onComplete: () => { node.textContent = original; },
        });
        node.textContent = original.replace(/[\d.]+/, '0');
      });

      q('[data-parallax]').forEach((el) => {
        const amount = parseFloat(el.dataset.parallax) || 0.15;
        gsap.fromTo(el, { yPercent: -amount * 50 }, {
          yPercent: amount * 50,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      q('[data-scrub-line]').forEach((el) => {
        gsap.fromTo(el, { scaleY: 0 }, {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: { trigger: el.parentElement, start: 'top 70%', end: 'bottom 60%', scrub: 0.4 },
        });
      });

      q('[data-draw]').forEach((el) => {
        const paths = el.querySelectorAll('path, line, polyline, circle');
        paths.forEach((p) => {
          const len = p.getTotalLength ? p.getTotalLength() : 0;
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: 1.8,
          ease: 'power2.inOut',
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      if (hasFinePointer()) {
        q('[data-magnetic]').forEach((el) => {
          const strength = parseFloat(el.dataset.magnetic) || 0.35;
          const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
          const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
          const move = (e) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * strength);
            yTo((e.clientY - (r.top + r.height / 2)) * strength);
          };
          const leave = () => { xTo(0); yTo(0); };
          el.addEventListener('pointermove', move);
          el.addEventListener('pointerleave', leave);
          cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); });
        });

        q('[data-tilt]').forEach((el) => {
          const max = parseFloat(el.dataset.tilt) || 6;
          const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3.out' });
          const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3.out' });
          gsap.set(el, { transformPerspective: 900 });
          const move = (e) => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            el.style.setProperty('--mx', `${px * 100}%`);
            el.style.setProperty('--my', `${py * 100}%`);
            ry((px - 0.5) * max * 2);
            rx((0.5 - py) * max * 2);
          };
          const leave = () => { rx(0); ry(0); };
          el.addEventListener('pointermove', move);
          el.addEventListener('pointerleave', leave);
          cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); });
        });
      }
    }, scope);

    window.__motionReady = true;
    // Fonts change line breaks and section heights; measure again once they're in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
