import { Link } from 'react-router-dom';
import { FIRM } from '../data/firm';
import { BrandMark } from '../v2/ui';

const COLS = [
  ['The Firm', [['/about', 'About RISCH'], ['/about', 'Our founder'], ['/perspective', 'Perspective'], ['/disclosure', 'Regulatory information']]],
  ['What We Provide', [['/solutions', 'Our approach'], ['/solutions', 'Mutual funds, PMS & AIFs'], ['/risk-profiler', 'Risk profile']]],
  ['Whom We Serve', [['/who-we-serve', 'Business owners & founders'], ['/who-we-serve', 'Private clients & families'], ['/who-we-serve', 'NRIs & global Indians'], ['/who-we-serve', 'Family offices']]],
];

// The v3 footer: brand and contact, the site map, the regulatory band and
// the mandatory mutual fund warning (same wording as components/Footer).
export default function V3Footer() {
  return (
    <footer className="v3-footer">
      <div className="v3-wrap">
        <div className="v3-footer-top">
          <div className="v3-footer-brand">
            <Link to="/v3" className="v3-footer-logo" aria-label="RISCH Wealth, home"><BrandMark /></Link>
            <p>Private wealth management for entrepreneurs, families, professionals and global Indians. Bengaluru, since {FIRM.foundedYear}.</p>
            <p className="v3-footer-contact">
              <a href={FIRM.phoneHref}>{FIRM.phone}</a>
              <a href={`mailto:${FIRM.email}`}>{FIRM.email}</a>
            </p>
          </div>
          {COLS.map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <p className="v3-footer-h">{title}</p>
              <ul>{links.map(([to, label]) => <li key={label}><Link to={to}>{label}</Link></li>)}</ul>
            </nav>
          ))}
          <div>
            <p className="v3-footer-h">Visit</p>
            <address>{FIRM.address.lines.map((l) => <span key={l}>{l}</span>)}</address>
          </div>
        </div>
        <div className="v3-footer-reg">
          <p>{FIRM.legalName}. {FIRM.registrationNote}</p>
          <p className="v3-footer-ids">{FIRM.registrations.map((r) => <span key={r.id}>{r.id}</span>)}</p>
        </div>
        {/* the standard warning an AMFI-registered distributor must show;
            keep this line as it is */}
        <p className="v3-footer-legal">
          Mutual fund investments are subject to market risks, read all scheme related documents carefully.
          {' '}This site is for informational purposes only and does not constitute investment advice or an offer to buy or sell any security.
          {' '}Past performance is not indicative of future results. See <Link to="/disclosure">Disclosures</Link>.
        </p>
        <div className="v3-footer-bottom">
          <p>© {new Date().getFullYear()} {FIRM.legalName}</p>
          <p>Trust. Discipline. Performance.</p>
        </div>
      </div>
    </footer>
  );
}
