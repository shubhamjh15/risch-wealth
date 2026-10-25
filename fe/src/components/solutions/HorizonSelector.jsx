import {
  HORIZONS, MACRO_CLASSES, SLIDER_MAX, SLIDER_MIN, UNDERSTAND, allocationFor, horizonForYears, mixLabel,
} from '../../content/solutions';

const Down = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1V13M7 13L1.5 7.5M7 13L12.5 7.5" stroke="currentColor" strokeWidth="1.3" /></svg>
);

// A slider that names the portfolio its years point to. The page keeps the
// Asset Allocation tab in step (one way: the tabs never move the slider).
export default function HorizonSelector({ years, onYears, onSeeMix }) {
  const fit = HORIZONS.find((h) => h.id === horizonForYears(years));
  const pct = ((years - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
  const label = years >= SLIDER_MAX ? `${SLIDER_MAX}+ years` : `${years} ${years === 1 ? 'year' : 'years'}`;
  const mix = allocationFor(fit.id).macro;
  const equity = Math.round(mix[0] + mix[1]);
  return (
    <div className="hz">
      <div className="hz-slider">
        <div className="hz-read" aria-hidden="true"><strong>{label}</strong></div>
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step="1"
          value={years}
          onChange={(e) => onYears(Number(e.target.value))}
          aria-label="How long the capital can stay invested, in years"
          aria-valuetext={label}
          style={{ '--p': `${pct}%` }}
        />
        <div className="hz-ticks" aria-hidden="true">
          {[1, 5, 10, 15].map((n) => <span key={n} style={{ left: `${((n - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%` }}>{n === 15 ? '15+' : n}</span>)}
        </div>
      </div>
      <div className="hz-fit" aria-live="polite">
        <span className="hz-fit-label">{UNDERSTAND.horizon.fitLabel}</span>
        <strong key={fit.id} className="hz-fit-name">{mixLabel(fit)} mix</strong>
        {/* the illustrative mix itself, as one bar that reshapes with the slider */}
        <div className="hz-mix" aria-hidden="true">
          {MACRO_CLASSES.map((c, i) => <i key={c.id} style={{ width: `${mix[i]}%`, background: c.color }} />)}
        </div>
        <span className="hz-mix-key">{equity}% equity · {100 - equity}% fixed income &amp; cash</span>
        <a href="#alloc-h" className="v3-textlink hz-fit-link" onClick={(e) => { e.preventDefault(); onSeeMix(); }}>
          {UNDERSTAND.horizon.fitLink} <Down />
        </a>
      </div>
    </div>
  );
}
