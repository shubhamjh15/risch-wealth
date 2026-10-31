import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import V3Nav from '../v3/V3Nav';
import V3Footer from '../v3/V3Footer';
import V3Hero from '../v3/V3Hero';
import Clients from '../v3/Clients';
import { Framework, PrinciplesBand, ServeSticky, Solutions } from '../v3/sections';
import Allocation from '../v3/Allocation';
import { Arrow, Clip, MEDIA, RiseLine } from '../v3/ui';
import { useSmoothScroll } from '../v3/smooth';
import { useMotion } from '../motion/useMotion';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../motion/gsap';
import founderOffice from '../assets/founder-office.jpg';
import { FAQS } from '../seo';
import { FIRM } from '../data/firm';
import { HERO, TOGETHER } from '../content/solutions';
import { PRESS, pressDate, pressImg } from '../data/press';

// The home page. Warm ivory, Cormorant display over Figtree text, rounded media frames,
// soft daylight footage (public/visuals), and the 3D
// allocation scene. The rest of the site shares this kit (src/v3/).
// The compounding illustration that used to sit after "Whom we serve" was
// removed at the client's request (no return illustrations on the site).

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const YEARS = new Date().getFullYear() - FIRM.careerStartYear;

const STATS = [
  { n: YEARS, unit: 'years', l: 'Founder’s career in private banking' },
  { n: FIRM.foundedYear, l: 'RISCH Wealth founded in Bengaluru', static: true },
  { n: 0, l: 'In-house products. Nothing of our own to sell' },
  { n: 4, unit: 'routes', l: 'Mutual funds, SIFs, PMS and AIFs' },
];

// The founder's career as the About page sets it out (firm-supplied).
const CAREER = [
  ['Founder & CEO', 'RISCH Wealth · Bengaluru'],
];
const ON_RECORD = {
  quote: 'I don’t believe in pushing products. It is all about maintaining relationships.',
  source: 'Morningstar India, 2019',
  url: 'https://morningstar.in/posts/54540/adviser-gung-ho-outsourcing-investment-management.aspx',
};

// Editorial pictures for the press cards (illustrative, not from the articles).
const PRESS_ART = ['wing-clouds', 'sea-plane', 'reel-horizon', 'sky-sun', 'resort-aerial', 'stage-course', 'reel-legacy'];

// Legacy mosaic, cropped to 800x1000. Pexels Licence: legacy-h1 32427301 (sky
// toned down to match the others), legacy-b2 39854948, legacy-d3 39181093,
// legacy-e4 12720684, legacy-b5 11004123.
const MOSAIC = ['legacy-h1', 'legacy-b2', 'legacy-d3', 'legacy-e4', 'legacy-b5'];

function Head({ num, label, title, children, center = false }) {
  return (
    <div className={'v3-head' + (center ? ' is-center' : '')}>
      <p className="v3-kicker" data-reveal><span>{num}</span>{label}</p>
      <h2 className="v3-h2" data-split>{title}</h2>
      {children}
    </div>
  );
}

function useScenes(rootRef) {
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      const q = (s) => root.querySelector(s);
      // Hero: the frame opens out, the lines rise, the arrow draws.
      gsap.set(q('.v3-hero-title'), { visibility: 'visible' });
      const rise = q('.v3-hero-rise .v2-rise-path');
      const head = q('.v3-hero-rise .v2-rise-head');
      const len = rise.getTotalLength();
      gsap.set(rise, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(head, { autoAlpha: 0 });
      gsap.timeline({ delay: 0.15 })
        .from(q('.v3-hero-frame'), { clipPath: 'inset(6% 4% 6% 4% round 40px)', duration: 1.8, ease: 'expo.out' })
        .from(q('.v3-hero-media'), { scale: 1.2, duration: 2.4, ease: 'expo.out' }, 0)
        .from(root.querySelectorAll('.v3-hero-in'), { yPercent: 115, duration: 1.4, ease: 'expo.out', stagger: 0.1 }, 0.3)
        .from(root.querySelectorAll('.v3-hero [data-hero]'), { autoAlpha: 0, y: 24, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.6)
        .to(rise, { strokeDashoffset: 0, duration: 1.5, ease: 'power3.inOut' }, 0.9)
        .to(head, { autoAlpha: 1, duration: 0.4 }, 2.2);
      // The hero media drifts as the page scrolls past.
      gsap.to(q('.v3-hero-media'), {
        yPercent: 12, ease: 'none',
        scrollTrigger: { trigger: q('.v3-hero'), start: 'top top', end: 'bottom top', scrub: true },
      });
      // Mosaic and press pictures: a slow parallax inside their frames.
      root.querySelectorAll('[data-drift] img').forEach((img) => {
        gsap.fromTo(img, { yPercent: -8, scale: 1.16 }, {
          yPercent: 8, scale: 1.16, ease: 'none',
          scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
      // The closing panel's arrow draws on.
      const closeRise = q('.v3-close-rise .v2-rise-path');
      if (closeRise) {
        const l = closeRise.getTotalLength();
        gsap.fromTo(closeRise, { strokeDasharray: l, strokeDashoffset: l }, {
          strokeDashoffset: 0, ease: 'none',
          scrollTrigger: { trigger: q('.v3-close'), start: 'top 75%', end: 'center 50%', scrub: 0.6 },
        });
      }
    }, root);
    return () => ctx.revert();
  }, []);
}

export default function Home() {
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
    <div ref={rootRef} className="v3">
      <V3Nav />
      <main>
        <V3Hero />

        {/* ============ INTRO ============ */}
        <section className="v3-sec v3-intro">
          <div className="v3-wrap">
            <div className="v3-intro-grid">
              <div>
                <p className="v3-kicker" data-reveal><span>01</span>Risk first. Portfolio second.</p>
                <h2 className="v3-h2 v3-intro-title" data-split>A private banker&rsquo;s discipline, working only for you.</h2>
              </div>
              <div className="v3-intro-side" data-reveal>
                <p>{HERO.body}</p>
                <Link to="/solutions" className="v3-textlink">Explore our approach <Arrow /></Link>
              </div>
            </div>
            <ul className="v3-stats" data-reveal="stagger">
              {STATS.map((s) => (
                <li key={s.l}>
                  <p className="v3-stat-n"><span data-count={s.static ? undefined : s.n}>{s.n}</span>{s.unit && <small>{s.unit}</small>}</p>
                  <p className="v3-stat-l">{s.l}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ WHAT WE PROVIDE ============ */}
        <section className="v3-sec v3-sec-tight">
          <div className="v3-wrap">
            <Head num="02" label="What we provide" title="Four ways to invest. One portfolio that fits together.">
              <p className="v3-head-sub" data-reveal>{TOGETHER.blocksIntro}</p>
            </Head>
          </div>
          <Solutions />
        </section>

        {/* ============ FRAMEWORK ============ */}
        <section className="v3-sec v3-tint">
          <div className="v3-wrap">
            <Head num="03" label="The RISCH framework" title="Four stages, in the same order, for every client." />
            <Framework />
          </div>
        </section>

        {/* ============ ALLOCATION (continues the tinted framework section) ============ */}
        <div className="v3-stage v3-stage-tint"><Allocation num="04" className="v3-stage-panel" /></div>

        {/* ============ WHOM WE SERVE ============ */}
        <section className="v3-sec">
          <div className="v3-wrap">
            <Head num="05" label="Whom we serve" title="For wealth that needs more than quick answers." />
            <ServeSticky />
          </div>
        </section>

        {/* ============ PRINCIPLES ============ */}
        <section className="v3-sec">
          <div className="v3-wrap">
            <Head num="06" label="Our mission: investor success" title="Seven principles behind every portfolio." />
          </div>
          <div className="v3-wrap v3-wrap-wide"><PrinciplesBand /></div>
        </section>

        {/* ============ LEGACY ============ */}
        <section className="v3-sec v3-tint">
          <div className="v3-wrap">
            <div className="v3-mosaic">
              <div className="v3-mosaic-text">
                <p className="v3-kicker" data-reveal><span>07</span>Legacy</p>
                <h2 className="v3-h2" data-split>Built to be handed on.</h2>
                <p data-reveal>Multi-generational wealth, consolidated reporting, and succession structured so it survives a handover.</p>
                <div data-reveal><Link to="/who-we-serve" className="v3-textlink">Private clients &amp; families <Arrow /></Link></div>
              </div>
              {MOSAIC.map((m) => (
                <figure key={m} className="v3-mosaic-pic" data-drift data-reveal>
                  <img src={`${MEDIA}/${m}.jpg`} alt="" loading="lazy" width="800" height="1000" />
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FOUNDER ============ */}
        <section className="v3-sec">
          <div className="v3-wrap v3-founder">
            <figure className="v3-founder-photo" data-reveal>
              <img src={founderOffice} alt="Rishiraj Maheshwari, Founder & CEO of RISCH Wealth" width="538" height="632" loading="lazy" />
              <figcaption><b>Rishiraj Maheshwari</b><span>Founder &amp; CEO</span></figcaption>
            </figure>
            <div className="v3-founder-text">
              <p className="v3-kicker" data-reveal><span>08</span>From the founder</p>
              <blockquote className="v3-founder-quote" data-split>The objective is not to beat the market every quarter. It is to help families preserve and grow wealth across generations.</blockquote>
              <ul className="v3-career" data-reveal="stagger">
                {CAREER.map(([r, f], k) => <li key={r} className={k ? undefined : 'is-now'}><b>{r}</b><span>{f}</span></li>)}
              </ul>
              <a className="v3-record" href={ON_RECORD.url} target="_blank" rel="noopener noreferrer" data-reveal>
                <span>On record</span>
                <q>{ON_RECORD.quote}</q>
                <small>{ON_RECORD.source} <Arrow /></small>
              </a>
              <div className="v3-founder-cta" data-reveal><Link to="/about" className="v3-pill v3-pill-dark"><span>The founder&rsquo;s story</span><i><Arrow /></i></Link></div>
            </div>
          </div>
        </section>

        {/* ============ CLIENTS ============ */}
        <section className="v3-sec v3-tint v3-clients-sec">
          <div className="v3-wrap">
            <Head num="09" label="Client experience" title="Hear it from our clients." />
          </div>
          <Clients />
        </section>

        {/* ============ PERSPECTIVE ============ */}
        <section className="v3-sec">
          <div className="v3-wrap">
            <div className="v3-head-row">
              <Head num="10" label="Perspective" title="Rishiraj Maheshwari, in the press." />
              <Link to="/perspective" className="v3-pill v3-pill-line" data-reveal><span>All articles</span><i><Arrow /></i></Link>
            </div>
            <ul className="v3-press" data-reveal="stagger">
              {PRESS.filter((p) => p.kind === 'press').slice(0, 7).map((p, k) => (
                <li key={p.url} className={k === 0 ? 'is-lead' : undefined}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    <span className="v3-press-art" data-drift><img src={pressImg(p) || `${MEDIA}/${PRESS_ART[k]}.jpg`} alt="" loading="lazy" width="1280" height="720" /></span>
                    <span className="v3-press-chip">{p.outlet}</span>
                    <span className="v3-press-body">
                      <span className="v3-press-date">{pressDate(p)}</span>
                      <span className="v3-press-title">{p.title}</span>
                      {k === 0 && p.quote && <span className="v3-press-quote">&ldquo;{p.quote}&rdquo;</span>}
                      {k === 0 && <span className="v3-press-note">{p.note}</span>}
                      <span className="v3-press-go">Read the article <Arrow /></span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="v3-sec v3-tint" id="faq">
          <div className="v3-wrap v3-faq">
            <Head num="11" label="Questions" title="Frequently asked." />
            <div className="v3-faq-list">
              {FAQS.map(({ q, a }, k) => (
                <details key={q} open={k === 0}>
                  <summary><h3>{q}</h3><i aria-hidden="true" /></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CLOSE ============ */}
        <section className="v3-close-sec">
          <div className="v3-wrap v3-wrap-wide">
            <div className="v3-close">
              <Clip name="close-sail" className="v3-cover" />
              <div className="v3-close-shade" aria-hidden="true" />
              <div className="v3-close-inner">
                <p className="v3-kicker v3-kicker-light" data-reveal><span>12</span>Begin</p>
                <h2 className="v3-close-title" data-split>Let&rsquo;s talk about the next twenty years.</h2>
                <div className="v3-close-rise"><RiseLine /></div>
                <div className="v3-close-row" data-reveal>
                  <Link to="/contact" className="v3-pill v3-pill-light"><span>Start a conversation</span><i><Arrow /></i></Link>
                  <a href={FIRM.phoneHref} className="v3-textlink v3-textlink-light">Call {FIRM.phone} <Arrow /></a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <V3Footer />
    </div>
  );
}

