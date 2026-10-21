import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav/Nav';
import Footer from '../components/Footer/Footer';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useMotion } from '../motion/useMotion';
import { scrollToY } from '../motion/gsap';
import { useRiskProfile } from '../hooks/useRiskProfile';
import ProfileToPortfolio from '../components/solutions/ProfileToPortfolio';
import HorizonSelector from '../components/solutions/HorizonSelector';
import AllocationPanel from '../components/solutions/AllocationPanel';
import ProcessTimeline from '../components/solutions/ProcessTimeline';
import BuildingBlocks from '../components/solutions/BuildingBlocks';
import Icon from '../components/solutions/Icons';
import Band from '../components/solutions/Band';
import RingSlider from '../components/solutions/RingSlider';
import PrinciplesMorph, { PrinciplesGrid } from '../components/solutions/PrinciplesMorph';
import { PRINCIPLES } from '../data/principles';
import { ALLOCATION, CLOSING, HERO, PHILOSOPHY, TOGETHER, UNDERSTAND, horizonForYears } from '../content/solutions';

// What We Provide: risk first, portfolio second. Hero (profile to portfolio), then the four
// parts of the page in order: Understand, Asset Allocation, Investment
// Philosophy, How it comes together. All copy lives in content/solutions.js.

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5" stroke="currentColor" strokeWidth="1.3" /></svg>
);

const Down = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1V13M7 13L1.5 7.5M7 13L12.5 7.5" stroke="currentColor" strokeWidth="1.3" /></svg>
);

const Eyebrow = ({ children }) => <p className="wp-eyebrow"><span>{children}</span></p>;

// a thin copper line drawing of a pitch and its creases, used as a divider
const Crease = () => (
  <svg className="wp-crease" viewBox="0 0 600 40" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true" focusable="false">
    <path d="M0 20H236M364 20H600" />
    <rect x="236" y="8" width="128" height="24" rx="1" />
    <path d="M262 8V32M300 8V32M338 8V32" strokeDasharray="1 3" />
  </svg>
);

export default function Solutions() {
  useScrollReveal();
  const rootRef = useRef(null);
  useMotion(rootRef);
  const { status, profile, isClient } = useRiskProfile();
  const complete = status === 'complete';
  const reviewHref = '/client-portal/risk-profile';
  const startHref = isClient ? '/client-portal/risk-assessment' : '/risk-profiler';

  // the scroll-morph needs room and motion; phones and reduced-motion get a plain grid
  const [morph, setMorph] = useState(false);
  useEffect(() => {
    setMorph(window.matchMedia('(min-width: 820px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const [ring, setRing] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 760px)');
    const set = () => setRing(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);
  const discCards = TOGETHER.disciplines.map((d) => ({
    key: d.t,
    content: (
      <div className="wp-dcard">
        <h4>{d.t}</h4>
        <p>{d.d}</p>
        <Link to={`/contact?topic=${encodeURIComponent(d.t)}`} className="wp-link">Discuss this <Arrow /></Link>
      </div>
    ),
  }));

  const [years, setYears] = useState(6);
  const [portfolio, setPortfolio] = useState('growth');
  // smooth scroll to the Asset Allocation section, clear of the sticky header
  const seeMix = () => {
    const el = document.querySelector('.wp-alloc');
    if (!el) return;
    const head = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h-scrolled')) || 94;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollToY(el.getBoundingClientRect().top + window.scrollY - head, { smooth: !still });
  };
  const onYears = (y) => { setYears(y); setPortfolio(horizonForYears(y)); };
  const goUnderstand = () => {
    const el = document.getElementById('understand');
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 80);
  };

  const U = UNDERSTAND;
  const philTop = (
    <div className="wrap wp-phil-top">
      <div>
        <Eyebrow>Our principles</Eyebrow>
        <h2 className="wp-h2" id="phil-h">{PHILOSOPHY.title}</h2>
        <Crease />
      </div>
      <blockquote className="wp-lead"><p>{PHILOSOPHY.quote}</p></blockquote>
    </div>
  );
  return (
    <div ref={rootRef}>
      <Nav />

      <header className="wp-hero wp-ground">
        <svg className="wp-arcs" viewBox="0 0 620 520" aria-hidden="true" focusable="false">
          <path d="M-40 520 A 560 560 0 0 1 420 40" />
          <path d="M-40 520 A 500 500 0 0 1 380 90" />
          <path d="M-40 520 A 440 440 0 0 1 335 145" />
        </svg>
        <div className="wrap wp-hero-grid">
          <div className="wp-hero-copy">
            <h1 className="wp-h1">
              <span className="h-line"><span style={{ '--d': '.15s' }}>{HERO.title[0]}</span></span>
              <span className="h-line"><span style={{ '--d': '.27s' }}><em>{HERO.title[1]}</em></span></span>
            </h1>
            <p className="wp-lede hero-in" style={{ '--d': '.5s' }}>{HERO.body}</p>
            <div className="wp-actions hero-in" style={{ '--d': '.65s' }}>
              <button type="button" className="btn wp-see" onClick={goUnderstand}>{HERO.secondary} <Down /></button>
            </div>
          </div>
          <ProfileToPortfolio />
        </div>
      </header>

      {/* 1 · UNDERSTAND */}
      <section className="wp-und" id="understand" aria-labelledby="und-h">
        <div className="wrap">
          <div className="wp-head reveal">
            <Eyebrow>Your profile</Eyebrow>
            <h2 className="wp-h2" id="und-h" data-split>{U.title}</h2>
            <p className="wp-body">{U.intro}</p>
            {complete && <p className="wp-saved">Your saved profile: <strong>{profile.tierName}</strong>. <Link to={reviewHref} className="wp-link">Review it <Arrow /></Link></p>}
          </div>

          <div className="wp-und-grid">
            <article className="wp-block reveal" aria-labelledby="tol-h">
              <Icon name="gauge" size={32} className="wp-block-icon" />
              <h3 id="tol-h">{U.tolerance.title}</h3>
              <p className="wp-body">{U.tolerance.body}</p>
            </article>

            <article className="wp-block reveal" aria-labelledby="hz-h">
              <Icon name="hourglass" size={32} className="wp-block-icon" />
              <h3 id="hz-h">{U.horizon.title}</h3>
              <p className="wp-body">{U.horizon.body}</p>
              <HorizonSelector years={years} onYears={onYears} onSeeMix={seeMix} />
              <p className="wp-note">{U.horizon.note}</p>
            </article>

            <article className="wp-block reveal" aria-labelledby="bs-h">
              <Icon name="brain" size={32} className="wp-block-icon" />
              <h3 id="bs-h">{U.behaviour.title}</h3>
              <p className="wp-body">{U.behaviour.body}</p>
              <figure className="wp-fig">
                <p className="wp-fig-n" aria-label={`${U.behaviour.figure} ${U.behaviour.figureText}`}><span aria-hidden="true">{U.behaviour.figure}</span></p>
                <figcaption>
                  <span>{U.behaviour.figureText}</span>
                </figcaption>
              </figure>
              <blockquote className="wp-quote">
                <p>{U.behaviour.quote}</p>
                <cite>{U.behaviour.quoteBy}</cite>
              </blockquote>
            </article>
          </div>
        </div>
      </section>

      {/* 2 · ASSET ALLOCATION */}
      <section className="wp-alloc" aria-labelledby="alloc-h">
        <div className="wrap">
          <div className="wp-head reveal">
            <h2 className="wp-h2" id="alloc-h" data-split>{ALLOCATION.title}</h2>
            <p className="wp-body">{ALLOCATION.intro}</p>
          </div>
          <div className="reveal">
            <AllocationPanel portfolio={portfolio} onPortfolio={setPortfolio} />
          </div>
          <p className="wp-disclosure reveal">{ALLOCATION.disclaimer}</p>
          <div className="wp-means reveal-stagger">
            {ALLOCATION.points.map(([t, d]) => (
              <p key={t}><strong>{t}</strong> {d}</p>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · INVESTMENT PHILOSOPHY */}
      <section className="wp-phil" aria-labelledby="phil-h">
        <Band src="/images/solutions/principles-band.webp" />
        {morph ? (
          <PrinciplesMorph principles={PRINCIPLES} hint={PHILOSOPHY.morphHint} top={philTop} />
        ) : (
          <>
            {philTop}
            <div className="wrap"><PrinciplesGrid principles={PRINCIPLES} title={PHILOSOPHY.morphTitle} /></div>
          </>
        )}
      </section>

      {/* 4 · HOW IT COMES TOGETHER */}
      <section className="wp-tog" id="together" aria-labelledby="tog-h">
        <div className="wrap">
          <div className="wp-head reveal">
            <Eyebrow>Our process</Eyebrow>
            <h2 className="wp-h2" id="tog-h" data-split>{TOGETHER.title}</h2>
          </div>
          <ProcessTimeline />

          <div className="wp-blocks">
            <div className="wp-head reveal">
              <Eyebrow>What we offer</Eyebrow>
              <h3 className="wp-h3">{TOGETHER.blocksTitle}</h3>
              <p className="wp-body">{TOGETHER.blocksIntro}</p>
            </div>
            <BuildingBlocks />
            <p className="wp-disclosure reveal">{TOGETHER.disclosure}</p>
          </div>

          <div className="wp-discs reveal">
            <div className="wp-discs-head">
              <h3 className="wp-h3">{TOGETHER.disciplinesTitle}</h3>
              <p className="wp-closing">{CLOSING.title}</p>
            </div>
            {ring ? <RingSlider items={discCards} label={TOGETHER.disciplinesTitle} /> : <ul className="wp-disc">{discCards.map((c) => <li key={c.key}>{c.content}</li>)}</ul>}
          </div>
        </div>
      </section>

      <Band src="/images/solutions/cta-band.webp" variant="cta">
        <div className="wrap wp-cta-copy reveal">
          <p className="wp-eyebrow"><span>The right conversation</span></p>
          <h2 className="wp-h2">Start with your risk. We will take it from there.</h2>
          <Link to={complete ? reviewHref : startHref} className="btn btn-primary btn-fill" data-magnetic="0.25"><span>{complete ? 'Review Risk Profile' : 'Start Risk Profile'}</span> <Arrow /></Link>
        </div>
      </Band>

      <Footer />
    </div>
  );
}
