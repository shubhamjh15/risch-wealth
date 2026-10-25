import { useEffect, useRef, useState } from 'react';

// Small visuals for the "Before we design a portfolio" cards on What We
// Provide. Each draws in once it is on screen.

function useOnScreen() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, on];
}

const CX = 130;
const CY = 128;
const R = 100;
const pt = (deg, r = R) => [CX + r * Math.cos((deg * Math.PI) / 180), CY - r * Math.sin((deg * Math.PI) / 180)];
const arc = (from, to) => {
  const [x1, y1] = pt(from);
  const [x2, y2] = pt(to);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
};
const SEGMENTS = [0, 1, 2, 3, 4].map((k) => ({ from: 180 - k * 36 - 1.5, to: 180 - (k + 1) * 36 + 1.5, o: 0.18 + k * 0.2 }));

// Risk tolerance: a gauge that settles on a reading, and the two things it
// weighs, the losses you could absorb and the losses you could sit through.
export function RiskGauge() {
  const [ref, on] = useOnScreen();
  return (
    <div ref={ref} className={'v3-gauge' + (on ? ' is-on' : '')} aria-hidden="true">
      <svg viewBox="0 0 260 146" className="v3-gauge-dial">
        {SEGMENTS.map((s) => <path key={s.from} d={arc(s.from, s.to)} className="v3-gauge-seg" style={{ opacity: s.o }} />)}
        {Array.from({ length: 21 }, (_, k) => {
          const [x1, y1] = pt(180 - k * 9, 84);
          const [x2, y2] = pt(180 - k * 9, k % 5 ? 80 : 76);
          return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} className="v3-gauge-tick" />;
        })}
        <g className="v3-gauge-needle">
          <line x1={CX} y1={CY} x2={CX} y2={CY - 74} />
          <circle cx={CX} cy={CY} r="8" />
        </g>
        <text x="22" y="145" className="v3-gauge-end">Cautious</text>
        <text x="238" y="145" className="v3-gauge-end" textAnchor="end">Adventurous</text>
      </svg>
      <div className="v3-gauge-rows">
        <div className="v3-gauge-row"><span>Losses you could absorb</span><i><b style={{ '--w': '74%' }} /></i></div>
        <div className="v3-gauge-row"><span>Losses you could sit through</span><i><b style={{ '--w': '48%' }} /></i></div>
        <span className="v3-gauge-limit" style={{ '--x': '48%' }}><em>The lower sets the limit</em></span>
      </div>
    </div>
  );
}

// Behaviour: what the funds returned against what their investors earned.
export function ReturnGap({ funds, investors, gap, caption }) {
  const [ref, on] = useOnScreen();
  const w = (investors / funds) * 100;
  return (
    <figure ref={ref} className={'v3-gap' + (on ? ' is-on' : '')}>
      <div className="v3-gap-row">
        <span>Funds returned</span>
        <i><b style={{ '--w': '100%' }} /></i>
        <strong>{funds}%</strong>
      </div>
      <div className="v3-gap-row">
        <span>Their investors earned</span>
        <i><b style={{ '--w': `${w}%` }} /><u style={{ '--x': `${w}%` }} /></i>
        <strong>{investors}%</strong>
      </div>
      <figcaption><b>{gap}</b> {caption}</figcaption>
    </figure>
  );
}
