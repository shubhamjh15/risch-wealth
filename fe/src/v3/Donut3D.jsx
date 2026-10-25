import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../motion/gsap';
import AllocationDial from './AllocationDial';

// The site's 3D allocation donut (components/solutions/donut3d.js), sized
// for the allocation scene. Hovering
// a segment, or a row in the list beside it (`hover`), lifts that segment
// and reads its share in the middle. Without WebGL the flat dial stands in.
export default function Donut3D({ values, colors, names, equity, label, hover = -1, onHover }) {
  const host = useRef(null);
  const handle = useRef(null);
  const latest = useRef(values);
  const hoverCb = useRef(onHover);
  const [mode, setMode] = useState('loading'); // loading | live | flat

  useEffect(() => { hoverCb.current = onHover; }, [onHover]);
  useEffect(() => {
    latest.current = values;
    handle.current?.setValues(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.join(',')]);
  useEffect(() => { handle.current?.setHover(hover); }, [hover]);

  useEffect(() => {
    const el = host.current;
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) {
      setMode('flat');
      return undefined;
    }
    let cancelled = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      import('../components/solutions/donut3d').then(({ mountDonut }) => {
        if (cancelled) return;
        const h = mountDonut(el, { colors, values: latest.current, reduced: prefersReducedMotion(), onHover: (i) => hoverCb.current?.(i) });
        if (h) { handle.current = h; setMode('live'); } else setMode('flat');
      }).catch(() => setMode('flat'));
    }, { rootMargin: '300px 0px' });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); handle.current?.dispose(); handle.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const on = hover >= 0 && values[hover] > 0;

  return (
    <div className={`v2-donut is-${mode}`} role="img" aria-label={`${label}: ${names.map((n, i) => `${n} ${Math.round(values[i])}%`).join(', ')}`}>
      {mode === 'flat'
        ? <AllocationDial values={values} colors={colors} names={names} equity={equity} label={label} hover={hover} onHover={onHover} />
        : (
          <>
            <div className="v2-donut-canvas" ref={host} />
            <div className={'v2-donut-read' + (on ? ' is-on' : '')} aria-hidden="true">
              {on
                ? <><b>{Math.round(values[hover])}%</b><span>{names[hover]}</span></>
                : <><b>{equity}%</b><span>in equity</span></>}
            </div>
            <p className="v2-donut-hint" aria-hidden="true">Hover the ring to read each share</p>
          </>
        )}
    </div>
  );
}
