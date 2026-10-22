import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../motion/gsap';

// A reel of muted clips that advance on a timer: pauses off screen and in a
// background tab, plays the current clip from the top, warms up the next one
// and pauses the rest. With reduced motion the first scene simply holds.
// Used by the v2 and v3 home page heroes.
//   const { i, setI, live, root, vids } = useReel(count, ms)
//   <header ref={root}> … <video ref={(el) => { vids.current[k] = el; }} />
export function useReel(count, ms) {
  const [i, setI] = useState(0);
  const [live, setLive] = useState(true);
  const root = useRef(null);
  const vids = useRef([]);

  useEffect(() => {
    let onScreen = true;
    const sync = () => setLive(onScreen && !document.hidden);
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { threshold: 0.05 });
    io.observe(root.current);
    document.addEventListener('visibilitychange', sync);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);

  useEffect(() => {
    if (!live || prefersReducedMotion()) return undefined;
    const id = setTimeout(() => setI((v) => (v + 1) % count), ms);
    return () => clearTimeout(id);
  }, [i, live, count, ms]);

  useEffect(() => {
    vids.current.forEach((v, k) => {
      if (!v) return;
      if (k === i && live && !prefersReducedMotion()) {
        if (v.preload !== 'auto') v.preload = 'auto';
        try { v.currentTime = 0; } catch { /* not loaded yet */ }
        v.play().catch(() => {});
      } else {
        if (k === (i + 1) % count && v.preload !== 'auto') { v.preload = 'auto'; v.load(); }
        v.pause();
      }
    });
  }, [i, live, count]);

  return { i, setI, live, root, vids };
}
