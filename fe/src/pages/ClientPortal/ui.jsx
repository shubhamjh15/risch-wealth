// Shared pieces for the client dashboard: number/date formatting, the
// allocation donut, the risk gauge and the sidebar icons.

export const inr = (n) => (n === null || n === undefined ? '–' : `₹${Math.round(n).toLocaleString('en-IN')}`);

// ₹1.24 Cr / ₹8.5 L, for tight spaces (donut centre).
export function inrShort(n) {
  if (n === null || n === undefined) return '–';
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return inr(n);
}

export const signedInr = (n) => (n === null || n === undefined ? '–' : `${n < 0 ? '−' : '+'}${inr(Math.abs(n))}`);
export const signedPct = (n) => (n === null || n === undefined ? '–' : `${n < 0 ? '−' : '+'}${Math.abs(n).toFixed(2)}%`);
export const tone = (n) => (n === null || n === undefined || n === 0 ? '' : n > 0 ? 'pos' : 'neg');
export const units = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
export const nav = (n) => (n === null || n === undefined ? '–' : Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 4 }));

// 'YYYY-MM-DD' dates are calendar dates (no timezone); anything else is a
// timestamp.
export function fmtDate(d) {
  if (!d) return '–';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T00:00:00`) : new Date(d);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const ASSET_COLORS = {
  Equity: '#F1650C',
  Debt: '#2F5D8A',
  Hybrid: '#2F8F52',
  Commodities: '#C9A227',
  International: '#7A5AA6',
  Other: '#8C8375',
};
export const assetColor = (c) => ASSET_COLORS[c] || ASSET_COLORS.Other;

// Allocation ring. `items`: [{ assetClass, value, pct }].
export function Donut({ items, total, size = 176 }) {
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="cp-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Asset allocation">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        {items.map((it) => {
          const len = (it.pct / 100) * c;
          const seg = (
            <circle
              key={it.assetClass}
              cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={assetColor(it.assetClass)} strokeWidth={stroke}
              strokeDasharray={`${Math.max(len - 1.5, 0)} ${c}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <div className="cp-donut-centre">
        <strong>{inrShort(total)}</strong>
        <span>Total</span>
      </div>
    </div>
  );
}

// Half-circle gauge split into the four RISCH mandates; the client's
// tier and those below it are filled.
export function RiskGauge({ tier, of = 4 }) {
  const w = 220;
  const cx = w / 2;
  const cy = 112;
  const r = 92;
  const gap = 0.05;
  const arcs = [];
  for (let i = 0; i < of; i += 1) {
    const a0 = Math.PI + (i / of) * Math.PI + (i ? gap / 2 : 0);
    const a1 = Math.PI + ((i + 1) / of) * Math.PI - (i < of - 1 ? gap / 2 : 0);
    const p = (a) => `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
    arcs.push(
      <path
        key={i}
        d={`M ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)}`}
        fill="none" strokeWidth="16" strokeLinecap="butt"
        stroke={i < tier ? 'var(--orange)' : 'var(--line)'}
      />,
    );
  }
  return (
    <svg className="cp-gauge" width={w} height={124} viewBox={`0 0 ${w} 124`} role="img" aria-label={`Risk level ${tier} of ${of}`}>
      {arcs}
      <text x={cx} y={cy - 14} textAnchor="middle" className="cp-gauge-num">{tier}</text>
      <text x={cx} y={cy + 6} textAnchor="middle" className="cp-gauge-of">of {of}</text>
    </svg>
  );
}

const icon = (d) => function Icon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
  );
};

export const Icons = {
  overview: icon(<><rect x="3" y="3" width="7" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="15" width="7" height="6" rx="1.5" /></>),
  portfolio: icon(<><path d="M12 3a9 9 0 1 0 9 9h-9z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15z" /></>),
  transactions: icon(<><path d="M4 7h14M14 3l4 4-4 4" /><path d="M20 17H6M10 13l-4 4 4 4" /></>),
  statements: icon(<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>),
  risk: icon(<><path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></>),
  messages: icon(<><path d="M4 5h16v11H8l-4 4z" /><path d="M8 9h8M8 12h5" /></>),
  profile: icon(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>),
  help: icon(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01" /></>),
  menu: icon(<path d="M4 7h16M4 12h16M4 17h16" />),
  close: icon(<path d="M6 6l12 12M18 6L6 18" />),
  chevron: icon(<path d="M6 9l6 6 6-6" />),
  download: icon(<><path d="M12 4v11M7 10l5 5 5-5" /><path d="M5 20h14" /></>),
  info: icon(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>),
  home: icon(<><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>),
  clients: icon(<><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" /><circle cx="17" cy="8.5" r="2.6" /><path d="M15 14.2c2.7.4 4.7 2.5 4.7 5.8" /></>),
  inbox: icon(<><path d="M4 13l2.5-8h11L20 13v6H4z" /><path d="M4 13h5l1 2h4l1-2h5" /></>),
  quote: icon(<><path d="M4 20V5h16v11H8z" /><path d="M9 9.5v2.5M15 9.5v2.5" /></>),
  team: icon(<><circle cx="12" cy="7.5" r="3" /><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="5" cy="9.5" r="2" /><circle cx="19" cy="9.5" r="2" /></>),
  plus: icon(<path d="M12 5v14M5 12h14" />),
  more: icon(<><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></>),
  search: icon(<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>),
  back: icon(<path d="M15 6l-6 6 6 6" />),
  signout: icon(<><path d="M9 4H5v16h4" /><path d="M16 8l4 4-4 4M20 12H9" /></>),
};

export const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5" stroke="currentColor" strokeWidth="1.3" /></svg>
);

export function PageHead({ title, sub, children }) {
  return (
    <div className="cp-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children}
    </div>
  );
}
