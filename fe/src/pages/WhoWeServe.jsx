import { Link } from 'react-router-dom';
import { PageShell, PageHero, CloseBand } from '../v3/page';
import { Arrow, MEDIA } from '../v3/ui';
import { SEGMENTS } from '../data/segments';

// One picture per client profile, in the order the segments are listed
// (sources listed in v3/sections.jsx).
const PICTURES = {
  'Business Owners': 'serve-business',
  'Entrepreneurs & Founders': 'serve-founder',
  'Private Clients & Families': 'serve-families',
  'NRIs & Global Indians': 'serve-nri',
  'Senior Executives & Professionals': 'serve-executive',
  'Family Offices': 'serve-office',
};

export default function WhoWeServe() {
  return (
    <PageShell>
      <PageHero
        kicker="Whom we serve"
        lines={[<>Built around <em>your</em> balance sheet,</>, 'whatever shape it takes.']}
        lede="RISCH works with a small number of clients directly. These are the people we work with most often, not a checklist you need to fit."
      />

      <section className="v3-sec">
        <div className="v3-wrap">
          <ol className="v3-profiles">
            {SEGMENTS.map((s, i) => (
              <li key={s.title} className="v3-profile">
                <figure className="v3-profile-pic" data-reveal>
                  <img src={`${MEDIA}/${PICTURES[s.title] || 'serve-office'}.jpg`} alt="" width="720" height="960" loading="lazy" data-parallax="0.1" />
                  <span className="v3-profile-n">{String(i + 1).padStart(2, '0')} <i>/</i> {String(SEGMENTS.length).padStart(2, '0')}</span>
                </figure>
                <div className="v3-profile-text">
                  <span className="v3-profile-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                  </span>
                  <p className="v3-profile-tag" data-reveal>{s.eyebrow}</p>
                  <h2 className="v3-profile-title" data-split>{s.title}</h2>
                  <p className="v3-lead" data-reveal>{s.body}</p>
                  <div data-reveal><Link to="/contact" className="v3-textlink">Start a conversation <Arrow /></Link></div>
                </div>
              </li>
            ))}
          </ol>
          <div className="v3-creed v3-creed-center">
            <p data-split>Every relationship is built on trust.</p>
            <p data-split><em>Every strategy is built for the long term.</em></p>
          </div>
        </div>
      </section>

      <CloseBand
        kicker="Not sure where you fit?"
        title="The risk profile is a better starting point than a category."
        primary={{ to: '/risk-profiler', label: 'Start Risk Profile' }}
        secondary={{ to: '/contact', label: 'Get in touch' }}
      />
    </PageShell>
  );
}
