import { Link } from 'react-router-dom';
import { PageShell, PageHero, Head, CloseBand } from '../v3/page';
import { Arrow, BrandMark } from '../v3/ui';
import { HowWeWork } from '../v3/principles';
import founderOffice from '../assets/founder-office.jpg';
import kratikaPhoto from '../assets/kratika-maheshwari.jpg';
import { FIRM } from '../data/firm';

// "Independence" is avoided on purpose: RISCH is a distributor, and the
// AMFI code steers distributors away from calling themselves independent.
const HOW_WE_WORK = [
  { t: 'Ability before willingness', d: 'Capacity sets the boundary. Willingness never overrides it.',
    icon: <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" /> },
  { t: 'No proprietary product', d: 'No fund of our own to place. Recommendations align to the client, not a shelf.',
    icon: <><circle cx="12" cy="12" r="9" /><path d="M15 9l-2 6-6 2 2-6 6-2z" /></> },
  { t: 'Disclosure before commitment', d: 'Worst case shown before a rupee is funded, not after.',
    icon: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></> },
  { t: 'Bounded deviation', d: 'Any override is recorded, justified, and signed by both parties.',
    icon: <path d="M12 3v18M5 7l-3 6a3 3 0 0 0 6 0l-3-6zM19 7l-3 6a3 3 0 0 0 6 0l-3-6zM5 7h14M9 21h6" /> },
];

// Open architecture and bounded deviation are already in How we work, so
// they aren't repeated here.
const GOVERNANCE = [
  { t: '8-point diagnostic', d: 'Scored separately, every time.' },
  { t: 'Conflict walls', d: 'Managed separately.' },
];

// The two founders, shown by the same Person component. Text and roles are
// from RISCH's own profiles of them, reworded where needed for a distributor
// (no "independent", "fiduciary" or "advisory"; see firm.js). No dates are
// given for earlier roles, so none are shown.
const FOUNDER = {
  num: '01', label: 'The founder',
  name: 'Rishiraj Maheshwari', title: 'Founder & Chief Executive Officer',
  photo: founderOffice, photoW: 538, photoH: 632,
  statement: 'Wealth deserves a higher standard of stewardship.',
  body: [
    `Rishiraj founded RISCH Wealth in ${FIRM.foundedYear} on one conviction: wealth management must go beyond products and market cycles, and become a disciplined, enduring partnership built around the client’s interests.`,
    'Over two decades in India’s private banking and institutional wealth management, he has worked with promoters, corporate leaders and ultra-high-net-worth families on asset allocation, business liquidity and the passing of wealth between generations. At RISCH he leads the investment philosophy and multi-asset allocation: a clear view of risk, diversification, valuation discipline and a margin of safety.',
  ],
  facts: [['20+', 'years in private banking'], ['6', 'institutions'], [String(FIRM.foundedYear), 'founded RISCH']],
  links: [
    { href: 'https://www.linkedin.com/in/rishiraj-maheshwari-81240b5/', label: 'LinkedIn', pill: true },
    { href: FIRM.phoneHref, label: `Call ${FIRM.phone}` },
  ],
  history: `Before founding **RISCH** in ${FIRM.foundedYear}, Rishiraj spent two decades in private banking at **Nuvama**, **ICICI Securities**, **RBS**, **Edelweiss** and **Indiabulls**.`,
  career: [
    { firm: 'RISCH Wealth', role: 'Founder & Chief Executive Officer', where: `Bengaluru · since ${FIRM.foundedYear}`, now: true },
    { firm: 'Nuvama Private Wealth & Family Office', role: 'Vice President', where: 'Mumbai' },
    { firm: 'ICICI Securities', role: 'Senior Private Banker, Private Wealth Management', where: 'Bengaluru' },
    { firm: 'The Royal Bank of Scotland (RBS)', role: 'Wealth Management', where: 'Bengaluru' },
    { firm: 'Edelweiss Financial Services', role: 'Senior Relationship Manager', where: 'Bengaluru' },
    { firm: 'Indiabulls Securities', role: 'Relationship Manager', where: 'Bengaluru' },
  ],
  education: [
    { what: 'MBA, Marketing & Systems', where: 'Canara Bank School of Management Studies, Bangalore University', note: 'First Division' },
    { what: 'Bachelor of Computer Applications', where: 'Prestige Institute of Management & Research', note: 'First Division' },
  ],
  extra: {
    h: 'In his words',
    quote: 'Wealth management is not merely about choosing investments. It is about making considered decisions, managing risk with discipline and preserving the freedom to make choices across generations.',
  },
  after: { h: 'Beyond the boardroom', text: 'Badminton, golf, travel and soulful music; a lasting curiosity about global macroeconomics; community engagement and social service.' },
};

const COFOUNDER = {
  num: '02', label: 'The co-founder',
  name: 'Kratika Maheshwari', title: 'Co-Founder & Chief Client Experience Officer',
  photo: kratikaPhoto, photoW: 640, photoH: 800,
  statement: 'A decade with HNI clients.',
  body: [
    'Kratika leads the RISCH client experience end to end: relationship management, portfolio reviews, reporting and day-to-day service, so that every client relationship is proactive, transparent and personal.',
    'More than ten years in private banking at HDFC Bank, ICICI Securities and Kotak Securities, managing HNI portfolios and cross-border relationships, taught her that how a portfolio is experienced matters as much as how it is built: the cadence of reviews, the clarity of reporting and the speed of execution.',
  ],
  facts: [['10+', 'years in private banking'], ['3', 'private banks'], ['MBA', 'in Finance']],
  links: [{ to: '/contact', label: 'Start a conversation' }],
  history: 'Before co-founding **RISCH**, Kratika spent more than ten years in private banking at **HDFC Bank**, **ICICI Securities** and **Kotak Securities**.',
  career: [
    { firm: 'RISCH Wealth', role: 'Co-Founder & Chief Client Experience Officer', where: 'Bengaluru', now: true },
    { firm: 'HDFC Bank Global Private Clients', role: 'Private Banking' },
    { firm: 'ICICI Securities', role: 'Private Wealth' },
    { firm: 'Kotak Securities', role: 'Private Banking' },
  ],
  education: [
    { what: 'MBA, Finance', where: 'Christ University' },
    { what: 'BBM', where: 'Center for Management Studies, Jain (Deemed-to-be University)' },
    { what: 'Schooling', where: 'Bishop Cotton Girls’ School, Bengaluru' },
  ],
  extra: { h: 'What she leads', list: ['Relationship management', 'Portfolio reviews', 'Client reporting', 'Day-to-day service'] },
};

// One founder: the portrait and introduction, then their experience as a
// timeline with education and one more note beside it.
function Person({ p, tint = false }) {
  return (
    <section className={'v3-sec' + (tint ? ' v3-tint' : '')} id={p.num === '02' ? 'team' : undefined}>
      <div className="v3-wrap">
        <div className="v3-person">
          <figure className="v3-person-photo" data-reveal>
            <img src={p.photo} alt={`${p.name}, ${p.title}, RISCH Wealth`} width={p.photoW} height={p.photoH} loading={p.num === '01' ? undefined : 'lazy'} />
          </figure>
          <div className="v3-person-intro">
            <p className="v3-kicker" data-reveal><span>{p.num}</span>{p.label}</p>
            <h2 className="v3-person-name" data-split>{p.name}</h2>
            <p className="v3-person-title" data-reveal>{p.title}</p>
            <p className="v3-person-statement" data-reveal>{p.statement}</p>
            {p.body.map((t) => <p key={t.slice(0, 24)} className="v3-body" data-reveal>{t}</p>)}
            <dl className="v3-person-facts" data-reveal="stagger">
              {p.facts.map(([n, l]) => <div key={l}><dt>{n}</dt><dd>{l}</dd></div>)}
            </dl>
            <div className="v3-row-actions" data-reveal>
              {p.links.map((l) => (l.to
                ? <Link key={l.label} to={l.to} className="v3-textlink">{l.label} <Arrow /></Link>
                : l.pill
                  ? <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="v3-pill v3-pill-dark"><span>{l.label}</span><i><Arrow /></i></a>
                  : <a key={l.label} href={l.href} className="v3-textlink">{l.label} <Arrow /></a>))}
            </div>
          </div>
        </div>

        <div className="v3-exp">
          <div>
            <p className="v3-exp-h" data-reveal>Experience</p>
            <p className="v3-exp-sent" data-reveal>
              {p.history.split(/\*\*(.+?)\*\*/).map((t, k) => (k % 2 ? <b key={k}>{t}</b> : t))}
            </p>
            <div className="v3-exp-edurow" data-reveal>
              <p className="v3-exp-h">Education</p>
              <ul className="v3-exp-edu">
                {p.education.map((e) => <li key={e.what}><b>{e.what}</b><span>{e.where}</span>{e.note && <small>{e.note}</small>}</li>)}
              </ul>
            </div>
          </div>
          <aside className="v3-exp-side" data-reveal>
            <div>
              <p className="v3-exp-h">{p.extra.h}</p>
              {p.extra.quote
                ? <blockquote className="v3-exp-quote">{p.extra.quote}</blockquote>
                : <ul className="v3-exp-tags">{p.extra.list.map((t) => <li key={t}>{t}</li>)}</ul>}
            </div>
            {p.after && (
              <div>
                <p className="v3-exp-h">{p.after.h}</p>
                <p className="v3-exp-note">{p.after.text}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <PageShell>
      <PageHero
        kicker="The Firm"
        lines={['Clear thinking about', <em key="e">your money.</em>]}
        lede={`A Bengaluru wealth firm, started in ${FIRM.foundedYear} by a career private banker. Fewer products, clear reasons for each one, and one person you can call.`}
      />

      <Person p={FOUNDER} />
      <Person p={COFOUNDER} tint />

      {/* ============ HOW WE WORK ============ */}
      <section className="v3-sec">
        <div className="v3-wrap">
          <Head num="03" label="How we work" title="Four principles, applied the same way every time." />
          <HowWeWork items={HOW_WE_WORK} />
        </div>
      </section>

      {/* ============ GOVERNANCE ============ */}
      <section className="v3-sec v3-sec-tight">
        <div className="v3-wrap">
          <div className="v3-gov">
            <Head num="04" label="Governance & standing" title="Written down, clear and accountable." />
            <ol className="v3-ledger" data-reveal="stagger">
              {GOVERNANCE.map((g, i) => (
                <li key={g.t}>
                  <span>0{i + 1}</span>
                  <b>{g.t}</b>
                  <p>{g.d}</p>
                </li>
              ))}
            </ol>
            <div className="v3-reg" data-reveal>
              <div>
                <p>{FIRM.registrationNote}</p>
                <p className="v3-reg-role">{FIRM.roleNote}</p>
              </div>
              <p className="v3-reg-ids">{FIRM.registrations.map((r) => <span key={r.id}>{r.id}</span>)}</p>
            </div>
          </div>
        </div>
      </section>

      <CloseBand
        kicker="Next step"
        title="Start with your risk. We’ll take it from there."
        primary={{ to: '/risk-profiler', label: 'Start Risk Profile' }}
        secondary={{ to: '/contact', label: 'Get in touch' }}
      />
    </PageShell>
  );
}
