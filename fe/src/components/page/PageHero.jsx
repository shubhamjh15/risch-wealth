// The opening of every inner page: a navy band with the headline (lines
// rise out of a mask on load, in CSS so it plays before any script), an
// optional lede and aside, and a green growth line drawing across the foot.
//   lines     array of headline lines (nodes); <em> sets the accent italic
//   aside     content for the right-hand column (CTAs, a note)
export default function PageHero({ eyebrow, lines, lede, aside, children, className = '' }) {
  return (
    <header className={`pg-hero ${className}`.trim()}>
      <svg className="pg-hero-line" viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 186 C140 180 200 160 290 166 S420 138 500 132 S630 146 700 112 S830 90 900 76 S1030 52 1090 34 S1170 14 1200 8" />
      </svg>
      <div className="wrap pg-hero-inner">
        {eyebrow && (
          <p className="h-eyebrow hero-in" style={{ '--d': '.05s' }}>
            <span className="h-dot" aria-hidden="true" />{eyebrow}
          </p>
        )}
        <h1 className="pg-title">
          {lines.map((line, i) => (
            <span className="h-line" key={i}><span style={{ '--d': `${0.12 + i * 0.1}s` }}>{line}</span></span>
          ))}
        </h1>
        {(lede || aside) && (
          <div className="pg-hero-foot">
            {lede ? <p className="pg-lede hero-in" style={{ '--d': '.4s' }}>{lede}</p> : <span />}
            {aside && <div className="pg-hero-aside hero-in" style={{ '--d': '.5s' }}>{aside}</div>}
          </div>
        )}
        {children}
      </div>
    </header>
  );
}
