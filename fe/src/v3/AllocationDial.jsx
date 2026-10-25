import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../motion/gsap';

// The allocation dial: a portfolio's four asset classes as arcs on a ring,
// inside a ring of 100 fine ticks (one per percent) that light up to the
// equity share, like the chapter ring of a watch. Arcs glide when the
// portfolio changes; hovering an arc (or a row, via `hover`) brings that
// class forward and puts its share in the centre.
const C = 260;           // centre
const R = 196;           // arc radius
const STROKE = 26;
const TICK_IN = 228;
const GAP = 1.4;         // degrees between arcs

const pt = (deg, r) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
};
function arc(d0, d1, r) {
  const [x0, y0] = pt(d0, r);
  const [x1, y1] = pt(d1, r);
  const large = d1 - d0 > 180 ? 1 : 0;
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export default function AllocationDial({ values, colors, names, equity, label, hover = -1, onHover }) {
  const [shown, setShown] = useState(values);
  const state = useRef({ v: values.slice() });

  // Glide from the current mix to the new one.
  useEffect(() => {
    const s = state.current;
    if (prefersReducedMotion()) { s.v = values.slice(); setShown(values.slice()); return undefined; }
    const from = s.v.slice();
    const k = { t: 0 };
    const tween = gsap.to(k, {
      t: 1, duration: 1.1, ease: 'expo.out',
      onUpdate: () => {
        s.v = from.map((f, i) => f + (values[i] - f) * k.t);
        setShown(s.v.slice());
      },
    });
    return () => tween.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.join(',')]);

  const total = shown.reduce((a, b) => a + b, 0) || 1;
  let at = 0;
  const arcs = shown.map((v, i) => {
    const span = (v / total) * 360;
    const seg = { i, d0: at + GAP / 2, d1: at + span - GAP / 2, show: span > GAP * 2 };
    at += span;
    return seg;
  });
  const lit = Math.round((shown[0] + shown[1]) || 0); // equity, in ticks
  const focus = hover >= 0 && values[hover] > 0;

  return (
    <svg className={'v2-dial' + (focus ? ' has-focus' : '')} viewBox="0 0 520 520" role="img" aria-label={`${label}: ${names.map((n, i) => `${n} ${Math.round(values[i])}%`).join(', ')}`}>
      <defs>
        <radialGradient id="v2-dial-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
          <stop offset="70%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={C} cy={C} r="250" fill="url(#v2-dial-glow)" />

      {/* chapter ring: one tick per percent, lit up to the equity share */}
      <g className="v2-dial-ticks">
        {Array.from({ length: 100 }, (_, k) => {
          const deg = k * 3.6;
          const long = k % 10 === 0;
          const [x0, y0] = pt(deg, TICK_IN);
          const [x1, y1] = pt(deg, TICK_IN + (long ? 16 : 8));
          return <line key={k} x1={x0} y1={y0} x2={x1} y2={y1} className={(k < lit ? 'is-lit' : '') + (long ? ' is-long' : '')} />;
        })}
      </g>
      {[0, 25, 50, 75].map((p) => {
        const [x, y] = pt(p * 3.6, TICK_IN + 34);
        return <text key={p} x={x} y={y} className="v2-dial-num" textAnchor="middle" dominantBaseline="middle">{p}</text>;
      })}

      <circle cx={C} cy={C} r={R} className="v2-dial-track" />
      {arcs.map((a) => a.show && (
        <path
          key={a.i}
          d={arc(a.d0, a.d1, R)}
          stroke={colors[a.i]}
          strokeWidth={STROKE}
          className={'v2-dial-arc' + (hover === a.i ? ' is-on' : '')}
          onPointerEnter={() => onHover?.(a.i)}
          onPointerLeave={() => onHover?.(-1)}
        />
      ))}
      <circle cx={C} cy={C} r={R - STROKE / 2 - 18} className="v2-dial-inner" />

      <g className="v2-dial-centre" key={focus ? `h${hover}` : 'eq'}>
        <text x={C} y={C - 6} textAnchor="middle" className="v2-dial-big">
          {focus ? Math.round(values[hover]) : equity}<tspan className="v2-dial-pct">%</tspan>
        </text>
        <text x={C} y={C + 40} textAnchor="middle" className="v2-dial-cap">{focus ? names[hover] : 'in equity'}</text>
        <text x={C} y={C + 64} textAnchor="middle" className="v2-dial-sub">{label}</text>
      </g>
    </svg>
  );
}
