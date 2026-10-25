import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { riskProfileReport } from '../../api/authApi';
import { RiskProfilerConfigProvider, useRiskProfilerConfig } from '../RiskProfiler/RiskProfilerConfigContext';
import ReportView from '../RiskProfiler/report/ReportView';
import { Icons } from './ui';

// A saved assessment's proposal, rebuilt from the answers stored in
// risk_profiles: /client-portal/risk-report?id=12. With &print=1 the
// browser's print dialog opens straight away ("Save as PDF").
export default function RiskReport(props) {
  return (
    <RiskProfilerConfigProvider>
      <Report {...props} />
    </RiskProfilerConfigProvider>
  );
}

function Report({ data }) {
  const [params] = useSearchParams();
  const id = params.get('id') || data.latestRiskProfile?.id;
  const autoPrint = params.get('print') === '1';
  const { config, error: configError } = useRiskProfilerConfig();
  const [report, setReport] = useState(null);
  const [err, setErr] = useState('');
  const printed = useRef(false);

  useEffect(() => {
    if (!id) { setErr('You haven’t taken the risk assessment yet.'); return; }
    riskProfileReport(id).then(setReport).catch((e) => setErr(e.message));
  }, [id]);

  const ready = Boolean(config && report);
  useEffect(() => {
    if (!ready || !autoPrint || printed.current) return undefined;
    printed.current = true;
    // let the charts and fonts settle before the print dialog snapshots the page
    const t = setTimeout(() => window.print(), 700);
    return () => clearTimeout(t);
  }, [ready, autoPrint]);

  const back = <Link to="/client-portal/risk-profile" className="sp-backlink"><Icons.back /> Your risk profile</Link>;
  if (err || configError) return <>{back}<p className="auth-note" role="alert">{err || configError}</p></>;
  if (!ready) return <>{back}<p className="cp-loading">Preparing your report…</p></>;

  // Stored answers are points per question; the report shows the options.
  const answers = Object.fromEntries(config.questions.map((q) => [q.id, q.options.find((o) => o.points === report.answers[q.id])]));
  const basics = {
    name: report.client.name, email: report.client.email, phone: report.client.phone || '',
    age: report.age || '', amount: report.investmentAmount || 5000000,
  };

  return (
    <div className="profiler-embedded">
      {back}
      <main className="wrap profiler-wrap">
        <section className="p-step is-active" data-step="report">
          <ReportView
            basics={basics}
            answers={answers}
            questions={config.questions}
            scoreResult={report.result}
            reportDate={report.createdAt}
            embedded
            saved
          />
        </section>
      </main>
    </div>
  );
}
