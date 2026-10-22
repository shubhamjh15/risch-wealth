import { useLayoutEffect, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS, TESTIMONIAL_GROUPS } from '../data/testimonials';
import { gsap, Draggable, prefersReducedMotion } from '../motion/gsap';
import { Arrow } from '../v2/ui';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Portraits first (the lead quote at the front), monograms after.
const ALL = [
  ...TESTIMONIALS.filter((t) => t.lead),
  ...TESTIMONIALS.filter((t) => !t.lead && t.photo),
  ...TESTIMONIALS.filter((t) => !t.lead && !t.photo),
];
const GROUPS = TESTIMONIAL_GROUPS.filter((g) => ALL.some((t) => t.group === g));
const key = (t) => t.name + t.quote.slice(0, 16);
const SPEED = 26; // px per second: a slow, steady drift
const LOOP_MIN = 4; // fewer cards than this simply sit still

// Every client account as a portrait card. With enough cards the row drifts
// slowly and endlessly (a second copy follows the first), easing to a stop
// while the pointer is over it so a quote can be read. It can be dragged or
// flicked at any time, and the arrows step a card at a time. Copy and
// portraits come from data/testimonials.js.
export default function Clients() {
  const [group, setGroup] = useState('All');
  const viewport = useRef(null);
  const track = useRef(null);
  const bar = useRef(null);
  const stepRef = useRef(() => {});
  const list = useMemo(() => (group === 'All' ? ALL : ALL.filter((t) => t.group === group)), [group]);
  const loop = list.length >= LOOP_MIN;

  useIsoLayoutEffect(() => {
    const t = track.current;
    const vp = viewport.current;
    const reduced = prefersReducedMotion();
    let offset = 0;
    let half = 0;
    const flow = { v: 1 };
    // one full copy: from the first card to the first card of the second copy
    const measure = () => {
      const second = t.children[list.length + 1];
      half = loop && second ? second.offsetLeft - t.children[0].offsetLeft : 0;
    };
    const minX = () => Math.min(0, vp.clientWidth - parseFloat(getComputedStyle(vp).paddingLeft) - t.scrollWidth);
    const place = (o) => (loop ? gsap.utils.wrap(-half, 0, o) : Math.max(minX(), Math.min(0, o)));
    const setX = gsap.quickSetter(t, 'x', 'px');
    const render = () => {
      const x = place(offset);
      setX(x);
      if (bar.current) {
        const p = loop ? -x / (half || 1) : (minX() ? x / minX() : 0);
        bar.current.style.transform = `scaleX(${Math.max(0.06, Math.min(1, p)).toFixed(3)})`;
      }
    };
    measure();
    render();

    // Only drift (and paint) while the row is on screen.
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(vp);
    const tick = (time, dt) => {
      if (!visible) return;
      if (loop && !reduced) offset -= (SPEED * flow.v * dt) / 1000;
      render();
    };
    gsap.ticker.add(tick);

    // Drag a stand-in element and translate its movement into the offset,
    // so dragging, flicking and the drift all share one position.
    const proxy = document.createElement('div');
    let base = 0;
    const [d] = Draggable.create(proxy, {
      type: 'x',
      trigger: t,
      inertia: !reduced,
      dragClickables: true,
      onPress() { base = offset - this.x; t.classList.add('is-dragging'); },
      onDrag() { offset = base + this.x; },
      onThrowUpdate() { offset = base + this.x; },
      onRelease() { t.classList.remove('is-dragging'); if (!loop) offset = place(offset); },
      onThrowComplete() { if (!loop) offset = place(offset); },
    });

    const ease = (v) => () => gsap.to(flow, { v, duration: v ? 1.2 : 0.7, ease: 'power2.out', overwrite: true });
    const slow = ease(0);
    const resume = ease(1);
    vp.addEventListener('pointerenter', slow);
    vp.addEventListener('pointerleave', resume);
    window.addEventListener('resize', measure);

    stepRef.current = (dir) => {
      const card = t.firstElementChild;
      const w = card ? card.getBoundingClientRect().width + 20 : 400;
      const o = { v: offset };
      const target = loop ? offset - dir * w : place(offset - dir * w);
      gsap.to(o, { v: target, duration: 0.9, ease: 'expo.out', onUpdate: () => { offset = o.v; } });
    };

    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      d.kill();
      vp.removeEventListener('pointerenter', slow);
      vp.removeEventListener('pointerleave', resume);
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, loop]);

  const cards = (copy) => list.map((t) => (
    <li key={`${copy}-${key(t)}`} className="v3-client" aria-hidden={copy ? true : undefined}>
      <div className="v3-client-photo">
        {t.photo
          ? <img src={t.photo} alt={copy ? '' : t.name} width="400" height="400" loading="lazy" draggable="false" />
          : <span className="v3-client-mono" aria-hidden="true">{t.initial}</span>}
        <span className="v3-client-group">{t.group}</span>
      </div>
      <blockquote><p>&ldquo;{t.quote}&rdquo;</p></blockquote>
      <div className="v3-client-who">
        <b>{t.name}</b>
        <span>{t.credentials?.join(', ') || t.role}</span>
        {t.place && <small>{t.place}</small>}
      </div>
    </li>
  ));

  const end = (copy) => (
    <li key={`end-${copy}`} className="v3-client v3-client-end" aria-hidden={copy ? true : undefined}>
      <p>Every account, in full.</p>
      <Link to="/testimonials" className="v3-pill v3-pill-dark" tabIndex={copy ? -1 : undefined}><span>All client stories</span><i><Arrow /></i></Link>
    </li>
  );

  return (
    <div className="v3-clients">
      <div className="v3-wrap v3-clients-bar">
        <div className="v3-clients-filters" role="tablist" aria-label="Filter by kind of client">
          {['All', ...GROUPS].map((g) => (
            <button key={g} type="button" role="tab" aria-selected={g === group} className={g === group ? 'is-on' : undefined} onClick={() => setGroup(g)}>
              {g}<small>{g === 'All' ? ALL.length : ALL.filter((x) => x.group === g).length}</small>
            </button>
          ))}
        </div>
        <div className="v3-clients-nav">
          <span className="v3-clients-prog" aria-hidden="true"><i ref={bar} /></span>
          <button type="button" onClick={() => stepRef.current(-1)} aria-label="Previous clients"><Arrow /></button>
          <button type="button" onClick={() => stepRef.current(1)} aria-label="More clients"><Arrow /></button>
        </div>
      </div>

      <div className="v3-clients-viewport" ref={viewport}>
        <ul className="v3-clients-track" ref={track} key={group}>
          {cards(0)}
          {end(0)}
          {loop && cards(1)}
          {loop && end(1)}
        </ul>
      </div>
      <p className="v3-wrap v3-clients-hint" aria-hidden="true">Drag to read at your own pace <Arrow /></p>
    </div>
  );
}
