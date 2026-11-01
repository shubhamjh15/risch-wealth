import { useEffect, useState } from 'react';
import { PageShell, LightHero } from '../v3/page';
import { FIRM } from '../data/firm';

// Each entry becomes a numbered row (same pattern as the home page's
// "Risk first. Return follows." section) — a heading and a paragraph,
// nothing invented beyond what the rest of the site already states.
// The two FIRM-derived entries only appear once those fields are filled
// in (src/data/firm.js), same as the footer's registration line.
function buildSections() {
  const sections = [
    {
      title: 'Purpose of this disclosure',
      body: "This page sets out the basis on which RISCH Wealth's website, its risk assessment and any proposal generated from it should be read. It is provided for transparency, not as a substitute for a direct conversation about your circumstances.",
    },
    {
      title: 'About RISCH Wealth',
      body: `${FIRM.legalName} is a private wealth practice based in ${FIRM.city}, ${FIRM.region}, ${FIRM.country}, founded in ${FIRM.foundedYear}. Nothing on this site is an offer or solicitation to buy or sell any security in any jurisdiction where such an offer would be unlawful.`,
    },
    {
      title: 'Regulatory compliance',
      body: `${FIRM.legalName} ensures compliance with all applicable laws and guidelines issued by SEBI and other regulatory authorities, as amended from time to time.`,
    },
    {
      title: 'The risk assessment: methodology and scope',
      body: 'The eight-question assessment synthesises two principal dimensions: liquidity time horizon and drawdown tolerance, informed by behavioural loss aversion. Resulting scores map across a continuum of four portfolios, from RISCH Balanced to RISCH Aggressive Plus, and the output is a preliminary allocation, not a final recommendation.',
    },
    {
      title: 'Context this tool cannot capture',
      body: 'The assessment is a starting point, not a complete financial picture. Overall net worth, debt obligations, illiquid holdings, tax position and family or succession considerations are reviewed in conversation before any allocation is finalised.',
    },
    {
      title: 'No proprietary products',
      body: 'RISCH Wealth holds no proprietary fund or product to sell. Where any institutional holding or third-party arrangement exists, it is managed under information barriers designed to prevent conflicts of interest from influencing a recommendation.',
    },
    {
      title: 'Bounded deviation',
      body: 'Where a client or RISCH Wealth elects to deviate from a recommended portfolio, that deviation is bounded to one tier above or below the recommendation, with the basis for it documented and signed by both parties.',
    },
    {
      title: 'No advice, no endorsement',
      body: `${FIRM.legalName} does not endorse or promote any opportunity referenced on this site, and nothing here should be read as an offer, solicitation or invitation to participate in one. Any assets or securities referenced may be arranged, referred to or held by the firm. This site does not provide business, investment, tax or legal advice, and no investment decision should be made solely on the basis of information provided here.`,
    },
    {
      title: 'General risk warning',
      body: 'This site, and any proposal generated from it, is provided for informational purposes only and does not constitute investment advice. Investments in securities, mutual funds, portfolio services and alternative assets are subject to market risk, including possible loss of principal invested.',
    },
    {
      title: 'Mutual fund risk disclosure',
      body: 'Mutual fund investments are subject to market risks; read all scheme-related documents carefully. The NAVs of the schemes may go up or down depending on the factors and forces affecting the securities market, including fluctuations in interest rates. The past performance of mutual funds is not necessarily indicative of the future performance of the schemes. A mutual fund does not guarantee or assure any dividend under any of its schemes, which is subject to the availability and adequacy of distributable surplus. Investors should review the scheme documents carefully and obtain expert professional advice on the specific legal, tax and financial implications of an investment.',
    },
    {
      title: 'No guarantee of returns',
      body: 'Past performance is not an indicator or guarantee of future returns. Portfolio names shown in a proposal (RISCH Balanced Portfolio, RISCH Growth Portfolio, RISCH Aggressive Portfolio, RISCH Aggressive Plus Portfolio) are labels for an allocation mandate and do not themselves represent or guarantee any performance outcome.',
    },
    {
      title: 'Confidentiality of client information',
      body: "Information a client shares with RISCH Wealth, whether through this site, in conversation or in a portfolio review, is held in confidence and used solely to develop, execute and service that client's portfolio.",
    },
    {
      title: 'Trademarks',
      body: 'Any trademarks or symbols appearing on this site are included for informational purposes only and remain the property of their respective owners.',
    },
  ];

  // Registration sits straight after the compliance statement, not at the end.
  if (FIRM.registrations.length > 0) {
    const at = sections.findIndex((x) => x.title === 'Regulatory compliance') + 1;
    sections.splice(at, 0, {
      title: 'Registration',
      body: (
        <>
          <p style={{ marginBottom: 12 }}>{FIRM.legalName}. {FIRM.registrationNote}</p>
          <p style={{ marginBottom: 12 }}>{FIRM.roleNote}</p>
          {FIRM.registrations.map((r) => (
            <p className="mb-0" key={r.id} style={{ marginBottom: 6 }}><strong>{r.id}</strong></p>
          ))}
        </>
      ),
    });
  }

  // Commission disclosure (SEBI/IMD/CIR No. 4/168230/09; all-trail model
  // since SEBI's October 2018 TER circular).
  const rateTable = FIRM.commissionRates && (
    <>
      <table className="v3-legal-table">
        <thead><tr><th>Scheme category</th><th>Annual trail (Top 30 cities)</th></tr></thead>
        <tbody>
          {FIRM.commissionRates.map((g) => [
            <tr className="is-group" key={g.group}><td colSpan={2}>{g.group}</td></tr>,
            ...g.rows.map(([name, rate]) => <tr key={g.group + name}><td>{name}</td><td>{rate}</td></tr>),
          ])}
        </tbody>
      </table>
      {FIRM.commissionRatesAsOf && <p style={{ fontSize: 13.5 }}>Rates as of {FIRM.commissionRatesAsOf}.</p>}
    </>
  );
  sections.push(
    {
      title: 'Commission earned on mutual funds',
      body: (
        <>
          <p>{FIRM.legalName} is offered commission on mutual fund business sourced under its own ARN. The commission varies from fund house to fund house and from scheme to scheme. In line with SEBI circular SEBI/IMD/CIR No. 4/168230/09, the commission earned from the asset management companies whose products we distribute is disclosed below.</p>
          {rateTable || <p>The scheme-category rate ranges currently applicable are available on request at {FIRM.email}.</p>}
        </>
      ),
    },
    {
      title: 'Basis of the rates disclosed',
      body: (
        <ul>
          <li>They refer to the Top 30 (T30) cities as defined by AMFI; commission may be higher for investments from Beyond 30 (B30) cities.</li>
          <li>They are set by agreement between {FIRM.legalName} and each AMC, and may change without prior notice.</li>
          <li>They are base trail rates, exclusive of GST. From 1 April 2026, GST on distributor commission is paid separately by the AMC, in line with the amended SEBI (Mutual Funds) Regulations and AMFI circular 135/BP/123/2025-26 dated 12 March 2026.</li>
          <li>All commission is paid as trail only, in line with the AMFI Master Circular for MFDs (AMFI/MFD-CIR/32/2025-26, 14 January 2026).</li>
          <li>They are compiled on a best-effort basis and updated as and when revised rates are received from AMCs.</li>
          <li>Scheme-level commission is available from your relationship manager on request.</li>
        </ul>
      ),
    },
    {
      title: 'Regular plans, trail commission only',
      body: 'As a mutual fund distributor, RISCH Wealth transacts in the Regular plans of mutual fund schemes, which carry distributor commission. Commission is paid by the AMC as a trail on assets invested; no upfront commission is paid to or received by RISCH Wealth. Every scheme also offers a Direct plan, with a lower expense ratio and no distributor commission; RISCH Wealth does not earn commission on Direct plans. Investors should check the exit load and total expense ratio (TER) applicable before investing.',
    },
    {
      title: 'Commission on PMS and AIF',
      body: 'Where RISCH Wealth distributes a portfolio management service or alternative investment fund, the fees or commission it receives from the portfolio manager or fund manager are disclosed to the client before investment, as required by the respective SEBI regulations.',
    },
    {
      title: 'Verifying what we earn',
      body: (
        <>
          The gross commission earned by {FIRM.legalName} in any financial year can be checked on AMFI’s website at <a href="https://www.amfiindia.com/commission-disclosure" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>amfiindia.com/commission-disclosure</a>. The commission paid on your own investments is also shown in rupee terms in your Consolidated Account Statement.
        </>
      ),
    },
  );

  if (FIRM.grievance) {
    sections.push({ title: 'Grievance redressal', body: FIRM.grievance });
  }

  sections.push({
    title: 'Questions about this disclosure',
    body: (
      <>
        Write to <a href={`mailto:${FIRM.email}`} style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>{FIRM.email}</a> or call <a href={FIRM.phoneHref} style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>{FIRM.phone}</a>.
      </>
    ),
  });

  // Grouped like a formal institutional disclosure. Clause numbers run
  // continuously across the groups.
  const groupOf = {
    'About RISCH Wealth': 'Regulatory Information',
    'Regulatory compliance': 'Regulatory Information',
    'Registration': 'Regulatory Information',
    'Grievance redressal': 'Regulatory Information',
    'General risk warning': 'Risk Disclosure',
    'Mutual fund risk disclosure': 'Risk Disclosure',
    'No guarantee of returns': 'Risk Disclosure',
    'The risk assessment: methodology and scope': 'Methodology',
    'Context this tool cannot capture': 'Methodology',
    'No proprietary products': 'Conflicts of Interest',
    'Bounded deviation': 'Portfolio Deviation Policy',
    'Commission earned on mutual funds': 'Commission Disclosure',
    'Basis of the rates disclosed': 'Commission Disclosure',
    'Regular plans, trail commission only': 'Commission Disclosure',
    'Commission on PMS and AIF': 'Commission Disclosure',
    'Verifying what we earn': 'Commission Disclosure',
  };
  const order = ['Regulatory Information', 'Commission Disclosure', 'Risk Disclosure', 'Methodology', 'Conflicts of Interest', 'Portfolio Deviation Policy', 'Important Investor Information'];
  let n = 0;
  return order
    .map((group) => ({
      group,
      clauses: sections.filter((s) => (groupOf[s.title] || 'Important Investor Information') === group).map((s) => ({ ...s, n: ++n })),
    }))
    .filter((g) => g.clauses.length);
}

const groupId = (name) => name.toLowerCase().replace(/[^a-z]+/g, '-');

export default function Disclosure() {
  const groups = buildSections();

  // Contents list follows the reader: the group nearest the top is marked.
  const [current, setCurrent] = useState(null);
  useEffect(() => {
    const els = [...document.querySelectorAll('.v3-legal-group')];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setCurrent(e.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <PageShell solid smooth={false}>
      <LightHero
        kicker="Legal & regulatory"
        lines={['Disclosures.']}
        lede="The information below governs how this site, the risk assessment and any proposal it generates should be read. If anything here is unclear, a conversation with RISCH resolves it faster than the fine print."
      />

      <section className="v3-sec v3-sec-legal">
        <div className="v3-wrap v3-legal">
          <nav className="v3-legal-toc" aria-label="Disclosure sections">
            <p>Contents</p>
            <ol>
              {groups.map((g, i) => (
                <li key={g.group}>
                  <a href={`#${groupId(g.group)}`} className={current === groupId(g.group) ? 'is-current' : undefined}><span>0{i + 1}</span>{g.group}</a>
                </li>
              ))}
            </ol>
            <a className="v3-legal-ask" href={`mailto:${FIRM.email}`}>Questions? {FIRM.email}</a>
          </nav>
          <div className="v3-legal-body">
            {groups.map((g) => (
              <section className="v3-legal-group" id={groupId(g.group)} key={g.group}>
                <h2>{g.group}</h2>
                {g.clauses.map((c) => (
                  <div className="v3-legal-clause" key={c.title}>
                    <h3><span>{String(c.n).padStart(2, '0')}</span>{c.title}</h3>
                    {typeof c.body === 'string' ? <p>{c.body}</p> : <div>{c.body}</div>}
                  </div>
                ))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
