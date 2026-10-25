import { Link } from 'react-router-dom';
import { PageShell, PageHero, Head, CloseBand } from '../v3/page';
import { Arrow, MEDIA } from '../v3/ui';
import { PRESS, PRESS_OUTLETS, pressDate, pressYear } from '../data/press';

// His own writing leads; the press follows, grouped by year, newest first.
const ARTICLES = PRESS.filter((p) => p.kind === 'article');
const COVERAGE = PRESS.filter((p) => p.kind === 'press');
const YEARS = [...new Set(COVERAGE.map(pressYear))];
// Editorial pictures for the cards (illustrative, not from the articles).
const ART = ['wing-clouds', 'sea-plane', 'reel-horizon', 'sky-sun', 'resort-aerial', 'stage-course', 'wall-5', 'close-sail'];

export default function Perspective() {
  return (
    <PageShell>
      <PageHero
        kicker="Perspective"
        lines={[<>Notes on risk, <em>not</em> noise.</>]}
        lede="Rishiraj Maheshwari’s writing, and his views as quoted in the financial press, on markets, mutual funds and how portfolios should be built."
        aside={<p className="v3-ph-outlets"><span>As featured in</span>{PRESS_OUTLETS.join(' · ')}</p>}
      />

      {ARTICLES.length > 0 && (
        <section className="v3-sec">
          <div className="v3-wrap">
            <Head num="01" label="By Rishiraj Maheshwari" title="In his own words." />
            {ARTICLES.map((a, i) => (
              <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="v3-article" data-reveal>
                <span className="v3-article-art"><img src={`${MEDIA}/${ART[i % ART.length]}.jpg`} alt="" loading="lazy" width="1280" height="720" /></span>
                <span className="v3-article-body">
                  <span className="v3-press-chip v3-press-chip-static">{a.outlet}</span>
                  <span className="v3-press-date">{pressDate(a)}</span>
                  <span className="v3-article-title">{a.title}</span>
                  <span className="v3-article-note">{a.note}</span>
                  <span className="v3-press-go">Read on {a.outlet} <Arrow /></span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="v3-sec v3-tint">
        <div className="v3-wrap">
          <div className="v3-split">
            <Head num="02" label="In the press" title="Views on markets, on the record." />
            <p className="v3-lead v3-split-side" data-reveal>Comment from RISCH&rsquo;s founder in Business Today, ANI and others since {COVERAGE.length ? pressYear(COVERAGE[COVERAGE.length - 1]) : ''}. Each quote is as published; follow the link for the full article.</p>
          </div>

          {YEARS.map((year) => (
            <div className="v3-year" key={year}>
              <h3 className="v3-year-n" data-reveal>{year}</h3>
              <ul className="v3-coverage" data-reveal="stagger">
                {COVERAGE.filter((p) => pressYear(p) === year).map((p) => (
                  <li key={p.url}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      <span className="v3-coverage-meta"><span className="v3-press-chip v3-press-chip-static">{p.outlet}</span><span className="v3-press-date">{pressDate(p)}</span></span>
                      <span className="v3-coverage-title">{p.title}</span>
                      {p.quote && <q className="v3-coverage-quote">{p.quote}</q>}
                      <span className="v3-coverage-note">{p.note}</span>
                      <span className="v3-press-go">Read the article <Arrow /></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="v3-fine">Views expressed in the press reflect market conditions at the time of publication and are not investment advice or a recommendation to buy or sell any security. See <Link to="/disclosure">Disclosures</Link>.</p>
        </div>
      </section>

      <CloseBand
        kicker="Prefer a direct answer?"
        title="Talk to us about your own portfolio instead."
        primary={{ to: '/contact', label: 'Start a conversation' }}
        secondary={{ to: '/risk-profiler', label: 'Start Risk Profile' }}
      />
    </PageShell>
  );
}
