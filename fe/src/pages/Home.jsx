import { useLayoutEffect, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav/Nav';
import Footer from '../components/Footer/Footer';
import heroRidges from '../assets/hero-ridges-1400.webp';
import heroRidgesSm from '../assets/hero-ridges-760.webp';
import founderOffice from '../assets/founder-office.jpg';
import { useMotion } from '../motion/useMotion';
import { gsap, ScrollTrigger, Draggable, prefersReducedMotion, hasFinePointer } from '../motion/gsap';
import { FAQS } from '../seo';
import { FIRM } from '../data/firm';
import { SEGMENTS } from '../data/segments';
import { PRINCIPLES } from '../data/principles';
import { TESTIMONIALS } from '../data/testimonials';
import { PRESS, pressDate } from '../data/press';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5" stroke="currentColor" strokeWidth="1.3" /></svg>
);

const YEARS = new Date().getFullYear() - FIRM.careerStartYear;

// Trust bar: verified facts only. Client count / assets appear first once
// they're filled in (and cleared) in src/data/firm.js.
function trustItems() {
  const items = [];
  if (FIRM.clientCount) items.push({ n: FIRM.clientCount, l: 'Client families' });
  if (FIRM.assets) items.push({ n: FIRM.assets.value, l: FIRM.assets.label });
  items.push(
    { n: `${YEARS} years`, count: YEARS, l: "Founder's career in private banking and wealth management" },
    { n: String(FIRM.foundedYear), l: 'Year RISCH Wealth was founded' },
    { n: 'Zero', l: 'Proprietary products, recommendations align to you, not a shelf' },
    { n: 'MF · PMS · AIF', l: 'Mutual funds, portfolio management services and alternative investment funds', compact: true },
  );
  return items.slice(0, 4);
}

// The RISCH Framework: the firm's signature method, shown as a four-stage
// diagram. The risk profiler supports stage 01; it isn't the product.
const FRAMEWORK = [
  { t: 'Understand Risk', d: 'We separate your willingness to take risk from your ability to withstand it. Both are measured; the lower one sets the limit.' },
  { t: 'Define the Objective', d: 'What this capital needs to do: liquidity, income, growth, preservation or legacy, often several at once.' },
  { t: 'Build the Allocation', d: 'A portfolio in which every holding has a role.', chips: ['Indian equity', 'Global equity', 'Fixed income', 'Commodities', 'Real estate'] },
  { t: 'Review & Rebalance', d: 'Your portfolio evolves as markets and your circumstances change, with a review at every rebalancing.' },
];

// Four quick facts under the CEO's note. "Client-first" replaces the
// mockup's "Independent" (a sensitive word for a registered distributor).
const CEO_FACTS = [
  { t: `${YEARS} Years`, d: 'In wealth management',
    icon: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-5.3 5.5-5.3s5.5 2.3 5.5 5.3" /><circle cx="17" cy="8.5" r="2.4" /><path d="M15.5 13.9c2.5.3 4.5 2.3 4.5 5.1" /></> },
  { t: 'Client-First', d: 'No product shelf',
    icon: <><path d="M4 20V14M9 20V9M14 20V12M19 20V5" /><path d="M2 20h20" /></> },
  { t: 'India + Global', d: 'Investment opportunities',
    icon: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></> },
  { t: 'Built for Generations', d: 'Long-term perspective',
    icon: <><path d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6l8-3z" /></> },
];

const DISCIPLINES = [
  { t: 'Portfolio Construction', d: 'A portfolio built around your objectives, liquidity needs and risk, sized to you, not a model.' },
  { t: 'Fund & Strategy Selection', d: 'Mutual funds, PMS and AIFs from across the market, each chosen for the role it plays in your portfolio.' },
  { t: 'Global Diversification', d: 'Access to opportunities beyond Indian markets (US, Europe, Asia and Taiwan) as part of one plan.' },
  { t: 'Wealth Coordination', d: 'Investments, liquidity, succession and your other advisers, brought into one view with one point of contact.' },
];

const WHY = [
  { t: 'No product shelf', d: 'No proprietary fund and no product shelf. Recommendations align to the client, never to what needs selling.' },
  { t: 'A focused practice', d: 'RISCH works with a small number of clients directly, so every portfolio gets genuine attention.' },
  { t: 'Accountable by design', d: 'The worst case is disclosed before you commit, and any override is documented and signed by both parties.' },
  { t: 'One view of your wealth', d: 'Holdings spread across custodians, brought together into one coherent strategy and one set of reports.' },
];

// Four primary client profiles; family offices get a line of their own.
const HOME_SEGMENTS = ['Private Clients & Families', 'Business Owners', 'Senior Executives & Professionals', 'NRIs & Global Indians']
  .map((title) => SEGMENTS.find((s) => s.title === title))
  .filter(Boolean);

// The spotlight quotes first, then others that have a portrait.
const VOICES = [
  ...TESTIMONIALS.filter((t) => t.spotlight),
  ...TESTIMONIALS.filter((t) => !t.spotlight && t.photo),
].slice(0, 8);

// The four RISCH portfolios, mildest first (be/src/riskProfiler/config.js).
const TIERS = ['Active Balanced', 'Active Growth', 'Active Aggressive', 'Aggressive Plus'];

// Bespoke scroll scenes that don't fit the generic data attributes.
function useHomeScenes(rootRef) {
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;
    const cleanups = [];

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Hero: the photograph drifts a little slower than the page.
      gsap.to(root.querySelector('.h-hero-media img'), {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: root.querySelector('.h-hero'), start: 'top top', end: 'bottom top', scrub: true },
      });

      // Principles: the section pins and the cards travel sideways.
      mm.add('(min-width: 961px)', () => {
        const section = root.querySelector('.h-principles');
        const track = root.querySelector('.h-principles-track');
        const counter = root.querySelector('.h-principles-count b');
        const bar = root.querySelector('.h-principles-bar i');
        const cards = gsap.utils.toArray(track.children);
        const distance = () => track.scrollWidth - window.innerWidth + 64;
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate(self) {
              const i = Math.min(cards.length - 1, Math.floor(self.progress * cards.length));
              counter.textContent = String(i + 1).padStart(2, '0');
              bar.style.transform = `scaleX(${self.progress})`;
              cards.forEach((c, n) => c.classList.toggle('is-active', n === i));
            },
          },
        });
      });

      // Framework: steps light up as they cross the middle; the dial follows.
      const steps = gsap.utils.toArray(root.querySelectorAll('.h-step'));
      const odometer = root.querySelector('.h-dial-odometer');
      const ring = root.querySelector('.h-dial-progress');
      const stageName = root.querySelectorAll('.h-dial-stage span');
      const setStep = (i) => {
        steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
        gsap.to(odometer, { yPercent: -(100 / steps.length) * i, duration: 0.8, ease: 'expo.out' });
        stageName.forEach((s, n) => s.classList.toggle('is-active', n === i));
      };
      steps.forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setStep(i),
        });
      });
      if (ring) {
        const len = ring.getTotalLength();
        gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(ring, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.querySelector('.h-steps'), start: 'top 55%', end: 'bottom 55%', scrub: 0.5 },
        });
      }

      // Marquee: always drifting, faster (and reversed) with the scroll.
      const marquee = root.querySelector('.h-marquee-track');
      if (marquee) {
        const loop = gsap.to(marquee, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
        ScrollTrigger.create({
          trigger: root.querySelector('.h-marquee'),
          start: 'top bottom',
          end: 'bottom top',
          onUpdate(self) {
            const dir = self.direction < 0 ? -1 : 1;
            const boost = Math.min(5, Math.abs(self.getVelocity()) / 400);
            gsap.killTweensOf(loop);
            loop.timeScale(dir * (1 + boost));
            gsap.to(loop, { timeScale: dir, duration: 1.2, ease: 'power2.out' });
          },
        });
      }

      // Founder portrait: unmasks from the bottom, the photo drifts inside.
      const figure = root.querySelector('.h-ceo-photo');
      if (figure) {
        gsap.fromTo(figure, { clipPath: 'inset(100% 0% 0% 0%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut',
          scrollTrigger: { trigger: figure, start: 'top 80%', once: true },
        });
        gsap.fromTo(figure.querySelector('img'), { scale: 1.25, yPercent: -6 }, {
          scale: 1.05, yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }

      // Testimonials: drag (or flick) the row of cards.
      const voices = root.querySelector('.h-voices-track');
      if (voices) {
        const progress = root.querySelector('.h-voices-progress i');
        function update() {
          const min = this.minX || -1;
          progress.style.transform = `scaleX(${Math.max(0.08, Math.min(1, this.x / min))})`;
        }
        const [drag] = Draggable.create(voices, {
          type: 'x',
          inertia: true,
          bounds: root.querySelector('.h-voices-viewport'),
          edgeResistance: 0.85,
          dragClickables: true,
          onPress() { voices.classList.add('is-dragging'); },
          onRelease() { voices.classList.remove('is-dragging'); },
          onDrag: update,
          onThrowUpdate: update,
        });
        cleanups.push(() => drag.kill());
      }

      // Risk gauge: the needle follows the pointer across the panel.
      const gauge = root.querySelector('.h-gauge');
      if (gauge && hasFinePointer()) {
        const needle = gauge.querySelector('.h-gauge-needle');
        const labels = gauge.querySelectorAll('.h-gauge-tier');
        const panel = root.querySelector('.h-assess');
        gsap.set(needle, { svgOrigin: '160 170', rotation: -20 });
        const turn = gsap.quickTo(needle, 'rotation', { duration: 0.9, ease: 'elastic.out(1, 0.5)' });
        const onMove = (e) => {
          const r = panel.getBoundingClientRect();
          const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
          turn(-80 + p * 160);
          const i = Math.min(TIERS.length - 1, Math.floor(p * TIERS.length));
          labels.forEach((l, n) => l.classList.toggle('is-active', n === i));
        };
        panel.addEventListener('pointermove', onMove);
        cleanups.push(() => panel.removeEventListener('pointermove', onMove));
      }
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);
}

export default function Home() {
  const rootRef = useRef(null);
  useMotion(rootRef);
  useHomeScenes(rootRef);

  return (
    <div ref={rootRef} className="home">
      <Nav />

      {/* ============ HERO ============
          A still photograph (misty ridges at dawn: patience, horizon, the
          long view), the promise set in charcoal on the pale sky, and the
          registrations at the foot. Answers, in order: who we are, what we
          do, for whom, why trust us, and what to do next. */}
      <header className="h-hero">
        <div className="h-hero-media" aria-hidden="true">
          <img src={heroRidges} srcSet={`${heroRidgesSm} 760w, ${heroRidges} 1400w`} sizes="100vw" alt="" width="1400" height="1460" fetchPriority="high" />
        </div>

        <div className="wrap h-hero-main">
          <p className="h-eyebrow hero-in" style={{ '--d': '.1s' }}>RISCH Private Wealth · Since {FIRM.foundedYear}</p>
          <h1 className="h-title">
            <span className="h-line"><span style={{ '--d': '.18s' }}>Capital deserves</span></span>
            <span className="h-line"><span style={{ '--d': '.28s' }}><em>a considered</em> hand.</span></span>
          </h1>
          {/* From the client brochure. The founder wants this line kept in the hero. */}
          <p className="h-tagline hero-in" style={{ '--d': '.5s' }}>We manage portfolios.</p>
          {/* brand → proposition → credibility → action */}
          <p className="h-lede hero-in" style={{ '--d': '.6s' }}>Private wealth management for entrepreneurs, business owners, professionals and families, built around your goals, your risk and your long-term wealth, across Indian and global markets.</p>
          {FIRM.minimumInvestable && (
            <p className="hero-note hero-in" style={{ '--d': '.65s' }}>For investors with {FIRM.minimumInvestable}+ in investable assets.</p>
          )}
          <div className="h-ctas hero-in" style={{ '--d': '.72s' }}>
            <Link to="/contact" className="btn btn-primary btn-fill"><span>Start Your Wealth Review</span> <Arrow /></Link>
            <Link to="/about" className="btn btn-line">Meet the Founder</Link>
          </div>
        </div>

        <div className="h-hero-foot hero-in" style={{ '--d': '.9s' }}>
          <div className="wrap h-hero-foot-inner">
            <ul className="h-points">
              <li>{YEARS} years of private-banking experience</li>
              <li>Open-architecture portfolios, no in-house products</li>
              <li>Indian &amp; global allocation</li>
            </ul>
            <p className="h-reg">
              <span>AMFI-registered Mutual Fund Distributor <strong>{FIRM.registrations[0].id}</strong></span>
              <span>APMI-registered PMS Distributor <strong>{FIRM.registrations[1].id}</strong></span>
            </p>
          </div>
        </div>
      </header>

      {/* ============ MANIFESTO + FACTS ============ */}
      <section className="h-manifesto">
        <div className="wrap">
          <p className="h-kicker" data-reveal>Our belief</p>
          <p className="h-manifesto-text" data-words>
            At RISCH, we believe wealth is not a destination, but a responsibility. Our role is to be the steward of your capital, aligned with your values, and committed to your legacy.
          </p>
          <div className="h-facts" data-reveal="stagger" aria-label="RISCH at a glance">
            {trustItems().map((item) => (
              <div key={item.l} className="h-fact">
                <div className={'h-fact-n' + (item.compact ? ' is-compact' : '')} data-count={item.count}>{item.n}</div>
                <div className="h-fact-l">{item.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SEVEN PRINCIPLES (pinned, horizontal) ============ */}
      <section className="h-principles" aria-labelledby="principles-title">
        <div className="wrap h-principles-head">
          <div>
            <p className="eyebrow" data-reveal>Our Mission: Investor Success</p>
            <h2 id="principles-title" className="h-h2" data-split>Investors trust us because we put them first.</h2>
          </div>
          <div className="h-principles-meta" data-reveal>
            <p className="lede">Seven investment principles guide every portfolio we manage, the same ones we set out for every new client, before a single rupee is committed.</p>
            <div className="h-principles-count" aria-hidden="true"><b>01</b> / {String(PRINCIPLES.length).padStart(2, '0')}</div>
            <div className="h-principles-bar" aria-hidden="true"><i /></div>
          </div>
        </div>
        <ol className="h-principles-track">
          {PRINCIPLES.map((p, i) => (
            <li className={'h-principle' + (i === 0 ? ' is-active' : '')} key={p.title}>
              <span className="h-principle-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="h-principle-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">{p.icon}</svg>
              </span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ============ FRAMEWORK (sticky dial + steps) ============ */}
      <section className="h-framework" id="framework">
        <div className="wrap h-framework-grid">
          <div className="h-framework-sticky">
            <p className="eyebrow" data-reveal>The RISCH Framework</p>
            <h2 className="h-h2" data-split>Understand first. Allocate second. <em>Compound over time.</em></h2>
            <p className="lede" data-reveal>Wealth management is a long relationship, not a single transaction. Every portfolio we manage follows the same four stages, for as long as you are a client.</p>
            <div className="h-dial" aria-hidden="true">
              <svg viewBox="0 0 200 200">
                <circle className="h-dial-track" cx="100" cy="100" r="92" />
                <path className="h-dial-progress" d="M100 8 a92 92 0 1 1 0 184 a92 92 0 1 1 0 -184" />
              </svg>
              <div className="h-dial-num"><div className="h-dial-odometer">{FRAMEWORK.map((_, i) => <span key={i}>{String(i + 1).padStart(2, '0')}</span>)}</div></div>
              <div className="h-dial-stage">{FRAMEWORK.map((s, i) => <span key={s.t} className={i === 0 ? 'is-active' : ''}>{s.t}</span>)}</div>
            </div>
          </div>
          <ol className="h-steps">
            {FRAMEWORK.map((step, i) => (
              <li key={step.t} className={'h-step' + (i === 0 ? ' is-active' : '')}>
                <span className="h-step-n">Stage {String(i + 1).padStart(2, '0')}</span>
                <h3>{step.t}</h3>
                <p>{step.d}</p>
                {step.chips && <ul className="h-chips">{step.chips.map((c) => <li key={c}>{c}</li>)}</ul>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ WHO WE SERVE ============ */}
      <section className="h-serve">
        <div className="wrap">
          <div className="h-serve-head">
            <div>
              <p className="eyebrow" data-reveal>Who We Serve</p>
              <h2 className="h-h2" data-split>For wealth that has outgrown simple answers.</h2>
            </div>
            <div data-reveal>
              <p>RISCH works with a small number of clients directly, typically where wealth is spread across businesses, custodians, generations or countries.</p>
              <Link to="/who-we-serve" className="text-link" data-label="Whom We Serve">More on who we work with <Arrow /></Link>
            </div>
          </div>
          <ul className="h-serve-list" data-reveal="stagger">
            {HOME_SEGMENTS.map((s, i) => (
              <li key={s.title}>
                <Link to="/who-we-serve" className="h-serve-row" data-label="Whom We Serve">
                  <span className="h-serve-i">{String(i + 1).padStart(2, '0')}</span>
                  <span className="h-serve-title">
                    <small>{s.eyebrow}</small>
                    <h3>{s.title}</h3>
                  </span>
                  <span className="h-serve-body">{s.body}</span>
                  <span className="h-serve-arrow" aria-hidden="true"><Arrow /></span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="h-serve-note" data-reveal>We also work alongside existing family offices, as a second opinion and execution partner.</p>
        </div>
      </section>

      {/* ============ WHAT WE DO (navy) ============ */}
      <section className="h-do">
        <div className="wrap">
          <div className="h-do-head">
            <div>
              <p className="eyebrow" data-reveal>What We Do</p>
              <h2 className="h-h2" data-split>Built around the whole balance sheet.</h2>
            </div>
            <Link to="/solutions" className="btn btn-light" data-label="What We Provide" data-reveal>View all solutions <Arrow /></Link>
          </div>
          <div className="h-do-grid" data-reveal="stagger">
            {DISCIPLINES.map((d, i) => (
              <article key={d.t} className="h-do-card">
                <span className="h-do-n">0{i + 1}</span>
                <h3>{d.t}</h3>
                <p>{d.d}</p>
                <span className="h-do-glow" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY RISCH ============ */}
      <section className="h-why">
        <div className="h-marquee" aria-hidden="true">
          <div className="h-marquee-track">
            {[0, 1].map((k) => (
              <span key={k} className="h-marquee-set">
                {WHY.map((w, i) => (
                  <span key={w.t} className={i % 2 ? 'is-outline' : ''}>{w.t}<i>✦</i></span>
                ))}
              </span>
            ))}
          </div>
        </div>
        <div className="wrap">
          <div className="h-why-head">
            <p className="eyebrow" data-reveal>Why RISCH</p>
            <h2 className="h-h2" data-split>Structured to put the client&rsquo;s interest first.</h2>
          </div>
          <div className="h-why-grid" data-reveal="stagger">
            {WHY.map((w, i) => (
              <div key={w.t} className="h-why-item">
                <span className="h-why-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{w.t}</h3>
                <p>{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CEO'S DESK ============ */}
      <section className="h-ceo">
        <div className="wrap h-ceo-grid">
          <figure className="h-ceo-figure">
            <div className="h-ceo-photo">
              <img src={founderOffice} alt="Rishiraj Maheshwari, Founder & CEO of RISCH Wealth" width="538" height="632" loading="lazy" />
            </div>
            <figcaption>
              <span>Rishiraj Maheshwari</span>
              <span>Founder &amp; CEO, RISCH Wealth</span>
            </figcaption>
          </figure>
          <div className="h-ceo-text">
            <p className="eyebrow" data-reveal>From the CEO&rsquo;s Desk</p>
            <blockquote className="h-ceo-quote">
              <p data-split>The objective is not to beat the market every quarter. The objective is to help families preserve and compound wealth across generations.</p>
            </blockquote>
            <div data-reveal>
              <h2 className="h-ceo-name">Rishiraj Maheshwari</h2>
              <p className="h-ceo-role">Founder &amp; CEO, {FIRM.legalName}</p>
            </div>
            <ul className="h-ceo-facts" data-reveal="stagger">
              {CEO_FACTS.map((f) => (
                <li key={f.t}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{f.icon}</svg>
                  <strong>{f.t}</strong>
                  <span>{f.d}</span>
                </li>
              ))}
            </ul>
            <ol className="h-career" data-reveal="stagger">
              <li><span>2010 – 2014</span><span>Senior Private Banker<small>ICICI Securities</small></span></li>
              <li><span>2018 – 2019</span><span>Edelweiss Financial Services<small>Mumbai</small></span></li>
              <li><span>2014 – Present</span><span>Founder &amp; CEO<small>RISCH Wealth</small></span></li>
            </ol>
            <Link to="/about" className="btn btn-primary btn-fill" data-label="The Firm"><span>Read the founder&rsquo;s story</span> <Arrow /></Link>
          </div>
        </div>
      </section>

      {/* ============ CLIENT VOICES (draggable) ============ */}
      <section className="h-voices">
        <div className="wrap h-voices-head">
          <div>
            <p className="eyebrow" data-reveal>The Client Experience</p>
            <h2 className="h-h2" data-split>In our clients&rsquo; words.</h2>
          </div>
          <div className="h-voices-side" data-reveal>
            <span className="h-voices-progress" aria-hidden="true"><i /></span>
            <Link to="/testimonials" className="text-link" data-label="Testimonials">All client stories <Arrow /></Link>
          </div>
        </div>
        <div className="h-voices-viewport">
          <ul className="h-voices-track">
            {VOICES.map((t) => (
              <li key={t.name + t.quote.slice(0, 12)} className="h-voice">
                <p className="h-voice-q">&ldquo;{t.quote}&rdquo;</p>
                <div className="h-voice-who">
                  {t.photo
                    ? <img src={t.photo} alt="" width="56" height="56" loading="lazy" draggable="false" />
                    : <span className="h-voice-initial" aria-hidden="true">{t.initial}</span>}
                  <span>
                    <strong>{t.name}</strong>
                    <small>{t.role}</small>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ IN THE PRESS ============ */}
      <section className="h-press">
        <div className="wrap">
          <div className="h-press-head">
            <div>
              <p className="eyebrow" data-reveal>Perspective</p>
              <h2 className="h-h2" data-split>Rishiraj Maheshwari, <em>in the press.</em></h2>
            </div>
            <Link to="/perspective" className="text-link" data-reveal>All articles and coverage <Arrow /></Link>
          </div>
          <ul className="h-press-list" data-reveal="stagger">
            {PRESS.slice(0, 4).map((p) => (
              <li key={p.url}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="h-press-item">
                  <span className="h-press-meta"><strong>{p.outlet}</strong>{pressDate(p)}</span>
                  <span className="h-press-title">{p.title}</span>
                  {p.quote && <q className="h-press-quote">{p.quote}</q>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ RISK ASSESSMENT ============ */}
      <section className="h-assess-wrap">
        <div className="wrap">
          <div className="h-assess" data-reveal>
            <div className="h-assess-copy">
              <p className="eyebrow">Risk Assessment</p>
              <h2 className="h-h2 h-h2-sm">Before we talk, see where you stand.</h2>
              <p>Eight questions on your time horizon and risk preference produce a preliminary allocation with hypothetical outcomes. It&rsquo;s a starting point for a conversation, not a recommendation.</p>
              <Link to="/risk-profiler" className="btn btn-primary btn-fill" data-label="Risk Assessment"><span>Take the risk assessment</span> <Arrow /></Link>
            </div>
            <div className="h-gauge" aria-hidden="true">
              <svg viewBox="0 0 320 180">
                <path className="h-gauge-arc" d="M20 170 A140 140 0 0 1 300 170" />
                {[0, 1, 2, 3, 4].map((i) => {
                  const a = Math.PI - (i / 4) * Math.PI;
                  return <line key={i} className="h-gauge-tick" x1={160 + Math.cos(a) * 124} y1={170 - Math.sin(a) * 124} x2={160 + Math.cos(a) * 140} y2={170 - Math.sin(a) * 140} />;
                })}
                <g className="h-gauge-needle"><line x1="160" y1="170" x2="160" y2="52" /><circle cx="160" cy="170" r="9" /></g>
              </svg>
              <ul className="h-gauge-tiers">
                {TIERS.map((t, i) => <li key={t} className={'h-gauge-tier' + (i === 1 ? ' is-active' : '')}>{t}</li>)}
              </ul>
              <p className="h-gauge-hint">Move across to explore the four RISCH portfolios</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="h-faq" id="faq">
        <div className="wrap h-faq-grid">
          <div className="h-faq-head">
            <p className="eyebrow" data-reveal>Questions</p>
            <h2 className="h-h2" data-split>Frequently asked questions.</h2>
            <p className="lede" data-reveal>How RISCH works, who we work with, and what the risk assessment tells you.</p>
          </div>
          <div className="h-faq-list" data-reveal="stagger">
            {FAQS.map(({ q, a }, idx) => (
              <details className="h-faq-item" key={q} open={idx === 0}>
                <summary>
                  <span className="h-faq-i">{String(idx + 1).padStart(2, '0')}</span>
                  <h3>{q}</h3>
                  <span className="h-faq-plus" aria-hidden="true" />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="h-final">
        <div className="wrap">
          <p className="eyebrow" data-reveal>Start A Conversation</p>
          <h2 className="h-final-title" data-split>Your portfolio deserves a considered second opinion.</h2>
          <div className="h-final-row">
            <p className="lede" data-reveal>Whether your wealth sits across several advisers or you&rsquo;re starting afresh, the first step is a conversation about what it needs to do, and what it can withstand.</p>
            <div className="h-final-actions" data-reveal>
              <Link to="/contact" className="h-orb" data-label="Get in touch">
                <span>Start a conversation</span>
                <Arrow />
              </Link>
              <a href={FIRM.phoneHref} className="text-link">Call {FIRM.phone}</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
