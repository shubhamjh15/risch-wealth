// All copy for the What We Provide page (/solutions) lives here.
// Lines marked COMPLIANCE are regulatory-sensitive: RISCH is an AMFI-registered
// mutual fund distributor (ARN-156886) and an APMI-registered distributor of
// PMS and AIFs (APRN-05916). Edit them here and nowhere else.

// ---- hero ---------------------------------------------------------------
export const HERO = {
  title: ['Risk first.', 'Portfolio second.'],
  body: 'A portfolio should begin with the person it is built for, not with a shelf of products. We first understand how much risk you can carry, how long your capital can stay invested and what it needs to achieve. Only then do we decide what belongs in the portfolio.',
  secondary: 'Explore our approach',
  // the picture reads left to right: inputs, then the investor, then the portfolio
  inputs: ['Risk Tolerance', 'Time Horizon', 'Behavioural Profile'],
  architecture: 'Portfolio architecture',
  outputs: ['Domestic Equity', 'International Equity', 'Fixed Income'],
};


// ---- 1. understand ---------------------------------------------------------
export const UNDERSTAND = {
  title: 'Before we design a portfolio, we understand you.',
  intro: 'Your risk profile is built before any product is discussed, so the answer is about you and nothing else. Three things shape it: how much risk you can tolerate, how long your capital can stay invested and how you are likely to behave when markets move.',
  tolerance: {
    title: 'Risk Tolerance',
    body: 'A short psychometric questionnaire looks at how you think about money, loss and uncertainty, not only what you say you are comfortable with. It separates the losses you could absorb from the losses you could sit through.',
  },
  horizon: {
    title: 'Time Horizon',
    body: 'The longer capital can wait, the more room the portfolio has to work.',
    note: 'Time horizon is one of three inputs. Your full risk profile sets the final fit.',
    fitLabel: 'Likely fit',
    fitLink: 'See this mix below',
  },
  behaviour: {
    title: 'Behavioural Science',
    body: 'Tolerance on paper is not behaviour in a crisis. We study the patterns that quietly cost investors returns, like the urge to sell in a fall or chase a rally, and shape the portfolio so that you can stay with it.',
    figure: '1.2%',
    figureText: 'a year lost by the average investor to the timing of their buying and selling. The funds returned 9.9% a year; their investors earned 8.7%.',
    // the same two figures, for the bar visual
    fundsReturned: 9.9,
    investorsEarned: 8.7,
    gapCaption: 'a year lost by the average investor to the timing of their buying and selling.',
    // COMPLIANCE: third-party statistic. Verified against Morningstar's "Mind the
    // Gap" study (10 years to 31 Dec 2025, US open-end funds and ETFs).
    // source line removed from the page at the owner's request (Morningstar, Mind the Gap, US funds, 10 years to 31 Dec 2025)
    quote: 'The investor’s chief problem, and even his worst enemy, is likely to be himself.',
    quoteBy: 'Benjamin Graham, The Intelligent Investor',
  },
};

// Slider boundaries (see horizonForYears): up to 5 years Active Balanced, 6 to 7
// Active Growth, 8 to 10 Active Aggressive, 11 and up Active Aggressive Plus. `at` is
// where a row puts the slider.
export const HORIZONS = [
  { id: 'balanced', name: 'RISCH Active Balanced', span: 'Up to 5 years', from: 0, to: 5, at: 3 },
  { id: 'growth', name: 'RISCH Active Growth', span: '5 to 7 years', from: 5, to: 7, at: 6 },
  { id: 'aggressive', name: 'RISCH Active Aggressive', span: '7 to 10 years', from: 7, to: 10, at: 8 },
  { id: 'aggressive-plus', name: 'RISCH Active Aggressive Plus', span: '10 years and beyond', from: 10, to: 15, at: 12 },
];
// How a mix is named on the site: by its risk level, not as a RISCH-branded
// product (RISCH is a distributor; these are illustrative mixes). The full
// names stay in the risk profiler's proposal, explained on the Disclosure page.
export const mixLabel = (h) => h.name.replace(/^RISCH Active /, '');
export const SLIDER_MIN = 1;
export const SLIDER_MAX = 15; // shown as "15+"
// the one place the slider's years are turned into a portfolio id
export const horizonForYears = (y) => (y <= 5 ? 'balanced' : y <= 7 ? 'growth' : y <= 10 ? 'aggressive' : 'aggressive-plus');

// ---- 2. asset allocation ------------------------------------------------------
export const ALLOCATION = {
  title: 'Asset allocation decides most of the journey.',
  intro: 'We do not start with a product shelf. We start with how your money is spread across asset classes, then keep that mix on track as markets move.',
  label: 'Illustrative',
  macroTitle: 'Macro asset allocation',
  subTitle: 'Sub-asset class breakdown',
  // COMPLIANCE
  disclaimer: 'Illustrative only. These are example asset mixes by time horizon, shown to explain how they differ. They are not a recommendation or an offer of any product, and your own allocation is set from your full risk profile and circumstances.',
  points: [
    ['Set from your risk profile.', 'The mix follows who you are and what the capital is for, not what is popular this year.'],
    ['Rebalanced when markets pull it off target.', 'When one asset class runs ahead or falls behind, we bring the portfolio back to its intended shape.'],
    ['Reviewed when your life changes.', 'A new business, a sale, a child, a retirement date: the allocation is revisited when the facts change.'],
  ],
};

// The four model portfolios. The macro percentages and the sub-splits are the
// same ones the risk profiler uses (be/src/riskProfiler/config.js: TIERS and
// SPLIT); keep the two in step. Sub-asset values are derived from them.
const MODELS = {
  balanced: { india: 38.21, intl: 12.10, debt: 43.81, cash: 5.88 },
  growth: { india: 52.74, intl: 15.79, debt: 28.02, cash: 3.45 },
  aggressive: { india: 66.69, intl: 19.36, debt: 11.71, cash: 2.24 },
  'aggressive-plus': { india: 78.61, intl: 0, debt: 19.43, cash: 1.96 },
};
const SPLIT = {
  india: { large: 0.795, mid: 0.127, small: 0.078 },
  intl: { europe: 0.436, us: 0.349, asia: 0.215 },
  debt: { medium: 0.435, long: 0.316, short: 0.249 },
};
export const MACRO_CLASSES = [
  { id: 'india', name: 'India Equity', color: '#E36A1A' },
  { id: 'intl', name: 'International Equity', color: '#2B4A75' },
  { id: 'debt', name: 'India Fixed Income', color: '#8A97AB' },
  { id: 'cash', name: 'Cash & Equivalents', color: '#D9CBB8' },
];
export const SUB_CLASSES = [
  { id: 'large', name: 'India Large Cap', color: '#C2550F', of: 'india' },
  { id: 'mid', name: 'India Mid Cap', color: '#EE8A45', of: 'india' },
  { id: 'small', name: 'India Small Cap', color: '#F2B880', of: 'india' },
  { id: 'europe', name: 'Europe Equity', color: '#2B4A75', of: 'intl' },
  { id: 'us', name: 'US Equity', color: '#4F7CAC', of: 'intl' },
  { id: 'asia', name: 'Asia ex-Japan', color: '#9DBBD8', of: 'intl' },
  { id: 'medium', name: 'Medium Term Debt', color: '#5F708A', of: 'debt' },
  { id: 'long', name: 'Long Term Debt', color: '#8A97AB', of: 'debt' },
  { id: 'short', name: 'Short Term Debt', color: '#C3CBD8', of: 'debt' },
  { id: 'cashsub', name: 'Cash Equivalents', color: '#D9CBB8', of: 'cash' },
];
const round1 = (n) => Math.round(n * 10) / 10;
export const allocationFor = (id) => {
  const m = MODELS[id];
  return {
    macro: MACRO_CLASSES.map((c) => round1(m[c.id])),
    sub: SUB_CLASSES.map((c) => round1(c.of === 'cash' ? m.cash : m[c.of] * SPLIT[c.of][c.id])),
  };
};
export const PORTFOLIO_SUITS = {
  balanced: 'For capital that may be needed within about five years, where steadiness matters more than growth.',
  growth: 'For goals five to seven years away, with room for growth alongside a solid base of income.',
  aggressive: 'For goals seven to ten years out, where equity can do more of the work and the journey can be uneven.',
  'aggressive-plus': 'For capital that can stay invested for ten years or more and can sit through deep, long falls.',
};
// COMPLIANCE: concentration warning carried over from the risk profiler.
export const PORTFOLIO_NOTES = {
  'aggressive-plus': 'Domestic-only equity concentration. This may carry higher volatility than a globally diversified aggressive mandate.',
};

// ---- 3. philosophy -------------------------------------------------------------
export const PHILOSOPHY = {
  title: 'We build portfolios, not product lists.',
  quote: 'In a Test match, the balls you leave alone matter as much as the ones you play. We invest the same way.',
  quoteAlt: 'Nobody wins a Test match in the first session. Long innings are built on patience, discipline and knowing when not to play a shot.',
  morphTitle: 'Our investment principles',
  morphHint: 'Hover over a card, or tap it, to turn it over.',
};

// ---- 4. how it comes together ----------------------------------------------------
export const TOGETHER = {
  title: 'How a RISCH portfolio comes together.',
  steps: [
    ['Understand', 'Goals, time horizon, liquidity needs and Risk Tolerance.'],
    ['Allocate', 'Choose the asset mix that fits your profile.'],
    ['Construct', 'Select funds and strategies for each role in the mix.'],
    ['Review', 'Monitor, rebalance and adapt as markets and your life change.'],
  ],
  blocksTitle: 'Solutions',
  blocksIntro: 'There is no model portfolio. These are the solutions that may form part of one, and how much weight each carries is set with you, not in advance.',
  // COMPLIANCE: "held through" lines name product categories. PMS and AIF are
  // offered as a distributor and only to eligible investors.
  blocks: [
    { name: 'Mutual Fund', role: 'Professionally managed funds across equity, debt and hybrid strategies, for the core of a portfolio.', through: 'Mutual funds across equity, debt and hybrid categories, distributed by RISCH.' },
    { name: 'Portfolio Management Services (PMS)', role: 'A dedicated, concentrated equity portfolio for larger investments.', through: 'PMS strategies, distributed by RISCH.' },
    { name: 'Alternative Investment Funds (AIF)', role: 'Strategies beyond listed markets, such as private credit and private equity, for eligible investors.', through: 'AIFs, distributed by RISCH.' },
  ],

  // COMPLIANCE: existing disclosure, keep verbatim.
  disclosure: 'Portfolio components shown here illustrate RISCH’s investment framework; they are not a recommendation. A suitable portfolio also depends on your wider net worth, liabilities, illiquid assets, taxes and liquidity needs, which we go through with you in conversation.',
  disciplinesTitle: 'Four disciplines. One coherent portfolio.',
  disciplines: [
    { t: 'Portfolio Construction', d: 'A portfolio built around your objectives, liquidity needs, time horizon and ability to withstand losses, sized to you and not to a model.' },
    { t: 'Fund & Strategy Selection', d: 'Mutual funds, PMS and AIFs from across the market, each chosen for the role it plays in your portfolio. Our research and risk assessment drive the selection.' },
    { t: 'Global Diversification', d: 'Access to opportunities beyond Indian markets (the US, Europe, Asia and Taiwan), held as part of one plan rather than as a separate bet.' },
    { t: 'Wealth Coordination', d: 'Investments, liquidity, succession and your legal and tax advisers brought into one view, with one point of contact and regular reviews.' },
  ],
};

export const CLOSING = {
  title: 'A portfolio built around your life.',
};
