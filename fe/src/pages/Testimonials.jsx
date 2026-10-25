import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell, PageHero, Head, CloseBand } from '../v3/page';
import { TESTIMONIALS, TESTIMONIAL_GROUPS } from '../data/testimonials';

const ALL = 'All profiles';
const LEAD = TESTIMONIALS.find((t) => t.lead) ?? TESTIMONIALS[0];
// Accounts with a portrait first, then monograms, each in data-file order.
const REST = [...TESTIMONIALS.filter((t) => t !== LEAD && t.photo), ...TESTIMONIALS.filter((t) => t !== LEAD && !t.photo)];

// Only offer a filter for profiles that actually have an account to show.
const PROFILES = TESTIMONIAL_GROUPS.filter((g) => REST.some((t) => t.group === g));
const FILTERS = [ALL, ...PROFILES];
const COUNTS = new Map(FILTERS.map((g) => [g, g === ALL ? REST.length : REST.filter((t) => t.group === g).length]));

function Who({ t }) {
  return (
    <div className="v3-quote-who">
      <b>{t.name}</b>
      <span>{(t.credentials ?? [t.role]).join(', ')}</span>
      {t.place && <small>{t.place}</small>}
    </div>
  );
}

export default function Testimonials() {
  const [filter, setFilter] = useState(ALL);
  const shown = useMemo(() => (filter === ALL ? REST : REST.filter((t) => t.group === filter)), [filter]);

  return (
    <PageShell>
      <PageHero
        kicker="In our clients’ words"
        lines={['Entrusted with', <em key="e">a lifetime’s work.</em>]}
        lede="Business owners, founders, CXOs, doctors, families, global Indians and family offices. Different balance sheets, one method: risk understood first, then a portfolio built around it."
      />

      {/* ============ FEATURED ============ */}
      <section className="v3-sec">
        <div className="v3-wrap">
          <figure className="v3-featured">
            <div className="v3-featured-photo" data-reveal>
              {LEAD.photo
                ? <img src={LEAD.photo} alt={LEAD.name} width="400" height="400" />
                : <span className="v3-client-mono">{LEAD.initial}</span>}
              <span className="v3-client-group">{LEAD.group}</span>
            </div>
            <div className="v3-featured-text">
              <span className="v3-featured-mark" aria-hidden="true">&ldquo;</span>
              <blockquote data-split>{LEAD.quote}</blockquote>
              <figcaption data-reveal><Who t={LEAD} /></figcaption>
            </div>
          </figure>
        </div>
      </section>

      {/* ============ ALL ACCOUNTS ============ */}
      <section className="v3-sec v3-tint">
        <div className="v3-wrap">
          <Head num="01" label="Client accounts" title="Different balance sheets, one method." />
          {/* never gated behind the scroll reveal: it must always be usable */}
          <div className="v3-clients-filters v3-filters-page" role="group" aria-label="Filter accounts by client profile">
            {FILTERS.map((g) => (
              <button key={g} type="button" className={filter === g ? 'is-on' : undefined} aria-pressed={filter === g} onClick={() => setFilter(g)}>
                {g}<small>{COUNTS.get(g)}</small>
              </button>
            ))}
          </div>

          {/* keyed on the filter so the cards animate in again on each change */}
          <ul className="v3-quotes" key={filter}>
            {shown.map((t, i) => (
              <li className="v3-quote" key={t.name + t.quote.slice(0, 12)} style={{ '--i': i }}>
                <div className="v3-quote-head">
                  {t.photo
                    ? <img src={t.photo} alt="" width="96" height="96" loading="lazy" />
                    : <span className="v3-quote-mono" aria-hidden="true">{t.initial}</span>}
                  <span className="v3-quote-group">{t.group}</span>
                </div>
                <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                <Who t={t} />
              </li>
            ))}
          </ul>

          <p className="v3-fine">
            Testimonials reflect the experience of individual clients and are not indicative of
            future results or a guarantee of any outcome. Names are shortened and portraits are
            published only with the client&rsquo;s permission. See <Link to="/disclosure">Disclosures</Link>.
          </p>
        </div>
      </section>

      <CloseBand
        kicker="Start a conversation"
        title="Your portfolio deserves a considered second opinion."
        primary={{ to: '/contact', label: 'Start a conversation' }}
        secondary={{ to: '/risk-profiler', label: 'Start Risk Profile' }}
      />
    </PageShell>
  );
}
