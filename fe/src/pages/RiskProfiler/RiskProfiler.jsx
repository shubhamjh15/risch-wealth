import { useEffect, useState } from 'react';
import V3Nav from '../../v3/V3Nav';
import V3Footer from '../../v3/V3Footer';
import { fmtINR, pct } from '../../utils/format';
import { submitRiskProfilerAnswers } from '../../api/riskProfilerApi';
import { RiskProfilerConfigProvider, useRiskProfilerConfig } from './RiskProfilerConfigContext';
import ReportView from './report/ReportView';
import { Req, ReqLegend } from '../../components/Req';
import { scrollToY } from '../../motion/gsap';

// `embedded`: shown inside the client portal (/client-portal/risk-assessment)
// instead of as a public page: no site nav or footer, the client's details
// pre-filled, and the result links back into the portal. `onSaved` runs
// once the result has been saved to their account.
export default function RiskProfiler({ embedded = false, prefill = null, onSaved = null }) {
  const body = (
    <RiskProfilerConfigProvider>
      <RiskProfilerBody embedded={embedded} prefill={prefill} onSaved={onSaved} />
    </RiskProfilerConfigProvider>
  );
  return embedded ? <div className="profiler-embedded">{body}</div> : <div className="v3 v3-profiler">{body}</div>;
}

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5" stroke="currentColor" strokeWidth="1.3" /></svg>
);

function RiskProfilerBody({ embedded, prefill, onSaved }) {
  const { config, error } = useRiskProfilerConfig();

  if (error) {
    return (
      <>
        {!embedded && <V3Nav solid />}
        <main className="wrap profiler-wrap">
          <p className="lede">The risk profiler couldn't load right now ({error}). Please make sure the API server is running and try again.</p>
        </main>
      </>
    );
  }

  // Until the question bank arrives, show the intro (it doesn't depend on
  // it) with Begin disabled. This is also what the prerendered HTML holds.
  if (!config) {
    return (
      <>
        {!embedded && <V3Nav solid />}
        <div className="prog-rail">
          <div className="wrap prog-inner">
            <span className="mono prog-label">Introduction</span>
            <div className="prog-track"><div className="prog-fill" style={{ width: '4%' }}></div></div>
          </div>
        </div>
        <main className="wrap profiler-wrap">
          <ProfilerIntro />
        </main>
      </>
    );
  }

  return <RiskProfilerQuiz questions={config.questions} embedded={embedded} prefill={prefill} onSaved={onSaved} />;
}

function ProfilerIntro({ onBegin }) {
  return (
    <section className="p-step is-active" data-step="intro">
      <p className="eyebrow reveal in">Risk Profile Questionnaire</p>
      <h1 className="display-xl reveal in" style={{ maxWidth: '14em' }}>Know your risk profile <span className="italic">before you invest.</span></h1>
      <p className="lede reveal in" style={{ maxWidth: '52ch', marginTop: 26 }}>This questionnaire follows a documented time-horizon and risk-preference methodology and takes about three minutes. At the end you&rsquo;ll see your risk profile and an illustrative asset mix for it: a starting point for a conversation with RISCH, not a recommendation.</p>
      <div className="intro-facts reveal in">
        <div><span className="mono">01</span> Basic details</div>
        <div><span className="mono">02</span> Time horizon: 2 questions</div>
        <div><span className="mono">03</span> Risk preference: 6 questions</div>
        <div><span className="mono">04</span> Your risk profile, instantly</div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 40 }} disabled={!onBegin} onClick={onBegin}><span>Begin</span><i><ArrowIcon /></i></button>
    </section>
  );
}

function stepLabel(key, questions) {
  if (key === 'intro') return 'Introduction';
  if (key === 'basics') return 'Your details';
  if (key === 'report') return 'Your risk profile';
  const q = questions.find((q) => q.id === key);
  return `${q.group}: Question ${q.groupIndex} of ${q.groupTotal}`;
}

function RiskProfilerQuiz({
  questions, embedded, prefill, onSaved,
}) {
  const STEP_ORDER = ['intro', 'basics', ...questions.map((q) => q.id), 'report'];

  const [stepIndex, setStepIndex] = useState(0);
  const [basics, setBasics] = useState({
    name: prefill?.name || '', email: prefill?.email || '', phone: prefill?.phone || '', age: '', amount: 5000000,
  });
  const [answers, setAnswers] = useState({});
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState(null);

  const currentStepKey = STEP_ORDER[stepIndex];

  // The backend — not this component — decides the tier. As soon as the
  // quiz reaches the report step, send the selected points and wait for
  // the computed result instead of scoring anything locally.
  useEffect(() => {
    if (currentStepKey !== 'report' || scoreResult) return;
    const pointsByQuestion = Object.fromEntries(
      Object.entries(answers).map(([id, opt]) => [id, opt.points])
    );
    let cancelled = false;
    submitRiskProfilerAnswers(pointsByQuestion, Number(basics.amount) || undefined, Number(basics.age) || undefined)
      .then((result) => {
        if (cancelled) return;
        setScoreResult(result);
        if (result.savedToAccount && onSaved) onSaved();
      })
      .catch((err) => { if (!cancelled) setScoreError(err.message); });
    return () => { cancelled = true; };
  }, [currentStepKey, scoreResult, answers, basics.amount, basics.age, onSaved]);

  const goToStep = (index) => {
    const clamped = Math.max(0, Math.min(index, STEP_ORDER.length - 1));
    setStepIndex(clamped);
    scrollToY(0);
  };

  // Name and amount are required: the proposal is addressed to the name
  // and sized on the amount. Email, mobile and age are optional.
  const [basicsError, setBasicsError] = useState('');
  const handleBasicsSubmit = (e) => {
    e.preventDefault();
    const age = basics.age === '' ? null : Number(basics.age);
    if (!basics.name.trim()) { setBasicsError('Please enter your full name.'); return; }
    if (!(Number(basics.amount) >= 10000)) { setBasicsError('Please enter the amount you’re considering investing (at least ₹10,000).'); return; }
    if (age !== null && !(Number.isInteger(age) && age >= 18 && age <= 100)) { setBasicsError('Please enter an age between 18 and 100, or leave it blank.'); return; }
    setBasicsError('');
    goToStep(stepIndex + 1);
  };

  const handleSelectOption = (questionId, opt) => {
    setAnswers((prev) => ({ ...prev, [questionId]: opt }));
  };

  const handleRestart = () => {
    setAnswers({});
    setScoreResult(null);
    setScoreError(null);
    setStepIndex(0);
  };

  const total = STEP_ORDER.length;
  const progressPct = Math.max(4, Math.round((stepIndex / (total - 1)) * 100));
  const showFooter = currentStepKey === 'report';

  return (
    <>
      {!embedded && <V3Nav solid />}

      <div className="prog-rail">
        <div className="wrap prog-inner">
          <span className="mono prog-label">Step {stepIndex + 1} of {total}: {stepLabel(currentStepKey, questions)}</span>
          <div className="prog-track"><div className="prog-fill" style={{ width: progressPct + '%' }}></div></div>
        </div>
      </div>

      <main className="wrap profiler-wrap">
        {currentStepKey === 'intro' && <ProfilerIntro onBegin={() => goToStep(1)} />}

        {currentStepKey === 'basics' && (
          <section className="p-step is-active" data-step="basics">
            <p className="q-eyebrow">Before We Begin</p>
            <h2 className="display-m" style={{ marginBottom: 36 }}>A little about you.</h2>
            <form noValidate onSubmit={handleBasicsSubmit}>
              <ReqLegend />
              <div className="field-row">
                <div className="field">
                  <label htmlFor="bName">Full name <Req /></label>
                  <input type="text" id="bName" aria-required="true" placeholder="Rishi Maheshwari" value={basics.name} onChange={(e) => setBasics({ ...basics, name: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="bEmail">Email address</label>
                  <input type="email" id="bEmail" placeholder="you@email.com" value={basics.email} onChange={(e) => setBasics({ ...basics, email: e.target.value })} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="bPhone">Mobile number</label>
                  <input type="tel" id="bPhone" placeholder="+91 99999 99999" value={basics.phone} onChange={(e) => setBasics({ ...basics, phone: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="bAge">Age</label>
                  <input type="number" id="bAge" min="18" max="100" placeholder="23" value={basics.age} onChange={(e) => setBasics({ ...basics, age: e.target.value })} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="bAmount">Indicative investment amount (₹) <Req /></label>
                  <input type="number" id="bAmount" aria-required="true" min="10000" step="10000" placeholder="5,000,000" value={basics.amount} onChange={(e) => setBasics({ ...basics, amount: e.target.value })} />
                </div>
                <div className="field"></div>
              </div>
              {basicsError && <p className="auth-note" role="alert">{basicsError}</p>}
              <div className="p-nav">
                <button type="button" className="btn btn-back" onClick={() => goToStep(stepIndex - 1)}>Back</button>
                <button type="submit" className="btn btn-primary"><span>Continue</span><i><ArrowIcon /></i></button>
              </div>
            </form>
          </section>
        )}

        {questions.some((q) => q.id === currentStepKey) && (
          <QuestionStep
            question={questions.find((q) => q.id === currentStepKey)}
            amount={Number(basics.amount) || 5000000}
            answer={answers[currentStepKey]}
            onSelect={(opt) => handleSelectOption(currentStepKey, opt)}
            onBack={() => goToStep(stepIndex - 1)}
            onNext={() => goToStep(stepIndex + 1)}
          />
        )}

        {currentStepKey === 'report' && (
          <section className="p-step is-active" data-step="report">
            {scoreError && (
              <p className="lede">Couldn't generate your risk profile ({scoreError}). Please make sure the API server is running, then try restarting.</p>
            )}
            {!scoreError && !scoreResult && (
              <p className="lede">Working out your risk profile…</p>
            )}
            {scoreResult && (
              <ReportView basics={basics} answers={answers} questions={questions} scoreResult={scoreResult} onRestart={handleRestart} embedded={embedded} />
            )}
          </section>
        )}
      </main>

      {showFooter && !embedded && <V3Footer />}
    </>
  );
}

function QuestionStep({ question: q, amount, answer, onSelect, onBack, onNext }) {
  return (
    <section className="p-step is-active" data-step="question">
      <p className="q-eyebrow">{q.group}: Question {q.groupIndex} of {q.groupTotal}</p>
      <h2 className="display-m" style={{ marginBottom: q.sub ? 8 : 36, maxWidth: '26ch' }}>{q.prompt}</h2>
      {q.sub && <p className="body-s text-muted" style={{ marginBottom: 20 }}>{q.sub}</p>}
      <div className="opt-list">
        {q.options.map((opt) => {
          const isSelected = answer && answer.label === opt.label;
          return (
            <div
              key={opt.label}
              className={'opt' + (isSelected ? ' selected' : '')}
              role="radio"
              tabIndex={0}
              aria-checked={isSelected ? 'true' : 'false'}
              onClick={() => onSelect(opt)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(opt);
                }
              }}
            >
              <div className="radio"></div>
              {q.type === 'payoff' ? (
                <div style={{ flex: 1 }}>
                  <div className="opt-text">{opt.label}</div>
                  <table className="opt-table"><tbody><tr>
                    <td>Worst case</td><td className="v-neg">{fmtINR(amount * (1 + opt.worst))} ({pct(opt.worst * 100)})</td>
                    <td>Expected</td><td className="v-pos">{fmtINR(amount * (1 + opt.exp))} (+{pct(opt.exp * 100)})</td>
                    <td>Best case</td><td className="v-pos">{fmtINR(amount * (1 + opt.best))} (+{pct(opt.best * 100)})</td>
                  </tr></tbody></table>
                </div>
              ) : q.type === 'range' ? (
                <div style={{ flex: 1 }}>
                  <div className="opt-text">{opt.label}</div>
                  <div className="opt-sub mono">+{opt.best}% best case &nbsp;·&nbsp; {opt.worst}% worst case</div>
                </div>
              ) : (
                <div className="opt-text">{opt.label}</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="p-nav">
        <button className="btn btn-back" onClick={onBack}>Back</button>
        <button className="btn btn-primary" disabled={!answer} onClick={onNext}><span>Continue</span><i><ArrowIcon /></i></button>
      </div>
    </section>
  );
}
