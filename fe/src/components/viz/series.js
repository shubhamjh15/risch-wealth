// Deterministic, illustrative growth series for the site's charts. Nothing
// here is a real fund, index or client portfolio: every chart that uses it
// is labelled as a hypothetical illustration.

// Small seeded PRNG (mulberry32) so the prerendered page and the browser
// draw the same line.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ten years of monthly values for a diversified portfolio: an upward drift
// (about 10% a year) with ordinary noise and two drawdowns, so it looks like
// a real journey rather than a straight line.
export function tenYearSeries(seed = 7) {
  const r = rng(seed);
  const out = [1];
  for (let m = 1; m <= 120; m += 1) {
    const shock = (r() - 0.5) * 0.055;
    const drawdown = (m > 26 && m < 31) ? -0.03 : (m > 74 && m < 78) ? -0.035 : 0;
    const recovery = (m >= 31 && m < 38) ? 0.012 : (m >= 78 && m < 86) ? 0.012 : 0;
    out.push(out[m - 1] * (1 + 0.0072 + shock + drawdown + recovery));
  }
  return out;
}

// The last `years` of a series, rebased to start at 1.
export function window(series, years) {
  const tail = series.slice(series.length - 1 - years * 12);
  return tail.map((v) => v / tail[0]);
}

// SVG path for values across a width/height box (top padding pad).
export function linePath(values, w, h, pad = 12) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    pad + (1 - (v - min) / span) * (h - pad * 2),
  ]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  return { d, area: `${d}L${w} ${h}L0 ${h}Z`, pts };
}

const INR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
// Rupees in crore / lakh, the way Indian investors read them.
export function formatINR(rupees) {
  if (rupees >= 1e7) return `₹${INR.format(rupees / 1e7)} Cr`;
  return `₹${INR.format(rupees / 1e5)} L`;
}
