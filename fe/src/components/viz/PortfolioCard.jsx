import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../../motion/gsap';
import { allocationFor } from '../../content/solutions';
import { tenYearSeries, window as tail, linePath, formatINR } from './series';

// The home hero's centrepiece: an illustrative ₹1 Cr portfolio. The growth
// line draws itself, the value counts up, the period tabs redraw it, and
// the pointer reads off any month. Below it, the model mix of the RISCH
// Active Growth portfolio. Clearly labelled hypothetical throughout.

const PERIODS = [1, 3, 5, 10];
const W = 560;
const H = 220;
const START = 1e7; // ₹1 Cr
const SERIES = tenYearSeries(7);
const MIX = allocationFor('growth').macro; // India equity, international, debt, cash
const MIX_ROWS = [
  { name: 'India equity', color: 'var(--brand)' },
  { name: 'Global equity', color: '#6C8FBF' },
  { name: 'Fixed income', color: 'var(--green-2)' },
  { name: 'Cash', color: '#8A93A3' },
];

export default function PortfolioCard() {
  const [years, setYears] = useState(5);
  const [hover, setHover] = useState(null);
  const lineRef = useRef(null);
  const areaRef = useRef(null);
  const valueRef = useRef(null);
  const svgRef = useRef(null);
  const shown = useRef(1);

  const values = useMemo(() => tail(SERIES, years), [years]);
  const { d, area, pts } = useMemo(() => linePath(values, W, H), [values]);
  const end = values[values.length - 1];
  const pct = (end - 1) * 100;

  // draw the line and count the value up whenever the period changes
  useEffect(() => {
    const line = lineRef.current;
    const len = line.getTotalLength();
    const counter = { v: shown.current };
    if (prefersReducedMotion()) {
      valueRef.current.textContent = formatINR(START * end);
      shown.current = end;
      return undefined;
    }
    const tl = gsap.timeline();
    tl.fromTo(line, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })
      .fromTo(areaRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power1.out' }, 0.5)
      .to(counter, {
        v: end,
        duration: 1.6,
        ease: 'power2.inOut',
        onUpdate: () => { valueRef.current.textContent = formatINR(START * counter.v); },
        onComplete: () => { shown.current = end; },
      }, 0);
    return () => tl.kill();
  }, [d, end]);

  const onMove = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHover(Math.round(x * (values.length - 1)));
  };
  const hp = hover != null ? pts[hover] : null;
  const hv = hover != null ? values[hover] : null;

  return (
    <div className="pc">
      <div className="pc-head">
        <div>
          <p className="pc-label">Illustrative portfolio · ₹1 Cr invested</p>
          <p className="pc-value"><span ref={valueRef}>{formatINR(START * end)}</span></p>
          <p className="pc-change">
            <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1l5 6H7v4H5V7H1z" fill="currentColor" /></svg>
            +{pct.toFixed(1)}% <span>over {years} {years === 1 ? 'year' : 'years'}</span>
          </p>
        </div>
        <div className="pc-tabs" role="group" aria-label="Period">
          {PERIODS.map((p) => (
            <button key={p} type="button" aria-pressed={years === p} className={years === p ? 'is-on' : ''} onClick={() => { setYears(p); setHover(null); }}>
              {p}Y
            </button>
          ))}
        </div>
      </div>

      <div className="pc-chart">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" onPointerMove={onMove} onPointerLeave={() => setHover(null)} aria-hidden="true">
          <defs>
            <linearGradient id="pcFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--green-2)" stopOpacity=".32" />
              <stop offset="1" stopColor="var(--green-2)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => <line key={g} className="pc-grid" x1="0" x2={W} y1={H * g} y2={H * g} />)}
          <path ref={areaRef} d={area} fill="url(#pcFill)" />
          <path ref={lineRef} d={d} className="pc-line" />
          {hp && (
            <g className="pc-hover">
              <line x1={hp[0]} x2={hp[0]} y1="0" y2={H} />
              <circle cx={hp[0]} cy={hp[1]} r="5" />
            </g>
          )}
        </svg>
        <span className="pc-end" style={{ left: '100%', top: `${(pts[pts.length - 1][1] / H) * 100}%` }} aria-hidden="true" />
        {hp && (
          <span className="pc-tip" style={{ left: `${(hp[0] / W) * 100}%`, top: `${(hp[1] / H) * 100}%` }}>
            {formatINR(START * hv)}
            <small>Month {hover}</small>
          </span>
        )}
      </div>

      <div className="pc-mix">
        <div className="pc-mix-bar" aria-hidden="true">
          {MIX.map((v, i) => <i key={MIX_ROWS[i].name} style={{ flexGrow: v, background: MIX_ROWS[i].color }} />)}
        </div>
        <ul className="pc-mix-legend">
          {MIX.map((v, i) => v > 0 && (
            <li key={MIX_ROWS[i].name}><i style={{ background: MIX_ROWS[i].color }} />{MIX_ROWS[i].name} <b>{Math.round(v)}%</b></li>
          ))}
        </ul>
      </div>

      <p className="pc-note">Hypothetical illustration of a diversified portfolio, model mix of RISCH Active Growth. Not actual or projected returns.</p>
    </div>
  );
}
