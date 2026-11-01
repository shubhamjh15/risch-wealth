// Firm facts shown across the site (home trust bar, footer, contact page,
// schema.org data). One place to keep them accurate.
//
// Anything set to null is simply not shown. Fill these in only with
// figures that are accurate, current, and cleared by compliance: the
// site deliberately doesn't display placeholder numbers.

export const FIRM = {
  name: 'RISCH Wealth',
  legalName: 'RISCH Wealth Private Limited',
  city: 'Bengaluru',
  region: 'Karnataka',
  country: 'India',
  // The only mailbox that currently receives mail. rischwealth.com has no
  // MX records yet, so contact@rischwealth.com would bounce. Switch this
  // once domain email is set up.
  email: 'rischwealth@gmail.com',
  phone: '+91 94480 90998',
  phoneHref: 'tel:+919448090998',
  // Optional second line. An older brochure listed +91 94830 03456 (also on
  // the Google Business Profile), but current materials only list the
  // number above, so it's off until confirmed. Shown wherever set.
  phoneAlt: null,
  phoneAltHref: null,
  // Office address, exactly as on the business card and letterhead.
  address: {
    lines: ['Brigade Exotica, Tower Azure', 'No 35 & 36/1, P', 'Old Madras Road', '(Before Budigere Cross)', 'Bengaluru 560049'],
    street: 'Brigade Exotica, Tower Azure, No 35 & 36/1, P, Old Madras Road (Before Budigere Cross)',
    postalCode: '560049',
  },
  clientLoginUrl: 'https://wealthelite.in/client-login',
  foundedYear: 2014,
  careerStartYear: 2006, // founder's first private-banking role (About timeline)

  // e.g. '100+'. Shown in the home trust bar as "Client families".
  clientCount: null,
  // e.g. { value: '₹250 Cr+', label: 'Assets under advice' }. Use the exact
  // term that matches the registration (AUM vs assets under advice, etc).
  assets: null,
  // e.g. '₹1 Cr'. Adds "For investors with ₹1 Cr+ in investable assets"
  // under the hero. Only if it's a real minimum you apply.
  minimumInvestable: null,

  // Regulatory standing, shown in the footer on every page, on the
  // Disclosure, About and Contact pages. APMI details: acknowledgement and
  // registration emails (June 2025). Written so the APMI registration is
  // only claimed for PMS distribution, which is what APMI registers.
  registrationNote: 'AMFI-registered Mutual Fund Distributor. Registered with APMI (Association of Portfolio Managers in India) as a Distributor of Portfolio Management Services. Distributor of Alternative Investment Funds (AIF).',
  // Plain-English statement of what the registrations mean in practice.
  // Shown with the registration details (About, Disclosure).
  roleNote: 'In practice: the mutual funds, portfolio management services and alternative investment funds we recommend are run by their own SEBI-registered asset managers, portfolio managers and fund managers. RISCH helps you choose them, arranges the investment and reviews the portfolio with you over time.',
  // `id` is shown on its own ("ARN-156886"), never with a caption that
  // repeats it or names the issuer.
  registrations: [
    // AMFI ARN (mutual fund distribution)
    { label: 'ARN', id: 'ARN-156886' },
    // APMI registration (PMS distribution)
    { label: 'APRN', id: 'APRN-05916' },
  ],
  // The founder's EUIN (E11449, valid 24/05/2025 – 23/05/2028) is no longer
  // shown on the site, but renew it before it expires.
  // Shown on the Disclosure page. Supplied by RISCH (October 2026); switch
  // the email to a domain address once one is set up.
  // Trail commission ranges (Top 30 cities) RISCH actually receives, per
  // SEBI/IMD/CIR No. 4/168230/09. Take them from RISCH's current AMC
  // brokerage structures; never copy another distributor's figures. Shape:
  // [{ group: 'Equity Schemes', rows: [['Equity Funds', '0.20% to 1.75%'], ...] }]
  // The table on the Disclosure page only appears once this is filled in.
  // Ranges cross-checked against AMC brokerage sheets for FY 2026-27
  // (Invesco, Quantum, Groww, Trust, Helios). Confirm against RISCH's own
  // quarterly AMC brokerage before go-live. Base rates, excluding GST.
  commissionRates: [
    { group: 'Equity Schemes', rows: [['Equity Funds', '0.20% to 1.75%']] },
    { group: 'Hybrid Schemes', rows: [
      ['Arbitrage Funds', '0.45% to 0.80%'],
      ['Conservative Hybrid Funds', '0.20% to 1.45%'],
      ['Other Hybrid Funds', '0.25% to 1.75%'],
    ] },
    { group: 'Debt Schemes', rows: [
      ['Overnight & Liquid Funds', '0.01% to 0.20%'],
      ['Ultra Short, Low, Money Market & Short Duration Funds', '0.05% to 1.30%'],
      ['Credit Risk Funds', '0.50% to 1.20%'],
      ['Gilt Funds', '0.10% to 1.00%'],
      ['Floater Funds', '0.15% to 0.68%'],
      ['Medium, Medium to Long, Long & Dynamic Duration Funds', '0.12% to 1.25%'],
      ['Corporate Bond, Banking & PSU Funds', '0.09% to 0.75%'],
    ] },
    { group: 'Other Schemes', rows: [
      ['Index Funds / ETFs', '0.03% to 1.10%'],
      ['Fund of Funds', '0.05% to 1.25%'],
      ['Retirement & Children’s Funds', '0.50% to 1.75%'],
    ] },
  ],
  commissionRatesAsOf: null, // e.g. 'October 2026'
  grievance:'For any complaint, write to or call our Grievance Officer, R K Maheshwari, at rischwealth@gmail.com or +91 94830 03456. If you are not satisfied with our response, you may raise it with the fund house or portfolio manager concerned, on SEBI’s SCORES portal (scores.sebi.gov.in), or through SMART ODR (smartodr.in).',
};
