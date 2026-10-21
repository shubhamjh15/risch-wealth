import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from './gsap';

// Native scrolling, deliberately: inertial "smooth scroll" libraries read as
// lag on a site people come to for information. This only restores the
// multi-page behaviour of starting every page at the top, and re-measures
// scroll animations once the new page has laid out.
export default function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);
  return null;
}
