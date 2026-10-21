import { useLayoutEffect, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav/Nav';
import Footer from '../components/Footer/Footer';
import heroRidges from '../assets/hero-ridges-1400.webp';
import heroRidgesSm from '../assets/hero-ridges-760.webp';
import Compounding from '../components/viz/Compounding';
import AllocationExplorer from '../components/viz/AllocationExplorer';
import founderOffice from '../assets/founder-office.jpg';
import { useMotion } from '../motion/useMotion';
import { gsap, Draggable, prefersReducedMotion } from '../motion/gsap';
import { FAQS } from '../seo';
import { FIRM } from '../data/firm';
import { SEGMENTS } from '../data/segments';
import { PRINCIPLES } from '../data/principles';
import { TESTIMONIALS } from '../data/testimonials';
import { PRESS, pressDate } from '../data/press';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5" stroke="currentColor" strokeWidth="1.4" /></svg>
);

const YEARS = new Date().getFullYear() - FIRM.careerStartYear;

const STATS = [
  { n: YEARS, unit: 'years', l: 'Founder’s career in private banking' },
  { n: FIRM.foundedYear, unit: '', l: 'RISCH Wealth founded' },
  { n: 0, unit: '', l: 'Proprietary products. Advice aligned to you' },
  { n: 3, unit: 'routes', l: 'Mutual funds, PMS and AIFs' },
];

const FRAMEWORK = [
  { t: 'Understand risk', d: 'Willingness and ability, both measured. The lower sets the limit.',
    icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
  { t: 'Define the objective', d: 'Liquidity, income, growth, preservation or legacy.',
    icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /></> },
  { t: 'Build the allocation', d: 'Every holding has a role, across India and the world.',
    icon: <><path d="M4 20V12M10 20V6M16 20V10M22 20H2" /></> },
  { t: 'Review & rebalance', d: 'Kept on target as markets and your life change.',
    icon: <><path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v5h-5" /></> },
];

const SERVE = ['Business Owners', 'Entrepreneurs & Founders', 'Private Clients & Families', 'NRIs & Global Indians', 'Senior Executives & Professionals', 'Family Offices']
  .map((title) => SEGMENTS.find((s) => s.title === title))
  .filter(Boolean);

// Spotlight quotes first, then others with a portrait.
const VOICES = [
  ...TESTIMONIALS.filter((t) => t.spotlight),
  ...TESTIMONIALS.filter((t) => !t.spotlight && t.photo),
].slice(0, 8);

function useHomeScenes(rootRef) {
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;
    const cleanups = [];
    const ctx = gsap.context(() => {
      // Framework: the green rail fills and each stage lights as it's reached.
      const rail = root.querySelector('.hm-steps-rail i');
      const steps = gsap.utils.toArray(root.querySelectorAll('.hm-step'));
      gsap.fromTo(rail, { scaleX: 0 }, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root.querySelector('.hm-steps'),
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: 0.6,
          onUpdate(self) {
            steps.forEach((s, i) => s.classList.toggle('is-on', self.progress >= i / steps.length + 0.02));
          },
        },
      });

      // Testimonials: drag or flick the row.
      const track = root.querySelector('.hm-voices-track');
      if (track) {
        const [drag] = Draggable.create(track, {
          type: 'x',
          inertia: true,
          bounds: root.querySelector('.hm-voices-viewport'),
          edgeResistance: 0.85,
          dragClickables: true,
          onPress() { track.classList.add('is-dragging'); },
          onRelease() { track.classList.remove('is-dragging'); },
        });
        cleanups.push(() => drag.kill());
      }

      // Closing panel: the green growth path draws across it.
      const grow = root.querySelector('.hm-close-line path');
      if (grow) {
        const len = grow.getTotalLength();
        gsap.fromTo(grow, { strokeDasharray: len, strokeDashoffset: len }, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.querySelector('.hm-close'), start: 'top 85%', end: 'bottom 75%', scrub: 0.8 },
        });
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
    <div ref={rootRef} className="hm">
      <Nav />

      {/* ============ HERO ============
          The photograph (misty ridges at dawn: patience, the long view), the
          promise in ink on the pale sky, the facts in a navy strip at the foot. */}
      <header className="hp-hero">
        <div className="hp-hero-media" aria-hidden="true">
          <img src={heroRidges} srcSet={`${heroRidgesSm} 760w, ${heroRidges} 1400w`} sizes="100vw" alt="" width="1400" height="1460" fetchPriority="high" />
        </div>
        <div className="wrap hp-hero-main">
          <p className="hp-eyebrow hero-in" style={{ '--d': '.1s' }}>RISCH Private Wealth · Since {FIRM.foundedYear}</p>
          <h1 className="hp-title">
            <span className="h-line"><span style={{ '--d': '.18s' }}>Capital deserves</span></span>
            <span className="h-line"><span style={{ '--d': '.28s' }}><em>a considered</em> hand.</span></span>
          </h1>
          {/* From the client brochure. The founder wants this line kept in the hero. */}
          <p className="hp-tagline hero-in" style={{ '--d': '.5s' }}>We manage portfolios.</p>
          <p className="hp-lede hero-in" style={{ '--d': '.6s' }}>Private wealth management for entrepreneurs, business owners, professionals and families, built around your goals, your risk and your long-term wealth, across Indian and global markets.</p>
          <div className="hp-ctas hero-in" style={{ '--d': '.72s' }}>
            <Link to="/contact" className="btn btn-dark"><span>Start Your Wealth Review</span> <Arrow /></Link>
            <Link to="/about" className="btn btn-line">Meet the Founder</Link>
          </div>
        </div>
        <div className="hp-hero-foot hero-in" style={{ '--d': '.9s' }}>
          <div className="wrap hp-hero-foot-inner">
            <ul className="hp-points">
              <li>{YEARS} years of private-banking experience</li>
              <li>Open-architecture portfolios, no in-house products</li>
              <li>Indian &amp; global allocation</li>
            </ul>
            <p className="hp-reg">
              <span>AMFI-registered Mutual Fund Distributor <strong>{FIRM.registrations[0].id}</strong></span>
              <span>APMI-registered PMS Distributor <strong>{FIRM.registrations[1].id}</strong></span>
            </p>
          </div>
        </div>
      </header>

      {/* ============ NUMBERS ============ */}
      <section className="hm-stats">
        <div className="wrap hm-stats-grid" data-reveal="stagger">
          {STATS.map((s) => (
            <div className="hm-stat" key={s.l}>
              <p className="hm-stat-n"><span data-count={s.n === FIRM.foundedYear ? undefined : s.n}>{s.n}</span>{s.unit && <small>{s.unit}</small>}</p>
              <p className="hm-stat-l">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ ALLOCATION ============ */}
      <section className="hm-sec">
        <div className="wrap">
          <div className="hm-head">
            <p className="hm-eyebrow" data-reveal>Risk first, portfolio second</p>
            <h2 className="hm-h2" data-split>Your horizon sets <em>the mix.</em></h2>
          </div>
          <div data-reveal><AllocationExplorer /></div>
        </div>
      </section>

      {/* ============ COMPOUNDING (navy) ============ */}
      <section className="hm-sec hm-navy">
        <div className="wrap hm-split">
          <div className="hm-head hm-head-left">
            <p className="hm-eyebrow" data-reveal>The long view</p>
            <h2 className="hm-h2" data-split>Time does the <em>heavy lifting.</em></h2>
            <p className="hm-sub" data-reveal>Discipline keeps you invested. Compounding does the rest.</p>
          </div>
          <div data-reveal><Compounding /></div>
        </div>
      </section>

      {/* ============ FRAMEWORK ============ */}
      <section className="hm-sec" id="framework">
        <div className="wrap">
          <div className="hm-head">
            <p className="hm-eyebrow" data-reveal>The RISCH framework</p>
            <h2 className="hm-h2" data-split>Understand. Allocate. <em>Compound.</em></h2>
          </div>
          <div className="hm-steps">
            <span className="hm-steps-rail" aria-hidden="true"><i /></span>
            <ol>
              {FRAMEWORK.map((s, i) => (
                <li key={s.t} className="hm-step">
                  <span className="hm-step-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{s.icon}</svg></span>
                  <span className="hm-step-n">0{i + 1}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============ PRINCIPLES ============ */}
      <section className="hm-sec hm-tint">
        <div className="wrap">
          <div className="hm-head">
            <p className="hm-eyebrow" data-reveal>Our mission: investor success</p>
            <h2 className="hm-h2" data-split>Seven principles behind <em>every portfolio.</em></h2>
          </div>
          <ol className="hm-principles" data-reveal="stagger">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} tabIndex={0}>
                <span className="hm-pr-top">
                  <span className="hm-pr-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p.icon}</svg></span>
                  <span className="hm-pr-n">{String(i + 1).padStart(2, '0')}</span>
                </span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
            <li className="hm-pr-cta">
              <p>The same principles we set out for every new client, before a rupee is invested.</p>
              <Link to="/solutions" className="text-link">How we invest <Arrow /></Link>
            </li>
          </ol>
        </div>
      </section>

      {/* ============ WHO WE SERVE ============ */}
      <section className="hm-sec">
        <div className="wrap">
          <div className="hm-head hm-head-row">
            <div>
              <p className="hm-eyebrow" data-reveal>Who we serve</p>
              <h2 className="hm-h2" data-split>For wealth that has outgrown <em>simple answers.</em></h2>
            </div>
            <Link to="/who-we-serve" className="text-link" data-reveal>All client profiles <Arrow /></Link>
          </div>
          <ul className="hm-serve" data-reveal="stagger">
            {SERVE.map((s) => (
              <li key={s.title}>
                <Link to="/who-we-serve" className="hm-serve-card">
                  <span className="hm-serve-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{s.icon}</svg></span>
                  <span className="hm-serve-eyebrow">{s.eyebrow}</span>
                  <span className="hm-serve-title">{s.title}</span>
                  <span className="hm-serve-go" aria-hidden="true"><Arrow /></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ FOUNDER ============ */}
      <section className="hm-sec hm-tint">
        <div className="wrap hm-founder">
          <figure className="hm-founder-photo" data-reveal>
            <img src={founderOffice} alt="Rishiraj Maheshwari, Founder & CEO of RISCH Wealth" width="538" height="632" loading="lazy" />
            <figcaption>
              <b>Rishiraj Maheshwari</b>
              <span>Founder &amp; CEO</span>
            </figcaption>
          </figure>
          <div className="hm-founder-text">
            <p className="hm-eyebrow" data-reveal>From the CEO&rsquo;s desk</p>
            <blockquote className="hm-quote" data-split>The objective is not to beat the market every quarter. It is to help families preserve and compound wealth across generations.</blockquote>
            <ul className="hm-career" data-reveal="stagger">
              <li><span>2010–14</span><b>Senior Private Banker</b><small>ICICI Securities</small></li>
              <li><span>2018–19</span><b>Edelweiss Financial Services</b><small>Mumbai</small></li>
              <li className="is-now"><span>2014–now</span><b>Founder &amp; CEO</b><small>RISCH Wealth</small></li>
            </ul>
            <div data-reveal><Link to="/about" className="btn btn-dark"><span>Meet the founder</span> <Arrow /></Link></div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="hm-sec hm-voices">
        <div className="wrap hm-head hm-head-row">
          <div>
            <p className="hm-eyebrow" data-reveal>Client experience</p>
            <h2 className="hm-h2" data-split>In our clients&rsquo; <em>words.</em></h2>
          </div>
          <Link to="/testimonials" className="text-link" data-reveal>All client stories <Arrow /></Link>
        </div>
        <div className="hm-voices-viewport">
          <ul className="hm-voices-track">
            {VOICES.map((t) => (
              <li key={t.name + t.quote.slice(0, 12)} className="hm-voice">
                <span className="hm-voice-mark" aria-hidden="true">&ldquo;</span>
                <p>{t.quote}</p>
                <div className="hm-voice-who">
                  {t.photo
                    ? <img src={t.photo} alt="" width="48" height="48" loading="lazy" draggable="false" />
                    : <span className="hm-voice-initial" aria-hidden="true">{t.initial}</span>}
                  <span><b>{t.name}</b><small>{t.role}</small></span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="wrap hm-drag-hint" aria-hidden="true">Drag to read more <Arrow /></p>
      </section>

      {/* ============ IN THE PRESS ============ */}
      <section className="hm-sec hm-tint">
        <div className="wrap">
          <div className="hm-head hm-head-row">
            <div>
              <p className="hm-eyebrow" data-reveal>Perspective</p>
              <h2 className="hm-h2" data-split>Rishiraj Maheshwari, <em>in the press.</em></h2>
            </div>
            <Link to="/perspective" className="text-link" data-reveal>All articles <Arrow /></Link>
          </div>
          <ul className="hm-press" data-reveal="stagger">
            {PRESS.slice(0, 3).map((p) => (
              <li key={p.url}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="hm-press-card">
                  <span className="hm-press-outlet">{p.outlet}</span>
                  <span className="hm-press-title">{p.title}</span>
                  <span className="hm-press-date">{pressDate(p)} <Arrow /></span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="hm-sec" id="faq">
        <div className="wrap hm-faq">
          <div className="hm-head hm-head-left">
            <p className="hm-eyebrow" data-reveal>Questions</p>
            <h2 className="hm-h2" data-split>Frequently <em>asked.</em></h2>
          </div>
          <div className="hm-faq-list">
            {FAQS.map(({ q, a }, idx) => (
              <details className="hm-faq-item" key={q} open={idx === 0}>
                <summary><h3>{q}</h3><span className="hm-faq-plus" aria-hidden="true" /></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CLOSE ============ */}
      <section className="hm-close-wrap">
        <div className="hm-close">
          <svg className="hm-close-line" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 270 C120 262 180 240 260 246 S400 214 470 206 S600 222 660 180 S800 150 860 132 S1000 96 1060 70 S1160 34 1200 22" />
          </svg>
          <div className="wrap hm-close-inner">
            <h2 className="hm-close-title" data-split>Your portfolio deserves a <em>considered second opinion.</em></h2>
            <div className="hm-close-actions" data-reveal>
              <Link to="/contact" className="btn btn-green"><span>Start a conversation</span> <Arrow /></Link>
              <a href={FIRM.phoneHref} className="btn btn-ghost-light">Call {FIRM.phone}</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
