import { Link } from 'react-router-dom';
import Logo from '../Logo';
import { FIRM } from '../../data/firm';

// Site footer (Figma, Sept 2026): brand and mission, The Firm and Clients
// links, office with icons, then a registration band (registration note,
// the mutual fund risk warning, ARN / APRN) and the bottom line with the
// firm's motto. Office, registration and contact details all come from
// src/data/firm.js.
//   showSocials    LinkedIn button under the mission (off on Disclosure
//                  and the risk profiler report)
//   extendedLegal  adds the longer risk sentence (Disclosure, profiler)

const FIRM_LINKS = [
  ['/about', 'The Firm'],
  ['/who-we-serve', 'Who We Serve'],
  ['/solutions', 'What We Provide'],
  ['/testimonials', 'Testimonials'],
  ['/perspective', 'Perspective'],
  ['/contact', 'Get In Touch'],
];
const CLIENT_LINKS = [
  ['/contact', 'Start a Conversation'],
  ['/risk-profiler', 'Risk Assessment'],
  ['/client-login', 'Client Login'],
  ['/disclosure', 'Disclosures'],
];
// Bottom-right links. Privacy Policy and Terms of Use are in the design but
// have no pages yet; give them a `to` once they exist and they appear.
const LEGAL_LINKS = [
  { label: 'Privacy Policy', to: null },
  { label: 'Terms of Use', to: null },
  { label: 'Disclosures', to: '/disclosure' },
].filter((l) => l.to);

const Icon = ({ children }) => (
  <svg className="f-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

export default function Footer({ showSocials = true, extendedLegal = false }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="f-top">
          <div className="f-brand">
            <Link to="/" className="f-logo">
              <Logo />
              <span>Private Wealth</span>
            </Link>
            <span className="f-rule" aria-hidden="true" />
            <p className="f-eyebrow">Our Mission: Investor Success</p>
            <p className="f-mission">Investors Trust Us Because<br /> We Put Them First.</p>
            {showSocials && (
              <div className="f-social">
                <a href="https://www.linkedin.com/in/rishiraj-maheshwari-81240b5/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.53-1 1.83-2.1 3.77-2.1 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21H9z" /></svg>
                </a>
                {/* Instagram hidden for now (https://www.instagram.com/rischwealth/) */}
              </div>
            )}
          </div>

          <nav className="f-col" aria-label="The Firm">
            <h2 className="f-heading">The Firm</h2>
            <ul>{FIRM_LINKS.map(([to, label]) => <li key={label}><Link to={to}>{label}</Link></li>)}</ul>
          </nav>

          <nav className="f-col" aria-label="Clients">
            <h2 className="f-heading">Clients</h2>
            <ul>{CLIENT_LINKS.map(([to, label]) => <li key={label}><Link to={to}>{label}</Link></li>)}</ul>
          </nav>

          <div className="f-col">
            <h2 className="f-heading">Our Office</h2>
            <ul className="f-office">
              <li>
                <Icon><path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.4" /></Icon>
                <address>{FIRM.address.lines.map((line) => <span key={line}>{line}</span>)}</address>
              </li>
              <li>
                <Icon><path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2C9.6 22 2 14.4 2 6a2 2 0 0 1 2-2z" /></Icon>
                <span>
                  <a href={FIRM.phoneHref}>{FIRM.phone}</a>
                  {FIRM.phoneAlt && <><br /><a href={FIRM.phoneAltHref}>{FIRM.phoneAlt}</a></>}
                </span>
              </li>
              <li>
                <Icon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></Icon>
                <a href={`mailto:${FIRM.email}`}>{FIRM.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="f-reg">
          <span className="f-reg-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6l8-3z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
          </span>
          <div className="f-reg-text">
            <p>{FIRM.legalName}. {FIRM.registrationNote}</p>
            {FIRM.grievance && <p className="f-reg-grievance">{FIRM.grievance}</p>}
          </div>
          <div className="f-reg-ids">
            {FIRM.registrations.map((r) => <p key={r.id}>{r.id}</p>)}
          </div>
        </div>

        {/* the standard warning an AMFI-registered distributor must show;
            keep this line as it is */}
        <div className="f-disclaimer">
          <p>
            Mutual fund investments are subject to market risks, read all scheme related documents carefully.
            {' '}This site is for informational purposes only and does not constitute investment advice or an offer to buy or sell any security.
            {extendedLegal && ' Investments in securities, mutual funds, portfolio services and alternative assets are subject to market risk, including possible loss of principal.'}
            {' '}Past performance is not indicative of future results. See <Link to="/disclosure">Disclosures</Link>.
          </p>
        </div>

        <div className="f-bottom">
          <p>© {new Date().getFullYear()} {FIRM.legalName}. All rights reserved.</p>
          <p className="f-motto">Trust. Discipline. Performance.</p>
          <ul className="f-legal">
            {LEGAL_LINKS.map((l) => <li key={l.label}><Link to={l.to}>{l.label}</Link></li>)}
          </ul>
        </div>
      </div>
    </footer>
  );
}
