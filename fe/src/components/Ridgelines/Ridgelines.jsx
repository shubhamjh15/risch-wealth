import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../motion/gsap';

// The home hero's living landscape: stacked ridgelines, like a range of
// hills or a market's history, drawn in hairline ink. One ridge is the
// brand orange and climbs steadily: a portfolio compounding through the
// noise. The surface drifts slowly, lifts under the pointer, and flattens
// a little as the page scrolls away.
//
// Plain 2D canvas, no library. It pauses off-screen and in background tabs,
// and draws one still frame with reduced motion. Colours come from CSS
// custom properties on the canvas, so it follows the theme.

// Compact 2D value noise with smooth interpolation. Enough for gentle terrain.
function makeNoise(seed = 7) {
  const p = new Uint8Array(512);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const perm = [...Array(256).keys()].sort(() => rnd() - 0.5);
  for (let i = 0; i < 512; i += 1) p[i] = perm[i & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const grad = (h, x, y) => ((h & 1) ? x : -x) + ((h & 2) ? y : -y);
  return (x, y) => {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = p[p[xi] + yi]; const ab = p[p[xi] + yi + 1];
    const ba = p[p[xi + 1] + yi]; const bb = p[p[xi + 1] + yi + 1];
    const x1 = grad(aa, xf, yf) + u * (grad(ba, xf - 1, yf) - grad(aa, xf, yf));
    const x2 = grad(ab, xf, yf - 1) + u * (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1));
    return x1 + v * (x2 - x1); // roughly -1..1
  };
}

// quiet: a lower, calmer band for inner-page heroes.
// night: full-height range for a dark ground; the far ridges fade into the
//   sky, the compounding ridge glows, and everything is a little taller.
export default function Ridgelines({ className = '', quiet = false, night = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const noise = makeNoise(11);
    const still = prefersReducedMotion();

    let w = 0; let h = 0; let dpr = 1;
    let colors = {};
    const pointer = { x: 0.62, y: 0.5, tx: 0.62, ty: 0.5, strength: 0, target: 0 };
    let scrollFlatten = 0;
    let raf = 0;
    let visible = true;
    let t0 = performance.now();

    const readColors = () => {
      const cs = getComputedStyle(canvas);
      colors = {
        ink: cs.getPropertyValue('--rl-ink').trim() || '#1C1A17',
        bg: cs.getPropertyValue('--rl-bg').trim() || '#FAF6F0',
        accent: cs.getPropertyValue('--rl-accent').trim() || '#F1650C',
        bg2: cs.getPropertyValue('--rl-bg-2').trim() || null,
      };
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      // 1.25x is plenty for hairlines and keeps the fill work small on 4K screens
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now) => {
      const t = (now - t0) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      pointer.strength += (pointer.target - pointer.strength) * 0.05;

      ctx.clearRect(0, 0, w, h);
      let rows = quiet ? (w < 700 ? 14 : 20) : (w < 700 ? 26 : 38);
      if (night) rows = w < 700 ? 22 : 30;
      const step = Math.max(8, Math.round(w / 150));
      const accentRow = Math.round(rows * (night ? 0.55 : 0.62));
      const top = h * (night ? 0.4 : 0.08);
      const gap = (h * (night ? 0.62 : 0.9)) / rows;
      const ampK = night ? (w < 700 ? 5 : 8.5) : quiet ? 2.6 : (w < 700 ? 3.2 : 6.5);
      const amp = gap * ampK * (1 - scrollFlatten * 0.7);
      const drift = still ? 0 : t * 0.06;
      let groundFill = colors.bg;
      if (colors.bg2) {
        groundFill = ctx.createLinearGradient(0, 0, 0, h);
        groundFill.addColorStop(0, colors.bg);
        groundFill.addColorStop(1, colors.bg2);
      }

      for (let r = 0; r < rows; r += 1) {
        const depth = r / (rows - 1); // 0 = far (top), 1 = near (bottom)
        const baseY = top + r * gap;
        const isAccent = r === accentRow;
        ctx.beginPath();
        let first = true;
        const pts = [];
        for (let x = -step; x <= w + step; x += step) {
          const nx = x / w;
          // terrain: two octaves, peaks stronger toward the middle of the canvas
          let n = noise(nx * 3.1 + drift, r * 0.19) * 0.65 + noise(nx * 7.3 - drift * 1.6, r * 0.33 + 4) * 0.35;
          const centre = Math.exp(-(((nx - 0.55) / 0.42) ** 2));
          n = Math.max(0, n + 0.18) * centre;
          // the compounding ridge climbs left to right, through the noise
          if (isAccent) n = n * 0.55 + Math.max(0, (nx - 0.08)) ** 1.6 * 1.25;
          // pointer lifts a soft hill under itself
          const dx = (nx - pointer.x) * (w / h);
          // pointer height mapped into row space (rows start lower on a night canvas)
          const dy = depth - (night ? (pointer.y - 0.4) / 0.62 : pointer.y);
          const lift = Math.exp(-(dx * dx) / 0.05 - (dy * dy) / 0.06) * pointer.strength * 1.6;
          const y = baseY - (n + lift) * amp * (0.55 + depth * 0.6);
          pts.push(x, y);
          if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
        }
        // fill below the line in the ground colour, so nearer ridges hide
        // farther ones. With a two-colour ground (--rl-bg-2) the fill is the
        // same vertical gradient as the CSS behind the canvas, so it's seamless.
        ctx.lineTo(w + step, h); ctx.lineTo(-step, h); ctx.closePath();
        ctx.fillStyle = groundFill;
        ctx.fill();
        ctx.beginPath();
        for (let i = 0; i < pts.length; i += 2) {
          if (i === 0) ctx.moveTo(pts[i], pts[i + 1]); else ctx.lineTo(pts[i], pts[i + 1]);
        }
        if (isAccent) {
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = night ? 2.2 : 1.8;
          ctx.globalAlpha = 1;
        } else {
          ctx.strokeStyle = colors.ink;
          ctx.lineWidth = night ? 0.8 : 0.75;
          ctx.globalAlpha = night ? 0.05 + depth * 0.42 : 0.12 + depth * 0.38;
        }
        ctx.stroke();
        if (isAccent && night) {
          // a soft halo: one wide, faint stroke (cheaper than shadowBlur)
          ctx.lineWidth = 7;
          ctx.globalAlpha = 0.16;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    };

    // ~30fps is smooth for a slow drift and halves the work
    let last = 0;
    const loop = (now) => {
      if (now - last >= 32) { last = now; draw(now); }
      if (!still && visible) raf = requestAnimationFrame(loop);
    };
    const start = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };

    const onPointer = (e) => {
      const r = canvas.getBoundingClientRect();
      const inside = e.clientY >= r.top && e.clientY <= r.bottom;
      pointer.tx = (e.clientX - r.left) / r.width;
      pointer.ty = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      pointer.target = inside ? 1 : 0;
    };
    const onLeave = () => { pointer.target = 0; };
    const onScroll = () => {
      const r = canvas.getBoundingClientRect();
      scrollFlatten = Math.min(1, Math.max(0, -r.top / (r.height || 1)));
    };

    readColors();
    resize();
    const ro = new ResizeObserver(() => { readColors(); resize(); if (still) draw(performance.now()); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      if (visible && !still) start();
    });
    io.observe(canvas);
    const onVis = () => { visible = !document.hidden; if (visible && !still) start(); };
    document.addEventListener('visibilitychange', onVis);
    // theme switch: pick up the new colours
    const mo = new MutationObserver(() => { readColors(); if (still) draw(performance.now()); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    if (still) {
      draw(performance.now());
    } else {
      window.addEventListener('pointermove', onPointer, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
      window.addEventListener('scroll', onScroll, { passive: true });
      t0 = performance.now() - 4000; // start mid-drift rather than from a flat frame
      start();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect(); mo.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, [quiet, night]);

  return <canvas ref={canvasRef} className={`ridgelines ${className}`.trim()} aria-hidden="true" />;
}
