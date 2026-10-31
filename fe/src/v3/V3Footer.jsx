import { Link } from 'react-router-dom';
import { FIRM } from '../data/firm';
import { BrandMark } from './ui';

const LINKEDIN = 'https://www.linkedin.com/in/rishiraj-maheshwari-81240b5/';

const COLS = [
  ['The Firm', [['/about', 'The Firm'], ['/who-we-serve', 'Who We Serve'], ['/solutions', 'What We Provide'], ['/testimonials', 'Testimonials'], ['/perspective', 'Perspective'], ['/contact', 'Get In Touch']]],
  ['Clients', [['/contact', 'Start a Conversation'], ['/risk-profiler', 'Risk Assessment'], ['/client-login', 'Client Login'], ['/disclosure', 'Disclosures']]],
];

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const Pin = () => <Icon><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></Icon>;
const Phone = () => <Icon><path d="M5 3h3.5l2 5-2.5 1.5a11 11 0 0 0 6.5 6.5L16 13.5l5 2V19a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z" /></Icon>;
const Mail = () => <Icon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></Icon>;
const Shield = () => <Icon><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3z" /><path d="m8.8 12 2.2 2.2 4.2-4.4" /></Icon>;
const Up = () => <Icon><path d="M12 19V5M6 11l6-6 6 6" /></Icon>;

// The v3 footer: brand and mission, the site map, the office, the
// regulatory band and the mandatory mutual fund warning.
export default function V3Footer() {
  return (
    <footer className="v3-footer">
      <div className="v3-wrap">
        <div className="v3-footer-top">
          <div className="v3-footer-brand">
            <Link to="/" className="v3-footer-logo" aria-label="RISCH Private Wealth, home">
              <BrandMark />
              <span>Private Wealth</span>
            </Link>
            <i className="v3-footer-rule" aria-hidden="true" />
            <p className="v3-footer-h">Our Mission: Investor Success</p>
            <p className="v3-footer-quote">Investors trust us because we put them first.</p>
            <a className="v3-footer-social" href={LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.3 8.8H2.2V21h3.1V8.8zM3.8 3a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zM21.8 13.9c0-3.3-1.8-5.4-4.6-5.4-1.6 0-2.7.9-3.2 1.7V8.8h-3V21h3.1v-6.3c0-1.7.6-3 2.3-3s2.2 1.4 2.2 3.1V21h3.2v-7.1z" /></svg>
            </a>
          </div>
          {COLS.map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <p className="v3-footer-h">{title}</p>
              <ul>{links.map(([to, label]) => <li key={label}><Link to={to}>{label}</Link></li>)}</ul>
            </nav>
          ))}
          <div>
            <p className="v3-footer-h">Our Office</p>
            <ul className="v3-footer-office">
              <li><Pin /><address>{FIRM.address.lines.map((l) => <span key={l}>{l}</span>)}</address></li>
              <li><Phone /><a href={FIRM.phoneHref}>{FIRM.phone}</a></li>
              {FIRM.phoneAlt && <li><Phone /><a href={FIRM.phoneAltHref}>{FIRM.phoneAlt}</a></li>}
              <li><Mail /><a href={`mailto:${FIRM.email}`}>{FIRM.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="v3-footer-reg">
          <span className="v3-footer-seal"><Shield /></span>
          <p>{FIRM.legalName}. {FIRM.registrationNote}</p>
          <ul className="v3-footer-ids">{FIRM.registrations.map((r) => <li key={r.id}>{r.id}</li>)}</ul>
        </div>
        {/* the standard warning an AMFI-registered distributor must show;
            keep this line as it is */}
        <p className="v3-footer-legal">
          Mutual fund investments are subject to market risks, read all scheme related documents carefully.
          {' '}This site is for informational purposes only and does not constitute investment advice or an offer to buy or sell any security.
          {' '}Past performance is not indicative of future results. See <Link to="/disclosure">Disclosures</Link>.
        </p>
        <div className="v3-footer-bottom">
          <p>© {new Date().getFullYear()} {FIRM.legalName}. All rights reserved.</p>
          <p className="v3-footer-motto">Trust<i>.</i> Discipline<i>.</i> Performance<i>.</i></p>
          <p className="v3-footer-end">
            <Link to="/disclosure">Disclosures</Link>
            <button type="button" className="v3-footer-top-btn" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Up /></button>
          </p>
        </div>
      </div>
    </footer>
  );
}
