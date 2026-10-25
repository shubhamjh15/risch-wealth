import { PageHead, PageFoot } from './ReportChrome';
import QBox from './QBox';
import RRChart from './RRChart';
import MandateBanner from './MandateBanner';

export default function ReportPage2({ meta, ambiguous, mandate, answers, questions }) {
  return (
    <div className="report-page">
      <PageHead dateStr={meta.dateStr} />

      <div className="r-section">
        <div className="q-box" style={{ marginBottom: 12 }}>
          <div className="q-num">7. Historical Return Range &amp; Downside Volatility Trade-off (Hypothetical 1-Year Period)</div>
          <RRChart question={questions[6]} selectedLabel={answers.q7 ? answers.q7.label : null} />
        </div>
        <div className="q-grid full">
          <QBox num={8} question={questions[7]} answer={answers.q8} />
        </div>
      </div>

      <div className="r-section">
        <h3 className="r-title">Section: Indicative Asset Mix</h3>
        <p className="r-sub">Based on your time horizon and risk preference responses above.</p>
        {ambiguous && (
          <p className="body-s" style={{ marginTop: 0, marginBottom: 12, color: 'var(--muted)', fontSize: '10.5px' }}>
            <em>Your time horizon and risk preference combination falls into a range flagged for internal review, the most conservative portfolio may still be appropriate if you are willing to revisit your stated risk preference.</em>
          </p>
        )}
        <MandateBanner mandate={mandate} />
      </div>

      <PageFoot n={2} />
    </div>
  );
}
