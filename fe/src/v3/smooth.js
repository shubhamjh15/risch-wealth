import { useEffect } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../motion/gsap';

// Inertial scrolling for the public content pages (home, The Firm, What We
// Provide and so on). Forms, the risk profiler and the portals keep native
// scrolling (see motion/ScrollReset.jsx). Lenis drives the window
// scroll, GSAP's ticker drives Lenis, and ScrollTrigger listens to it, so
// pinned and scrubbed scenes stay in step with the smoothed position.
let instance = null;
export const getLenis = () => instance;

export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return undefined;
    let cancelled = false;
    let tick = null;
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      instance = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true });
      instance.on('scroll', ScrollTrigger.update);
      tick = (time) => instance?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    });
    return () => {
      cancelled = true;
      if (tick) gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      instance?.destroy();
      instance = null;
    };
  }, [enabled]);
}

// Scroll to an element or y position, smoothly when Lenis is running.
export function scrollToTarget(target) {
  if (instance) instance.scrollTo(target, { duration: 1.6 });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
  else target?.scrollIntoView({ behavior: 'smooth' });
}
