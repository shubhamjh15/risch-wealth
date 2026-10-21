// Rishiraj Maheshwari's own writing and his commentary in the press, newest
// first. Shown on the Perspective page and in the home page's "In the
// press" section.
//
// Every entry was checked against the original article (October 2026):
// headline, outlet, date and link are as published, and `quote` is his
// words verbatim from that article. Don't paraphrase inside `quote`; put a
// summary in `note` instead. Add new coverage at the top.
//   kind   'article'  written by him
//          'press'    he is quoted
//   date   ISO date of publication

export const PRESS = [
  {
    kind: 'press',
    date: '2026-09-15',
    outlet: 'ANI · The Tribune',
    title: 'RBI clarity changes dynamics in Tata ecosystem; all eyes on Sept 17 Tata Sons board meeting',
    quote: 'Tata Sons Board will have to evaluate its options',
    note: 'On the Tata Sons board meeting after the RBI’s decision, and why challenging the regulator would be closely watched, in India and beyond.',
    url: 'https://www.tribuneindia.com/news/nbfc-registration/rbi-clarity-changes-dynamics-in-tata-ecosystem-all-eyes-on-sept-17-tata-sons-board-meeting',
  },
  {
    kind: 'press',
    date: '2024-07-12',
    outlet: 'Business Today',
    title: 'Market titans like Vijay Kedia and the Jhunjhunwalas are shifting their focus on start-ups; here’s why',
    quote: 'Diversify a portfolio, conduct thorough research, and be prepared for the long-term commitment required in start-up investing',
    note: 'Why seasoned market investors are backing start-ups, and the discipline that kind of investing needs.',
    url: 'https://www.businesstoday.in/magazine/cover-story/story/market-titans-like-vijay-kedia-and-the-jhunjhunwalas-are-shifting-their-focus-on-start-ups-here-s-why-436428-2024-07-12',
  },
  {
    kind: 'press',
    date: '2024-02-29',
    outlet: 'Business Today',
    title: 'Sectoral and thematic mutual funds is seeing a great run; what’s driving this growth?',
    quote: 'With an increasing influx of retail SIP investments, investors are now seeking additional diversification options.',
    note: 'What is driving money into sectoral and thematic funds, and why diversified funds still come first.',
    url: 'https://www.businesstoday.in/magazine/deep-dive/story/sectoral-and-thematic-mutual-funds-is-seeing-a-great-run-whats-driving-this-growth-419334-2024-02-29',
  },
  {
    kind: 'press',
    date: '2024-01-04',
    outlet: 'Business Today',
    title: 'How to build mutual fund portfolio in 2024? Here’s what these money managers suggest',
    quote: 'India is witnessing the best of macros in a long time with better growth, lower oil prices, revival in investment cycle.',
    note: 'Building a mutual fund portfolio for 2024: strict risk profiling, a five-to-seven-year horizon, and small caps kept to a small share.',
    url: 'https://www.businesstoday.in/mutual-funds/story/how-to-build-mutual-fund-portfolio-in-2024-heres-what-these-money-managers-suggest-411866-2024-01-04',
  },
  {
    kind: 'press',
    date: '2023-09-08',
    outlet: 'Business Today',
    title: 'HDFC Smallcap Fund, Quant Smallcap Fund, Franklin India Smaller Companies Fund: These have delivered up to 39% returns in just 1 year',
    quote: 'Whoever comes in for small-caps funds now should have long time horizons 5–10-year holdings and allocate funds as per their risk appetite and asset allocations.',
    note: 'After a strong year for small-cap funds: how much to allocate, and for how long.',
    url: 'https://www.businesstoday.in/mutual-funds/story/hdfc-smallcap-fund-quant-smallcap-fund-franklin-india-smaller-companies-fund-these-have-delivered-up-to-39-returns-in-just-1-year-397457-2023-09-08',
  },
  {
    kind: 'press',
    date: '2022-07-19',
    outlet: 'Business Today',
    title: 'How to make money in times of a falling rupee? Here’s what analysts have to say',
    quote: 'The sectors that can benefit from depreciating rupee are that of IT, pharma, textiles, tea and garments.',
    note: 'Which sectors gain and which suffer when the rupee weakens.',
    url: 'https://www.businesstoday.in/markets/stock-picks/story/how-to-make-money-in-times-of-a-falling-rupee-heres-what-analysts-have-to-say-341954-2022-07-19',
  },
  {
    kind: 'article',
    date: '2020-09-04',
    outlet: 'Morningstar India',
    title: '7 principles of sound advice',
    note: 'Seven practices every adviser must follow to earn investors’ trust: a client-first approach, understanding investors, behavioural coaching, diversification, ongoing monitoring, independence and minimising costs. The same principles RISCH sets out for every new client.',
    url: 'https://www.morningstar.in/posts/59816/7-principles-sound-advice.aspx',
  },
];

export const pressYear = (p) => p.date.slice(0, 4);
export const pressDate = (p) =>
  new Date(`${p.date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// The outlets, for the "as featured in" line.
export const PRESS_OUTLETS = ['Business Today', 'Morningstar India', 'ANI', 'The Tribune'];
