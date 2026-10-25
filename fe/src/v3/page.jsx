import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import V3Nav from './V3Nav';
import V3Footer from './V3Footer';
import { useSmoothScroll } from './smooth';
import { Arrow, Clip, RiseLine, StillMedia } from './ui';
import { useMotion } from '../motion/useMotion';
import { ScrollTrigger } from '../motion/gsap';

// The kit every inner page is built from, so the whole site reads as one:
// the shell (nav, footer, motion), two kinds of opening (an editorial one
// over a footage frame, or a quiet ivory one), section headings, and the
// closing band.

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Nav, footer, scroll motion (data-reveal / data-split / …, see
// motion/useMotion.js) and, on content pages, smooth scrolling. Media on
// these pages is still (StillMedia); only the closing band plays footage. Forms and
// tools pass smooth={false} so native scrolling and focus behave as usual.
//   solid   start the nav frosted (pages that open on ivory)
export function PageShell({ children, solid = false, smooth = true, className = '' }) {
  const rootRef = useRef(null);
  useSmoothScroll(smooth);
  useMotion(rootRef);
  useIsoLayoutEffect(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return (
    <StillMedia.Provider value>
      <div ref={rootRef} className={`v3 ${className}`.trim()}>
        <V3Nav solid={solid} />
        <main>{children}</main>
        <V3Footer />
      </div>
    </StillMedia.Provider>
  );
}

// The opening of a content page: an editorial header on the page ground,
// the headline rising line by line (CSS, so it plays before any script),
// with the intro, actions and an optional card (`aside`) beside it.
//   lines    headline lines; <em> sets an accent word
export function PageHero({ kicker, lines, lede, actions, aside }) {
  return (
    <header className="v3-ph">
      <div className="v3-wrap v3-ph-top">
        <div className="v3-ph-copy">
          {kicker && <p className="v3-kicker v3-ph-in" style={{ '--d': '.05s' }}><span>RISCH</span>{kicker}</p>}
          <h1 className="v3-ph-title">
            {lines.map((line, i) => (
              <span className="v3-ph-l" key={i}><span style={{ '--d': `${0.12 + i * 0.1}s` }}>{line}</span></span>
            ))}
          </h1>
        </div>
        <div className="v3-ph-side">
          <div className="v3-ph-rise v3-ph-in" style={{ '--d': '.4s' }}><RiseLine /></div>
          {lede && <p className="v3-ph-lede v3-ph-in" style={{ '--d': '.45s' }}>{lede}</p>}
          {actions && <div className="v3-ph-actions v3-ph-in" style={{ '--d': '.55s' }}>{actions}</div>}
          {aside && <div className="v3-ph-aside v3-ph-in" style={{ '--d': '.65s' }}>{aside}</div>}
        </div>
      </div>
    </header>
  );
}

// A quiet opening on ivory, for pages that are mostly a form or a document.
export function LightHero({ kicker, lines, lede, children }) {
  return (
    <header className="v3-lh">
      <div className="v3-wrap">
        {kicker && <p className="v3-kicker v3-ph-in" style={{ '--d': '.05s' }}><span>RISCH</span>{kicker}</p>}
        <h1 className="v3-lh-title">
          {lines.map((line, i) => (
            <span className="v3-ph-l" key={i}><span style={{ '--d': `${0.12 + i * 0.1}s` }}>{line}</span></span>
          ))}
        </h1>
        <div className="v3-lh-rise v3-ph-in" style={{ '--d': '.4s' }}><RiseLine /></div>
        {lede && <p className="v3-lh-lede v3-ph-in" style={{ '--d': '.45s' }}>{lede}</p>}
        {children}
      </div>
    </header>
  );
}

// A section's heading: a numbered kicker, the title, an optional sub line.
export function Head({ num, label, title, children, center = false, light = false }) {
  return (
    <div className={'v3-head' + (center ? ' is-center' : '')}>
      <p className={'v3-kicker' + (light ? '' : '')} data-reveal><span>{num}</span>{label}</p>
      <h2 className="v3-h2" data-split>{title}</h2>
      {children}
    </div>
  );
}

// The closing band at the foot of a page, over the sailboat at sunset (the
// one clip the inner pages play).
//   primary / secondary   { to, label }
export function CloseBand({ kicker = 'Next step', title, lede, primary, secondary, clip = 'close-sail' }) {
  return (
    <section className="v3-close-sec">
      <div className="v3-wrap v3-wrap-wide">
        <div className="v3-close">
          <Clip name={clip} className="v3-cover" live />
          <div className="v3-close-shade" aria-hidden="true" />
          <div className="v3-close-inner">
            <p className="v3-kicker v3-kicker-light" data-reveal><span>RISCH</span>{kicker}</p>
            <h2 className="v3-close-title v3-close-title-sm" data-split>{title}</h2>
            {lede && <p className="v3-close-lede" data-reveal>{lede}</p>}
            <div className="v3-close-rise" data-draw><RiseLine /></div>
            <div className="v3-close-row" data-reveal>
              <Link to={primary.to} className="v3-pill v3-pill-light"><span>{primary.label}</span><i><Arrow /></i></Link>
              {secondary && <Link to={secondary.to} className="v3-textlink v3-textlink-light">{secondary.label} <Arrow /></Link>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

