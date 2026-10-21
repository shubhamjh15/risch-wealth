import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../../motion/gsap';
import { formatINR } from './series';

// "Time does the heavy lifting": pick an amount, a horizon and an assumed
// rate, and watch the bars compound. Pure arithmetic at a constant assumed
// rate, labelled as a hypothetical illustration, not a projection.

const AMOUNTS = [2.5e6, 1e7, 5e7]; // ₹25 L, ₹1 Cr, ₹5 Cr
const RATES = [8, 10, 12];

export default function Compounding() {
  const [amount, setAmount] = useState(1e7);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(20);
  const finalRef = useRef(null);
  const shown = useRef(null);

  const bars = useMemo(
    () => Array.from({ length: years + 1 }, (_, y) => amount * (1 + rate / 100) ** y),
    [amount, rate, years],
  );
  const final = bars[bars.length - 1];
  const max = final;

  // count the result to its new value
  useEffect(() => {
    const el = finalRef.current;
    if (shown.current == null || prefersReducedMotion()) {
      shown.current = final;
      el.textContent = formatINR(final);
      return undefined;
    }
    const c = { v: shown.current };
    const tw = gsap.to(c, {
      v: final,
      duration: 0.9,
      ease: 'power3.out',
      onUpdate: () => { el.textContent = formatINR(c.v); },
      onComplete: () => { shown.current = final; },
    });
    return () => tw.kill();
  }, [final]);

  return (
    <div className="cg">
      <div className="cg-controls">
        <div className="cg-field">
          <span className="cg-label">Invest</span>
          <div className="cg-seg" role="group" aria-label="Amount invested">
            {AMOUNTS.map((a) => (
              <button key={a} type="button" aria-pressed={amount === a} className={amount === a ? 'is-on' : ''} onClick={() => setAmount(a)}>{formatINR(a).replace('.00', '')}</button>
            ))}
          </div>
        </div>
        <div className="cg-field">
          <span className="cg-label">Assumed return</span>
          <div className="cg-seg" role="group" aria-label="Assumed yearly return">
            {RATES.map((r) => (
              <button key={r} type="button" aria-pressed={rate === r} className={rate === r ? 'is-on' : ''} onClick={() => setRate(r)}>{r}%</button>
            ))}
          </div>
        </div>
        <label className="cg-field cg-range">
          <span className="cg-label">Stay invested <b>{years} years</b></span>
          <input type="range" min="3" max="30" value={years} onChange={(e) => setYears(Number(e.target.value))} style={{ '--p': `${((years - 3) / 27) * 100}%` }} />
        </label>
      </div>

      <div className="cg-result">
        <p className="cg-result-label">Could grow to</p>
        <p className="cg-result-value" ref={finalRef}>{formatINR(final)}</p>
        <p className="cg-result-x"><b>{(final / amount).toFixed(1)}×</b> your capital</p>
      </div>

      <div className="cg-bars" aria-hidden="true">
        {bars.map((v, i) => (
          <span key={i} className={i === bars.length - 1 ? 'is-last' : ''} style={{ '--h': `${Math.max(2, (v / max) * 100)}%`, '--i': i }} />
        ))}
      </div>
      <div className="cg-axis" aria-hidden="true"><span>Today</span><span>Year {years}</span></div>

      <p className="cg-note">Hypothetical illustration at a constant assumed rate, before costs and taxes. Real returns vary year to year and can be negative. Not a projection or a promise of returns.</p>
    </div>
  );
}
