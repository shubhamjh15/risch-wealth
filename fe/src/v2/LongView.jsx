import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../motion/gsap';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Kept modest on purpose: this illustrates compounding, not any product's
// returns (SEBI/AMFI rules don't allow return projections).
const RATES = [0.08, 0.1, 0.12];
const DEFAULT_RATE = 0.1;
const YEARS = 25;

const crore = (v) => `₹${v >= 10 ? v.toFixed(1) : v.toFixed(2)} Cr`;

// Pinned scene: scrolling through it walks 25 years forward. The terrain
// (./terrain.js) rises row by row and the readout counts the years and the
// value of ₹1 Cr at the chosen assumed rate. Before three.js loads (or
// without WebGL) the readout still works over a plain black ground.
export default function LongView({ num = '04', className = '' }) {
  const section = useRef(null);
  const canvas = useRef(null);
  const yearEl = useRef(null);
  const valueEl = useRef(null);
  const multEl = useRef(null);
  const rail = useRef(null);
  const terrain = useRef(null);
  const state = useRef({ p: 0, rate: DEFAULT_RATE, shown: DEFAULT_RATE });
  const [rate, setRate] = useState(DEFAULT_RATE);

  const paint = () => {
    const { p, shown } = state.current;
    // Whole years, so the figure always matches (1 + r)^year exactly.
    const years = Math.round(p * YEARS);
    const mult = Math.pow(1 + shown, years);
    if (yearEl.current) yearEl.current.textContent = String(years).padStart(2, '0');
    if (valueEl.current) valueEl.current.textContent = crore(mult);
    if (multEl.current) multEl.current.textContent = `${mult.toFixed(1)}×`;
    if (rail.current) rail.current.style.transform = `scaleX(${p})`;
  };

  // Three.js, lazily, once the section is close.
  useEffect(() => {
    const el = section.current;
    let disposed = false;
    let visible = false;
    const onResize = () => terrain.current?.resize();
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      terrain.current?.setPointer((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
    };

    const boot = () => {
      import('./terrain').then(({ createTerrain }) => {
        if (disposed || !canvas.current) return;
        try {
          terrain.current = createTerrain(canvas.current, { small: window.innerWidth < 760 });
        } catch {
          return; // no WebGL: the readout carries the section on its own
        }
        terrain.current.setRate(state.current.shown);
        terrain.current.setProgress(prefersReducedMotion() ? 1 : state.current.p);
        if (visible) terrain.current.start();
        el.classList.add('has-terrain');
      });
    };

    let booted = false;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !booted) { booted = true; boot(); }
      if (visible) terrain.current?.start();
      else terrain.current?.stop();
    }, { rootMargin: '300px 0px' });
    io.observe(el);
    window.addEventListener('resize', onResize);
    el.addEventListener('pointermove', onMove);
    return () => {
      disposed = true;
      io.disconnect();
      window.removeEventListener('resize', onResize);
      el.removeEventListener('pointermove', onMove);
      terrain.current?.dispose();
      terrain.current = null;
    };
  }, []);

  // Scroll: pin the scene and map progress to years.
  useIsoLayoutEffect(() => {
    const el = section.current;
    if (prefersReducedMotion()) {
      state.current.p = 1;
      paint();
      return undefined;
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: () => `+=${window.innerHeight * 2.4}`,
      pin: true,
      scrub: true,
      onUpdate(self) {
        state.current.p = self.progress;
        terrain.current?.setProgress(self.progress);
        paint();
      },
    });
    paint();
    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rate: ease the figures and the landscape to the new curve.
  const choose = (r) => {
    setRate(r);
    state.current.rate = r;
    gsap.to(state.current, {
      shown: r,
      duration: 0.9,
      ease: 'power3.inOut',
      onUpdate: () => {
        terrain.current?.setRate(state.current.shown);
        paint();
      },
    });
  };

  return (
    <section ref={section} className={`v2-long ${className}`.trim()} aria-labelledby="v2-long-title">
      <canvas ref={canvas} className="v2-long-canvas" aria-hidden="true" />
      <div className="v2-long-shade" aria-hidden="true" />
      <div className="v2-wrap v2-long-ui">
        <div className="v2-long-head">
          <p className="v2-label"><span>{num}</span> Compounding</p>
          <h2 id="v2-long-title" className="v2-h2">Time does the<br />heavy lifting.</h2>
          <p className="v2-long-sub">Each line is a quarter. The nearest is today, the horizon is year twenty-five. Scroll to walk forward.</p>
        </div>

        <div className="v2-long-read">
          <div className="v2-long-year">
            <p className="v2-label">Year</p>
            <p className="v2-long-big"><span ref={yearEl}>00</span><small>/ {YEARS}</small></p>
          </div>
          <div className="v2-long-value">
            <p className="v2-label">Illustration: ₹1 Cr at the assumed rate</p>
            <p className="v2-long-big"><span ref={valueEl}>₹1.00 Cr</span></p>
            <p className="v2-long-mult"><span ref={multEl}>1.0×</span> your capital</p>
          </div>
          <div className="v2-long-rate" role="group" aria-label="Assumed annual return">
            <p className="v2-label">Assumed return</p>
            <div>
              {RATES.map((r) => (
                <button key={r} type="button" className={r === rate ? 'is-on' : undefined} aria-pressed={r === rate} onClick={() => choose(r)}>
                  {Math.round(r * 100)}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="v2-long-foot">
          <span className="v2-long-rail" aria-hidden="true"><i ref={rail} /></span>
          <p>Hypothetical illustration of compounding at a constant assumed rate, before costs and taxes. It does not represent the past or future performance of any scheme, portfolio or strategy, and returns are not guaranteed: real returns vary year to year and can be negative. Mutual fund investments are subject to market risks, read all scheme related documents carefully.</p>
        </div>
      </div>
    </section>
  );
}
