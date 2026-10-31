import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Arrow } from './ui';

// Cards that carry a small diagram instead of an icon or a photo: "How we
// work" on The Firm, the four products and the four disciplines. They
// draw in once on screen.

function useOnScreen() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, on];
}

// Capacity and willingness; the lower one is the line the portfolio keeps to.
function AbilityViz() {
  return (
    <div className="v3-pv-bars">
      <div><span>Ability to take risk</span><i><b style={{ '--w': '78%' }} /></i></div>
      <div><span>Willingness to take risk</span><i><b style={{ '--w': '52%' }} /></i></div>
      <em style={{ '--x': '52%' }}><small>The limit</small></em>
    </div>
  );
}

// The whole market on the shelf; nothing of our own on it.
const FUNDS = ['Large cap', 'Flexi cap', 'Mid cap', 'Global', 'Short debt', 'Gilt', 'PMS', 'AIF', 'Hybrid', 'Arbitrage', 'Small cap', 'Gold'];
function ShelfViz() {
  return (
    <div className="v3-pv-shelf">
      {FUNDS.map((f, k) => <span key={f} className={[2, 3, 6, 9].includes(k) ? 'is-pick' : undefined} style={{ '--i': k }}>{f}</span>)}
      <span className="is-none">In-house fund <s>none</s></span>
    </div>
  );
}

// The range of outcomes, with the worst case marked before anything is funded.
function DisclosureViz() {
  return (
    <svg className="v3-pv-range" viewBox="0 0 300 130" aria-hidden="true">
      <path className="v3-pv-band" d="M10 66 C 70 58, 120 40, 170 34 S 260 16, 290 10 L 290 118 C 250 112, 200 104, 170 100 S 70 82, 10 70 Z" />
      <path className="v3-pv-mid" d="M10 68 C 80 62, 130 58, 170 64 S 250 60, 290 58" />
      <path className="v3-pv-worst" d="M10 70 C 70 82, 120 96, 170 100 S 250 112, 290 118" />
      <line x1="10" x2="290" y1="68" y2="68" className="v3-pv-base" />
      <text x="292" y="12" textAnchor="end">Best case</text>
      <text x="292" y="128" textAnchor="end" className="is-worst">Worst case, shown first</text>
    </svg>
  );
}

// RISCH's four portfolios; an override can move one step either way, never more.
const TIERS = ['Balanced', 'Growth', 'Aggressive', 'Aggressive Plus'];
function DeviationViz() {
  return (
    <div className="v3-pv-tiers">
      {TIERS.map((t, k) => (
        <span key={t} className={k === 1 ? 'is-on' : Math.abs(k - 1) === 1 ? 'is-near' : undefined} style={{ '--h': `${38 + k * 20}%` }}>
          <i />
          <small>{t}</small>
        </span>
      ))}
      <em>±1 tier, recorded and signed</em>
    </div>
  );
}

const VIZ = [AbilityViz, ShelfViz, DisclosureViz, DeviationViz];

// A grid of cards, each a diagram over a title and a line of text.
//   items  [{ t, d, tag?, more?, href? }]   viz  matching diagram components
export function VizCards({ items, viz, cols = 2, linkLabel }) {
  const [ref, on] = useOnScreen();
  return (
    <ul ref={ref} className={`v3-pv v3-pv-${cols}` + (on ? ' is-on' : '')}>
      {items.map((c, i) => {
        const Viz = viz[i];
        const body = (
          <>
            <div className="v3-pv-art" aria-hidden="true">{Viz && <Viz />}</div>
            <div className="v3-pv-text">
              <span className="v3-pv-n">0{i + 1}</span>
              {c.tag && <span className="v3-pv-tag">{c.tag}</span>}
              <h3>{c.t}</h3>
              <p>{c.d}</p>
              {c.more && <small>{c.more}</small>}
              {c.href && <span className="v3-press-go">{linkLabel} <Arrow /></span>}
            </div>
          </>
        );
        return <li key={c.t}>{c.href ? <Link to={c.href}>{body}</Link> : body}</li>;
      })}
    </ul>
  );
}

export const HowWeWork = ({ items }) => <VizCards items={items} viz={VIZ} />;

/* ---- the four products ---- */

// Many holdings, spread across equity, debt and hybrid.
function MfViz() {
  const kinds = Array.from({ length: 30 }, (_, k) => (k % 10 < 5 ? 'eq' : k % 10 < 8 ? 'dt' : 'hy'));
  return (
    <div className="v3-pv-dots">
      {kinds.map((c, k) => <i key={k} className={c} style={{ '--i': k }} />)}
      <p><b className="eq" />Equity <b className="dt" />Debt <b className="hy" />Hybrid</p>
    </div>
  );
}

// Mostly long, with some short positions: the flexibility a SIF adds.
function SifViz() {
  const bars = [62, 80, 48, 70, 90, -34, 56, -22];
  return (
    <div className="v3-pv-ls">
      <div>{bars.map((h, k) => <span key={k} className={h < 0 ? 'is-short' : undefined}><i style={{ '--h': `${Math.abs(h)}%`, '--i': k }} /></span>)}</div>
      <p><b />Long <b className="is-short" />Short</p>
    </div>
  );
}

// Fewer, larger positions.
function PmsViz() {
  const size = [2, 1, 1, 1, 1];
  return (
    <div className="v3-pv-blocks">
      {size.map((n, k) => <i key={k} style={{ '--s': n, '--i': k }} />)}
    </div>
  );
}

// Outside the listed market.
function AifViz() {
  return (
    <div className="v3-pv-beyond">
      <div className="v3-pv-listed"><span>Listed markets</span>{Array.from({ length: 12 }, (_, k) => <i key={k} />)}</div>
      <ul>
        <li>Private credit</li>
        <li>Private equity</li>
        <li>Real estate</li>
      </ul>
    </div>
  );
}

export const PRODUCT_VIZ = [MfViz, SifViz, PmsViz, AifViz];

/* ---- the four disciplines ---- */

// Blocks sized to the client, not a model.
function BuildViz() {
  return (
    <div className="v3-pv-stack">
      {[['Liquidity', 18], ['Income', 26], ['Growth', 38], ['Legacy', 18]].map(([t, h]) => (
        <span key={t} style={{ '--h': `${h}%` }}><small>{t}</small></span>
      ))}
    </div>
  );
}

// The whole market, narrowed to the few that fit.
function SelectViz() {
  return (
    <svg className="v3-pv-funnel" viewBox="0 0 300 140" aria-hidden="true">
      {Array.from({ length: 26 }, (_, k) => {
        const x = 18 + (k % 13) * 21; const y = k < 13 ? 18 : 38;
        return <circle key={k} cx={x} cy={y} r="5" className={[3, 8, 17, 22].includes(k) ? 'is-pick' : undefined} />;
      })}
      <path d="M14 56 L286 56 L196 100 L104 100 Z" className="v3-pv-cone" />
      {[126, 142, 158, 174].map((x) => <circle key={x} cx={x} cy="122" r="7" className="is-pick" />)}
    </svg>
  );
}

// India and the world, in one plan.
function GlobalViz() {
  return (
    <div className="v3-pv-world">
      {[['India', 62], ['US', 18], ['Europe', 8], ['Asia', 7], ['Taiwan', 5]].map(([t, w]) => (
        <span key={t} style={{ '--w': `${w}%` }}>{w > 10 && <b>{t}</b>}</span>
      ))}
      <small>India · US · Europe · Asia · Taiwan, one plan (illustrative)</small>
    </div>
  );
}

// One point of contact at the centre.
function CoordViz() {
  const around = ['Investments', 'Liquidity', 'Succession', 'Tax adviser', 'Legal adviser', 'Reviews'];
  return (
    <div className="v3-pv-hub">
      <span className="v3-pv-hub-core">You + RISCH</span>
      {around.map((t, k) => {
        const a = ((k * 60 - 90) * Math.PI) / 180;
        return <span key={t} className="v3-pv-hub-node" style={{ '--x': `${Math.round(Math.cos(a) * 128)}px`, '--y': `${Math.round(Math.sin(a) * 66)}px`, '--i': k }}>{t}</span>;
      })}
    </div>
  );
}

export const DISCIPLINE_VIZ = [BuildViz, SelectViz, GlobalViz, CoordViz];
