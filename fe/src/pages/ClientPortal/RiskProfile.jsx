import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listRiskProfiles } from '../../api/authApi';
import {
  Arrow, Icons, PageHead, RiskGauge, fmtDate, inr,
} from './ui';

const ALLOC = [
  ['india', 'Indian equity'],
  ['intl', 'International equity'],
  ['debt', 'Fixed income'],
  ['cash', 'Cash & liquid'],
];

export default function RiskProfile({ data }) {
  const risk = data.latestRiskProfile;
  const [history, setHistory] = useState([]);
  useEffect(() => { listRiskProfiles().then((r) => setHistory(r.riskProfiles)).catch(() => {}); }, []);

  if (!risk) {
    return (
      <>
        <PageHead title="Your risk profile" sub="Helps us understand how much risk suits you." />
        <section className="cp-card cp-empty">
          <h2 className="cp-card-title">Not assessed yet</h2>
          <p>Eight questions on your time horizon and comfort with risk. Take it while signed in and your result is saved here, for us to discuss with you.</p>
          <Link to="/client-portal/risk-assessment" className="btn btn-primary">Take the risk assessment <Arrow /></Link>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHead title="Your risk profile" sub="Helps us understand how much risk suits you." />
      <div className="cp-grid cp-grid-2">
        <section className="cp-card cp-risk">
          <p className="cp-card-label">Your current profile</p>
          <RiskGauge tier={risk.tier} />
          <h2 className="cp-risk-name">{risk.tierName}</h2>
          <p className="cp-muted">Assessed {fmtDate(risk.createdAt)}{risk.investmentAmount ? ` · for ${inr(risk.investmentAmount)}` : ''}</p>
          <div className="cp-risk-actions">
            <Link to={`/client-portal/risk-report?id=${risk.id}&print=1`} className="btn btn-primary cp-btn-sm"><Icons.download /> Download report (PDF)</Link>
            <Link to={`/client-portal/risk-report?id=${risk.id}`} className="btn cp-btn-sm">View report</Link>
          </div>
          <Link to="/client-portal/risk-assessment" className="cp-link cp-retake">Retake assessment <Arrow /></Link>
        </section>
        <section className="cp-card">
          <h2 className="cp-card-title">Indicative allocation</h2>
          <div className="alloc-bars" role="list">
            {ALLOC.map(([k, label]) => (
              <div className="alloc-bar" role="listitem" key={k}>
                <span className="ab-label">{label}</span>
                <span className="ab-track"><span className="ab-fill" style={{ width: `${Number(risk.allocation[k]) || 0}%` }}></span></span>
                <span className="ab-pct">{Math.round((Number(risk.allocation[k]) || 0) * 10) / 10}%</span>
              </div>
            ))}
          </div>
          <p className="cp-fine">From your answers; a preliminary assessment, not a recommendation. We confirm suitability with you before any investment.</p>
        </section>
      </div>

      {history.length > 1 && (
        <section className="cp-card">
          <h2 className="cp-card-title">Past assessments</h2>
          <div className="cp-table-wrap">
            <table className="cp-table">
              <thead><tr><th>Date</th><th>Profile</th><th className="num">Amount considered</th><th aria-label="Report" /></tr></thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}><td>{fmtDate(h.createdAt)}</td><td>{h.tierName}</td><td className="num">{h.investmentAmount ? inr(h.investmentAmount) : '–'}</td><td className="num"><Link to={`/client-portal/risk-report?id=${h.id}&print=1`} className="cp-link"><Icons.download /> PDF</Link></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="cp-callout"><Icons.info /> Your risk profile helps us suggest suitable investments. Retake it whenever your circumstances change.</p>
    </>
  );
}
