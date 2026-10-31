import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell, PageHero, Head, CloseBand } from '../v3/page';
import { Arrow } from '../v3/ui';
import { PRESS, PRESS_OUTLETS, PRINT, outletKey, pressDate, pressImg } from '../data/press';
import coverJune from '../assets/press/bt-2024-06-23.jpg';
import coverMarch from '../assets/press/bt-2024-03-03.jpg';
import founderHeadshot from '../assets/founder-headshot.jpg';

const COVERS = [coverJune, coverMarch];
// The lead story: the newest piece that has its own image.
const LEAD = PRESS.find((p) => pressImg(p));
const REST = PRESS.filter((p) => p !== LEAD);
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'et', label: 'The Economic Times' },
  { key: 'bt', label: 'Business Today' },
  { key: 'mc', label: 'Moneycontrol' },
  { key: 'ms', label: 'Morningstar India' },
  { key: 'ani', label: 'ANI · The Tribune' },
];
const FIRST_YEAR = PRESS[PRESS.length - 1].date.slice(0, 4);

// Print editions first, then the lead story, then every piece in one
// consistent list that can be filtered by publication.
export default function Perspective() {
  const [filter, setFilter] = useState('all');
  const shown = useMemo(() => (filter === 'all' ? REST : PRESS.filter((p) => outletKey(p.outlet) === filter)), [filter]);
  const count = (k) => (k === 'all' ? PRESS.length : PRESS.filter((p) => outletKey(p.outlet) === k).length);

  return (
    <PageShell>
      <PageHero
        kicker="Perspective"
        lines={[<>Notes on risk, <em>not</em> noise.</>]}
        lede="Rishiraj Maheshwari’s writing, and his views as quoted in the financial press, on markets, mutual funds and how portfolios should be built."
        aside={(
          <>
            <div className="v3-ph-person">
              <img src={founderHeadshot} alt="" width="380" height="380" />
              <span><b>Rishiraj Maheshwari</b><small>Founder &amp; CEO, RISCH Wealth</small></span>
            </div>
            <p className="v3-ph-outlets is-ruled"><span>As featured in</span>{PRESS_OUTLETS.join(' · ')}</p>
          </>
        )}
      />

      {/* ============ IN PRINT ============ */}
      <section className="v3-sec">
        <div className="v3-wrap">
          <div className="v3-split">
            <Head num="01" label="Featured in print" title="In print, twice in 2024." />
            <ul className="v3-pstats" data-reveal="stagger">
              <li><b>{PRESS.length}</b><span>Articles and features</span></li>
              <li><b>{PRESS_OUTLETS.length}</b><span>Publications</span></li>
              <li><b>{FIRST_YEAR}</b><span>On the record since</span></li>
            </ul>
          </div>
          <div className="v3-spreads">
            {PRINT.map((p, i) => (
              <a key={p.edition} className="v3-spread" href={p.url} target="_blank" rel="noopener noreferrer" data-reveal>
                <span className="v3-spread-cover"><img src={COVERS[i]} alt={`Business Today, ${p.edition} edition`} width="640" height="900" loading="lazy" /></span>
                <span className="v3-spread-body">
                  <span className="v3-spread-kicker">Business Today · {p.edition}</span>
                  <span className="v3-spread-title">{p.cover}</span>
                  <q className="v3-spread-quote">{p.quote}</q>
                  <span className="v3-spread-by">Rishiraj Maheshwari, in this edition</span>
                  <span className="v3-spread-what">{p.what}</span>
                  <span className="v3-press-go">Read the article <Arrow /></span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LEAD + ALL COVERAGE ============ */}
      <section className="v3-sec v3-tint">
        <div className="v3-wrap">
          <Head num="02" label="On the record" title="Views on markets, as published." />

          {filter === 'all' && LEAD && (
            <a className="v3-plead" href={LEAD.url} target="_blank" rel="noopener noreferrer" data-reveal>
              <span className="v3-plead-art"><img src={pressImg(LEAD)} alt="" width="900" height="506" /></span>
              <span className="v3-plead-body">
                <Meta p={LEAD} />
                <span className="v3-plead-title">{LEAD.title}</span>
                {LEAD.quote && <q className="v3-plead-quote">{LEAD.quote}</q>}
                <span className="v3-article-note">{LEAD.note}</span>
                <span className="v3-press-go">Read the article <Arrow /></span>
              </span>
            </a>
          )}

          <div className="v3-clients-filters v3-filters-page v3-pfilters" role="group" aria-label="Filter by publication">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" className={filter === f.key ? 'is-on' : undefined} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}<small>{count(f.key)}</small>
              </button>
            ))}
          </div>

          <ul className="v3-plist" key={filter}>
            {shown.map((p, i) => (
              <li key={p.url} style={{ '--i': i }}>
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  <Thumb p={p} />
                  <span className="v3-plist-body">
                    <Meta p={p} />
                    <span className="v3-plist-title">{p.title}</span>
                    {p.quote ? <q className="v3-plist-quote">{p.quote}</q> : <span className="v3-plist-note">{p.note}</span>}
                  </span>
                  <span className="v3-plist-go" aria-hidden="true"><Arrow /></span>
                </a>
              </li>
            ))}
          </ul>

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

function Meta({ p }) {
  return (
    <span className="v3-pmeta">
      <span className="v3-press-chip v3-press-chip-static" data-outlet={outletKey(p.outlet)}>{p.outlet}</span>
      <span className="v3-press-date">{pressDate(p)}</span>
      {p.kind === 'article' && <span className="v3-pmeta-by">By Rishiraj</span>}
    </span>
  );
}

// The article's own image; where the outlet publishes none, a quiet cream
// tile with the publication's name, in keeping with the rest of the list.
function Thumb({ p }) {
  const img = pressImg(p);
  return (
    <span className="v3-plist-art" data-outlet={outletKey(p.outlet)}>
      {img ? <img src={img} alt="" loading="lazy" width="900" height="506" /> : <TopicArt title={p.title} />}
      {!img && <em>{p.outlet}</em>}
    </span>
  );
}

// Small drawings for pieces with no image of their own, picked by topic.
function TopicArt({ title }) {
  const t = title.toLowerCase();
  const S = (props) => <svg viewBox="0 0 120 70" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props} />;
  if (/allocation/.test(t)) return ( // a mix: donut
    <S><circle cx="60" cy="35" r="22" stroke="#EAD9C6" strokeWidth="10" /><circle cx="60" cy="35" r="22" stroke="#E36A1A" strokeWidth="10" strokeDasharray="76 139" transform="rotate(-90 60 35)" /><circle cx="60" cy="35" r="22" stroke="#C9A27E" strokeWidth="10" strokeDasharray="34 139" strokeDashoffset="-76" transform="rotate(-90 60 35)" /></S>);
  if (/valuation/.test(t)) return ( // price vs value
    <S><path d="M14 52 L34 40 L50 46 L70 22 L88 30 L106 16" stroke="#E36A1A" strokeWidth="3" /><path d="M14 44 H106" stroke="#C9A27E" strokeWidth="2" strokeDasharray="4 5" /></S>);
  if (/principles/.test(t)) return ( // seven steps
    <S>{[0, 1, 2, 3, 4, 5, 6].map((k) => <rect key={k} x={12 + k * 14} y={54 - k * 6} width="10" height={6 + k * 6} rx="2" fill={k === 6 ? '#E36A1A' : '#EAD9C6'} />)}</S>);
  if (/trail|sebi/.test(t)) return ( // steady trail over time
    <S><path d="M12 54 H108" stroke="#C9B9A6" strokeWidth="1.5" />{[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={16 + k * 15} y="34" width="9" height="20" rx="2" fill="#E36A1A" opacity={0.35 + k * 0.12} />)}</S>);
  return ( // relationships: two linked circles
    <S><circle cx="46" cy="35" r="17" stroke="#C9A27E" strokeWidth="3" /><circle cx="74" cy="35" r="17" stroke="#E36A1A" strokeWidth="3" /></S>);
}
