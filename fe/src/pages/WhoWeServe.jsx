import { useLayoutEffect, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav/Nav';
import Footer from '../components/Footer/Footer';
import PageHero from '../components/page/PageHero';
import ClosingCta from '../components/page/ClosingCta';
import { useMotion } from '../motion/useMotion';
import { gsap, prefersReducedMotion } from '../motion/gsap';
import { SEGMENTS } from '../data/segments';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Each profile card pins in turn; the next slides over it while the one
// underneath settles back (scales down, dims). Plain stacked cards on
// phones and with reduced motion.
function useStack(rootRef) {
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 861px)', () => {
        const cards = gsap.utils.toArray(root.querySelectorAll('.ws-card'));
        cards.forEach((card, i) => {
          if (i === cards.length - 1) return;
          // explicit start: tweening a filter from "none" begins at brightness(0)
          gsap.fromTo(card.querySelector('.ws-card-inner'), { scale: 1, filter: 'brightness(1)' }, {
            scale: 0.92,
            filter: 'brightness(0.9)',
            ease: 'none',
            scrollTrigger: {
              trigger: cards[i + 1],
              start: 'top bottom',
              end: 'top 18%',
              scrub: true,
            },
          });
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);
}

export default function WhoWeServe() {
  const rootRef = useRef(null);
  useMotion(rootRef);
  useStack(rootRef);

  return (
    <div ref={rootRef}>
      <Nav overHero />

      <PageHero
        eyebrow="Who We Serve"
        lines={[<>Built around <em>your</em> balance sheet,</>, 'whatever shape it takes.']}
        lede="RISCH works with a small number of clients directly. These are the people we work with most often, not a checklist you need to fit."
      />

      <section className="ws-stack-sec">
        <div className="wrap">
          <ol className="ws-stack">
            {SEGMENTS.map((s, i) => (
              <li className="ws-card" key={s.title} style={{ '--i': i }}>
                <Link to="/contact" className="ws-card-inner" data-label="Get in touch">
                  <div className="ws-card-side">
                    <span className="ws-card-n">{String(i + 1).padStart(2, '0')}<small> / {String(SEGMENTS.length).padStart(2, '0')}</small></span>
                    <span className="ws-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                    </span>
                  </div>
                  <div className="ws-card-main">
                    <span className="ws-card-eyebrow">{s.eyebrow}</span>
                    <h2 className="ws-card-title">{s.title}</h2>
                    <p className="ws-card-body">{s.body}</p>
                    <span className="ws-card-cta">Start a conversation <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
          <p className="ws-motto">
            <span data-split>Every relationship is built on trust.</span>
            <span data-split><em>Every strategy is built for the long term.</em></span>
          </p>
        </div>
      </section>

      <ClosingCta
        eyebrow="Not Sure Where You Fit?"
        title="The risk profiler is a better starting point than a category."
        primary={{ to: '/risk-profiler', label: 'Take the risk profiler' }}
        secondary={{ to: '/contact', label: 'Get in touch' }}
      />

      <Footer />
    </div>
  );
}
