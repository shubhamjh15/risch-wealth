import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav/Nav';
import Footer from '../components/Footer/Footer';
import PageHero from '../components/page/PageHero';
import ClosingCta from '../components/page/ClosingCta';
import { useMotion } from '../motion/useMotion';
import { TESTIMONIALS, TESTIMONIAL_GROUPS } from '../data/testimonials';
import skyline from '../assets/testimonials-skyline.webp';
import skyline2x from '../assets/testimonials-skyline-2x.webp';

const ALL = 'All profiles';
const LEAD = TESTIMONIALS.find((t) => t.lead) ?? TESTIMONIALS[0];
const REST = TESTIMONIALS.filter((t) => t !== LEAD);

// Only offer a filter for profiles that actually have an account to show.
const PROFILES = TESTIMONIAL_GROUPS.filter((g) => REST.some((t) => t.group === g));
const FILTERS = [ALL, ...PROFILES];
// Counted once here rather than per chip on every render.
const COUNTS = new Map(FILTERS.map((g) => [g, g === ALL ? REST.length : REST.filter((t) => t.group === g).length]));

// A client's photograph when one has been supplied and cleared, otherwise
// their monogram. Both sit on the same accent disc, so the two mix cleanly.
const Portrait = ({ person }) => (
  <span className="ts-portrait" aria-hidden="true">
    {person.photo
      ? <img src={person.photo} alt="" loading="lazy" decoding="async" />
      : <span className="ts-monogram">{person.initial}</span>}
  </span>
);

const Attribution = ({ person }) => (
  <figcaption className="ts-by">
    <Portrait person={person} />
    <span className="ts-who">
      <span className="ts-sign">{person.name}</span>
      {(person.credentials ?? [person.role]).map((line) => (
        <span className="ts-cred" key={line}>{line}</span>
      ))}
      {person.place && <span className="ts-place">{person.place}</span>}
    </span>
  </figcaption>
);

export default function Testimonials() {
  const [filter, setFilter] = useState(ALL);
  const shown = useMemo(
    () => (filter === ALL ? REST : REST.filter((t) => t.group === filter)),
    [filter],
  );
  const rootRef = useRef(null);
  useMotion(rootRef);

  return (
    <div ref={rootRef}>
      <Nav />

      <PageHero
        eyebrow="In our clients&rsquo; words"
        lines={['Entrusted with', <em key="e">a lifetime&rsquo;s work.</em>]}
        lede="Business owners, founders, CXOs, doctors, families, global Indians and family offices. Different balance sheets, one method, risk understood first, then a portfolio built around it."
      />

      <section className="pg-sec ts2-lead-sec">
        <div className="wrap ts2-lead">
          {/* skyline at dusk: a global-city view whose warm sky sits with the ivory palette */}
          <div className="pg-photo ts2-photo" data-reveal aria-hidden="true">
            <img src={skyline} srcSet={`${skyline} 1x, ${skyline2x} 2x`} alt="" width="300" height="898" loading="lazy" data-parallax="0.14" />
          </div>
          <figure className="ts2-featured">
            <span className="ts2-mark" aria-hidden="true">&ldquo;</span>
            <blockquote data-split>{LEAD.quote}</blockquote>
            <div data-reveal><Attribution person={LEAD} /></div>
          </figure>
        </div>
      </section>

      <section className="pg-sec ts2-all">
        <div className="wrap">
          <div className="pg-head">
            <div>
              <p className="eyebrow" data-reveal>Client accounts</p>
              <h2 className="h-h2" data-split>Different balance sheets, <em>one method.</em></h2>
            </div>
          </div>

          {/* never gated behind the scroll-reveal: it must always be usable */}
          <div className="ts-filter ts2-filter" role="group" aria-label="Filter accounts by client profile">
            {FILTERS.map((g) => (
              <button
                key={g}
                type="button"
                className={'ts-chip' + (filter === g ? ' is-on' : '')}
                aria-pressed={filter === g}
                onClick={() => setFilter(g)}
              >
                {g}
                <span className="ts-chip-n">{COUNTS.get(g)}</span>
              </button>
            ))}
          </div>

          {/* keyed on the filter so the cards animate in again on each change */}
          <div className="ts2-grid" key={filter}>
            {shown.map((t, i) => (
              <figure className="ts2-card" key={t.name} style={{ '--i': i }}>
                <blockquote>{t.quote}</blockquote>
                <Attribution person={t} />
              </figure>
            ))}
          </div>

          <p className="ts-note ts2-note">
            Testimonials reflect the experience of individual clients and are not indicative of
            future results or a guarantee of any outcome. Names are shortened and portraits are
            published only with the client&rsquo;s permission. See <Link to="/disclosure">Disclosures</Link>.
          </p>
        </div>
      </section>

      <ClosingCta
        eyebrow="Start A Conversation"
        title="Your portfolio deserves a considered second opinion."
        primary={{ to: '/contact', label: 'Start a conversation' }}
        secondary={{ to: '/risk-profiler', label: 'Take the risk profiler' }}
      />

      <Footer />
    </div>
  );
}
