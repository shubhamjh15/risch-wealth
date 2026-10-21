import { Link } from 'react-router-dom';

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5" stroke="currentColor" strokeWidth="1.3" /></svg>
);

// The navy sign-off panel that closes each inner page: a headline, the
// main action as a magnetic orb, and a quieter second link.
//   primary / secondary   { to, label }
export default function ClosingCta({ eyebrow, title, lede, primary, secondary }) {
  return (
    <section className="pg-close-wrap">
      <div className="pg-close">
        <div className="wrap pg-close-inner">
          <div>
            {eyebrow && <p className="eyebrow" data-reveal>{eyebrow}</p>}
            <h2 className="pg-close-title" data-split>{title}</h2>
            {lede && <p className="pg-close-lede" data-reveal>{lede}</p>}
          </div>
          <div className="pg-close-actions" data-reveal>
            <Link to={primary.to} className="h-orb h-orb-light" data-magnetic="0.4" data-label={primary.label}>
              <span>{primary.label}</span>
              <Arrow />
            </Link>
            {secondary && <Link to={secondary.to} className="text-link text-link-light" data-label={secondary.label}>{secondary.label} <Arrow /></Link>}
          </div>
        </div>
      </div>
    </section>
  );
}
