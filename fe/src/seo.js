// Per-page SEO metadata and structured data (schema.org JSON-LD).
//
// Used in two places, so the two always agree:
//   - scripts/prerender.mjs writes these into each page's static HTML at
//     build time (what search engines, social previews and LLM crawlers see)
//   - components/RouteHead.jsx updates them on client-side navigation
//
// Guidelines from the SEO audit: titles 50–60 characters, descriptions
// 120–160 characters. `npm run build` warns if a page falls outside that.

// Explicit .js extension: scripts/prerender.mjs imports this file in plain Node.
import { FIRM } from './data/firm.js';

export const SITE_URL = 'https://rischwealth.com';
export const SITE_NAME = 'RISCH Wealth';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const PAGES = {
  '/': {
    title: 'RISCH Wealth | Private Wealth Management in Bengaluru',
    description: 'RISCH Wealth is a private wealth management firm in Bengaluru, led by a career private banker, for entrepreneurs, families, professionals and global Indians.',
  },
  '/about': {
    title: 'About RISCH Wealth | Founder & CEO Rishiraj Maheshwari',
    description: 'Meet Rishiraj Maheshwari, founder of RISCH Wealth: a career private banker whose roles include ICICI Securities and Nuvama Private Wealth.',
  },
  '/who-we-serve': {
    title: 'Who We Serve | Private Wealth for Families, NRIs & Founders',
    description: 'RISCH Wealth works with business owners, entrepreneurs, families, NRIs, senior executives and family offices, with a portfolio built around each balance sheet.',
  },
  '/solutions': {
    title: 'Risk First, Portfolio Second: What We Provide | RISCH',
    description: 'RISCH starts with your risk, time horizon and liquidity, then decides which solutions belong in your portfolio. Private wealth portfolio construction.',
  },
  '/risk-profiler': {
    title: 'Risk Profiler | Find Your Investment Risk Profile | RISCH',
    description: 'Answer eight questions to see your investment risk profile and an illustrative asset mix, with time horizon and risk preference scored separately.',
  },
  '/testimonials': {
    title: 'Client Testimonials | RISCH Wealth Private Wealth Firm',
    description: 'What clients say about working with RISCH Wealth, a private wealth management firm in Bengaluru led by career private banker Rishiraj Maheshwari.',
  },
  '/perspective': {
    title: 'Perspective | Notes on Risk and Portfolio Strategy | RISCH',
    description: 'Rishiraj Maheshwari of RISCH Wealth in Business Today, Morningstar India and ANI: articles and commentary on markets, mutual funds and portfolios.',
  },
  '/disclosure': {
    title: 'Disclosures & Disclaimers | RISCH Wealth Private Limited',
    description: 'Important disclosures, methodology notes and disclaimers for RISCH Wealth Private Limited and the RISCH risk profiler. Investments are subject to market risk.',
  },
  '/contact': {
    title: 'Contact RISCH Wealth | Private Wealth Firm in Bengaluru',
    description: 'Get in touch with RISCH Wealth in Bengaluru about private wealth solutions, portfolio construction or your risk profile. Email, call or send us a message.',
  },
  '/client-login': {
    title: 'Client Login | RISCH Wealth',
    description: 'Sign in to your RISCH Wealth client account.',
    noindex: true,
  },
  '/client-portal': {
    title: 'Overview | RISCH Client Portal',
    description: 'Your RISCH Wealth client portal.',
    noindex: true,
  },
  '/client-portal/portfolio': {
    title: 'Portfolio | RISCH Client Portal',
    description: 'Your RISCH Wealth client portal.',
    noindex: true,
  },
  '/client-portal/transactions': {
    title: 'Transactions | RISCH Client Portal',
    description: 'Your RISCH Wealth client portal.',
    noindex: true,
  },
  '/client-portal/statements': {
    title: 'Statements | RISCH Client Portal',
    description: 'Your RISCH Wealth client portal.',
    noindex: true,
  },
  '/client-portal/risk-profile': {
    title: 'Risk Profile | RISCH Client Portal',
    description: 'Your RISCH Wealth client portal.',
    noindex: true,
  },
  '/client-portal/risk-assessment': {
    title: 'Risk Assessment | RISCH Client Portal',
    description: 'Your RISCH Wealth client portal.',
    noindex: true,
  },
  '/client-portal/risk-report': {
    title: 'Risk Proposal | RISCH Client Portal',
    description: 'Your RISCH Wealth client portal.',
    noindex: true,
  },
  '/client-portal/messages': {
    title: 'Messages | RISCH Client Portal',
    description: 'Your RISCH Wealth client portal.',
    noindex: true,
  },
  '/client-portal/profile': {
    title: 'Profile & Security | RISCH Client Portal',
    description: 'Your RISCH Wealth client portal.',
    noindex: true,
  },
  '/employee-portal': {
    title: 'Staff Portal | RISCH Wealth',
    description: 'The RISCH Wealth staff portal.',
    noindex: true,
  },
  '/employee-login': {
    title: 'Employee Login | RISCH Wealth',
    description: 'Sign-in for the RISCH Wealth team.',
    noindex: true,
  },
  '/404': {
    title: 'Page Not Found | RISCH Wealth',
    description: "The page you're looking for doesn't exist.",
    noindex: true,
  },
};

export function getPage(pathname) {
  return PAGES[pathname] || PAGES['/404'];
}

export function canonicalUrl(pathname) {
  return pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathname}`;
}

// Shown on the home page and emitted as FAQPage schema. Every answer is
// drawn from what the site already says elsewhere; keep them in sync.
export const FAQS = [
  {
    q: 'What is RISCH Wealth?',
    a: 'RISCH Wealth Private Limited is a private wealth management firm based in Bengaluru. It was founded in 2014 by Rishiraj Maheshwari, a career private banker whose career includes Senior Private Banker at ICICI Securities and Nuvama Private Wealth.',
  },
  {
    q: 'Who does RISCH Wealth work with?',
    a: 'RISCH works with a small number of clients directly. The profiles we see most often are business owners, entrepreneurs and founders, private clients and families, NRIs and global Indians, senior executives and professionals, and family offices looking for a second opinion.',
  },
  {
    q: 'Can NRIs work with RISCH?',
    a: 'Yes. NRIs and global Indians are among the clients RISCH works with most often, typically where holdings sit across countries and the Indian portfolio needs a single point of accountability. Which funds and strategies are available depends on your country of residence and each product\'s rules, which we check before recommending anything.',
  },
  {
    q: 'How does RISCH build and manage a portfolio?',
    a: 'In four steps that repeat for as long as you are a client. We understand your goals, liquidity needs, time horizon and ability to withstand losses; construct a diversified portfolio across Indian and international equity, fixed income, commodities and real estate; monitor it with regular reviews and rebalancing; and coordinate it with the rest of your family wealth and long-term financial decisions.',
  },
  {
    q: 'How does the RISCH risk profiler work?',
    a: 'The risk profiler is an eight-question diagnostic that scores your time horizon and risk preference independently, then matches you to a recommended portfolio. You get an instant proposal with an allocation and hypothetical outcomes. It is a starting point for a conversation, not a substitute for one.',
  },
  {
    q: 'Which asset classes does RISCH allocate across?',
    a: 'Portfolios are built across domestic equity (large, mid and small cap, plus thematic and sectoral funds), international equity (US, Europe, Asia ex-Japan and Taiwan), fixed income (short, medium and long duration), commodities (gold and silver) and real estate (REITs and InvITs), sized to the client rather than a model.',
  },
  {
    q: 'Does RISCH Wealth sell its own investment products?',
    a: 'No. RISCH has no proprietary fund, so recommendations align to the client, not a product shelf. Any deviation from the recommended portfolio is recorded, justified and signed by both parties.',
  },
  {
    q: 'How do I get started?',
    a: `Start with a conversation: email ${FIRM.email} or call ${FIRM.phone}, or use the contact page. If you'd like a first view beforehand, the risk profiler on this site produces a preliminary allocation in a few minutes.`,
  },
];

const ORG_ID = `${SITE_URL}/#organization`;
const FOUNDER_ID = `${SITE_URL}/#founder`;

const ORGANIZATION = {
  '@type': 'FinancialService',
  '@id': ORG_ID,
  name: 'RISCH Wealth',
  legalName: 'RISCH Wealth Private Limited',
  alternateName: 'RISCH Private Wealth',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo.png`,
  image: OG_IMAGE,
  description: 'Private wealth management firm in Bengaluru, led by a career private banker. Portfolios built around each client\'s goals, risk and long-term wealth.',
  foundingDate: '2014',
  founder: { '@id': FOUNDER_ID },
  email: FIRM.email,
  telephone: FIRM.phone.replace(/\s+/g, '-'),
  contactPoint: [FIRM.phone, FIRM.phoneAlt].filter(Boolean).map((t) => ({
    '@type': 'ContactPoint',
    telephone: t.replace(/\s+/g, '-'),
    contactType: 'customer service',
    areaServed: 'IN',
  })),
  address: {
    '@type': 'PostalAddress',
    streetAddress: FIRM.address.street,
    postalCode: FIRM.address.postalCode,
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    addressCountry: 'IN',
  },
  areaServed: { '@type': 'Country', name: 'India' },
  knowsAbout: ['Private wealth management', 'Portfolio construction', 'Risk profiling', 'Wealth coordination', 'Succession planning'],
  // Company profiles only; the founder's personal LinkedIn is on FOUNDER.
  // Instagram (https://www.instagram.com/rischwealth/) is hidden for now;
  // add it back here as sameAs: [...] when it's shown on the site again.
};

const FOUNDER = {
  '@type': 'Person',
  '@id': FOUNDER_ID,
  name: 'Rishiraj Maheshwari',
  jobTitle: 'Founder & CEO',
  worksFor: { '@id': ORG_ID },
  sameAs: ['https://www.linkedin.com/in/rishiraj-maheshwari-81240b5/'],
};

const COFOUNDER = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#kratika-maheshwari`,
  name: 'Kratika Maheshwari',
  jobTitle: 'Co-Founder & Chief Client Experience Officer',
  worksFor: { '@id': ORG_ID },
  alumniOf: ['Christ University', 'Jain (Deemed-to-be University)'],
};

const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  publisher: { '@id': ORG_ID },
  inLanguage: 'en-IN',
};

// The JSON-LD graph for a page. Organization + founder + website go on
// every page; the FAQ only on the home page, where it's visible.
export function getJsonLd(pathname) {
  const page = getPage(pathname);
  const graph = [ORGANIZATION, FOUNDER, COFOUNDER, WEBSITE];
  if (!page.noindex) {
    graph.push({
      '@type': pathname === '/about' ? 'AboutPage' : pathname === '/contact' ? 'ContactPage' : 'WebPage',
      '@id': `${canonicalUrl(pathname)}#webpage`,
      url: canonicalUrl(pathname),
      name: page.title,
      description: page.description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': ORG_ID },
      inLanguage: 'en-IN',
    });
  }
  if (pathname === '/') {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: FAQS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

// The <head> tags for a page, as plain data. The prerender script
// serialises these to HTML; RouteHead applies them to the live document.
export function getHeadTags(pathname) {
  const page = getPage(pathname);
  const url = canonicalUrl(pathname);
  const meta = [
    { name: 'description', content: page.description },
    { name: 'robots', content: page.noindex ? 'noindex, follow' : 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:locale', content: 'en_IN' },
    { property: 'og:title', content: page.title },
    { property: 'og:description', content: page.description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: OG_IMAGE },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'RISCH Wealth: Capital deserves a considered hand.' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: page.title },
    { name: 'twitter:description', content: page.description },
    { name: 'twitter:image', content: OG_IMAGE },
  ];
  return { title: page.title, canonical: page.noindex ? null : url, meta };
}
