import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '@fontsource-variable/cormorant-garamond/wght.css';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import '@fontsource-variable/inter/wght.css';
import '../styles/v2.css';
import V2Nav from '../v2/V2Nav';
import V2Footer from '../v2/V2Footer';
import Cursor from '../v2/Cursor';
import HeroReel from '../v2/HeroReel';
import Allocation from '../v2/Allocation';
import LongView from '../v2/LongView';
import ServeList from '../v2/ServeList';
import Voices from '../v2/Voices';
import { Arrow, BrandMark, Clip, MEDIA, RiseLine } from '../v2/ui';
import { useSmoothScroll } from '../v2/smooth';
import { useMotion } from '../motion/useMotion';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../motion/gsap';
import founderOffice from '../assets/founder-office.jpg';
import { FAQS } from '../seo';
import { FIRM } from '../data/firm';
import { PRINCIPLES } from '../data/principles';
import { PRESS, PRESS_OUTLETS, pressDate } from '../data/press';

// Version 2 of the home page, at /v2 while it's reviewed: warm black and
// paper, graded colour footage with a different picture of growth in every
// scene, RISCH orange as the one accent (the logo's rising arrow), a serif
// display face and scroll-driven scenes. The current home page
// (pages/Home.jsx) is untouched. Everything for this version lives in
// src/v2/, styles/v2.css and public/v2/media/ (free-licence clips from
// Mixkit, graded and re-encoded).

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const YEARS = new Date().getFullYear() - FIRM.careerStartYear;

const STATS = [
  { n: YEARS, unit: 'yrs', l: 'In private banking, since 2006' },
  { n: FIRM.foundedYear, l: 'RISCH founded, Bengaluru', static: true },
  { n: 0, l: 'In-house products. Nothing of our own to sell' },
  { n: 3, unit: 'routes', l: 'Mutual funds, PMS and AIFs' },
];

// Each stage of the framework, with the picture that stands for it.
const STAGES = [
  { t: 'Understand risk', k: 'Read the route', clip: 'stage-risk',
    d: 'Willingness and ability, both measured. The lower of the two sets the limit, so the portfolio is one you can hold through a bad year.' },
  { t: 'Define the objective', k: 'Set the destination', clip: 'stage-objective',
    d: 'Liquidity, income, growth, preservation or legacy. Each goal gets its own horizon, and its own money, across India and the world.' },
  { t: 'Build the allocation', k: 'Build to plan', clip: 'stage-build',
    d: 'Every holding has a role, chosen from the whole market with no in-house products to place. Mutual funds, PMS and AIFs, each where it fits.' },
  { t: 'Review & rebalance', k: 'Hold the course', clip: 'stage-course',
    d: 'Kept on target as markets move and your life changes. When one part runs ahead or falls behind, we bring the portfolio back to shape.' },
];

// The founder's career as the About page sets it out (firm-supplied; no
// dates are given there, so none are shown here).
const CAREER = [
  ['Now', 'Founder & CEO', 'RISCH Wealth · Bengaluru'],
  ['Earlier', 'Edelweiss Financial Services', 'Mumbai'],
  ['', 'Senior Private Banker', 'ICICI Securities · Bengaluru'],
  ['', 'Assistant Vice President, Private Wealth', 'Unicon Investment Solutions'],
  ['', 'Relationship Manager', 'Indiabulls Securities'],
];

// His own words in the press, verbatim (Ravi Samalad, "Why this adviser is
// gung-ho about outsourcing investment management", Morningstar India,
// 30 August 2019).
const ON_RECORD = {
  quote: 'I don’t believe in pushing products. It is all about maintaining relationships.',
  source: 'Morningstar India, 2019',
  url: 'https://morningstar.in/posts/54540/adviser-gung-ho-outsourcing-investment-management.aspx',
};

// The legacy collage: each picture drifts at its own speed.
const WALL = [
  { img: 'wall-6', speed: -0.9 },
  { img: 'wall-1', speed: 0.5 },
  { img: 'wall-3', speed: -0.4 },
  { img: 'wall-2', speed: 0.8 },
  { img: 'wall-4', speed: -0.7 },
  { img: 'wall-7', speed: 0.35 },
  { img: 'wall-5', speed: -0.55 },
];

function Principles() {
  const [active, setActive] = useState(0);
  const listRef = useRef(null);
  useIsoLayoutEffect(() => {
    const rows = listRef.current?.querySelectorAll('li:not(.v2-pr-more)');
    if (!rows || prefersReducedMotion()) return undefined;
    const triggers = [...rows].map((row, idx) => ScrollTrigger.create({
      trigger: row,
      start: 'top 62%',
      end: 'bottom 62%',
      onToggle: (self) => { if (self.isActive) setActive(idx); },
    }));
    return () => triggers.forEach((t) => t.kill());
  }, []);
  return (
    <div className="v2-pr">
      <div className="v2-pr-side">
        <p className="v2-label"><span>05</span> Seven principles</p>
        <div className="v2-pr-num" aria-hidden="true">
          <span className="v2-pr-num-strip" style={{ transform: `translateY(${-active}em)` }}>
            {PRINCIPLES.map((p, idx) => <span key={p.title}>{String(idx + 1).padStart(2, '0')}</span>)}
          </span>
        </div>
        <span className="v2-pr-meter" aria-hidden="true"><i style={{ transform: `scaleX(${(active + 1) / PRINCIPLES.length})` }} /></span>
        <p className="v2-pr-note">Our mission is investor success. These are the principles every new client receives, before a rupee is invested.</p>
      </div>
      <ol className="v2-pr-list" ref={listRef}>
        {PRINCIPLES.map((p, idx) => (
          <li key={p.title} className={idx === active ? 'is-on' : undefined}>
            <span className="v2-pr-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">{p.icon}</svg>
            </span>
            <div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          </li>
        ))}
        <li className="v2-pr-more">
          <Link to="/solutions" className="v2-link">How we invest <Arrow /></Link>
        </li>
      </ol>
    </div>
  );
}

// The page's own scroll scenes. Pins are created top to bottom (child
// components create theirs first; everything is sorted at the end), and the
// generic reveals (useMotion) are measured after.
function useScenes(rootRef) {
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;
    const mm = gsap.matchMedia();
    const cleanups = [];
    const ctx = gsap.context(() => {
      const q = (s) => root.querySelector(s);

      // Hero: the two lines rise as the curtain lifts, the orange arrow draws
      // under them, then the hero sinks and dims as the page slides over it.
      gsap.set(q('.v2-hero-title'), { visibility: 'visible' });
      const rise = q('.v2-hero-rise .v2-rise-path');
      const head = q('.v2-hero-rise .v2-rise-head');
      const len = rise.getTotalLength();
      gsap.set(rise, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(head, { autoAlpha: 0 });
      gsap.timeline({ delay: 1.3 })
        .from(root.querySelectorAll('.v2-hero-in'), { yPercent: 115, duration: 1.5, ease: 'expo.out', stagger: 0.12 })
        .from(root.querySelectorAll('.v2-hero [data-hero]'), { autoAlpha: 0, y: 24, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, '-=1.1')
        .to(rise, { strokeDashoffset: 0, duration: 1.6, ease: 'power3.inOut' }, '-=1.2')
        .to(head, { autoAlpha: 1, duration: 0.4 }, '-=0.25')
        .from(q('.v2-hero-media'), { scale: 1.16, duration: 2.8, ease: 'expo.out' }, 0);

      const heroST = () => ({ trigger: q('.v2-hero'), start: 'top top', end: 'bottom top', scrub: true });
      gsap.to(q('.v2-hero-inner'), { yPercent: -18, autoAlpha: 0.1, ease: 'none', scrollTrigger: heroST() });
      gsap.to(q('.v2-hero-media'), { yPercent: 22, ease: 'none', scrollTrigger: heroST() });
      gsap.to(q('.v2-hero-veil'), { opacity: 0.85, ease: 'none', scrollTrigger: heroST() });

      // Window: a frame of the city opens to fill the screen while the two
      // words either side of it part. The time-lapse inside is driven by the
      // scroll itself, so scrolling moves the clouds and the light.
      const win = q('.v2-window');
      const film = win.querySelector('video');
      const still = win.querySelector('.v2-window-still');
      const ready = () => film.classList.add('is-ready');
      film.addEventListener('loadeddata', ready);
      cleanups.push(() => film.removeEventListener('loadeddata', ready));
      const narrow = window.innerWidth < 700;
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && film.preload !== 'auto') { film.preload = 'auto'; film.load(); }
      }, { rootMargin: '600px 0px' });
      io.observe(win);
      cleanups.push(() => io.disconnect());
      const tl = gsap.timeline({
        scrollTrigger: { trigger: win, start: 'top top', end: () => `+=${window.innerHeight * 1.8}`, pin: true, scrub: 0.8 },
        onUpdate() {
          if (film.readyState >= 1 && film.duration) film.currentTime = Math.min(film.duration - 0.05, tl.progress() * film.duration);
        },
      });
      tl.fromTo(win.querySelector('.v2-window-frame'),
        { clipPath: narrow ? 'inset(29% 14% 29% 14% round 2px)' : 'inset(31% 36% 31% 36% round 2px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 })
        .fromTo([still, film], { scale: 1.35 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
        .to(win.querySelector('.v2-window-l'), { xPercent: -60, autoAlpha: 0, ease: 'power2.in', duration: 0.7 }, 0)
        .to(win.querySelector('.v2-window-r'), { xPercent: 60, autoAlpha: 0, ease: 'power2.in', duration: 0.7 }, 0)
        .fromTo(win.querySelector('.v2-window-cap'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.72)
        .to({}, { duration: 0.25 });

      // The four stages scroll sideways (wide screens only).
      mm.add('(min-width: 900px)', () => {
        const wrap = q('.v2-ascent');
        const track = wrap.querySelector('.v2-ascent-track');
        const bar = wrap.querySelector('.v2-ascent-bar i');
        const distance = () => track.scrollWidth - window.innerWidth;
        const move = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => { bar.style.transform = `scaleX(${self.progress})`; },
          },
        });
        wrap.querySelectorAll('.v2-stage').forEach((stage) => {
          gsap.fromTo(stage.querySelector('.v2-stage-media'), { xPercent: -12 }, {
            xPercent: 12, ease: 'none',
            scrollTrigger: { trigger: stage, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
          });
          gsap.from(stage.querySelectorAll('.v2-stage-body > *'), {
            y: 40, autoAlpha: 0, stagger: 0.06, ease: 'power3.out',
            scrollTrigger: { trigger: stage, containerAnimation: move, start: 'left 75%', end: 'left 35%', scrub: true },
          });
        });
      });

      // Legacy: every picture in the collage drifts at its own speed.
      const legacy = q('.v2-legacy');
      legacy.querySelectorAll('.v2-legacy-pic').forEach((pic) => {
        const s = parseFloat(pic.dataset.speed) || 0;
        gsap.fromTo(pic, { yPercent: -s * 28 }, {
          yPercent: s * 28, ease: 'none',
          scrollTrigger: { trigger: legacy, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      // Founder portrait: the frame opens from the bottom, the photo settles.
      const photo = q('.v2-founder-photo');
      gsap.fromTo(photo, { clipPath: 'inset(100% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut',
        scrollTrigger: { trigger: photo, start: 'top 80%', once: true },
      });
      gsap.fromTo(photo.querySelector('img'), { scale: 1.3 }, {
        scale: 1, duration: 2.2, ease: 'expo.out',
        scrollTrigger: { trigger: photo, start: 'top 80%', once: true },
      });

      // Testimonial wall and press marquee: drifting rows that slow when
      // hovered (the press row also speeds up with the scroll).
      const drift = (track, seconds, reverse) => {
        const loop = gsap.fromTo(track, { xPercent: reverse ? -50 : 0 }, { xPercent: reverse ? 0 : -50, duration: seconds, ease: 'none', repeat: -1 });
        const row = track.parentElement;
        const slow = () => gsap.to(loop, { timeScale: 0.12, duration: 0.6, overwrite: true });
        const resume = () => gsap.to(loop, { timeScale: 1, duration: 0.8, overwrite: true });
        row.addEventListener('pointerenter', slow);
        row.addEventListener('pointerleave', resume);
        cleanups.push(() => { row.removeEventListener('pointerenter', slow); row.removeEventListener('pointerleave', resume); });
        return loop;
      };
      root.querySelectorAll('.v2-vo-row').forEach((row) => drift(row.querySelector('.v2-vo-track'), 80, row.classList.contains('is-reverse')));
      const press = drift(q('.v2-marquee-track'), 40, false);
      ScrollTrigger.create({
        trigger: q('.v2-press'),
        start: 'top bottom',
        end: 'bottom top',
        onUpdate(self) {
          const boost = Math.min(Math.abs(self.getVelocity()) / 300, 6);
          gsap.to(press, { timeScale: 1 + boost, duration: 0.2, overwrite: true });
          gsap.to(press, { timeScale: 1, duration: 1.2, delay: 0.2, overwrite: false });
        },
      });

      // Footer: the wordmark rises into place as you arrive.
      gsap.fromTo(q('.v2-footer-mark svg'), { yPercent: 40 }, {
        yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: q('.v2-footer-mark'), start: 'top bottom', end: 'bottom bottom', scrub: true },
      });
    }, root);
    return () => {
      cleanups.forEach((fn) => fn());
      mm.revert();
      ctx.revert();
    };
  }, []);
}

export default function HomeV2() {
  const rootRef = useRef(null);
  useSmoothScroll();
  useScenes(rootRef);
  useMotion(rootRef);
  useIsoLayoutEffect(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return (
    <div ref={rootRef} className="v2">
      <div className="v2-intro" aria-hidden="true">
        <span className="v2-intro-mark"><BrandMark /></span>
        <span className="v2-intro-bar"><i /></span>
      </div>
      <div className="v2-grain" aria-hidden="true" />
      <Cursor />
      <V2Nav />

      <main>
        {/* ============ HERO (film reel) ============ */}
        <HeroReel />

        <div className="v2-sheet">
          {/* ============ PHILOSOPHY ============ */}
          <section className="v2-sec v2-dark v2-philo">
            <div className="v2-wrap">
              <p className="v2-label" data-reveal><span>01</span> Philosophy</p>
              <p className="v2-manifesto" data-words>
                Most firms begin with a product. We begin with a question: how much risk can you take, and how much can you live with? Only then do we build, across India and the world, with nothing of our own to sell.
              </p>
              <ul className="v2-stats" data-reveal="stagger">
                {STATS.map((s) => (
                  <li key={s.l}>
                    <p className="v2-stat-n"><span data-count={s.static ? undefined : s.n}>{s.n}</span>{s.unit && <small>{s.unit}</small>}</p>
                    <p className="v2-stat-l">{s.l}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ============ WINDOW (scroll-driven time-lapse) ============ */}
          <section className="v2-window" aria-label="Twenty years of trust">
            <div className="v2-window-frame">
              {/* the still is always there; the time-lapse fades in over it
                  once its frames have arrived, so the frame is never empty */}
              <img className="v2-cover v2-window-still" src={`${MEDIA}/window-city.jpg`} alt="" width="1280" height="720" />
              <video className="v2-cover v2-window-film" src={`${MEDIA}/window-city-v2.mp4`} muted playsInline preload="none" aria-hidden="true" tabIndex={-1} />
            </div>
            <p className="v2-window-word v2-window-l" aria-hidden="true">{YEARS === 20 ? 'Twenty' : YEARS}<br />years</p>
            <p className="v2-window-word v2-window-r" aria-hidden="true">of<br />trust.</p>
            <div className="v2-window-cap">
              <p className="v2-label">Private banking since 2006</p>
              <p>Through 2008, 2013 and 2020.<br />Cycles pass. Trust compounds.</p>
            </div>
          </section>

          {/* ============ FRAMEWORK (sideways) ============ */}
          <section className="v2-ascent v2-dark" aria-labelledby="v2-ascent-title">
            <div className="v2-ascent-track">
              <div className="v2-ascent-intro">
                <p className="v2-label"><span>02</span> The RISCH framework</p>
                <h2 id="v2-ascent-title" className="v2-h2">Four stages.<br />One direction.</h2>
                <p className="v2-ascent-sub">The same sequence for every client, in the same order. Risk comes first, the portfolio second.</p>
                <span className="v2-ascent-hint" aria-hidden="true">Keep scrolling <Arrow /></span>
              </div>
              {STAGES.map((s, idx) => (
                <article key={s.t} className="v2-stage">
                  <div className="v2-stage-clip"><div className="v2-stage-media"><Clip name={s.clip} className="v2-cover" /></div></div>
                  <div className="v2-stage-body">
                    <span className="v2-stage-n">0{idx + 1}</span>
                    <p className="v2-stage-k">{s.k}</p>
                    <h3>{s.t}</h3>
                    <p className="v2-stage-d">{s.d}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="v2-wrap v2-ascent-foot" aria-hidden="true">
              <span>Understand</span>
              <span className="v2-ascent-bar"><i /></span>
              <span>Review</span>
            </div>
          </section>

          {/* ============ ALLOCATION (3D) ============ */}
          <Allocation />

          {/* ============ COMPOUNDING (3D) ============ */}
          <LongView />

          {/* ============ PRINCIPLES ============ */}
          <section className="v2-sec v2-paper">
            <div className="v2-wrap"><Principles /></div>
          </section>

          {/* ============ WHOM WE SERVE ============ */}
          <section className="v2-sec v2-dark v2-serve">
            <div className="v2-wrap">
              <div className="v2-head v2-head-row">
                <div>
                  <p className="v2-label" data-reveal><span>06</span> Whom we serve</p>
                  <h2 className="v2-h2" data-split>For wealth that has outgrown simple answers.</h2>
                </div>
                <Link to="/who-we-serve" className="v2-link" data-reveal>All client profiles <Arrow /></Link>
              </div>
              <ServeList />
            </div>
          </section>

          {/* ============ LEGACY (collage) ============ */}
          <section className="v2-legacy v2-paper" aria-labelledby="v2-legacy-title">
            <div className="v2-legacy-pics" aria-hidden="true">
              {WALL.map((w) => (
                <figure key={w.img} className="v2-legacy-pic" data-speed={w.speed}>
                  <img src={`${MEDIA}/${w.img}.jpg`} alt="" loading="lazy" width="800" height="1000" />
                </figure>
              ))}
            </div>
            <div className="v2-legacy-text">
              <p className="v2-label" data-reveal><span>07</span> Legacy</p>
              <h2 id="v2-legacy-title" className="v2-legacy-title" data-split>Built to be handed on.</h2>
              <p className="v2-legacy-sub" data-reveal>Multi-generational wealth, consolidated reporting, and succession structured so it survives a handover.</p>
              <div data-reveal><Link to="/who-we-serve" className="v2-link">Private clients &amp; families <Arrow /></Link></div>
            </div>
          </section>

          {/* ============ FOUNDER ============ */}
          <section className="v2-sec v2-paper v2-founder">
            <div className="v2-wrap v2-founder-grid">
              <figure className="v2-founder-photo">
                <img src={founderOffice} alt="Rishiraj Maheshwari, Founder & CEO of RISCH Wealth" width="538" height="632" loading="lazy" />
              </figure>
              <div className="v2-founder-text">
                <p className="v2-label" data-reveal><span>08</span> From the founder</p>
                <blockquote className="v2-founder-quote" data-split>
                  The objective is not to beat the market every quarter. It is to help families preserve and compound wealth across generations.
                </blockquote>
                <p className="v2-founder-sign" data-reveal><b>Rishiraj Maheshwari</b> Founder &amp; CEO</p>
                <table className="v2-ledger" data-reveal>
                  <tbody>
                    {CAREER.map(([y, r, f]) => <tr key={r}><td>{y}</td><td>{r}</td><td>{f}</td></tr>)}
                  </tbody>
                </table>
                <a className="v2-founder-record" href={ON_RECORD.url} target="_blank" rel="noopener noreferrer" data-reveal>
                  <span>On record</span>
                  <q>{ON_RECORD.quote}</q>
                  <small>{ON_RECORD.source} <Arrow /></small>
                </a>
                <div data-reveal><Link to="/about" className="v2-link">The founder&rsquo;s story <Arrow /></Link></div>
              </div>
            </div>
          </section>

          {/* ============ CLIENTS (all testimonials) ============ */}
          <Voices />

          {/* ============ PRESS ============ */}
          <section className="v2-sec v2-paper v2-press">
            <div className="v2-marquee" aria-hidden="true">
              <div className="v2-marquee-track">
                {[0, 1].map((k) => (
                  <span key={k}>{PRESS_OUTLETS.map((o) => <span key={o}>{o}<i>✦</i></span>)}</span>
                ))}
              </div>
            </div>
            <div className="v2-wrap">
              <div className="v2-head v2-head-row">
                <p className="v2-label" data-reveal><span>10</span> Perspective, in the press</p>
                <Link to="/perspective" className="v2-link" data-reveal>All articles <Arrow /></Link>
              </div>
              <ul className="v2-press-list" data-reveal="stagger">
                {PRESS.slice(0, 4).map((p) => (
                  <li key={p.url}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" data-cursor="Read">
                      <span className="v2-press-outlet">{p.outlet}</span>
                      <span className="v2-press-title">{p.title}</span>
                      <span className="v2-press-date">{pressDate(p)}</span>
                      <Arrow />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ============ FAQ ============ */}
          <section className="v2-sec v2-paper v2-faq" id="faq">
            <div className="v2-wrap v2-faq-grid">
              <div>
                <p className="v2-label" data-reveal><span>11</span> Questions</p>
                <h2 className="v2-h2" data-split>Asked, and answered.</h2>
              </div>
              <div className="v2-faq-list">
                {FAQS.map(({ q, a }) => (
                  <details key={q}>
                    <summary><h3>{q}</h3><i aria-hidden="true" /></summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ============ CLOSE ============ */}
          <section className="v2-close">
            <Clip name="close-sail" className="v2-cover v2-close-bg" />
            <div className="v2-close-veil" aria-hidden="true" />
            <div className="v2-wrap v2-close-inner">
              <p className="v2-label" data-reveal>Begin</p>
              <h2 className="v2-close-title" data-split>Let&rsquo;s talk about the next twenty years.</h2>
              <div className="v2-close-rise" data-draw><RiseLine /></div>
              <div className="v2-close-row" data-reveal>
                <Link to="/contact" className="v2-orb" data-magnetic="0.3"><span>Start a<br />conversation</span></Link>
                <div className="v2-close-contact">
                  <a href={FIRM.phoneHref}>{FIRM.phone}</a>
                  <a href={`mailto:${FIRM.email}`}>{FIRM.email}</a>
                  <Link to="/risk-profiler" className="v2-link">Or start with your risk profile <Arrow /></Link>
                </div>
              </div>
            </div>
          </section>

          <V2Footer />
        </div>
      </main>
    </div>
  );
}
