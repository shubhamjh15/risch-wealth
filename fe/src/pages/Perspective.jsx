import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav/Nav';
import Footer from '../components/Footer/Footer';
import PageHero from '../components/page/PageHero';
import ClosingCta from '../components/page/ClosingCta';
import { useMotion } from '../motion/useMotion';
import { PRESS, PRESS_OUTLETS, pressDate, pressYear } from '../data/press';

const External = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3.5 2.5h6v6M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.3" /></svg>
);

// His own writing leads; the press follows, grouped by year, newest first.
const ARTICLES = PRESS.filter((p) => p.kind === 'article');
const COVERAGE = PRESS.filter((p) => p.kind === 'press');
const YEARS = [...new Set(COVERAGE.map(pressYear))];

export default function Perspective() {
  const rootRef = useRef(null);
  useMotion(rootRef);

  return (
    <div ref={rootRef}>
      <Nav overHero />

      <PageHero
        eyebrow="Perspective"
        lines={[<>Notes on risk, <em>not</em> noise.</>]}
        lede="Rishiraj Maheshwari’s writing, and his views as quoted in the financial press, on markets, mutual funds and how portfolios should be built."
        aside={<p className="pv-outlets">As featured in <span>{PRESS_OUTLETS.join(' · ')}</span></p>}
      />

      {ARTICLES.length > 0 && (
        <section className="pg-sec pg-tint">
          <div className="wrap">
            <p className="eyebrow" data-reveal>By Rishiraj Maheshwari</p>
            {ARTICLES.map((a) => (
              <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="pv-feature" data-reveal>
                <span className="pv-feature-meta">
                  <span>{a.outlet}</span>
                  <span>{pressDate(a)}</span>
                </span>
                <span className="pv-feature-title">{a.title}</span>
                <span className="pv-feature-note">{a.note}</span>
                <span className="pv-read">Read on {a.outlet} <External /></span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="pg-sec">
        <div className="wrap">
          <div className="pg-head">
            <div>
              <p className="eyebrow" data-reveal>In the press</p>
              <h2 className="h-h2" data-split>Views on markets, <em>on the record.</em></h2>
            </div>
            <p className="lede" data-reveal>Comment from RISCH&rsquo;s founder in Business Today, ANI and others since {COVERAGE.length ? pressYear(COVERAGE[COVERAGE.length - 1]) : ''}. Each quote is as published; follow the link for the full article.</p>
          </div>

          {YEARS.map((year) => (
            <div className="pv-year" key={year}>
              <h3 className="pv-year-n" data-reveal>{year}</h3>
              <ul className="pv-list" data-reveal="stagger">
                {COVERAGE.filter((p) => pressYear(p) === year).map((p) => (
                  <li key={p.url}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="pv-item">
                      <span className="pv-item-meta">
                        <span className="pv-tag">{p.outlet}</span>
                        <span className="pv-date">{pressDate(p)}</span>
                      </span>
                      <span className="pv-item-main">
                        <span className="pv-title">{p.title}</span>
                        {p.quote && <q className="pv-quote">{p.quote}</q>}
                        <span className="pv-excerpt">{p.note}</span>
                      </span>
                      <span className="pv-arrow" aria-hidden="true"><External /></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="pv-disclaimer">Views expressed in the press reflect market conditions at the time of publication and are not investment advice or a recommendation to buy or sell any security. See <Link to="/disclosure">Disclosures</Link>.</p>
        </div>
      </section>

      <ClosingCta
        eyebrow="Prefer A Direct Answer?"
        title="Talk to us about your own portfolio instead."
        primary={{ to: '/risk-profiler', label: 'Take the risk profiler' }}
        secondary={{ to: '/contact', label: 'Get in touch' }}
      />

      <Footer />
    </div>
  );
}
