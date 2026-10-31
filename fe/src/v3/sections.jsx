import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TOGETHER } from '../content/solutions';
import { SEGMENTS } from '../data/segments';
import { PRINCIPLES } from '../data/principles';
import { ScrollTrigger, prefersReducedMotion } from '../motion/gsap';
import { Arrow, Clip, MEDIA } from './ui';
import { PRODUCT_VIZ, VizCards } from './principles';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Advances an index on a timer while `run` is true; restarts when it changes.
function useAuto(count, ms, run) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!run || prefersReducedMotion()) return undefined;
    const id = setTimeout(() => setI((v) => (v + 1) % count), ms);
    return () => clearTimeout(id);
  }, [i, run, count, ms]);
  return [i, setI];
}

// True while the element is on screen (a third of it), so a visitor arrives
// at the first item rather than somewhere in the middle, and the timer
// doesn't run for nobody.
function useSeen(ref) {
  const [seen, setSeen] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      setOnScreen(e.isIntersecting);
      if (e.isIntersecting) setSeen(true);
    }, { threshold: 0.35 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref]);
  return seen && onScreen;
}

/* ---------------- What we provide: the four products, drawn ---------------- */

const TAGS = ['The core', 'More flexible', 'Concentrated', 'Beyond listed markets'];

export function Solutions() {
  const items = TOGETHER.blocks.map((b, k) => ({ t: b.name, d: b.role, tag: TAGS[k], more: b.through }));
  return (
    <div className="v3-routes">
      <div className="v3-wrap"><VizCards items={items} viz={PRODUCT_VIZ} cols={4} /></div>
      <p className="v3-routes-note">{TOGETHER.disclosure}</p>
    </div>
  );
}

/* ---------------- The framework: an autoplaying stepper ---------------- */

const STEPS = [
  { t: 'Understand risk', k: 'Read the route', clip: 'stage-risk',
    d: 'Willingness and ability, both measured. The lower of the two sets the limit, so the portfolio is one you can hold through a bad year.' },
  { t: 'Define the objective', k: 'Set the destination', clip: 'stage-objective',
    d: 'Liquidity, income, growth, preservation or legacy. Each goal gets its own horizon, and its own money, across India and the world.' },
  { t: 'Build the allocation', k: 'Build to plan', clip: 'stage-build',
    d: 'Every holding has a role, chosen from the whole market with no in-house products to place. Mutual funds, SIFs, PMS and AIFs, each where it fits.' },
  { t: 'Review & rebalance', k: 'Hold the course', clip: 'stage-course',
    d: 'Kept on target as markets move and your life changes. When one part runs ahead or falls behind, we bring the portfolio back to shape.' },
];
const STEP_MS = 4500;

export function Framework() {
  const root = useRef(null);
  const run = useSeen(root);
  const [i, setI] = useAuto(STEPS.length, STEP_MS, run);
  // the stage we're leaving stays visible underneath while the next wipes in
  const prev = useRef(0);
  const [last, setLast] = useState(0);
  useEffect(() => {
    setLast(prev.current);
    prev.current = i;
  }, [i]);
  const s = STEPS[i];
  return (
    <div className="v3-steps" ref={root}>
      <ol className="v3-steps-list">
        {STEPS.map((step, k) => (
          <li key={step.t} className={k === i ? 'is-on' : k < i ? 'is-done' : undefined}>
            <button type="button" onClick={() => setI(k)} aria-expanded={k === i}>
              <span className="v3-step-n">0{k + 1}</span>
              <span className="v3-step-t">{step.t}</span>
            </button>
            <div className="v3-step-more"><div><p>{step.d}</p></div></div>
            <span className="v3-step-bar" aria-hidden="true">
              <i key={k === i ? `on-${i}` : 'off'} style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: run ? 'running' : 'paused' }} />
            </span>
          </li>
        ))}
      </ol>
      <div className="v3-steps-media">
        {STEPS.map((step, k) => (
          <div key={step.clip} className={'v3-steps-clip' + (k === i ? ' is-on' : k === last && last !== i ? ' is-prev' : '')}>
            <Clip name={step.clip} className="v3-cover" />
          </div>
        ))}
        <div className="v3-steps-shade" aria-hidden="true" />
        <span className="v3-steps-badge">{String(i + 1).padStart(2, '0')} <i>/</i> 0{STEPS.length}</span>
        <div className="v3-steps-cap" key={i} aria-hidden="true">
          <span>Stage 0{i + 1} · {s.k}</span>
          <b>{s.t}</b>
        </div>
        <span className="v3-steps-prog" aria-hidden="true">
          <i key={`p-${i}`} style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: run ? 'running' : 'paused' }} />
        </span>
      </div>
    </div>
  );
}

/* ---------------- Whom we serve: list with a sticky picture ---------------- */

// Pictures (also used on Whom We Serve), cropped to 900x1200: dusk and warm
// low light throughout. Unsplash Licence: serve-founder -Cr5ZifES7s (Pavel
// Gromov), serve-families DgmK-H2VqTU (Maverick Frame), serve-nri K2Z2Y3hZgc0
// (Nellie Adamyan). Pexels Licence: serve-business-2 11043708, serve-executive 34341284,
// serve-office-2 31386711.
const SERVE = [
  ['Business Owners', 'serve-business-2'],
  ['Entrepreneurs & Founders', 'serve-founder'],
  ['Private Clients & Families', 'serve-families'],
  ['NRIs & Global Indians', 'serve-nri'],
  ['Senior Executives & Professionals', 'serve-executive'],
  ['Family Offices', 'serve-office-2'],
].map(([title, img]) => ({ ...SEGMENTS.find((s) => s.title === title), img })).filter((s) => s.title);

export function ServeSticky() {
  const [on, setOn] = useState(0);
  const list = useRef(null);
  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const rows = list.current.querySelectorAll('li');
    const triggers = [...rows].map((row, k) => ScrollTrigger.create({
      trigger: row, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) setOn(k); },
    }));
    return () => triggers.forEach((t) => t.kill());
  }, []);
  return (
    <div className="v3-serve">
      <ol className="v3-serve-list" ref={list}>
        {SERVE.map((s, k) => (
          <li key={s.title} className={k === on ? 'is-on' : undefined} onPointerEnter={() => setOn(k)}>
            <span className="v3-serve-n">0{k + 1}</span>
            <div>
              <span className="v3-serve-tag">{s.eyebrow}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <img className="v3-serve-inline" src={`${MEDIA}/${s.img}.jpg`} alt="" loading="lazy" width="720" height="960" />
              <Link to="/who-we-serve" className="v3-textlink">How we work together <Arrow /></Link>
            </div>
          </li>
        ))}
      </ol>
      <div className="v3-serve-media" aria-hidden="true">
        <div className="v3-serve-frame">
          {SERVE.map((s, k) => (
            <img key={s.img} src={`${MEDIA}/${s.img}.jpg`} alt="" loading="lazy" width="720" height="960" className={k === on ? 'is-on' : undefined} />
          ))}
          <span className="v3-serve-cap" key={on}>{SERVE[on].title}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Principles: the active one large, all seven listed ---------------- */

const BAND_MS = 6000;
const RING = 2 * Math.PI * 92;

export function PrinciplesBand() {
  const root = useRef(null);
  const run = useSeen(root);
  const [i, setI] = useAuto(PRINCIPLES.length, BAND_MS, run);
  const p = PRINCIPLES[i];
  return (
    <div className="v3-band" ref={root}>
      <div className="v3-band-main">
        <div className="v3-band-ring" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <circle className="v3-band-track" cx="100" cy="100" r="92" />
            <circle
              key={i}
              className="v3-band-prog"
              cx="100" cy="100" r="92"
              style={{ strokeDasharray: RING, strokeDashoffset: RING, animationDuration: `${BAND_MS}ms`, animationPlayState: run ? 'running' : 'paused' }}
            />
          </svg>
          <span className="v3-band-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">{p.icon}</svg>
          </span>
        </div>
        <div className="v3-band-text" key={p.title} aria-live="polite">
          <p className="v3-band-k">Principle {String(i + 1).padStart(2, '0')} of 0{PRINCIPLES.length}</p>
          <h3>{p.title}</h3>
          <p>{p.body}</p>
        </div>
      </div>
      <ol className="v3-band-list" role="tablist" aria-label="Our investment principles">
        {PRINCIPLES.map((x, k) => (
          <li key={x.title}>
            <button type="button" role="tab" aria-selected={k === i} className={k === i ? 'is-on' : undefined} onClick={() => setI(k)}>
              <span>0{k + 1}</span>
              <b>{x.title.replace(/^We('re| are)? /, '').replace(/\.$/, '')}</b>
              <i aria-hidden="true"><em key={k === i ? `on-${i}` : 'off'} style={{ animationDuration: `${BAND_MS}ms`, animationPlayState: run ? 'running' : 'paused' }} /></i>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
