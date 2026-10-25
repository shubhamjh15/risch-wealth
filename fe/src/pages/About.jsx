import { PageShell, PageHero, Head, CloseBand } from '../v3/page';
import { Arrow } from '../v3/ui';
import { HowWeWork } from '../v3/principles';
import founderOffice from '../assets/founder-office.jpg';
import founderHeadshot from '../assets/founder-headshot.jpg';
import kratikaPhoto from '../assets/kratika-maheshwari.jpg';
import { FIRM } from '../data/firm';

const Svg = ({ children, sw = 1.5 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

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

const GOVERNANCE = [
  { t: 'Open architecture', d: 'No proprietary product.', icon: <><circle cx="12" cy="12" r="9" /><path d="M15 9l-2 6-6 2 2-6 6-2z" /></> },
  { t: '8-point diagnostic', d: 'Scored separately, every time.', icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></> },
  { t: 'Bounded deviation', d: 'Jointly signed, always.', icon: <path d="M12 3v18M5 7l-3 6a3 3 0 0 0 6 0l-3-6zM19 7l-3 6a3 3 0 0 0 6 0l-3-6zM5 7h14M9 21h6" /> },
  { t: 'Conflict walls', d: 'Managed separately.', icon: <><rect x="4" y="4" width="7" height="7" rx="1.2" /><rect x="13" y="4" width="7" height="7" rx="1.2" /><rect x="4" y="13" width="7" height="7" rx="1.2" /><rect x="13" y="13" width="7" height="7" rx="1.2" /></> },
];

// The founder's career, as RISCH sets it out (no dates are given for the
// earlier roles, so none are shown).
const TIMELINE = [
  { label: 'Current', t: 'Founder & CEO', d: `RISCH Wealth Private Limited · Bengaluru · Since ${FIRM.foundedYear}`, now: true },
  { label: 'Previously', t: 'Edelweiss Financial Services', d: 'Mumbai' },
  { t: 'Senior Private Banker', d: 'ICICI Securities · Bengaluru' },
  { t: 'Assistant Vice President, Private Wealth', d: 'Unicon Investment Solutions · Bengaluru' },
  { t: 'Relationship Manager', d: 'Indiabulls Securities' },
  { label: 'Education', t: 'MBA, Marketing & Systems', d: 'Canara Bank School of Management Studies', extra: ['BCA', 'DAVV University'] },
];

// His own words in the press, verbatim (Morningstar India, 30 August 2019).
const ON_RECORD = {
  quote: 'I don’t believe in pushing products. It is all about maintaining relationships.',
  source: 'Morningstar India, 2019',
  url: 'https://morningstar.in/posts/54540/adviser-gung-ho-outsourcing-investment-management.aspx',
};

export default function About() {
  return (
    <PageShell>
      <PageHero
        kicker="The Firm"
        lines={['Built for people who ask', <><em>why</em>, not just how much.</>]}
        lede={`A Bengaluru private wealth practice, founded in ${FIRM.foundedYear} by a career private banker, for clients who want fewer products, clearer reasoning and one accountable relationship.`}
        aside={(
          <div className="v3-ph-person">
            <img src={founderHeadshot} alt="" width="380" height="380" />
            <span><b>Rishiraj Maheshwari</b><small>Founder &amp; CEO · two decades in private banking</small></span>
          </div>
        )}
      />

      {/* ============ THE FOUNDER ============ */}
      <section className="v3-sec">
        <div className="v3-wrap v3-founder">
          <figure className="v3-founder-photo" data-reveal>
            <img src={founderOffice} alt="Rishiraj Maheshwari, Founder & CEO of RISCH Wealth" width="538" height="632" />
            <figcaption><b>Rishiraj Maheshwari</b><span>Founder &amp; CEO</span></figcaption>
          </figure>
          <div className="v3-founder-text">
            <p className="v3-kicker" data-reveal><span>01</span>The founder</p>
            <h2 className="v3-h2" data-split>Two decades in private banking.</h2>
            <p className="v3-lead" data-reveal>Rishiraj founded RISCH after more than two decades in private banking, most recently at Edelweiss Financial Services, and before that as a Senior Private Banker at ICICI Securities.</p>
            <p className="v3-body" data-reveal>That career is why RISCH is built the way it is: risk understood first, in a documented and repeatable way, before a single recommendation is made.</p>
            <ul className="v3-chips" data-reveal="stagger">
              <li><Svg><path d="M2 9l10-5 10 5-10 5-10-5z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></Svg>MBA</li>
              <li><Svg><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 12h18" /></Svg>20+ years</li>
              <li><Svg><path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.4" /></Svg>Bengaluru</li>
            </ul>
            <a className="v3-record" href={ON_RECORD.url} target="_blank" rel="noopener noreferrer" data-reveal>
              <span>On record</span>
              <q>{ON_RECORD.quote}</q>
              <small>{ON_RECORD.source} <Arrow /></small>
            </a>
            <div className="v3-row-actions" data-reveal>
              <a href="https://www.linkedin.com/in/rishiraj-maheshwari-81240b5/" target="_blank" rel="noopener noreferrer" className="v3-pill v3-pill-dark"><span>LinkedIn</span><i><Arrow /></i></a>
              <a href={FIRM.phoneHref} className="v3-textlink">Call {FIRM.phone} <Arrow /></a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ABOUT RISCH + CREED ============ */}
      <section className="v3-sec v3-tint">
        <div className="v3-wrap">
          <div className="v3-split">
            <Head num="02" label="About RISCH" title="Built from private banking. Designed around the client." />
            <div className="v3-split-side" data-reveal>
              <p className="v3-lead">RISCH was founded in {FIRM.foundedYear} by Rishiraj Maheshwari, after a career working with wealthy individuals and families at some of India&rsquo;s best-known financial institutions.</p>
              <p className="v3-body">Today, RISCH works with a select group of clients who want a more disciplined, personal approach to their wealth: fewer products, clearer reasoning, and one accountable relationship.</p>
            </div>
          </div>
          <div className="v3-creed">
            <p data-split>Understand the client.</p>
            <p data-split>Build around the client.</p>
            <p data-split><em>Stay accountable to the client.</em></p>
          </div>
        </div>
      </section>

      {/* ============ EXPERIENCE ============ */}
      <section className="v3-sec">
        <div className="v3-wrap">
          <div className="v3-split">
            <Head num="03" label="Experience" title="Two decades across India’s leading wealth institutions." />
            <p className="v3-lead v3-split-side" data-reveal>Private banking and family-office work at ICICI Securities and Edelweiss, before founding RISCH in {FIRM.foundedYear}.</p>
          </div>
          <ol className="v3-tl">
            <span className="v3-tl-rail" aria-hidden="true"><i data-scrub-line /></span>
            {TIMELINE.map((x) => (
              <li key={x.t} className={x.now ? 'is-now' : undefined} data-reveal>
                <span className="v3-tl-label">{x.label || ''}</span>
                <span className="v3-tl-dot" aria-hidden="true" />
                <div>
                  <h3>{x.t}</h3>
                  <p>{x.d}</p>
                  {x.extra && <><h3 className="v3-tl-second">{x.extra[0]}</h3><p>{x.extra[1]}</p></>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ LEADERSHIP ============ */}
      <section className="v3-sec v3-tint" id="team">
        <div className="v3-wrap">
          <Head num="04" label="Leadership" title="The people behind every client relationship." />
          <article className="v3-member">
            <figure className="v3-member-photo" data-reveal>
              <img src={kratikaPhoto} alt="Kratika Maheshwari, Co-Founder & Chief Client Experience Officer, RISCH Wealth" width="640" height="800" loading="lazy" />
            </figure>
            <div className="v3-member-text">
              <h3 className="v3-member-name" data-split>Kratika Maheshwari</h3>
              <p className="v3-member-role" data-reveal>Co-Founder &amp; Chief Client Experience Officer</p>
              <p className="v3-lead" data-reveal>Kratika leads the RISCH client experience end to end: relationship management, portfolio reviews, reporting and day-to-day service, so that every client relationship is proactive, transparent and personal.</p>
              <p className="v3-body" data-reveal>She brings more than a decade of experience in private banking and wealth management at HDFC Bank Global Private Clients, ICICI Securities Private Wealth and Kotak Securities, where she managed HNI portfolios, worked on cross-border client acquisition and structured business banking relationships.</p>
              <p className="v3-body" data-reveal>At RISCH, she connects portfolio strategy with how clients actually experience it: the cadence of reviews, the clarity of reporting and the speed of execution.</p>
              <dl className="v3-facts" data-reveal="stagger">
                <div><dt>Previously</dt><dd>HDFC Bank Global Private Clients · ICICI Securities Private Wealth · Kotak Securities</dd></div>
                <div><dt>Education</dt><dd>MBA, Finance · Christ University<br />BBM · Center for Management Studies, Jain (Deemed-to-be University)<br />Bishop Cotton Girls&rsquo; School, Bengaluru</dd></div>
              </dl>
            </div>
          </article>
        </div>
      </section>

      {/* ============ HOW WE WORK ============ */}
      <section className="v3-sec">
        <div className="v3-wrap">
          <Head num="05" label="How we work" title="Four principles, applied the same way every time." />
          <HowWeWork items={HOW_WE_WORK} />
        </div>
      </section>

      {/* ============ GOVERNANCE ============ */}
      <section className="v3-sec v3-sec-tight">
        <div className="v3-wrap">
          <div className="v3-gov">
            <Head num="06" label="Governance & standing" title="Documented, structured, accountable." />
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
