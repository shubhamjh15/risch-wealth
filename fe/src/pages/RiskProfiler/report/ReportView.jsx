import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ReportPage1 from './ReportPage1';
import ReportPage2 from './ReportPage2';
import ReportPage3 from './ReportPage3';
import ReportPage4 from './ReportPage4';
import ResultSummary from './ResultSummary';

// `scoreResult` is exactly what the backend returned from
// POST /api/risk-profiler/score (be/src/riskProfiler/scoring.js) —
// this component only renders it, it never recomputes anything.
// `reportDate` (a saved assessment's date) replaces today's date; with
// `saved`, it's a past assessment reopened from the portal, so there's no
// "saved to your portal" note and no Start over.
export default function ReportView({
  basics, answers, questions, scoreResult, onRestart, embedded = false, reportDate = null, saved = false,
}) {
  const { tier, ambiguous, tierOrder, tiers } = scoreResult;
  const mandate = tiers[tier];
  const amount = Number(basics.amount) || 5000000;

  const [activeTab, setActiveTab] = useState(tier);

  const dateStr = useMemo(
    () => (reportDate ? new Date(reportDate) : new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    [reportDate]
  );

  const meta = {
    clientName: basics.name || 'Prospective Client',
    clientAge: basics.age ? `${basics.age} Years` : '–',
    clientEmail: basics.email || '–',
    clientPhone: basics.phone || '–',
    dateStr,
  };

  const handleDownload = () => {
    // Whichever tier the client is exploring on screen, the printed
    // proposal always reflects the recommended mandate only.
    setActiveTab(tier);
    window.print();
  };

  return (
    <>
      <ResultSummary name={basics.name} scoreResult={scoreResult} />
      <p className="rp-sum-full">Full report</p>
      <div className="report-scroll">
        <ReportPage1 meta={meta} amount={amount} answers={answers} questions={questions} />
        <ReportPage2 meta={meta} ambiguous={ambiguous} mandate={mandate} answers={answers} questions={questions} />
        <ReportPage3 meta={meta} tiers={tiers} tierOrder={tierOrder} recommendedTier={tier} amount={amount} activeTab={activeTab} onSelectTab={setActiveTab} />
        <ReportPage4 meta={meta} />
      </div>

      <div className="report-notice">
        <p><strong>This is a preliminary assessment, not a final investment recommendation.</strong> It's based only on your answers here. A suitable portfolio also depends on your wider net worth, liabilities, illiquid assets, taxes and liquidity needs, which we'd go through with you in conversation.</p>
        {scoreResult.savedToAccount && !saved && (
          <p style={{ marginTop: 10 }}>This result has been saved to your <Link to={embedded ? '/client-portal/risk-profile' : '/client-portal'}>{embedded ? 'risk profile' : 'client portal'}</Link>.</p>
        )}
      </div>

      <div className="report-actions">
        <Link to={embedded ? '/client-portal/messages' : '/contact'} state={embedded ? { topic: 'Portfolio review' } : undefined} className="btn btn-primary">Discuss this with RISCH
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5" stroke="currentColor" strokeWidth="1.3" /></svg>
        </Link>
        <button className="btn" onClick={handleDownload}>
          Download / Print Report
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V10M7 10L3.5 6.5M7 10L10.5 6.5M2 13H12" stroke="currentColor" strokeWidth="1.3" /></svg>
        </button>
        {!saved && <button className="btn" onClick={onRestart}>Start over</button>}
      </div>
    </>
  );
}
