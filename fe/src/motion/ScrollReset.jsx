import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from './gsap';
import { getLenis } from '../v3/smooth';

// Native scrolling, deliberately: inertial "smooth scroll" libraries read as
// lag on a site people come to for information. This only restores the
// multi-page behaviour of starting every page at the top, and re-measures
// scroll animations once the new page has laid out.
// The jump is instant: with `scroll-behavior:smooth` on <html> a plain
// scrollTo(0, 0) animated, and on phones the new page laying out cut the
// animation short, leaving the page part-way down. ScrollTrigger also keeps
// the old page's scroll position and puts it back when it refreshes, so
// that memory is cleared and its cache updated first. Links with a #hash
// (e.g. /testimonials#share) are left to the page to position.
if (typeof window !== 'undefined' && 'scrollRestoration' in history) history.scrollRestoration = 'manual';

export default function ScrollReset() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (hash) return undefined;
    const toTop = () => {
      getLenis()?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      ScrollTrigger.clearScrollMemory('manual');
      ScrollTrigger.update();
    };
    toTop();
    const id = requestAnimationFrame(() => {
      toTop();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
