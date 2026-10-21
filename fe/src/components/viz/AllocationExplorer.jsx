import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DonutBlock } from '../solutions/AllocationPanel';
import { HORIZONS, MACRO_CLASSES, PORTFOLIO_NOTES, PORTFOLIO_SUITS, allocationFor } from '../../content/solutions';

// The four RISCH model portfolios. Pick a horizon and the 3D donut (hover a
// segment to read its share) and the bars glide to that model mix, the same
// numbers the risk profiler uses.
export default function AllocationExplorer() {
  const [id, setId] = useState('growth');
  const mix = allocationFor(id).macro;
  const equity = Math.round(mix[0] + mix[1]);
  const tier = HORIZONS.find((h) => h.id === id);

  return (
    <div className="ax">
      <div className="ax-tabs" role="tablist" aria-label="Investment horizon">
        {HORIZONS.map((h) => (
          <button key={h.id} type="button" role="tab" aria-selected={id === h.id} className={id === h.id ? 'is-on' : ''} onClick={() => setId(h.id)}>
            <span>{h.span}</span>
            <b>{h.name.replace('RISCH ', '')}</b>
          </button>
        ))}
      </div>

      <div className="ax-body">
        <div className="ax-donut3d">
          <DonutBlock title="Asset mix" classes={MACRO_CLASSES} values={mix} name={tier.name} />
          <p className="ax-hint">Hover the ring to read each share</p>
        </div>

        <div className="ax-side">
          <p className="ax-name">{tier.name}</p>
          <p className="ax-equity"><b>{equity}%</b> in equity</p>
          <ul className="ax-rows">
            {MACRO_CLASSES.map((c, i) => (
              <li key={c.id} className={mix[i] ? '' : 'is-zero'}>
                <span className="ax-row-name"><i style={{ background: c.color }} />{c.name}</span>
                <span className="ax-row-bar"><i style={{ width: `${mix[i]}%`, background: c.color }} /></span>
                <b>{mix[i].toFixed(0)}%</b>
              </li>
            ))}
          </ul>
          <p className="ax-suits">{PORTFOLIO_SUITS[id]}</p>
          {PORTFOLIO_NOTES[id] && <p className="ax-warn">{PORTFOLIO_NOTES[id]}</p>}
          <Link to="/risk-profiler" className="text-link">Find your portfolio in 3 minutes
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5" stroke="currentColor" strokeWidth="1.3" /></svg>
          </Link>
        </div>
      </div>
      <p className="ax-note">Illustrative model mixes of the four RISCH portfolios. Not a recommendation; your own allocation is set from your full risk profile.</p>
    </div>
  );
}
