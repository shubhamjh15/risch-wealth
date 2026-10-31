import { PageHead, PageFoot } from './ReportChrome';

export default function ReportPage4({ meta }) {
  return (
    <div className="report-page">
      <PageHead dateStr={meta.dateStr} />

      <div className="r-section">
        <h3 className="r-title">Section: Deviation Policy &amp; Acknowledgement</h3>
        <p className="r-sub" style={{ marginBottom: 12 }}>If the client or RISCH Wealth elects to depart from the indicated asset mix, deviation is restricted to a maximum tolerance of one tier above or below, with the basis for deviation documented and signed by both parties. This report is confirmed once reviewed and countersigned by RISCH Wealth.</p>
        <div className="decl-row">
          <div className="decl-box">
            <h4>Client Declaration &amp; Confirmation</h4>
            <div className="decl-item"><span className="chk" style={{ background: 'transparent' }}></span><span>I acknowledge the responses above are the ones I provided, and are true and accurate to the best of my knowledge.</span></div>
            <div className="decl-item"><span className="chk" style={{ background: 'transparent' }}></span><span>I have not requested any deviation from the indicated asset mix shown above.</span></div>
            <div className="decl-sign"><span><b>Client:</b> {meta.clientName}</span><span><b>Date:</b> ____________</span></div>
          </div>
          <div className="decl-box">
            <h4>RISCH Wealth Review</h4>
            <div className="decl-item"><span className="chk" style={{ background: 'transparent' }}></span><span>Questionnaire administered in accordance with RISCH Wealth suitability protocols.</span></div>
            <div className="decl-item"><span className="chk" style={{ background: 'transparent' }}></span><span>Rationale for any approved adjustment documented and aligned to client objectives.</span></div>
            <div className="decl-sign"><span><b>RISCH Wealth:</b> Pending review</span><span><b>Date:</b> ____________</span></div>
          </div>
        </div>
      </div>

      <div className="r-section">
        <h3 className="r-title">Section: Methodology &amp; Important Disclosures</h3>
        <div className="disclosure-box">
          <p><strong>Diagnostic framework &amp; scoring.</strong> This questionnaire synthesizes three principal dimensions: liquidity time horizon, expected return vs. drawdown tolerance, and behavioural loss aversion. Resulting scores map across a continuum of four portfolios, from RISCH Balanced to RISCH Aggressive Plus.</p>
          <p><strong>Holistic context.</strong> This questionnaire is a foundational tool. Overall net worth, debt obligations, non-liquid holdings, tax considerations and bespoke liquidity milestones should be reviewed before any allocation is finalised.</p>
          <p><strong>General disclaimer.</strong> This report is for informational purposes only and does not constitute investment advice. Investments in securities, mutual funds, portfolio services and alternative assets are subject to market risk, including possible loss of principal invested.</p>
          <p><strong>No guarantee of returns.</strong> Past performance is not an indicator or guarantee of future returns. Portfolio names (RISCH Balanced Portfolio, RISCH Growth Portfolio, RISCH Aggressive Portfolio, RISCH Aggressive Plus Portfolio) do not represent or guarantee performance results.</p>
          <p><strong>Conflict of interest.</strong> RISCH Wealth holds no proprietary product to sell. Any institutional holdings or third-party arrangements are managed under information barriers to prevent conflicts of interest.</p>
        </div>
      </div>

      <div className="report-footer-block">
        <div className="rfb-name">RISCH WEALTH PRIVATE LIMITED</div>
        <div className="rfb-sub">RISCH Private Wealth</div>
        <div className="rfb-sub">Website: www.rischwealth.com</div>
      </div>

      <PageFoot n={4} />
    </div>
  );
}
