import Ridgelines from '../Ridgelines/Ridgelines';

// The opening of every inner page: eyebrow, a display headline whose lines
// rise out of a mask on load (CSS, so it plays before any script), an
// optional lede and aside, and a quiet band of the home page's ridgelines.
//   lines     array of headline lines (nodes); <em> sets the accent italic
//   aside     content for the right-hand column (CTAs, a quote, a photo)
export default function PageHero({ eyebrow, lines, lede, aside, children, ridges = true, className = '' }) {
  return (
    <header className={`pg-hero ${className}`.trim()}>
      <div className="wrap pg-hero-inner">
        {eyebrow && (
          <p className="h-eyebrow hero-in" style={{ '--d': '.1s' }}>
            <span className="h-dot" aria-hidden="true" />{eyebrow}
          </p>
        )}
        <h1 className="pg-title">
          {lines.map((line, i) => (
            <span className="h-line" key={i}><span style={{ '--d': `${0.15 + i * 0.11}s` }}>{line}</span></span>
          ))}
        </h1>
        {(lede || aside) && (
          <div className="pg-hero-foot">
            {lede ? <p className="pg-lede hero-in" style={{ '--d': '.55s' }}>{lede}</p> : <span />}
            {aside && <div className="pg-hero-aside hero-in" style={{ '--d': '.7s' }}>{aside}</div>}
          </div>
        )}
        {children}
      </div>
      {ridges && <div className="pg-hero-ridges" aria-hidden="true"><Ridgelines quiet /></div>}
    </header>
  );
}
