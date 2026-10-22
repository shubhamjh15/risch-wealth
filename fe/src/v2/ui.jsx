import { useEffect, useRef } from 'react';
import { PATHS } from '../components/logoPaths';
import { prefersReducedMotion } from '../motion/gsap';

// Small pieces shared across the v2 home page.

export const MEDIA = '/v2/media';

export const Arrow = ({ className = 'v2-arrow' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M2 10h15M11 4l6 6-6 6" stroke="currentColor" strokeWidth="1.3" /></svg>
);

// The RISCH logo with the wordmark in currentColor and the rising swoosh and
// arrow (the last three paths) in the accent colour.
export function BrandMark({ title, className = '' }) {
  const word = PATHS.slice(0, 5);
  const rise = PATHS.slice(5);
  return (
    <svg className={`v2-brand ${className}`.trim()} viewBox="40 40 304 150" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      <g fill="currentColor">{word.map((d) => <path key={d.slice(0, 24)} d={d} />)}</g>
      <g className="v2-brand-rise">{rise.map((d) => <path key={d.slice(0, 24)} d={d} />)}</g>
    </svg>
  );
}

// The rising arrow on its own, as a stroked line that can be drawn on.
export function RiseLine({ className = '' }) {
  return (
    <svg className={`v2-rise ${className}`.trim()} viewBox="0 0 600 120" fill="none" aria-hidden="true">
      <path className="v2-rise-path" d="M2 112 C 140 104, 250 98, 360 70 S 520 22, 588 10" />
      <path className="v2-rise-head" d="M560 4 L598 6 L582 40" />
    </svg>
  );
}

// Muted, looping, inline video that only plays while it's on screen.
export function Clip({ name, className = '', eager = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    if (prefersReducedMotion()) { v.pause(); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (v.preload === 'none') v.preload = 'auto';
        v.play().catch(() => {});
      } else v.pause();
    }, { rootMargin: '200px 0px' });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className={className}
      src={`${MEDIA}/${name}.mp4`}
      poster={`${MEDIA}/${name}.jpg`}
      muted
      loop
      playsInline
      autoPlay={eager}
      preload={eager ? 'auto' : 'none'}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
