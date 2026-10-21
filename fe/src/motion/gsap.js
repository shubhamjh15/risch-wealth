// One place that registers GSAP's plugins. Everything that animates
// imports gsap from here, so a plugin is never used unregistered.
// Safe to import while prerendering: plugins only register in a browser.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

const isBrowser = typeof window !== 'undefined';
if (isBrowser) gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin);

export { gsap, ScrollTrigger, SplitText, Draggable };

// Our house curve: a long, soft settle. Used by most reveals.
export const EASE = 'expo.out';

export const prefersReducedMotion = () =>
  isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mouse or trackpad, not touch. Hover-driven effects only run here.
export const hasFinePointer = () =>
  isBrowser && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Signed-in apps (client and staff portals) keep native scrolling and no
// page-level motion: they're tools, and they have their own scroll areas.
export const isAppRoute = (pathname) => /^\/(client-portal|employee-portal)(\/|$)/.test(pathname);

// Scroll the page to a y position (native smooth scrolling).
export function scrollToY(y, { smooth = true } = {}) {
  if (!isBrowser) return;
  window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
}
