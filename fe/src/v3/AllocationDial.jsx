import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../motion/gsap';

// The allocation donut: a portfolio's asset classes as segments of one flat
// ring, split by thin gaps, with the equity share in the middle. Segments
// glide when the portfolio changes; hovering a segment (or a row, via
// `hover`) brings that class forward and puts its share in the centre.
const C = 260;           // centre
const R = 178;           // ring radius (middle of the stroke)
const STROKE = 92;
const GAP = 0.8;         // degrees between segments

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
  const focus = hover >= 0 && values[hover] > 0;

  return (
    <svg className={'v2-dial' + (focus ? ' has-focus' : '')} viewBox="0 0 520 520" role="img" aria-label={`${label}: ${names.map((n, i) => `${n} ${Math.round(values[i])}%`).join(', ')}`}>
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

      <g className="v2-dial-centre" key={focus ? `h${hover}` : 'eq'}>
        <text x={C} y={C + 8} textAnchor="middle" className="v2-dial-big">
          {focus ? Math.round(values[hover]) : equity}<tspan className="v2-dial-pct">%</tspan>
        </text>
        <text x={C} y={C + 44} textAnchor="middle" className="v2-dial-cap">{focus ? names[hover] : 'in equity'}</text>
      </g>
    </svg>
  );
}
