import { Link } from 'react-router-dom';
import { BrandMark } from './ui';
import { FIRM } from '../data/firm';

const FIRM_LINKS = [
  ['/about', 'The Firm'],
  ['/solutions', 'Approach'],
  ['/who-we-serve', 'Clients'],
  ['/testimonials', 'Testimonials'],
  ['/perspective', 'Perspective'],
];
const CLIENT_LINKS = [
  ['/contact', 'Start a conversation'],
  ['/risk-profiler', 'Risk profile'],
  ['/client-login', 'Client login'],
  ['/disclosure', 'Disclosures'],
];

// The v2 footer: links, office and the regulatory band (same facts and the
// same mandatory mutual fund warning as components/Footer), closed by the
// wordmark set across the full width.
export default function V2Footer() {
  return (
    <footer className="v2-footer">
      <div className="v2-wrap">
        <div className="v2-footer-top">
          <p className="v2-footer-motto">Trust.<br />Discipline.<br />Performance.</p>
          <nav aria-label="The Firm">
            <p className="v2-label">The Firm</p>
            <ul>{FIRM_LINKS.map(([to, label]) => <li key={label}><Link to={to}>{label}</Link></li>)}</ul>
          </nav>
          <nav aria-label="Clients">
            <p className="v2-label">Clients</p>
            <ul>{CLIENT_LINKS.map(([to, label]) => <li key={label}><Link to={to}>{label}</Link></li>)}</ul>
          </nav>
          <div>
            <p className="v2-label">Office</p>
            <address>{FIRM.address.lines.map((line) => <span key={line}>{line}</span>)}</address>
            <p className="v2-footer-contact">
              <a href={FIRM.phoneHref}>{FIRM.phone}</a>
              <a href={`mailto:${FIRM.email}`}>{FIRM.email}</a>
            </p>
          </div>
        </div>

        <div className="v2-footer-reg">
          <p>{FIRM.legalName}. {FIRM.registrationNote}</p>
          <p className="v2-footer-ids">{FIRM.registrations.map((r) => <span key={r.id}>{r.id}</span>)}</p>
        </div>
        {/* the standard warning an AMFI-registered distributor must show;
            keep this line as it is */}
        <p className="v2-footer-legal">
          Mutual fund investments are subject to market risks, read all scheme related documents carefully.
          {' '}This site is for informational purposes only and does not constitute investment advice or an offer to buy or sell any security.
          {' '}Past performance is not indicative of future results. See <Link to="/disclosure">Disclosures</Link>.
        </p>
      </div>

      <div className="v2-footer-mark" aria-hidden="true"><BrandMark /></div>

      <div className="v2-wrap v2-footer-bottom">
        <p>© {new Date().getFullYear()} {FIRM.legalName}</p>
        <p>Bengaluru, India</p>
      </div>
    </footer>
  );
}
