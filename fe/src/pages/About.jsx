import { useRef } from 'react';
import Nav from '../components/Nav/Nav';
import Footer from '../components/Footer/Footer';
import PageHero from '../components/page/PageHero';
import ClosingCta from '../components/page/ClosingCta';
import founderHeadshot from '../assets/founder-headshot.jpg';
import kratikaPhoto from '../assets/kratika-maheshwari.jpg';
import { useMotion } from '../motion/useMotion';
import { FIRM } from '../data/firm';

const Svg = ({ children, sw = 1.6 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

const HOW_WE_WORK = [
  { t: 'Ability before willingness', d: 'Capacity sets the boundary. Willingness never overrides it.',
    icon: <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" /> },
  { t: 'Independence from product', d: 'No proprietary fund. Recommendations align to the client, not the shelf.',
    icon: <><circle cx="12" cy="12" r="9" /><path d="M15 9l-2 6-6 2 2-6 6-2z" /></> },
  { t: 'Disclosure before commitment', d: 'Worst case shown before a rupee is funded, not after.',
    icon: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></> },
  { t: 'Bounded deviation', d: 'Any override is recorded, justified, and signed by both parties.',
    icon: <path d="M12 3v18M5 7l-3 6a3 3 0 0 0 6 0l-3-6zM19 7l-3 6a3 3 0 0 0 6 0l-3-6zM5 7h14M9 21h6" /> },
];

const GOVERNANCE = [
  { t: 'Open Architecture', d: 'No proprietary product.', icon: <><circle cx="12" cy="12" r="9" /><path d="M15 9l-2 6-6 2 2-6 6-2z" /></> },
  { t: '8-Point Diagnostic', d: 'Scored independently.', icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></> },
  { t: 'Bounded Deviation', d: 'Jointly signed, always.', icon: <path d="M12 3v18M5 7l-3 6a3 3 0 0 0 6 0l-3-6zM19 7l-3 6a3 3 0 0 0 6 0l-3-6zM5 7h14M9 21h6" /> },
  { t: 'Conflict Walls', d: 'Managed independently.', icon: <><rect x="4" y="4" width="7" height="7" rx="1.2" /><rect x="13" y="4" width="7" height="7" rx="1.2" /><rect x="4" y="13" width="7" height="7" rx="1.2" /><rect x="13" y="13" width="7" height="7" rx="1.2" /></> },
];

const PREVIOUSLY = [
  { t: 'Edelweiss Financial Services', d: 'Mumbai' },
  { t: 'Senior Private Banker', d: 'ICICI Securities · Bengaluru' },
  { t: 'Assistant Vice President, Private Wealth', d: 'Unicon Investment Solutions · Bengaluru' },
  { t: 'Relationship Manager', d: 'Indiabulls Securities' },
];

export default function About() {
  const rootRef = useRef(null);
  useMotion(rootRef);

  return (
    <div ref={rootRef}>
      <Nav />

      <PageHero
        eyebrow="Who We Are"
        lines={['Built for people who ask', <><em>why</em>, not just <em>how much</em>.</>]}
      />

      {/* ============ THE FOUNDER ============ */}
      <section className="pg-sec">
        <div className="wrap ab-founder">
          <figure className="ab-founder-fig">
            <div className="pg-photo" data-reveal>
              <img src={founderHeadshot} alt="Rishiraj Maheshwari, Founder & CEO" width="380" height="380" data-parallax="0.12" />
            </div>
            <figcaption>
              <h2 className="ab-founder-name">Rishiraj Maheshwari</h2>
              <p className="ab-founder-role">Founder &amp; CEO</p>
              <div className="ab-founder-links">
                <a href="https://www.linkedin.com/in/rishiraj-maheshwari-81240b5/" target="_blank" rel="noopener noreferrer" className="pg-chip">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.53-1 1.83-2.1 3.77-2.1 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21H9z" /></svg>
                  LinkedIn
                </a>
                <a href="tel:+919448090998" className="pg-chip">
                  <Svg sw={1.8}><path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2C9.6 22 2 14.4 2 6a2 2 0 0 1 2-2z" /></Svg>
                  Call
                </a>
              </div>
            </figcaption>
          </figure>

          <div className="ab-founder-text">
            <p className="eyebrow" data-reveal>The Founder</p>
            <h2 className="h-h2" data-split>Two decades in private banking.</h2>
            <p className="lede" data-reveal>Rishiraj founded RISCH after more than two decades in private banking, most recently at Edelweiss Financial Services, and before that as a Senior Private Banker at ICICI Securities.</p>
            <p data-reveal>That career is why RISCH is built the way it is: risk understood first, in a documented and repeatable way, before a single recommendation is made.</p>
            <ul className="ab-creds" data-reveal="stagger">
              <li><Svg sw={1.8}><path d="M2 9l10-5 10 5-10 5-10-5z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></Svg>MBA</li>
              <li><Svg sw={1.8}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 12h18" /></Svg>20+ Years</li>
              <li><Svg sw={1.8}><path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.4" /></Svg>Bengaluru</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============ ABOUT RISCH + CREED ============ */}
      <section className="pg-sec pg-tint">
        <div className="wrap">
          <div className="pg-head">
            <div>
              <p className="eyebrow" data-reveal>About RISCH</p>
              <h2 className="h-h2" data-split>Built from private banking. <em>Designed around the client.</em></h2>
            </div>
            <div data-reveal>
              <p className="lede">RISCH was founded in {FIRM.foundedYear} by Rishiraj Maheshwari, after a career advising wealthy individuals and families at some of India&rsquo;s best-known financial institutions.</p>
              <p>Today, RISCH works with a select group of clients who want a more disciplined, personal approach to their wealth: fewer products, clearer reasoning, and one accountable relationship.</p>
            </div>
          </div>
          <p className="ab-creed">
            <span data-split>Understand the client.</span>
            <span data-split>Build around the client.</span>
            <span data-split><em>Stay accountable to the client.</em></span>
          </p>
        </div>
      </section>

      {/* ============ EXPERIENCE (scroll-filled timeline) ============ */}
      <section className="pg-sec">
        <div className="wrap">
          <div className="pg-head">
            <div>
              <p className="eyebrow" data-reveal>Experience</p>
              <h2 className="h-h2" data-split>Two decades across India&rsquo;s leading wealth institutions.</h2>
            </div>
            <p className="lede" data-reveal>Private banking and family-office advisory at ICICI Securities and Edelweiss, before founding RISCH in {FIRM.foundedYear}.</p>
          </div>

          <ol className="pg-timeline">
            <span className="pg-timeline-rail" aria-hidden="true"><i data-scrub-line /></span>
            <li className="pg-tl-item is-current" data-reveal>
              <span className="pg-tl-label">Current</span>
              <div>
                <h3>Founder &amp; CEO</h3>
                <p>RISCH Wealth Private Limited · Bengaluru · Since {FIRM.foundedYear}</p>
              </div>
            </li>
            {PREVIOUSLY.map((p, i) => (
              <li className="pg-tl-item" key={p.t} data-reveal>
                <span className="pg-tl-label">{i === 0 ? 'Previously' : ''}</span>
                <div>
                  <h3>{p.t}</h3>
                  <p>{p.d}</p>
                </div>
              </li>
            ))}
            <li className="pg-tl-item" data-reveal>
              <span className="pg-tl-label">Education</span>
              <div>
                <h3>MBA, Marketing &amp; Systems</h3>
                <p>Canara Bank School of Management Studies</p>
                <h3 className="pg-tl-second">BCA</h3>
                <p>DAVV University</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ============ LEADERSHIP ============ */}
      <section className="pg-sec pg-tint" id="team">
        <div className="wrap">
          <p className="eyebrow" data-reveal>Leadership</p>
          <h2 className="h-h2 ab-team-title" data-split>The people behind every client relationship.</h2>

          <article className="ab-member">
            <div className="pg-photo pg-photo-tall" data-reveal>
              <img src={kratikaPhoto} alt="Kratika Maheshwari, Co-Founder & Chief Client Experience Officer, RISCH Wealth" width="640" height="800" loading="lazy" data-parallax="0.12" />
            </div>
            <div className="ab-member-text">
              <h3 className="ab-member-name" data-split>Kratika Maheshwari</h3>
              <p className="ab-member-role" data-reveal>Co-Founder &amp; Chief Client Experience Officer</p>
              <p className="lede" data-reveal>Kratika leads the RISCH client experience end to end: relationship management, portfolio reviews, reporting and day-to-day service, so that every client relationship is proactive, transparent and personal.</p>
              <p data-reveal>She brings more than a decade of experience in private banking and wealth management at HDFC Bank Global Private Clients, ICICI Securities Private Wealth and Kotak Securities, where she managed HNI portfolios, worked on cross-border client acquisition and structured business banking relationships.</p>
              <p data-reveal>At RISCH, she connects portfolio strategy with how clients actually experience it, the cadence of reviews, the clarity of reporting and the speed of execution.</p>
              <dl className="ab-facts" data-reveal="stagger">
                <div><dt>Previously</dt><dd>HDFC Bank Global Private Clients · ICICI Securities Private Wealth · Kotak Securities</dd></div>
                <div><dt>Education</dt><dd>MBA, Finance · Christ University<br />BBM · Center for Management Studies, Jain (Deemed-to-be University)<br />Bishop Cotton Girls&rsquo; School, Bengaluru</dd></div>
              </dl>
            </div>
          </article>
        </div>
      </section>

      {/* ============ HOW WE WORK ============ */}
      <section className="pg-sec">
        <div className="wrap">
          <div className="pg-head">
            <div>
              <p className="eyebrow" data-reveal>How We Work</p>
              <h2 className="h-h2" data-split>Four principles.</h2>
            </div>
          </div>
          <div className="pg-cards" data-reveal="stagger">
            {HOW_WE_WORK.map((c, i) => (
              <article className="pg-card" key={c.t} data-tilt="4">
                <span className="pg-card-top">
                  <span className="pg-card-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="pg-card-icon"><Svg>{c.icon}</Svg></span>
                </span>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
                <span className="pg-card-glow" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GOVERNANCE (navy) ============ */}
      <section className="pg-navy">
        <div className="wrap">
          <div className="pg-head">
            <div>
              <p className="eyebrow" data-reveal>Governance &amp; Standing</p>
              <h2 className="h-h2" data-split>Documented, structured, accountable.</h2>
            </div>
          </div>
          <div className="pg-cards pg-cards-navy" data-reveal="stagger">
            {GOVERNANCE.map((g) => (
              <article className="pg-card" key={g.t} data-tilt="4">
                <span className="pg-card-top"><span className="pg-card-icon"><Svg sw={1.8}>{g.icon}</Svg></span></span>
                <h3>{g.t}</h3>
                <p>{g.d}</p>
                <span className="pg-card-glow" aria-hidden="true" />
              </article>
            ))}
          </div>
          {FIRM.registrations.length > 0 && (
            <div className="pg-reg" data-reveal>
              <div>
                <p>{FIRM.registrationNote}</p>
                <p className="pg-reg-role">{FIRM.roleNote}</p>
              </div>
              <p className="pg-reg-ids">
                {FIRM.registrations.map((r) => <span key={r.id}>{r.id}</span>)}
              </p>
            </div>
          )}
        </div>
      </section>

      <ClosingCta
        eyebrow="Next Step"
        title="See what a portfolio built for you looks like."
        primary={{ to: '/risk-profiler', label: 'Take the risk profiler' }}
        secondary={{ to: '/contact', label: 'Get in touch' }}
      />

      <Footer />
    </div>
  );
}
