import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollTrigger, prefersReducedMotion } from '../motion/gsap';
import { HORIZONS, MACRO_CLASSES, PORTFOLIO_NOTES, PORTFOLIO_SUITS, allocationFor, mixLabel } from '../content/solutions';
import { scrollToTarget } from './smooth';
import { Arrow } from './ui';
import AllocationDial from './AllocationDial';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// The site's chart colours, deep enough to read on the ivory panel.
const LOOK = { india: '#E36A1A', intl: '#3D67A6', debt: '#8E9AB0', cash: '#C4AE8E' };
const COLORS = MACRO_CLASSES.map((c) => LOOK[c.id]);
const NAMES = MACRO_CLASSES.map((c) => c.name);
const SPANS = ['≤ 5 yrs', '5–7 yrs', '7–10 yrs', '10+ yrs'];

// "Your horizon sets the mix": the four RISCH model portfolios on the site's
// 3D donut.
// Scrolling through the pinned scene walks from the shortest horizon to the
// longest; the rail jumps straight to one. Same numbers as the risk
// profiler and the What We Provide page (content/solutions.js).
//   ref   optional; exposes { choose(index) } so another control (the
//         horizon slider on What We Provide) can jump to a mix
export default function Allocation({ num = '03', className = '', ref = null }) {
  const section = useRef(null);
  const trigger = useRef(null);
  const idxRef = useRef(1);
  const [idx, setIdx] = useState(1);
  const [hover, setHover] = useState(-1);

  const tier = HORIZONS[idx];
  const mix = allocationFor(tier.id).macro;
  const equity = Math.round(mix[0] + mix[1]);

  useEffect(() => { idxRef.current = idx; }, [idx]);

  // Pinned on wide screens: scroll walks through the four horizons.
  useIsoLayoutEffect(() => {
    if (prefersReducedMotion() || window.innerWidth < 900) return undefined;
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: () => `+=${window.innerHeight * 2.6}`,
      pin: true,
      onUpdate(self) {
        const next = Math.min(HORIZONS.length - 1, Math.floor(self.progress * HORIZONS.length));
        if (next !== idxRef.current) setIdx(next);
      },
    });
    trigger.current = st;
    return () => { st.kill(); trigger.current = null; };
  }, []);

  const choose = (k) => {
    const st = trigger.current;
    if (st) scrollToTarget(st.start + ((k + 0.5) / HORIZONS.length) * (st.end - st.start));
    else setIdx(k);
  };
  useImperativeHandle(ref, () => ({ choose }));

  return (
    <section ref={section} className={`v2-alloc ${className}`.trim()} aria-labelledby="v2-alloc-title">
      <div className="v2-wrap v2-alloc-inner">
        <div className="v2-alloc-stage">
          <div className="v2-alloc-visual">
            <AllocationDial values={mix} colors={COLORS} names={NAMES} equity={equity} label={`Illustrative ${mixLabel(tier).toLowerCase()} mix`} hover={hover} onHover={setHover} />
          </div>

          <div className="v2-alloc-info">
            <p className="v2-label"><span>{num}</span> Asset allocation</p>
            <h2 id="v2-alloc-title" className="v2-alloc-title">Your horizon sets the mix.</h2>
            <div className="v2-alloc-now" key={idx}>
              <p className="v2-alloc-span">{tier.span}</p>
              <h3 className="v2-alloc-name">Illustrative mix: {mixLabel(tier)}</h3>
            </div>
            <ul className="v2-alloc-rows">
              {MACRO_CLASSES.map((c, i) => (
                <li
                  key={c.id}
                  className={(hover === i ? 'is-on' : '') + (mix[i] ? '' : ' is-zero')}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(-1)}
                >
                  <span className="v2-alloc-row-name"><i style={{ background: COLORS[i] }} />{c.name}</span>
                  <span className="v2-alloc-bar"><i style={{ transform: `scaleX(${mix[i] / 100})`, background: COLORS[i] }} /></span>
                  <b>{Math.round(mix[i])}%</b>
                </li>
              ))}
            </ul>
            <p className="v2-alloc-suits" key={`d-${idx}`}>{PORTFOLIO_SUITS[tier.id]}</p>
            {PORTFOLIO_NOTES[tier.id] && <p className="v2-alloc-warn">{PORTFOLIO_NOTES[tier.id]}</p>}
            <Link to="/risk-profiler" className="v2-link">Find your risk profile in 3 minutes <Arrow /></Link>
          </div>
        </div>

        <div className="v2-alloc-rail" role="tablist" aria-label="Investment horizon">
          <span className="v2-alloc-rail-line" aria-hidden="true"><i style={{ transform: `scaleX(${(idx + 1) / HORIZONS.length})` }} /></span>
          {HORIZONS.map((h, k) => (
            <button key={h.id} type="button" role="tab" aria-selected={k === idx} className={k === idx ? 'is-on' : k < idx ? 'is-past' : undefined} onClick={() => choose(k)}>
              <span>{SPANS[k]}</span>
              <b>{mixLabel(h)}</b>
            </button>
          ))}
        </div>
        <p className="v2-alloc-note">Illustrative asset mixes by time horizon, shown only to explain how horizon and risk shape an allocation. Not a recommendation or an offer of any product; a suitable allocation depends on your full risk profile and circumstances. Mutual fund investments are subject to market risks, read all scheme related documents carefully.</p>
      </div>
    </section>
  );
}
