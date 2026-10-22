import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS, TESTIMONIAL_GROUPS } from '../data/testimonials';
import { prefersReducedMotion } from '../motion/gsap';
import { scrollToTarget } from './smooth';
import { Arrow, Clip } from './ui';

const ADVANCE_MS = 9000;
// The lead quote first, then everyone with a portrait, then the rest (a
// monogram spotlight is weaker than a face), each in data-file order.
const ALL = [
  ...TESTIMONIALS.filter((t) => t.lead),
  ...TESTIMONIALS.filter((t) => !t.lead && t.photo),
  ...TESTIMONIALS.filter((t) => !t.lead && !t.photo),
];
const GROUPS = TESTIMONIAL_GROUPS.filter((g) => ALL.some((t) => t.group === g));
const key = (t) => t.name + t.quote.slice(0, 16);

function Portrait({ t, size = 56, className = '' }) {
  return t.photo
    ? <img className={className} src={t.photo} alt="" width={size} height={size} loading="lazy" draggable="false" />
    : <span className={`${className} v2-vo-initial`} aria-hidden="true">{t.initial}</span>;
}

// Every client account, on the landing page itself: a spotlight that turns
// over on its own (or by picking a face), filters by kind of client, and a
// slow wall of all the quotes underneath. Copy and portraits come from
// data/testimonials.js.
export default function Voices() {
  const [group, setGroup] = useState('All');
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const stage = useRef(null);

  const list = useMemo(() => (group === 'All' ? ALL : ALL.filter((t) => t.group === group)), [group]);
  const n = list.length;
  const t = list[Math.min(i, n - 1)];
  const go = (d) => setI((v) => (v + d + n) % n);

  useEffect(() => {
    if (paused || n < 2 || prefersReducedMotion()) return undefined;
    const id = setTimeout(() => go(1), ADVANCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, paused, n]);

  const pickFromWall = (item) => {
    setGroup('All');
    setI(ALL.indexOf(item));
    if (stage.current) scrollToTarget(stage.current.getBoundingClientRect().top + window.scrollY - 120);
  };

  return (
    <section className="v2-vo" aria-labelledby="v2-vo-title">
      <Clip name="voices-bg" className="v2-cover v2-vo-bg" />
      <div className="v2-vo-veil" aria-hidden="true" />

      <div className="v2-wrap v2-vo-inner">
        <div className="v2-vo-head">
          <div>
            <p className="v2-label" data-reveal><span>09</span> Client experience</p>
            <h2 id="v2-vo-title" className="v2-h2" data-split>In our clients&rsquo; words.</h2>
          </div>
          <p className="v2-vo-count" data-reveal><b>{ALL.length}</b> clients, from Bengaluru to Basra and Dallas</p>
        </div>

        <div className="v2-vo-filters" role="tablist" aria-label="Filter by kind of client" data-reveal>
          {['All', ...GROUPS].map((g) => (
            <button key={g} type="button" role="tab" aria-selected={g === group} className={g === group ? 'is-on' : undefined} onClick={() => { setGroup(g); setI(0); }}>
              {g}<small>{g === 'All' ? ALL.length : ALL.filter((x) => x.group === g).length}</small>
            </button>
          ))}
        </div>

        <div ref={stage} className="v2-vo-stage" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
          <figure className="v2-vo-spot" key={key(t)}>
            <div className="v2-vo-photo">
              {t.photo ? <img src={t.photo} alt={t.name} width="400" height="400" /> : <span className="v2-vo-initial v2-vo-initial-lg">{t.initial}</span>}
              <span className="v2-vo-group">{t.group}</span>
            </div>
            <blockquote>
              <span className="v2-vo-mark" aria-hidden="true">&ldquo;</span>
              <p>{t.quote}</p>
            </blockquote>
            <figcaption>
              <b>{t.name}</b>
              {t.credentials?.map((c) => <span key={c}>{c}</span>)}
              {t.place && <small>{t.place}</small>}
            </figcaption>
          </figure>

          <div className="v2-vo-rail">
            <ul className="v2-vo-faces">
              {list.map((item, k) => (
                <li key={key(item)}>
                  <button type="button" className={k === i ? 'is-on' : undefined} onClick={() => setI(k)} aria-label={`${item.name}, ${item.role}`} aria-current={k === i}>
                    <Portrait t={item} size={64} className="v2-vo-face" />
                    {k === i && (
                      <svg className={'v2-vo-ring' + (paused ? ' is-paused' : '')} viewBox="0 0 72 72" aria-hidden="true">
                        <circle cx="36" cy="36" r="34" style={{ animationDuration: `${ADVANCE_MS}ms` }} />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <div className="v2-vo-nav">
              <span>{String(Math.min(i, n - 1) + 1).padStart(2, '0')} <i>/</i> {String(n).padStart(2, '0')}</span>
              <button type="button" onClick={() => go(-1)} aria-label="Previous client"><Arrow /></button>
              <button type="button" onClick={() => go(1)} aria-label="Next client"><Arrow /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="v2-vo-wall" aria-label="All client quotes">
        {[ALL.slice(0, Math.ceil(ALL.length / 2)), ALL.slice(Math.ceil(ALL.length / 2))].map((row, r) => (
          <div key={r} className={'v2-vo-row' + (r ? ' is-reverse' : '')}>
            <div className="v2-vo-track">
              {[0, 1].map((copy) => row.map((item) => (
                <button
                  key={`${copy}-${key(item)}`}
                  type="button"
                  className="v2-vo-card"
                  onClick={() => pickFromWall(item)}
                  tabIndex={copy ? -1 : 0}
                  aria-hidden={copy ? true : undefined}
                  data-cursor="Read"
                >
                  <p>&ldquo;{item.quote}&rdquo;</p>
                  <span className="v2-vo-card-who">
                    <Portrait t={item} size={40} className="v2-vo-card-face" />
                    <span><b>{item.name}</b><small>{item.role}</small></span>
                  </span>
                </button>
              )))}
            </div>
          </div>
        ))}
      </div>

      <div className="v2-wrap v2-vo-foot">
        <Link to="/testimonials" className="v2-link">Read every story in full <Arrow /></Link>
      </div>
    </section>
  );
}
