import { Link } from 'react-router-dom';

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5" stroke="currentColor" strokeWidth="1.4" /></svg>
);

// The navy sign-off panel that closes each inner page.
//   primary / secondary   { to, label }
export default function ClosingCta({ eyebrow, title, lede, primary, secondary }) {
  return (
    <section className="hm-close-wrap">
      <div className="hm-close">
        <svg className="hm-close-line pg-close-line" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 270 C120 262 180 240 260 246 S400 214 470 206 S600 222 660 180 S800 150 860 132 S1000 96 1060 70 S1160 34 1200 22" />
        </svg>
        <div className="wrap hm-close-inner">
          {eyebrow && <p className="hm-eyebrow pg-close-eyebrow" data-reveal>{eyebrow}</p>}
          <h2 className="hm-close-title" data-split>{title}</h2>
          {lede && <p className="pg-close-lede" data-reveal>{lede}</p>}
          <div className="hm-close-actions" data-reveal>
            <Link to={primary.to} className="btn btn-green"><span>{primary.label}</span> <Arrow /></Link>
            {secondary && <Link to={secondary.to} className="btn btn-ghost-light">{secondary.label}</Link>}
          </div>
        </div>
      </div>
    </section>
  );
}
