import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEGMENTS } from '../data/segments';
import { gsap, hasFinePointer, prefersReducedMotion } from '../motion/gsap';
import { Arrow, MEDIA } from './ui';

// Pictures: serve-business and serve-executive are Pexels photos (Pexels licence,
// photo IDs 30535785 and 7580860); the rest are stills from Mixkit Free clips.
const ROWS = [
  ['Business Owners', 'serve-business'],
  ['Entrepreneurs & Founders', 'serve-founders'],
  ['Private Clients & Families', 'serve-families'],
  ['NRIs & Global Indians', 'serve-nri'],
  ['Senior Executives & Professionals', 'serve-executive'],
  ['Family Offices', 'serve-office'],
].map(([title, img]) => ({ ...SEGMENTS.find((s) => s.title === title), img })).filter((s) => s.title);

// Client profiles as a list of large rows. With a mouse, a portrait for the
// hovered row follows the cursor; on touch it sits inline in the row.
export default function ServeList() {
  const [on, setOn] = useState(-1);
  const list = useRef(null);
  const card = useRef(null);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return undefined;
    const el = card.current;
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' });
    const rTo = gsap.quickTo(el, 'rotation', { duration: 0.9, ease: 'power3.out' });
    let lastX = 0;
    const move = (e) => {
      const r = list.current.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
      rTo(Math.max(-8, Math.min(8, (e.clientX - lastX) * 0.4)));
      lastX = e.clientX;
    };
    const host = list.current;
    host.addEventListener('pointermove', move);
    return () => host.removeEventListener('pointermove', move);
  }, []);

  return (
    <div className="v2-serve-wrap" ref={list} onPointerLeave={() => setOn(-1)}>
      <ul className="v2-serve-list">
        {ROWS.map((s, idx) => (
          <li key={s.title} onPointerEnter={() => setOn(idx)}>
            <Link to="/who-we-serve" className={'v2-serve-row' + (on === idx ? ' is-on' : '')}>
              <span className="v2-serve-n">{String(idx + 1).padStart(2, '0')}</span>
              <span className="v2-serve-thumb" aria-hidden="true"><img src={`${MEDIA}/${s.img}.jpg`} alt="" loading="lazy" width="720" height="960" /></span>
              <span className="v2-serve-title">{s.title}</span>
              <span className="v2-serve-tag">{s.eyebrow}</span>
              <span className="v2-serve-body"><span>{s.body}</span></span>
              <span className="v2-serve-go"><Arrow /></span>
            </Link>
          </li>
        ))}
      </ul>
      <div ref={card} className={'v2-serve-card' + (on >= 0 ? ' is-on' : '')} aria-hidden="true">
        {ROWS.map((s, idx) => (
          <img key={s.img} src={`${MEDIA}/${s.img}.jpg`} alt="" loading="lazy" className={idx === on ? 'is-on' : undefined} width="720" height="960" />
        ))}
      </div>
    </div>
  );
}
