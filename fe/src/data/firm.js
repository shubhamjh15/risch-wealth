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
  grievance: 'For any complaint, write to or call our Grievance Officer, R K Maheshwari, at rischwealth@gmail.com or +91 94830 03456. If you are not satisfied with our response, you may raise it with the fund house or portfolio manager concerned, on SEBI’s SCORES portal (scores.sebi.gov.in), or through SMART ODR (smartodr.in).',
};
